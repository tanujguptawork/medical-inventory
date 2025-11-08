import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // TEMPORARY: Using simplified admin check
    // TODO: Replace with proper role-based authentication
    if (this.authService.isTemporaryAdmin()) {
      return true;
    }
    
    this.router.navigate(['/']);
    return false;
  }
}


