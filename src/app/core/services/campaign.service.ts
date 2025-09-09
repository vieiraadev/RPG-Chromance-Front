import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';

export interface Reward {
  type: string;
  name: string;
  icon: string;
}

export interface Campaign {
  id: string;
  campaign_id: string;
  title: string;
  chapter: number;
  description: string;
  full_description: string;
  image: string;
  thumbnail: string;
  rewards: Reward[];
  is_locked: boolean;
  created_at?: string;
  updated_at?: string;
  
  status?: 'in_progress' | 'completed' | 'cancelled' | null;
  active_character_id?: string | null;
  active_character_name?: string | null;
  current_chapter?: number;
  chapters_completed?: number[];
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
}

export interface ActiveCampaignStatus {
  has_active_campaign: boolean;
  active_campaign: Campaign | null;
}

export interface StartCampaignRequest {
  character_id: string;
  character_name: string;
  campaign_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = `${environment.apiBaseUrl}/api/campaigns`;

  constructor(private http: HttpClient) {}

  
  getCampaigns(): Observable<CampaignListResponse> {
    return this.http.get<CampaignListResponse>(`${this.apiUrl}/`);
  }

  getCampaignById(campaignId: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${campaignId}`);
  }

  seedCampaigns(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/seed`, {});
  }

  getActiveCampaignStatus(): Observable<ActiveCampaignStatus> {
    return this.http.get<ActiveCampaignStatus>(`${this.apiUrl}/active/status`);
  }

  startCampaign(characterId: string, campaignId: string, characterName?: string): Observable<any> {
    const request: StartCampaignRequest = {
      character_id: characterId,
      character_name: characterName || 'Personagem',
      campaign_id: campaignId
    };
    
    return this.http.post<any>(`${this.apiUrl}/start`, request);
  }

  cancelCampaign(campaignId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${campaignId}/cancel`);
  }

  completeChapter(campaignId: string, characterId: string, chapterCompleted: number): Observable<any> {
    const request = {
      character_id: characterId,
      chapter_completed: chapterCompleted
    };
    
    return this.http.put<any>(`${this.apiUrl}/${campaignId}/complete-chapter`, request);
  }
}