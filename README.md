# Task Management System

A full-stack task management application with role-based access control, built using NestJS, Angular, and TypeScript in a modular monorepo structure.

## Overview

This system implements a secure task management platform where users with different roles can securely manage tasks within an organization. The application demonstrates RBAC implementation, JWT-based authentication, and organization-level data isolation.

## Project Structure

```
TurboVets/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/          # Authentication & Authorization
│   │   │   ├── entities/      # TypeORM entities
│   │   │   ├── dto/           # Data Transfer Objects
│   │   │   ├── tasks/         # Task management module
│   │   │   ├── users/         # User management module
│   │   │   ├── organizations/ # Organization management
│   │   │   └── audit-log/     # Audit logging module
│   │   ├── database.sqlite    # SQLite database
│   │   └── package.json
│   │
│   └── dashboard/              # Angular Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/      # Core services and models
│       │   │   │   └── store/ # NgRx state management
│       │   │   ├── features/  # Feature modules
│       │   │   │   ├── auth/  # Authentication components
│       │   │   │   ├── dashboard/ # Task dashboard
│       │   │   │   └── users/ # User management
│       │   │   └── app.component.ts
│       │   └── main.ts
│       └── package.json
│
├── package.json                # Root workspace configuration
└── README.md
```

## Architecture Overview

### NX Monorepo Layout and Rationale

This project uses a workspace-based monorepo structure rather than separate repositories for several reasons:

**Benefits:**
- **Shared Code**: Common TypeScript interfaces, DTOs, and utilities can be shared between frontend and backend
- **Consistent Tooling**: Single package.json, unified linting, and build processes
- **Dependency Management**: Centralized dependency management reduces version conflicts
- **Development Efficiency**: Single repository to clone, single CI/CD pipeline

**Structure:**
- `apps/api/` - NestJS backend application
- `apps/dashboard/` - Angular frontend application
- Shared libraries would typically be in `libs/` but are currently embedded in each app for simplicity

### Shared Libraries/Modules

While not fully implemented as separate libraries, the following shared concepts exist:

**Data Models:**
- User interfaces and DTOs
- Task interfaces and DTOs
- Authentication models
- Common TypeScript types

**Authentication Logic:**
- JWT token handling
- Role-based access control decorators
- User payload interfaces

## Features

### Backend (NestJS + TypeORM + SQLite)
- JWT-based authentication
- Role-based access control (Owner, Admin, Viewer)
- Organization-level data isolation
- Task CRUD operations with proper authorization
- User management with role assignment
- Comprehensive audit logging

### Frontend (Angular + TailwindCSS)
- Responsive task management dashboard
- User authentication and registration
- NgRx state management
- Role-based UI rendering
- Real-time task updates

## Tech Stack

**Backend:**
- NestJS 10
- TypeORM
- SQLite
- JWT
- Passport
- Swagger

**Frontend:**
- Angular 17
- NgRx
- TailwindCSS
- TypeScript

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone and navigate to your directory:
```bash
cd /Users/biswajit/Desktop/TurboVets  #In my case
```

2. Install dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd apps/api
npm install
```

4. Install frontend dependencies:
```bash
cd ../dashboard
npm install
```

### Environment Setup

1. Backend environment configuration:
```bash
cd apps/api
cp env.example .env
```

2. Configure your environment variables in `.env`:
```env
# Database Configuration
DB_TYPE=sqlite
DB_DATABASE=database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

### Running the Application

1. Start the backend API:
```bash
cd apps/api
npm run dev
```
The API will be available at `http://localhost:3000`
API documentation available at `http://localhost:3000/api`

2. Start the frontend dashboard:
```bash
cd apps/dashboard
npm run dev
```
The dashboard will be available at `http://localhost:4200`

## Data Model Explanation

### Core Entities

