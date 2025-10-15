import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../auth/decorators/current-user.decorator';
import { Role } from '../dto/user.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  // Task creation permission check - all authenticated users can create tasks
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - login required' })
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: UserPayload) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  // Task read permission check
  @ApiOperation({ summary: 'Get all tasks accessible to the user' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.tasksService.findAll(user);
  }

  @Get('my-tasks')
  // Task read permission check
  @ApiOperation({ summary: 'Get tasks assigned to or created by the current user' })
  @ApiResponse({ status: 200, description: 'User tasks retrieved successfully' })
  findMyTasks(@CurrentUser() user: UserPayload) {
    return this.tasksService.findByUser(parseInt(user.id), user);
  }

  @Get(':id')
  // Task read permission check
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  // Task update permission check - only admins and owners can update tasks
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only admins and owners can update tasks' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  // Task delete permission check - only admins and owners can delete tasks
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only admins and owners can delete tasks' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    return this.tasksService.remove(id, user);
  }
}
