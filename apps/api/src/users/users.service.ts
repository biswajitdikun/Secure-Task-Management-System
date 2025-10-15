import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../entities/user.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Task } from '../entities/task.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { UserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createUserDto: CreateUserDto, user: UserPayload): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Only owners can assign admin roles, admins can only create viewers
    if (user.role === 'admin' && (createUserDto.role === 'admin' || createUserDto.role === 'owner')) {
      throw new ForbiddenException('Admins can only create viewer users');
    }

    // Prevent creating another Owner - only one Owner can exist
    if (createUserDto.role === 'owner') {
      throw new ForbiddenException('Only one Owner can exist in the system');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user in the same organization as the creator
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      organizationId: parseInt(user.organizationId),
      isActive: true,
    };

    const savedUser = await this.userRepository.save(userData);
    
    // Remove password from response
    delete savedUser.password;
    
    return savedUser;
  }

  async findAll(user: UserPayload): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.organizationId = :organizationId', {
        organizationId: user.organizationId,
      });

    return query.getMany();
  }

  async findOne(id: number, user: UserPayload): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: { id, organizationId: parseInt(user.organizationId) },
      relations: ['organization'],
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return foundUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto, user: UserPayload): Promise<User> {
    const foundUser = await this.findOne(id, user);

    // Only owners and admins can update other users, users can update themselves
    if (user.role !== 'owner' && user.role !== 'admin' && parseInt(user.id) !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Only owners can assign admin roles, admins can only assign viewer roles
    if (updateUserDto.role) {
      if (user.role === 'admin' && (updateUserDto.role === 'admin' || updateUserDto.role === 'owner')) {
        throw new ForbiddenException('Admins can only assign viewer roles');
      }

      // Prevent creating another Owner - only one Owner can exist
      if (updateUserDto.role === 'owner') {
        throw new ForbiddenException('Only one Owner can exist in the system');
      }
    }

    const updateData = {
      ...updateUserDto,
      organizationId: updateUserDto.organizationId ? parseInt(updateUserDto.organizationId) : undefined,
    };
    await this.userRepository.update(id, updateData);
    return this.findOne(id, user);
  }

  async remove(id: number, user: UserPayload): Promise<void> {
    const foundUser = await this.findOne(id, user);

    // Prevent self-deletion
    if (parseInt(user.id) === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    // Role-based deletion permissions
    if (user.role === 'owner') {
      // Owners can delete admins and viewers (but not other owners)
      if (foundUser.role === 'owner') {
        throw new ForbiddenException('Owners cannot delete other owners');
      }
    } else if (user.role === 'admin') {
      // Admins can only delete viewers
      if (foundUser.role !== 'viewer') {
        throw new ForbiddenException('Admins can only delete viewer users');
      }
    } else {
      // Viewers cannot delete anyone
      throw new ForbiddenException('You do not have permission to delete users');
    }

    // Store user info before deletion for audit log
    const deletedUserInfo = {
      email: foundUser.email,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      role: foundUser.role
    };

    // Delete or reassign tasks associated with this user
    await this.taskRepository.delete({ createdById: id });
    await this.taskRepository.update({ assignedToId: id }, { assignedToId: null });

    // Delete the user
    await this.userRepository.remove(foundUser);

    // Add audit log entry for user deletion
    try {
      await this.auditLogRepository.save({
        userId: parseInt(user.id), // The user who performed the deletion
        action: 'DELETE',
        resource: 'USER',
        resourceId: id, // The ID of the deleted user
        details: `User deleted: ${deletedUserInfo.email} (${deletedUserInfo.firstName} ${deletedUserInfo.lastName}) - Role: ${deletedUserInfo.role}`,
        organizationId: parseInt(user.organizationId),
        timestamp: new Date()
      });
    } catch (error) {
      // Don't fail the deletion if audit logging fails
      console.error('Failed to log user deletion audit:', error);
    }
  }
}
