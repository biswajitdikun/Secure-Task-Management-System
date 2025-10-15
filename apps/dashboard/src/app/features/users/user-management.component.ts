import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User, Role, CreateUserDto, UpdateUserDto } from '../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;
  userForm: FormGroup;
  isCreating = false;
  showCreateForm = false;

  roles = Role;
  get roleOptions() {
    const currentUserRole = this.getRoleValue(this.currentUser?.role || '');
    
    if (currentUserRole === 'owner') {
      // Owners can create Admins and Viewers
      return [
        { value: 'viewer', label: 'Viewer' },
        { value: 'admin', label: 'Admin' }
      ];
    } else if (currentUserRole === 'admin') {
      // Admins can only create Viewers
      return [
        { value: 'viewer', label: 'Viewer' }
      ];
    } else {
      // Viewers cannot create users
      return [];
    }
  }

  getRoleUpdateOptions(user: User) {
    const currentUserRole = this.getRoleValue(this.currentUser?.role || '');
    const userRole = this.getRoleValue(user.role);
    
    const options = [
      { value: 'viewer', label: 'Viewer' }
    ];
    
    if (currentUserRole === 'owner') {
      // Only owners can change users to Admin
      options.push({ value: 'admin', label: 'Admin' });
      // Note: Owner role is NOT included - only one Owner can exist
    }
    
    return options;
  }

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      role: ['viewer', [Validators.required]]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
  }


  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      // Reset form to default values when showing
      this.userForm.reset();
      this.userForm.patchValue({ role: 'viewer' });
    }
  }

  createUser() {
    if (this.userForm.valid) {
      this.isCreating = true;
      const formValue = this.userForm.value;
      const userData: CreateUserDto = {
        ...formValue,
        role: this.getRoleEnum(formValue.role)
      };

      this.userService.createUser(userData).subscribe({
        next: (newUser) => {
          this.users.push(newUser);
          this.isCreating = false;
          // Reset form and hide it
          this.userForm.reset();
          this.userForm.patchValue({ role: 'viewer' });
          this.showCreateForm = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.isCreating = false;
        }
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  canDeleteUser(user: User): boolean {
    // Owners and admins can delete users, but cannot delete themselves
    if (!this.currentUser) return false;
    
    const currentUserRole = this.getRoleValue(this.currentUser.role);
    const userRole = this.getRoleValue(user.role);
    
    // Convert both IDs to strings for comparison
    const currentUserId = this.currentUser.id.toString();
    const userId = user.id.toString();
    
    // Cannot delete yourself
    if (userId === currentUserId) return false;
    
    // Role-based deletion permissions
    if (currentUserRole === 'owner') {
      // Owners can delete admins and viewers (but not other owners)
      return userRole === 'admin' || userRole === 'viewer';
    } else if (currentUserRole === 'admin') {
      // Admins can only delete viewers
      return userRole === 'viewer';
    } else {
      // Viewers cannot delete anyone
      return false;
    }
  }

  canCreateUser(): boolean {
    // Only owners and admins can create users
    const currentUserRole = this.getRoleValue(this.currentUser?.role || '');
    return currentUserRole === 'owner' || currentUserRole === 'admin';
  }

  canUpdateUserRole(user: User): boolean {
    // Owners and admins can update user roles, but cannot change their own role or owner roles
    if (!this.currentUser) return false;
    
    const currentUserRole = this.getRoleValue(this.currentUser.role);
    const userRole = this.getRoleValue(user.role);
    
    // Convert both IDs to numbers for comparison
    const currentUserId = parseInt(this.currentUser.id);
    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
    const isNotSelf = userId !== currentUserId;
    
    // Owners and admins can update user roles
    const isOwnerOrAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';
    
    // Cannot update owner roles (only one owner can exist)
    const isNotOwner = userRole !== 'owner';
    
    return isOwnerOrAdmin && isNotSelf && isNotOwner;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  updateUserRole(user: User, newRole: string | Role): void {
    if (!this.canUpdateUserRole(user)) {
      alert('You do not have permission to update user roles.');
      return;
    }

    // Normalize the role value to ensure it's a valid string
    const roleValue = this.getRoleValue(newRole);
    const roleLabel = this.getRoleLabel(newRole);
    
    if (confirm(`Are you sure you want to change ${user.firstName} ${user.lastName}'s role to ${roleLabel}?`)) {
      const updateData: UpdateUserDto = { role: this.getRoleEnum(newRole) };
      this.userService.updateUser(user.id, updateData).subscribe({
        next: (updatedUser) => {
          // Update the user in the local array
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          alert('Failed to update user role. Please try again.');
        }
      });
    }
  }

  getRoleLabel(role: Role | string): string {
    const roleStr = role as string;
    switch (roleStr) {
      case 'owner':
      case Role.OWNER: return 'Owner';
      case 'admin':
      case Role.ADMIN: return 'Admin';
      case 'viewer':
      case Role.VIEWER: return 'Viewer';
      default: return roleStr || 'Unknown';
    }
  }

  getRoleValue(role: Role | string): string {
    const roleStr = role as string;
    switch (roleStr) {
      case 'owner':
      case Role.OWNER: return 'owner';
      case 'admin':
      case Role.ADMIN: return 'admin';
      case 'viewer':
      case Role.VIEWER: return 'viewer';
      default: return roleStr || 'viewer';
    }
  }

  getRoleEnum(role: Role | string): Role {
    const roleStr = role as string;
    switch (roleStr) {
      case 'owner':
      case Role.OWNER: return Role.OWNER;
      case 'admin':
      case Role.ADMIN: return Role.ADMIN;
      case 'viewer':
      case Role.VIEWER: return Role.VIEWER;
      default: return Role.VIEWER;
    }
  }

  getRoleBadgeClass(role: Role | string): string {
    const roleStr = role as string;
    switch (roleStr) {
      case 'owner':
      case Role.OWNER: return 'bg-purple-100 text-purple-800';
      case 'admin':
      case Role.ADMIN: return 'bg-blue-100 text-blue-800';
      case 'viewer':
      case Role.VIEWER: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
