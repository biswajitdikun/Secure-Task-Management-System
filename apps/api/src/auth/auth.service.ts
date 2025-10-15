import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User } from '../entities/user.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from '../dto/auth.dto';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Find user by email and include organization data
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });

    if (user) {
      // Check if the provided password matches the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // Return user data without the password
        const { password: _, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create JWT payload with user information
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      organizationId: user.organizationId,
    };

    // TODO: Add audit logging for login events
    // await this.auditLogService.log(
    //   user.id,
    //   'LOGIN',
    //   'USER',
    //   user.id,
    //   user.organizationId,
    //   `User logged in: ${user.email}`,
    // );

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId.toString(),
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Make sure this email isn't already taken
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Determine user role and organization
    // First user becomes owner and creates the main organization
    const totalUserCount = await this.userRepository.count();
    
    let organizationId: number;
    
    if (totalUserCount === 0) {
      // This is the first user - they become the owner and create the main org
      const organization = this.organizationRepository.create({
        name: 'Main Organization',
        description: 'Primary organization for task management',
      });
      const savedOrganization = await this.organizationRepository.save(organization);
      organizationId = savedOrganization.id;
    } else {
      // Find the main organization for new users to join
      const mainOrganization = await this.organizationRepository
        .createQueryBuilder('organization')
        .orderBy('organization.createdAt', 'ASC')
        .getOne();
      
      if (!mainOrganization) {
        throw new Error('No organization found');
      }
      organizationId = mainOrganization.id;
    }

    // Create the new user
    const userData = {
      ...registerDto,
      password: hashedPassword,
      organizationId: organizationId,
      role: totalUserCount === 0 ? 'owner' as any : 'viewer' as any, // First user = owner, rest = viewers
      isActive: true,
    };

    const savedUser = await this.userRepository.save(userData);

    // TODO: Add audit logging for registration events
    // try {
    //   await this.auditLogService.log(
    //     savedUser.id,
    //     'REGISTER',
    //     'USER',
    //     savedUser.id,
    //     savedUser.organizationId,
    //     `User registered: ${savedUser.email}`,
    //   );
    // } catch (error) {
    //   console.error('Failed to log audit:', error);
    //   // Don't fail registration if audit logging fails
    // }

    // Generate JWT token for the new user
    const payload = {
      email: savedUser.email,
      sub: savedUser.id,
      role: savedUser.role,
      organizationId: savedUser.organizationId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.id.toString(),
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        organizationId: savedUser.organizationId.toString(),
      },
    };
  }
}
