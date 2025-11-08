import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { AuditLogService } from '../../../services/audit-log.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['username', 'email', 'name', 'role', 'actions'];
  showAddForm = false;
  userForm: FormGroup;
  isEditing = false;
  editingUserId: string | null = null;

  roles = [
    { value: 'admin', viewValue: 'Admin' },
    { value: 'pharmacist', viewValue: 'Pharmacist' },
    { value: 'staff', viewValue: 'Staff' }
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private auditLogService: AuditLogService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      role: ['staff', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  openAddForm(): void {
    this.isEditing = false;
    this.editingUserId = null;
    this.userForm.reset({
      role: 'staff'
    });
    this.showAddForm = true;
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.userForm.reset();
    this.isEditing = false;
    this.editingUserId = null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.isEditing && this.editingUserId) {
        const userId = this.editingUserId;
        const username = userData.username;
        this.userService.updateUser(userId, userData).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.cancelForm();
            this.loadUsers();
            
            this.auditLogService.logAction(
              'update',
              'user',
              userId,
              username,
              undefined,
              `Updated user: ${username}`
            );
          },
          error: () => {
            this.snackBar.open('Error updating user', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        this.userService.addUser(userData).subscribe({
          next: (newUser) => {
            this.snackBar.open('User added successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.cancelForm();
            this.loadUsers();
            
            this.auditLogService.logAction(
              'create',
              'user',
              newUser.id!,
              newUser.username,
              undefined,
              `Added new user: ${newUser.username}`
            );
          },
          error: () => {
            this.snackBar.open('Error adding user', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }

  editUser(user: User): void {
    this.isEditing = true;
    this.editingUserId = user.id || null;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      name: user.name || '',
      role: user.role
    });
    this.showAddForm = true;
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      if (user.id) {
        const userId = user.id;
        const username = user.username;
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadUsers();
            
            this.auditLogService.logAction(
              'delete',
              'user',
              userId,
              username,
              undefined,
              `Deleted user: ${username}`
            );
          },
          error: () => {
            this.snackBar.open('Error deleting user', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }
}

