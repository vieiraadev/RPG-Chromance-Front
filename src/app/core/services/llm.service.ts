import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../config/environment';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ContextualAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  priority: number;
  category: string;
}

export interface LLMChatRequest {
  message: string;
  character_id?: string;
  conversation_history?: ChatMessage[];
  generate_actions?: boolean;
  interaction_count?: number; 
}

export interface LLMChatResponse {
  success: boolean;
  response?: string;
  contextual_actions?: ContextualAction[];
  error?: string;
  usage?: any;
  progression?: ProgressionInfo;
}

export interface CharacterSuggestionRequest {
  partial_data: any;
}

export interface ProgressionInfo {
  interaction_count: number;
  max_interactions: number;
  current_phase: 'introduction' | 'development' | 'resolution';
  chapter: number;
  should_provide_reward: boolean;
  progress_percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class LLMService {
  private apiUrl = `${environment.apiBaseUrl}/api/llm`;
  
  private conversationSubject = new BehaviorSubject<ChatMessage[]>([]);
  public conversation$ = this.conversationSubject.asObservable();

  private contextualActionsSubject = new BehaviorSubject<ContextualAction[]>([]);
  public contextualActions$ = this.contextualActionsSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private progressionSubject = new BehaviorSubject<ProgressionInfo | null>(null);
  public progression$ = this.progressionSubject.asObservable();

  constructor(private http: HttpClient) {}

  async sendMessage(
    message: string, 
    characterId?: string,
    generateActions: boolean = true
  ): Promise<LLMChatResponse> {
    return this.sendMessageWithProgression(message, characterId, generateActions, 1);
  }

  async sendMessageWithProgression(
    message: string, 
    characterId?: string,
    generateActions: boolean = true,
    interactionCount: number = 1
  ): Promise<LLMChatResponse> {
    try {
      this.loadingSubject.next(true);
      
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      const currentConversation = this.conversationSubject.value;
      this.conversationSubject.next([...currentConversation, userMessage]);
      
      const request: LLMChatRequest = {
        message,
        character_id: characterId,
        conversation_history: currentConversation,
        generate_actions: generateActions,
        interaction_count: interactionCount 
      };

      const response = await this.http.post<LLMChatResponse>(
        `${this.apiUrl}/chat`, 
        request
      ).toPromise();

      if (response?.success && response.response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date()
        };
        
        this.conversationSubject.next([...this.conversationSubject.value, assistantMessage]);
        
        if (response.contextual_actions && response.contextual_actions.length > 0) {
          this.contextualActionsSubject.next(response.contextual_actions);
        }

        if (response.progression) {
          this.progressionSubject.next(response.progression);
        }
      }

      return response!;
      
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);

      let errorMessage = 'Erro ao comunicar com a LLM';
      
      if (error?.error?.detail) {
        errorMessage = error.error.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        contextual_actions: []
      };
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async executeContextualAction(action: ContextualAction, characterId?: string): Promise<LLMChatResponse> {
    const actionMessage = `Executar ação: "${action.name}" - ${action.description}`;
    return this.sendMessage(actionMessage, characterId, true);
  }

  async executeContextualActionWithProgression(
    action: ContextualAction, 
    characterId?: string, 
    interactionCount: number = 1
  ): Promise<LLMChatResponse> {
    const actionMessage = `Executar ação: "${action.name}" - ${action.description}`;
    return this.sendMessageWithProgression(actionMessage, characterId, true, interactionCount);
  }

  async suggestCharacter(partialData: any): Promise<LLMChatResponse> {
    try {
      this.loadingSubject.next(true);
      
      const request: CharacterSuggestionRequest = {
        partial_data: partialData
      };

      const response = await this.http.post<LLMChatResponse>(
        `${this.apiUrl}/character-suggestion`, 
        request
      ).toPromise();

      return response!;
      
    } catch (error: any) {
      console.error('Erro ao solicitar sugestão:', error);
      return {
        success: false,
        error: 'Erro ao gerar sugestão',
        contextual_actions: []
      };
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/health`).toPromise();
      return response?.available || false;
    } catch (error) {
      console.error('Erro no health check:', error);
      return false;
    }
  }

  async resetChapterProgression(): Promise<boolean> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/reset-progression`, {}).toPromise();
      
      if (response?.success) {
        this.clearConversation();
        this.progressionSubject.next(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao resetar progressão:', error);
      return false;
    }
  }

  clearConversation(): void {
    this.conversationSubject.next([]);
    this.contextualActionsSubject.next([]);
    this.progressionSubject.next(null);
  }

  getCurrentConversation(): ChatMessage[] {
    return this.conversationSubject.value;
  }

  getCurrentContextualActions(): ContextualAction[] {
    return this.contextualActionsSubject.value;
  }

  getCurrentProgression(): ProgressionInfo | null {
    return this.progressionSubject.value;
  }

  setConversation(messages: ChatMessage[]): void {
    this.conversationSubject.next(messages);
  }

  setContextualActions(actions: ContextualAction[]): void {
    this.contextualActionsSubject.next(actions);
  }

  setProgression(progression: ProgressionInfo | null): void {
    this.progressionSubject.next(progression);
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  addCustomAction(action: ContextualAction): void {
    const currentActions = this.contextualActionsSubject.value;
    this.contextualActionsSubject.next([...currentActions, action]);
  }

  removeAction(actionId: string): void {
    const currentActions = this.contextualActionsSubject.value;
    const filteredActions = currentActions.filter(action => action.id !== actionId);
    this.contextualActionsSubject.next(filteredActions);
  }

  getActionsSortedByPriority(): ContextualAction[] {
    return this.getCurrentContextualActions().sort((a, b) => b.priority - a.priority);
  }

  getActionsByCategory(category: string): ContextualAction[] {
    return this.getCurrentContextualActions().filter(action => action.category === category);
  }

  getPhaseDisplayName(phase: string): string {
    switch (phase) {
      case 'introduction': return 'EXPLORAÇÃO';
      case 'development': return 'DESENVOLVIMENTO';  
      case 'resolution': return 'CLÍMAX';
      default: return 'FASE DESCONHECIDA';
    }
  }

  getPhaseColor(phase: string): string {
    switch (phase) {
      case 'introduction': return '#00d4ff'; 
      case 'development': return '#0080ff'; 
      case 'resolution': return '#0066cc';    
      default: return '#747d8c';
    }
  }

  shouldShowFinalRewardHint(interactionCount: number): boolean {
    return interactionCount >= 8;
  }

async loadCampaignHistory(campaignId: string): Promise<{success: boolean, history: any[], lastInteraction: number}> {
  try {
    const response = await this.http.get<any>(
      `${this.apiUrl}/chroma/campaign/${campaignId}/full-context`
    ).toPromise();
    
    if (response?.success && response.conversation_history) {
      return {
        success: true,
        history: response.conversation_history,
        lastInteraction: response.last_interaction || 0
      };
    }
    
    return { success: false, history: [], lastInteraction: 0 };
  } catch (error) {
    console.error('Erro ao carregar histórico do ChromaDB:', error);
    return { success: false, history: [], lastInteraction: 0 };
  }
}

async checkChromaHealth(): Promise<boolean> {
  try {
    const response = await this.http.get<any>(
      `${this.apiUrl}/chroma/health`
    ).toPromise();
    return response?.success || false;
  } catch (error) {
    console.error('Erro no health check do ChromaDB:', error);
    return false;
  }
}

async clearCampaignHistory(campaignId: string): Promise<boolean> {
  try {
    const response = await this.http.delete<any>(
      `${this.apiUrl}/chroma/campaign/${campaignId}`
    ).toPromise();
    
    return response?.success || false;
  } catch (error) {
    console.error('Erro ao limpar histórico do ChromaDB:', error);
    return false;
  }
}

clearCurrentCampaignOnly(campaignId: string): Promise<boolean> {
  return this.http
    .delete<any>(`${this.apiUrl}/chroma/campaign/${campaignId}/current-only`)
    .toPromise()
    .then((response) => {
      console.log('Campaign current limpa:', response);
      return response?.success || false;
    })
    .catch((error) => {
      console.error('Erro ao limpar campaign current:', error);
      return false;
    });
}

clearContextualActions(): void {
  this.contextualActionsSubject.next([]);
}

}