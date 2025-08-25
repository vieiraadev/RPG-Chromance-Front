import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl; 

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: HttpParams) {
    return this.http.get<T>(this.base + path, { params });
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(this.base + path, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.base + path);
  }
}
