import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

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
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  
  constructor(private api: ApiService) {}


  getCampaigns(): Observable<CampaignListResponse> {
    return this.api.get<CampaignListResponse>('/api/campaigns/');
  }
  
  getCampaignById(campaignId: string): Observable<Campaign> {
    return this.api.get<Campaign>(`/api/campaigns/${campaignId}`);
  }
  
  seedCampaigns(): Observable<Campaign[]> {
    return this.api.post<Campaign[]>('/api/campaigns/seed', {});
  }
}