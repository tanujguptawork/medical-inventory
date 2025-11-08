import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<boolean> {
    // In a real app, this would make an HTTP call to your backend
    // For demo purposes, we'll use mock authentication
    return new Observable(observer => {
      setTimeout(() => {
        // Mock authentication - accept any credentials for demo
        if (username && password) {
          // Check if user exists in user service, otherwise create admin
          // For demo, if username is 'admin', make them admin, else staff
          const role = username.toLowerCase() === 'admin' ? 'admin' : 'staff';
          const user: User = {
            id: '1',
            username: username,
            email: `${username}@pharmacy.com`,
            role: role,
            name: username
          };
          
          const token = 'mock_jwt_token_' + Date.now();
          localStorage.setItem(this.TOKEN_KEY, token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 500); // Simulate API delay
    });
  }

  // TEMPORARY METHOD: This is a quick check for admin access
  // TODO: Remove this method and implement proper role-based authentication
  isTemporaryAdmin(): boolean {
    const user = this.currentUserSubject.value;
    // Temporary check - just verifies if username is 'admin'
    return user?.username.toLowerCase() === 'admin';
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user from storage', e);
      }
    }
  }
}

