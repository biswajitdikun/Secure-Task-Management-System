import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { TaskStatus } from '../dto/task.dto';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditLogService: AuditLogService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: UserPayload): Promise<Task> {
    // Create a new task with the current user as the creator
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy: { id: parseInt(user.id) } as any,
      organizationId: parseInt(user.organizationId),
      status: TaskStatus.TODO, // New tasks start as TODO
    });

    const savedTask = await this.taskRepository.save(task);
    
    // Log this action for audit purposes
    await this.auditLogService.log(
      parseInt(user.id),
      'CREATE',
      'TASK',
      savedTask.id,
      parseInt(user.organizationId),
      `Created task: ${savedTask.title}`,
    );

    return savedTask;
  }

  async findAll(user: UserPayload): Promise<Task[]> {
    // Build query to get all tasks with related data
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.organization', 'organization');

    // Only show tasks from the user's organization
    query.where('task.organizationId = :organizationId', {
      organizationId: user.organizationId,
    });

    return query.getMany();
  }

  async findOne(id: number, user: UserPayload): Promise<Task> {
    // Find task by ID, but only if it belongs to the user's organization
    const task = await this.taskRepository.findOne({
      where: { id, organizationId: parseInt(user.organizationId) },
      relations: ['createdBy', 'assignedTo', 'organization'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: UserPayload): Promise<Task> {
    const task = await this.findOne(id, user);

    // Check if user can update this task
    if (task.createdById !== parseInt(user.id) && task.assignedToId !== parseInt(user.id) && user.role !== 'owner' && user.role !== 'admin') {
      throw new ForbiddenException('You can only update tasks you created or are assigned to');
    }

    // Status update logic
    if (updateTaskDto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      updateTaskDto.completedAt = new Date();
    } else if (updateTaskDto.status !== TaskStatus.COMPLETED && task.status === TaskStatus.COMPLETED) {
      updateTaskDto.completedAt = null;
    }

    await this.taskRepository.update(id, updateTaskDto);
    
    // Log audit
    await this.auditLogService.log(
      parseInt(user.id),
      'UPDATE',
      'TASK',
      id,
      parseInt(user.organizationId),
      `Updated task: ${task.title}`,
    );

    return this.findOne(id, user);
  }

  async remove(id: number, user: UserPayload): Promise<void> {
    const task = await this.findOne(id, user);

    // Only creators and owners/admins can delete tasks
    if (task.createdById !== parseInt(user.id) && user.role !== 'owner' && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete tasks you created');
    }

    // Log audit
    await this.auditLogService.log(
      parseInt(user.id),
      'DELETE',
      'TASK',
      id,
      parseInt(user.organizationId),
      `Deleted task: ${task.title}`,
    );

    await this.taskRepository.remove(task);
  }

  async findByUser(userId: number, user: UserPayload): Promise<Task[]> {
    // Users can only see tasks from their organization
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.organization', 'organization')
      .where('task.organizationId = :organizationId', {
        organizationId: user.organizationId,
      })
      .andWhere('(task.assignedToId = :userId OR task.createdById = :userId)', {
        userId,
      });

    return query.getMany();
  }
}
