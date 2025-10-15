import { User } from '../models/user.model';
import { Task } from '../models/task.model';

export interface AppState {
  auth: AuthState;
  tasks: TaskState;
  users: UserState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'my-tasks';
}

export interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}
