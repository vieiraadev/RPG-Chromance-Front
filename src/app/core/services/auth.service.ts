import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string; // Lembrar de ajustar de acordo com back
  refresh_token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private refreshKey = 'refresh_token';

  constructor(private api: ApiService) {}

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/signin', payload).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.access_token);
        if (res.refresh_token) {
          localStorage.setItem(this.refreshKey, res.refresh_token);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
