import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Organization]),
    AuditLogModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
