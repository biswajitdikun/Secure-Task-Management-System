import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AuditLogModule } from './audit-log/audit-log.module';

import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Task } from './entities/task.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Database connection - using SQLite for development
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DB_DATABASE', 'database.sqlite'),
        entities: [User, Organization, Task, AuditLog],
        synchronize: configService.get('NODE_ENV') !== 'production', // Auto-create tables in dev
        logging: configService.get('NODE_ENV') === 'development', // Show SQL queries in dev
      }),
      inject: [ConfigService],
    }),
    // JWT configuration - make it globally available
    JwtModule.register({
      secret: 'your-super-secret-jwt-key-change-this-in-production',
      signOptions: { expiresIn: '24h' },
      global: true,
    }),
    // Passport for authentication strategies
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Feature modules
    AuthModule,
    UsersModule,
    TasksModule,
    OrganizationsModule,
    AuditLogModule,
  ],
})
export class AppModule {}
