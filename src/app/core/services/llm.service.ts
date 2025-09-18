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
}

export interface LLMChatResponse {
  success: boolean;
  response?: string;
  contextual_actions?: ContextualAction[];
  error?: string;
  usage?: any;
}

export interface CharacterSuggestionRequest {
  partial_data: any;
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

  constructor(private http: HttpClient) {}

  async sendMessage(
    message: string, 
    characterId?: string,
    generateActions: boolean = true
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
        generate_actions: generateActions
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

  clearConversation(): void {
    this.conversationSubject.next([]);
    this.contextualActionsSubject.next([]);
  }

  getCurrentConversation(): ChatMessage[] {
    return this.conversationSubject.value;
  }

  getCurrentContextualActions(): ContextualAction[] {
    return this.contextualActionsSubject.value;
  }

  setConversation(messages: ChatMessage[]): void {
    this.conversationSubject.next(messages);
  }

  setContextualActions(actions: ContextualAction[]): void {
    this.contextualActionsSubject.next(actions);
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
}