import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuditLog } from '../../core/models/audit-log.model';
import { Task, TaskStatus, TaskPriority, CreateTaskDto, UpdateTaskDto } from '../../core/models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Task Management</h1>
              <p class="text-gray-600">Welcome back, {{ currentUser?.firstName }}!</p>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-500">Role: {{ currentUser?.role }}</span>
              <button
                *ngIf="currentUser?.role === 'owner' || currentUser?.role === 'admin'"
                (click)="navigateToUsers()"
                class="btn-secondary"
              >
                Manage Users
              </button>
              <button
                *ngIf="currentUser?.role === 'owner' || currentUser?.role === 'admin'"
                (click)="showAuditLogs = !showAuditLogs"
                class="btn-secondary"
              >
                {{ showAuditLogs ? 'Hide' : 'View' }} Audit Logs
              </button>
              <button
                (click)="logout()"
                class="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Create Task Form -->
          <div class="card mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Create New Task</h2>
            <form [formGroup]="taskForm" (ngSubmit)="createTask()">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    formControlName="title"
                    class="input-field"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select formControlName="priority" class="input-field">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    formControlName="category"
                    class="input-field"
                    placeholder="Category"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    formControlName="dueDate"
                    class="input-field"
                  />
                </div>
              </div>
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  class="input-field"
                  placeholder="Task description"
                ></textarea>
              </div>
              <div class="mt-4">
                <button
                  type="submit"
                  [disabled]="taskForm.invalid || isCreating"
                  class="btn-primary"
                >
                  {{ isCreating ? 'Creating...' : 'Create Task' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Task List -->
          <div class="card">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Tasks</h2>
              <div class="flex space-x-2">
                <button
                  (click)="filter = 'all'"
                  [class]="filter === 'all' ? 'btn-primary' : 'btn-secondary'"
                >
                  All Tasks
                </button>
                <button
                  (click)="filter = 'my-tasks'"
                  [class]="filter === 'my-tasks' ? 'btn-primary' : 'btn-secondary'"
                >
                  My Tasks
                </button>
              </div>
            </div>

            <!-- Task Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                *ngFor="let task of filteredTasks"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                [class]="getPriorityClass(task.priority)"
              >
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-semibold text-gray-900">{{ task.title }}</h3>
                  <div class="flex space-x-2">
                    <button
                      *ngIf="canEditTask(task)"
                      (click)="editTask(task)"
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      *ngIf="canDeleteTask(task)"
                      (click)="deleteTask(task.id)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p *ngIf="task.description" class="text-gray-600 text-sm mb-2">
                  {{ task.description }}
                </p>
                
                <div class="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span>Created by: {{ task.createdBy.firstName }} {{ task.createdBy.lastName }}</span>
                  <span>{{ task.category }}</span>
                </div>
                
                <div class="flex justify-between items-center">
                  <select
                    [value]="task.status"
                    (change)="updateTaskStatus(task.id, $event)"
                    class="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <span *ngIf="task.dueDate" class="text-xs text-gray-500">
                    Due: {{ formatDate(task.dueDate) }}
                  </span>
                </div>
              </div>
            </div>

            <div *ngIf="filteredTasks.length === 0" class="text-center py-8 text-gray-500">
              No tasks found
            </div>
          </div>

          <!-- Audit Logs Section -->
          <div *ngIf="showAuditLogs" class="card mt-8">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Audit Logs</h2>
              <button
                (click)="loadAuditLogs()"
                class="btn-secondary"
              >
                Refresh
              </button>
            </div>

            <div *ngIf="auditLogs.length === 0 && !isLoadingAuditLogs" class="text-center py-8 text-gray-500">
              No audit logs found
            </div>

            <div *ngIf="isLoadingAuditLogs" class="text-center py-8 text-gray-500">
              Loading audit logs...
            </div>

            <div *ngIf="auditLogs.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let log of auditLogs" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(log.timestamp) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                          <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-xs font-medium text-gray-700">
                              {{ log.user.firstName.charAt(0) }}{{ log.user.lastName.charAt(0) }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900">
                            {{ log.user.firstName }} {{ log.user.lastName }}
                          </div>
                          <div class="text-sm text-gray-500">{{ log.user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" [ngClass]="getActionBadgeClass(log.action)">
                        {{ log.action }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ log.resource }} #{{ log.resourceId }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                      {{ log.details }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <!-- Edit Task Modal -->
      <div *ngIf="isEditing" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
            <form [formGroup]="editForm" (ngSubmit)="saveEdit()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    formControlName="title"
                    class="input-field"
                    placeholder="Task title"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    formControlName="description"
                    rows="3"
                    class="input-field"
                    placeholder="Task description"
                  ></textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select formControlName="priority" class="input-field">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select formControlName="status" class="input-field">
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      formControlName="category"
                      class="input-field"
                      placeholder="Category"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      formControlName="dueDate"
                      class="input-field"
                    />
                  </div>
                </div>
              </div>
              
              <div class="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  (click)="cancelEdit()"
                  class="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="editForm.invalid || isCreating"
                  class="btn-primary"
                >
                  {{ isCreating ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentUser = this.authService.getCurrentUser();
  taskForm: FormGroup;
  editForm: FormGroup;
  private _filter: 'all' | 'my-tasks' = 'all';
  
  get filter(): 'all' | 'my-tasks' {
    return this._filter;
  }
  
  set filter(value: 'all' | 'my-tasks') {
    this._filter = value;
    this.applyFilter();
  }
  isCreating = false;
  isEditing = false;
  editingTask: Task | null = null;
  showAuditLogs = false;
  auditLogs: AuditLog[] = [];
  isLoadingAuditLogs = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private auditLogService: AuditLogService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // Set up the form for creating new tasks
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: [''],
      priority: ['medium'],
      category: ['General'],
      dueDate: ['']
    });

    // Set up the form for editing existing tasks
    this.editForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: [''],
      priority: ['medium'],
      category: ['General'],
      dueDate: [''],
      status: ['todo']
    });
  }

  ngOnInit() {
    // Load tasks when the component starts
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  applyFilter() {
    if (this.filter === 'my-tasks') {
      const currentUserId = parseInt(this.currentUser?.id || '0');
      
      this.filteredTasks = this.tasks.filter(task => {
        const isCreatedByMe = task.createdById === currentUserId;
        const isAssignedToMe = task.assignedToId === currentUserId;
        
        return isCreatedByMe || isAssignedToMe;
      });
    } else {
      this.filteredTasks = this.tasks;
    }
  }

  canEditTask(task: Task): boolean {
    if (!this.currentUser) return false;
    
    const currentUserRole = this.currentUser.role;
    const currentUserId = parseInt(this.currentUser.id);
    
    // Owners and Admins can edit all tasks
    if (currentUserRole === 'owner' || currentUserRole === 'admin') {
      return true;
    }
    
    // Viewers can only edit tasks they created
    if (currentUserRole === 'viewer') {
      return task.createdById === currentUserId;
    }
    
    return false;
  }

  canDeleteTask(task: Task): boolean {
    if (!this.currentUser) return false;
    
    const currentUserRole = this.currentUser.role;
    const currentUserId = parseInt(this.currentUser.id);
    
    // Owners and Admins can delete all tasks
    if (currentUserRole === 'owner' || currentUserRole === 'admin') {
      return true;
    }
    
    // Viewers can only delete tasks they created
    if (currentUserRole === 'viewer') {
      return task.createdById === currentUserId;
    }
    
    return false;
  }

  createTask() {
    if (this.taskForm.valid) {
      this.isCreating = true;
      const taskData: CreateTaskDto = this.taskForm.value;
      
      this.taskService.createTask(taskData).subscribe({
        next: (newTask) => {
          this.tasks.unshift(newTask);
          this.applyFilter();
          this.taskForm.reset();
          this.taskForm.patchValue({ priority: 'medium', category: 'General' });
          this.isCreating = false;
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.isCreating = false;
        }
      });
    }
  }

  updateTaskStatus(taskId: number, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as TaskStatus;
    
    const updateData: UpdateTaskDto = { status: newStatus };
    
    this.taskService.updateTask(taskId, updateData).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.applyFilter();
        }
      },
      error: (error) => {
        console.error('Error updating task:', error);
      }
    });
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.editForm.patchValue({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category || 'General',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status
    });
    this.isEditing = true;
  }

  saveEdit() {
    if (this.editForm.valid && this.editingTask) {
      this.isCreating = true; // Reuse the loading state
      const updateData: UpdateTaskDto = this.editForm.value;
      
      this.taskService.updateTask(this.editingTask.id, updateData).subscribe({
        next: (updatedTask) => {
          const index = this.tasks.findIndex(t => t.id === this.editingTask!.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
            this.applyFilter();
          }
          this.cancelEdit();
          this.isCreating = false;
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.isCreating = false;
        }
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingTask = null;
    this.editForm.reset();
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'border-l-4 border-red-500';
      case TaskPriority.HIGH:
        return 'border-l-4 border-orange-500';
      case TaskPriority.MEDIUM:
        return 'border-l-4 border-yellow-500';
      case TaskPriority.LOW:
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  logout() {
    this.authService.logout();
  }

  loadAuditLogs() {
    this.isLoadingAuditLogs = true;
    this.auditLogService.getAuditLogs().subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.isLoadingAuditLogs = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.isLoadingAuditLogs = false;
      }
    });
  }

  getActionBadgeClass(action: string): string {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'READ': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