**User Entity:**
```typescript
{
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'viewer';
  organizationId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Task Entity:**
```typescript
{
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedToId: number;
  createdById: number;
  organizationId: number;
  dueDate: Date;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Organization Entity:**
```typescript
{
  id: number;
  name: string;
  description: string;
  parentOrganizationId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**AuditLog Entity:**
```typescript
{
  id: number;
  userId: number;
  action: string;
  resource: string;
  resourceId: number;
  details: string;
  organizationId: number;
  timestamp: Date;
}
```

### Entity Relationships
- User belongs to one Organization (Many-to-One)
- Task belongs to one Organization and is created by one User (Many-to-One)
- Task can be assigned to one User (Many-to-One, optional)
- AuditLog belongs to one User and Organization (Many-to-One)

### ERD Diagram

```
┌─────────────────┐    ┌─────────────────┐
│   Organization  │    │      User       │
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ name            │◄───┤ organizationId  │
│ description     │    │ email           │
│ parentOrgId     │    │ password        │
│ createdAt       │    │ firstName       │
│ updatedAt       │    │ lastName        │
└─────────────────┘    │ role            │
         │              │ isActive        │
         │              │ createdAt       │
         │              │ updatedAt       │
         └─────────────────┘
                 │                       │
                 │                       │ createdBy
                 │                       ▼
                 │              ┌─────────────────┐
                 │              │      Task       │
                 │              ├─────────────────┤
                 │              │ id (PK)         │
                 │              │ title           │
                 │              │ description     │
                 │              │ status          │
                 │              │ priority        │
                 │              │ category        │
                 │              │ assignedToId    │
                 │              │ createdById     │
                 │              │ organizationId  │
                 │              │ dueDate         │
                 │              │ completedAt     │
                 │              │ createdAt       │
                 │              │ updatedAt       │
                 └─────────────────┘
                         │
                         │              ┌─────────────────┐
                         └──────────────┤   AuditLog      │
                                        ├─────────────────┤
                                        │ id (PK)         │
                                        │ userId          │
                                        │ action          │
                                        │ resource        │
                                        │ resourceId      │
                                        │ details         │
                                        │ organizationId  │
                                        │ timestamp       │
                                        └─────────────────┘
```

## Access Control Implementation

### Role Hierarchy
- **Owner**: Full system access, can manage all users and tasks
- **Admin**: Can manage users and tasks, cannot create other admins
- **Viewer**: Read-only access, can create tasks but only edit/delete their own

### Permission Matrix

| Action | Owner | Admin | Viewer |
|--------|-------|-------|--------|
| Create Task | ✓ | ✓ | ✓ |
| View All Tasks | ✓ | ✓ | ✓ |
| Edit Any Task | ✓ | ✓ | ✗ |
| Edit Own Task | ✓ | ✓ | ✓ |
| Delete Any Task | ✓ | ✓ | ✗ |
| Delete Own Task | ✓ | ✓ | ✓ |
| View Users | ✓ | ✓ | ✓ |
| Create User | ✓ | ✓ | ✗ |
| Update User Role | ✓ | ✓ | ✗ |
| Delete Users | ✓ | ✓ | ✗ |
| View Audit Logs | ✓ | ✓ | ✗ |

### JWT Auth Integration with Access Control

**Authentication Flow:**
1. User logs in with email/password
2. Backend validates credentials and generates JWT token
3. JWT contains user ID, email, role, and organization ID
4. Frontend stores JWT in localStorage
5. HTTP interceptor attaches JWT to all API requests

**Authorization Implementation:**
```typescript
// JWT Strategy extracts user info from token
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  validate(payload: any): UserPayload {
    return {
      id: payload.sub.toString(),
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId.toString()
    };
  }
}

// Roles Guard checks permissions
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}

// Usage in controllers
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param('id') id: number) {
    // Additional business logic checks in service layer
  }
}
```

**Organization Scoping:**
```typescript
// All queries are scoped to user's organization
const tasks = await this.taskRepository.find({
  where: { organizationId: user.organizationId }
});
```

## API Documentation

### Authentication Endpoints

#### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "organizationId": "1"
  }
}
```

#### POST /auth/register
**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "2",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "viewer",
    "organizationId": "1"
  }
}
```

### Task Endpoints

#### GET /tasks
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "status": "in_progress",
    "priority": "high",
    "category": "Work",
    "assignedToId": 2,
    "createdById": 1,
    "organizationId": 1,
    "dueDate": "2024-01-15T00:00:00.000Z",
    "completedAt": null,
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  }
]
```

#### POST /tasks
**Request:**
```json
{
  "title": "New task",
  "description": "Task description",
  "priority": "medium",
  "category": "Personal",
  "dueDate": "2024-01-20T00:00:00.000Z"
}
```

**Response:**
```json
{
  "id": 2,
  "title": "New task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "category": "Personal",
  "assignedToId": null,
  "createdById": 1,
  "organizationId": 1,
  "dueDate": "2024-01-20T00:00:00.000Z",
  "completedAt": null,
  "createdAt": "2024-01-10T11:00:00.000Z",
  "updatedAt": "2024-01-10T11:00:00.000Z"
}
```

