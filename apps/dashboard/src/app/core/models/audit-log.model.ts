export interface AuditLog {
    id: number;
    userId: number;
    action: string;
    resource: string;
    resourceId: number;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    organizationId: number;
    timestamp: string;
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    organization: {
      id: number;
      name: string;
      description: string;
    };
  }