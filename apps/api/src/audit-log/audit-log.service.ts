import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLog } from '../entities/audit-log.entity';
import { UserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(user: UserPayload): Promise<AuditLog[]> {
    const query = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .leftJoinAndSelect('auditLog.organization', 'organization')
      .where('auditLog.organizationId = :organizationId', {
        organizationId: user.organizationId,
      })
      .orderBy('auditLog.timestamp', 'DESC');

    return query.getMany();
  }

  async log(
    userId: number,
    action: string,
    resource: string,
    resourceId: number | null,
    organizationId: number,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      resource,
      resourceId,
      organizationId,
      details,
      ipAddress,
      userAgent,
    });

    await this.auditLogRepository.save(auditLog);
    console.log(`[AUDIT] User ${userId} performed ${action} on ${resource}${resourceId ? ` (ID: ${resourceId})` : ''} in organization ${organizationId}`);
  }
}
