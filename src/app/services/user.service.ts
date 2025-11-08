import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  private storageKey = 'users_data';

  constructor() {
    this.loadUsersFromStorage();
    this.initializeDefaultUsers();
  }

  getAllUsers(): Observable<User[]> {
    return this.users$;
  }

  getUserById(id: string): Observable<User | undefined> {
    const users = this.usersSubject.value;
    const user = users.find(u => u.id === id);
    return of(user);
  }

  addUser(user: Omit<User, 'id'>): Observable<User> {
    return new Observable(observer => {
      setTimeout(() => {
        const users = this.usersSubject.value;
        const newUser: User = {
          ...user,
          id: this.generateId()
        };
        const updatedUsers = [...users, newUser];
        this.usersSubject.next(updatedUsers);
        this.saveUsersToStorage(updatedUsers);
        observer.next(newUser);
        observer.complete();
      }, 300);
    });
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return new Observable(observer => {
      setTimeout(() => {
        const users = this.usersSubject.value;
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          const updatedUser: User = {
            ...users[index],
            ...user,
            id
          };
          users[index] = updatedUser;
          this.usersSubject.next([...users]);
          this.saveUsersToStorage(users);
          observer.next(updatedUser);
        }
        observer.complete();
      }, 300);
    });
  }

  deleteUser(id: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const users = this.usersSubject.value.filter(u => u.id !== id);
        this.usersSubject.next(users);
        this.saveUsersToStorage(users);
        observer.next(true);
        observer.complete();
      }, 300);
    });
  }

  private initializeDefaultUsers(): void {
    const users = this.usersSubject.value;
    if (users.length === 0) {
      // Add default admin user
      const defaultAdmin: User = {
        id: 'admin_1',
        username: 'admin',
        email: 'admin@pharmacy.com',
        role: 'admin',
        name: 'Administrator'
      };
      this.usersSubject.next([defaultAdmin]);
      this.saveUsersToStorage([defaultAdmin]);
    }
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private loadUsersFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const users = JSON.parse(stored);
        this.usersSubject.next(users);
      } catch (e) {
        console.error('Error loading users from storage', e);
      }
    }
  }

  private saveUsersToStorage(users: User[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }
}


