// src/app/core/services/llm.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../config/environment';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface LLMChatRequest {
  message: string;
  character_id?: string;
  conversation_history?: ChatMessage[];
}

export interface LLMChatResponse {
  success: boolean;
  response?: string;
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
  
  // Estado do chat atual
  private conversationSubject = new BehaviorSubject<ChatMessage[]>([]);
  public conversation$ = this.conversationSubject.asObservable();
  
  // Estado de loading
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Envia mensagem para a LLM
   */
  async sendMessage(
    message: string, 
    characterId?: string
  ): Promise<LLMChatResponse> {
    try {
      this.loadingSubject.next(true);
      
      // Adiciona mensagem do usuário ao histórico
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
        conversation_history: currentConversation
      };

      const response = await this.http.post<LLMChatResponse>(
        `${this.apiUrl}/chat`, 
        request
      ).toPromise();

      if (response?.success && response.response) {
        // Adiciona resposta da LLM ao histórico
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date()
        };
        
        this.conversationSubject.next([...this.conversationSubject.value, assistantMessage]);
      }

      return response!;
      
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Trata diferentes tipos de erro
      let errorMessage = 'Erro ao comunicar com a LLM';
      
      if (error?.error?.detail) {
        errorMessage = error.error.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Solicita sugestão para personagem
   */
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
        error: 'Erro ao gerar sugestão'
      };
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Verifica se a LLM está disponível
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/health`).toPromise();
      return response?.available || false;
    } catch (error) {
      console.error('Erro no health check:', error);
      return false;
    }
  }

  /**
   * Limpa a conversa atual
   */
  clearConversation(): void {
    this.conversationSubject.next([]);
  }

  /**
   * Obtém a conversa atual
   */
  getCurrentConversation(): ChatMessage[] {
    return this.conversationSubject.value;
  }

  /**
   * Define uma nova conversa
   */
  setConversation(messages: ChatMessage[]): void {
    this.conversationSubject.next(messages);
  }

  /**
   * Verifica se está carregando
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}