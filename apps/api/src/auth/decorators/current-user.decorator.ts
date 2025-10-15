import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Interface for the user data stored in JWT token
export interface UserPayload {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

// Decorator to easily get the current user from the request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // This is set by the JWT strategy
  },
);
