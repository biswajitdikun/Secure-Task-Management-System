import { SetMetadata } from '@nestjs/common';
import { Role } from '../../dto/user.dto';

// Key used by the RolesGuard to check permissions
export const ROLES_KEY = 'roles';

// Decorator to specify which roles can access an endpoint
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
