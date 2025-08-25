import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

export interface LoginRequest {
  email: string;
  senha: string;   
}

export interface SignupRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserOut {
  id: string;
  nome: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token'; 
  private loggedIn$ = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));
  public isLoggedIn$ = this.loggedIn$.asObservable();

  constructor(private api: ApiService) {}

  signup(body: SignupRequest): Observable<UserOut> {
    return this.api.post<UserOut>('/api/auth/signup', body);
  }

  login(body: LoginRequest): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/api/auth/login', body).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.access_token);
        this.loggedIn$.next(true);
      })
    );
  }

  me(): Observable<UserOut> {
    return this.api.get<UserOut>('/api/auth/me');
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.loggedIn$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
