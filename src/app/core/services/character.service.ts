import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';

export interface CharacterAttributes {
  forca: number;
  inteligencia: number;
  carisma: number;
  destreza: number;
}

export interface CharacterCreate {
  name: string;
  raca: string;
  classe: string;
  descricao?: string;
  atributos: CharacterAttributes;
  imageUrl: string;
}

export interface CharacterResponse {
  _id: string;
  name: string;
  raca: string;
  classe: string;
  descricao: string;
  atributos: CharacterAttributes;
  imageUrl: string;
  user_id?: string;
  created_at: string;
  active: boolean;
}

export interface CharacterListResponse {
  characters: CharacterResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiUrl = `${environment.apiBaseUrl}/api/characters`;

  constructor(private http: HttpClient) {}

  createCharacter(character: CharacterCreate): Observable<CharacterResponse> {
    return this.http.post<CharacterResponse>(this.apiUrl, character);
  }

  listCharacters(): Observable<CharacterListResponse> {
    return this.http.get<CharacterListResponse>(this.apiUrl);
  }

  getCharacter(id: string): Observable<CharacterResponse> {
    return this.http.get<CharacterResponse>(`${this.apiUrl}/${id}`);
  }

  updateCharacter(id: string, character: Partial<CharacterCreate>): Observable<CharacterResponse> {
    return this.http.put<CharacterResponse>(`${this.apiUrl}/${id}`, character);
  }

  deleteCharacter(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}