#### PATCH /tasks/:id
**Request:**
```json
{
  "title": "Updated task title",
  "status": "completed",
  "completedAt": "2024-01-10T12:00:00.000Z"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated task title",
  "description": "Write comprehensive README and API docs",
  "status": "completed",
  "priority": "high",
  "category": "Work",
  "assignedToId": 2,
  "createdById": 1,
  "organizationId": 1,
  "dueDate": "2024-01-15T00:00:00.000Z",
  "completedAt": "2024-01-10T12:00:00.000Z",
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z"
}
```

### User Management Endpoints

#### GET /users
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "organizationId": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /users
**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "viewer"
}
```

**Response:**
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "viewer",
  "organizationId": 1,
  "isActive": true,
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-10T10:00:00.000Z"
}
```

### Audit Log Endpoints

#### GET /audit-log
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "action": "CREATE",
    "resource": "TASK",
    "resourceId": 1,
    "details": "Task created: Complete project documentation",
    "organizationId": 1,
    "timestamp": "2024-01-10T10:00:00.000Z",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "admin@example.com"
    }
  }
]
```

## NgRx State Management

### Store Structure
```typescript
interface AppState {
  auth: AuthState;
  tasks: TaskState;
  users: UserState;
}
```

### State Slices
- **Auth State**: User, token, authentication status
- **Task State**: Tasks, loading state, filter
- **User State**: Users, loading state

### Benefits
- Predictable state updates
- Time-travel debugging with DevTools
- Memoized selectors for performance
- Centralized side effect management

## Design Decisions & Trade-offs

### Architecture Decisions

**Monorepo Structure vs. Separate Repositories**
- Decision: Used workspace-based monorepo structure
- Pros: Shared code, consistent tooling, easier dependency management
- Cons: Larger repository size, potential build complexity
- Rationale: Benefits outweigh complexity for full-stack application

**SQLite vs. PostgreSQL for Development**
- Decision: Used SQLite for development database
- Pros: Zero setup, portable, fast for development
- Cons: Limited concurrent writes, not production-ready for high load
- Rationale: Perfect for development; easy migration path to PostgreSQL

**TypeORM vs. Prisma**
- Decision: Chose TypeORM for ORM
- Pros: Decorator-based entities, good NestJS integration
- Cons: More complex queries, less type-safe than Prisma
- Rationale: Better integration with NestJS ecosystem

### Security & Authentication Decisions

**JWT vs. Session-based Authentication**
- Decision: Implemented JWT-based authentication
- Pros: Stateless, scalable, works well with SPAs
- Cons: Harder to revoke tokens, larger token size
- Rationale: Better suited for API-first architecture

**Role-based vs. Permission-based Access Control**
- Decision: Implemented hierarchical RBAC
- Pros: Simple to understand, easy to implement
- Cons: Less flexible than granular permissions
- Rationale: Meets requirements while keeping complexity manageable

### Frontend Architecture Decisions

**NgRx vs. Simple State Management**
- Decision: Implemented NgRx for state management
- Pros: Predictable state, time-travel debugging, scalable
- Cons: More boilerplate, steeper learning curve
- Rationale: Required by assessment criteria

**TailwindCSS vs. Component Library Styling**
- Decision: Used TailwindCSS for styling
- Pros: Rapid development, consistent design, small bundle size
- Cons: Learning curve, potential CSS bloat
- Rationale: Enables rapid UI development

## Future Considerations

### Security Enhancements
- JWT refresh tokens
- CSRF protection
- Rate limiting
- RBAC caching

### Advanced Features
- Role delegation
- Custom permissions
- Real-time notifications
- Task templates
- File attachments

### Performance Optimizations
- Database indexing
- Redis caching
- CDN integration
- Connection pooling

### Scalability Improvements
- Microservices architecture
- API versioning
- Horizontal scaling
- Database sharding

## Testing

### Backend Testing
```bash
cd apps/api
npm run test
npm run test:e2e
npm run test:cov
```

### Frontend Testing
```bash
cd apps/dashboard
npm run test
```

## Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy with PM2 or similar

### Frontend Deployment
1. Build for production
2. Serve with nginx
3. Configure API endpoints
4. Set up SSL certificates

## License

MIT License

## Author

Biswajit Satapathy - Built as part of the TurboVets coding challenge