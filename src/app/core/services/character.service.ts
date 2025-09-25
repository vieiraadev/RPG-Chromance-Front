import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../config/environment';

export interface CharacterAttributes {
  vida: number;
  energia: number;
  forca: number;
  inteligencia: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  chapter: number;
  campaign_id: string;
  obtained_at: string;
  metadata: {
    power?: string;
    rarity?: string;
    effect?: string;
  };
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
  id?: string;
  name: string;
  raca: string;
  classe: string;
  descricao: string;
  atributos: CharacterAttributes;
  inventory?: InventoryItem[]; 
  imageUrl: string;
  user_id?: string;
  is_selected?: boolean;
  created_at: string;
  updated_at?: string;
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
  private selectedCharacterSubject = new BehaviorSubject<CharacterResponse | null>(null);
  public selectedCharacter$ = this.selectedCharacterSubject.asObservable();

  constructor(private http: HttpClient) {}

  createCharacter(character: CharacterCreate): Observable<CharacterResponse> {
    return this.http.post<CharacterResponse>(this.apiUrl, character);
  }

  listCharacters(): Observable<CharacterListResponse> {
    return this.http.get<CharacterListResponse>(this.apiUrl).pipe(
      tap(response => {
        console.log('Characters from API:', response);
        response.characters.forEach(character => {
          if (character.is_selected === undefined) {
            character.is_selected = false;
          }
          if (!character.inventory) {
            character.inventory = [];
          }
        });
      })
    );
  }

  getCharacter(id: string): Observable<CharacterResponse> {
    return this.http.get<CharacterResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(character => {
        console.log('Single character from API:', character);
        if (!character.inventory) {
          character.inventory = [];
        }
      })
    );
  }

  updateCharacter(id: string, character: Partial<CharacterCreate>): Observable<CharacterResponse> {
    return this.http.put<CharacterResponse>(`${this.apiUrl}/${id}`, character);
  }

  deleteCharacter(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  selectCharacter(id: string): Observable<CharacterResponse> {
    return this.http.post<CharacterResponse>(`${this.apiUrl}/${id}/select`, {}).pipe(
      tap(selectedCharacter => {
        this.selectedCharacterSubject.next(selectedCharacter);
        this.refreshCharacterStates();
      })
    );
  }

  private refreshCharacterStates(): void {
  }

  getSelectedCharacter(): Observable<CharacterResponse> {
    return this.http.get<CharacterResponse>(`${this.apiUrl}/selected`).pipe(
      tap(selectedCharacter => {
        this.selectedCharacterSubject.next(selectedCharacter);
      })
    );
  }

  getCharacterInventory(characterId: string): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/${characterId}/inventory`);
  }

  clearSelectedCharacter(): void {
    this.selectedCharacterSubject.next(null);
  }

  getCurrentSelectedCharacter(): CharacterResponse | null {
    return this.selectedCharacterSubject.value;
  }
}