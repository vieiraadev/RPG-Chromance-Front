import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const hasToken = !!token;

    if (!hasToken) {
      this.router.navigateByUrl('/auth/login');
    }

    return hasToken;
  }
}