import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';
import { UserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async findOne(id: number, user: UserPayload): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parentOrganization', 'childOrganizations'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(
    id: number,
    updateOrganizationDto: UpdateOrganizationDto,
    user: UserPayload,
  ): Promise<Organization> {
    await this.organizationRepository.update(id, updateOrganizationDto);
    return this.findOne(id, user);
  }
}
