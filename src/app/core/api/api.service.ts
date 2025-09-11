import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: HttpParams) {
    return this.http.get<T>(this.base + path, { 
      params,
      headers: this.getAuthHeaders()
    });
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(this.base + path, body, {
      headers: this.getAuthHeaders(),
    });
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(this.base + path, body, {
      headers: this.getAuthHeaders(),
    });
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.base + path, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }
}