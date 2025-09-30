import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { LLMService, ChatMessage, ContextualAction, ProgressionInfo } from '../../../core/services/llm.service';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { CharacterService, CharacterResponse, InventoryItem } from '../../../core/services/character.service';
import { NotificationService } from '@app/core/services/notification.service';
import { ConfirmationService } from '@app/core/services/confirmation.service';

interface StoryEntry {
  timestamp: string;
  type: 'system' | 'narrator' | 'player' | 'llm';
  message: string;
}

interface CharacterAttribute {
  name: string;
  value: number;
  max: number;
}

interface EquipmentSlot {
  type: string;
  icon: string;
  item?: {
    name: string;
    quality: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, LoaderComponent],
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss']
})
export class GamePageComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('storyContent') storyContent!: ElementRef;

  isLoading = false;
  isInitialLoading = true;
  isCharacterPanelCollapsed = true;
  llmLoading = false;

  activeCharacter: CharacterResponse | null = null;
  activeCampaign: Campaign | null = null;
  
  characterName = 'Personagem';
  characterLevel = 1;
  currentCharacterId: string | undefined;

  private subscriptions: Subscription[] = [];

  storyLog: StoryEntry[] = [];
  availableActions: ContextualAction[] = [];

  customCommand = '';
  llmSuggestions = [
    'Quem sou eu? ',
    'Descreva o ambiente',
    'O que devo fazer agora?',
  ];

  characterAttributes: CharacterAttribute[] = [];

  currentInteractionCount = 1;
  maxInteractions = 10;
  currentPhase: 'introduction' | 'development' | 'resolution' = 'introduction';
  progressPercentage = 10;
  currentProgression: ProgressionInfo | null = null;

  private shouldScrollToBottom = false;

  constructor(
    private llmService: LLMService,
    private campaignService: CampaignService,
    private characterService: CharacterService,
    private notification: NotificationService,
    private confirmation: ConfirmationService
  ) {}

  get equipmentSlots(): EquipmentSlot[] {
    const inventory = this.activeCharacter?.inventory || [];
    
    return inventory.map(item => ({
      type: item.type,
      icon: this.getItemIcon(item),
      item: {
        name: item.name,
        quality: this.mapRarityToQuality(item.metadata?.rarity)
      }
    }));
  }

  ngOnInit() {
    setTimeout(() => {
      this.isInitialLoading = false;
      this.loadGameData();
    }, 4000);
  
    const loadingSub = this.llmService.loading$.subscribe(loading => {
      this.llmLoading = loading;
    });
    this.subscriptions.push(loadingSub);
  
    const actionsSub = this.llmService.contextualActions$.subscribe(actions => {
      this.availableActions = actions;
      if (actions.length > 0 && !this.isInitialLoading) {
        this.addStoryEntry('system', `${actions.length} novas ações contextuais disponíveis.`);
      }
    });
    this.subscriptions.push(actionsSub);
  
    const progressionSub = this.llmService.progression$.subscribe(progression => {
      this.currentProgression = progression;
      if (progression) {
        this.updateProgressionFromServer(progression);
      }
    });
    this.subscriptions.push(progressionSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  resetProgressionForNewChapter() {
    this.currentInteractionCount = 1;
    this.updateProgressionState();
    this.addStoryEntry('system', `Nova progressão de capítulo iniciada (1/10 interações)`);
  }

  updateProgressionState() {
    this.progressPercentage = (this.currentInteractionCount / this.maxInteractions) * 100;
    
    if (this.currentInteractionCount <= 3) {
      this.currentPhase = 'introduction';
    } else if (this.currentInteractionCount <= 7) {
      this.currentPhase = 'development';
    } else {
      this.currentPhase = 'resolution';
    }
  }

  updateProgressionFromServer(progression: ProgressionInfo) {
    this.currentInteractionCount = progression.interaction_count;
    this.maxInteractions = progression.max_interactions;
    this.currentPhase = progression.current_phase;
    this.progressPercentage = progression.progress_percentage;
  }

  getPhaseDisplayName(): string {
    return this.llmService.getPhaseDisplayName(this.currentPhase);
  }

  getPhaseColor(): string {
    return this.llmService.getPhaseColor(this.currentPhase);
  }

  shouldShowFinalRewardHint(): boolean {
    return this.llmService.shouldShowFinalRewardHint(this.currentInteractionCount);
  }

  async resetChapterProgression() {
    try {
      const success = await this.llmService.resetChapterProgression();
      if (success) {
        this.resetProgressionForNewChapter();
        this.clearStoryLog();
        this.addStoryEntry('system', 'Capítulo reiniciado. Nova progressão narrativa iniciada.');
      } else {
        this.addStoryEntry('system', 'Erro ao reiniciar capítulo. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao resetar progressão:', error);
      this.addStoryEntry('system', 'Erro ao reiniciar capítulo.');
    }
  }

  private async loadGameData() {
    this.isLoading = true;
    this.resetProgressionForNewChapter();
    
    try {
      const activeCampaignStatus = await this.campaignService.getActiveCampaignStatus().toPromise();
      
      if (activeCampaignStatus && activeCampaignStatus.has_active_campaign && activeCampaignStatus.active_campaign) {
        this.activeCampaign = activeCampaignStatus.active_campaign;
        
        await this.loadCampaignHistoryFromChroma(this.activeCampaign.campaign_id);
        
        if (this.storyLog.length === 0) {
          this.addDefaultStoryMessages();
        }
        
        if (this.activeCampaign.active_character_id) {
          try {
            const character = await this.characterService.getCharacter(this.activeCampaign.active_character_id).toPromise();
            
            if (character) {
              this.activeCharacter = character;
              this.updateCharacterDisplay(character);
              this.currentCharacterId = character._id;
              
              console.log('Inventário do personagem:', character.inventory);
              
              if (this.storyLog.length === 0) {
                this.addStoryEntry('system', `Personagem carregado: ${character.name} (${character.raca} ${character.classe})`);
              }
              
              if (character.inventory && character.inventory.length > 0) {
                this.addStoryEntry('system', `${character.inventory.length} itens carregados no inventário.`);
              }
              
              this.notification.info(`Bem-vindo, ${character.name}!`);
            }
          } catch (characterError) {
            console.error('Erro ao carregar personagem ativo:', characterError);
            this.notification.error('Erro ao carregar dados do personagem.');
            this.addStoryEntry('system', 'Erro ao carregar dados do personagem. Usando dados padrão.');
          }
        } else {
          if (this.storyLog.length === 0) {
            this.addStoryEntry('system', `Campanha ${this.activeCampaign.title} ativa, mas sem personagem definido.`);
          }
        }
      } else {
        this.addDefaultStoryMessages();
        
        try {
          const character = await this.characterService.getSelectedCharacter().toPromise();
          if (character) {
            this.activeCharacter = character;
            this.updateCharacterDisplay(character);
            this.currentCharacterId = character._id;
            
            console.log('Inventário do personagem:', character.inventory);
            
            this.addStoryEntry('system', `Personagem selecionado carregado: ${character.name}`);
            
            if (character.inventory && character.inventory.length > 0) {
              this.addStoryEntry('system', `${character.inventory.length} itens no inventário.`);
            }
            
            this.notification.warning('Nenhuma campanha ativa. Usando personagem selecionado.');
          } else {
            this.addStoryEntry('system', 'Nenhuma campanha ativa ou personagem selecionado encontrado.');
            this.notification.warning('Nenhuma campanha ativa ou personagem selecionado encontrado.');
          }
        } catch (selectedError) {
          console.error('Erro ao carregar personagem selecionado:', selectedError);
          this.addStoryEntry('system', 'Nenhum personagem encontrado. Usando dados padrão.');
          this.notification.error('Nenhum personagem encontrado.');
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do jogo:', error);
      this.addDefaultStoryMessages();
      this.addStoryEntry('system', 'Erro ao carregar dados. Usando configurações padrão.');
      this.notification.error('Erro ao carregar dados do jogo.');
    } finally {
      this.isLoading = false;
    }
  }

  private addDefaultStoryMessages() {
    if (this.activeCampaign) {
      const chapterMessages = this.getChapterMessages(this.activeCampaign.title);
      
      this.addStoryEntry('system', chapterMessages.system);
      this.addStoryEntry('narrator', chapterMessages.narrator);
    } else {
      this.addStoryEntry('system', 'Interface neural ativada. Bem-vindo ao setor 7.');
      this.addStoryEntry('narrator', 'Você se encontra em um beco escuro da cidade. O som de sirenes ecoa à distância enquanto as luzes de neon piscam nas paredes molhadas. Sua respiração está pesada após a fuga dos seguranças corporativos.');
    }
  }

  private async loadCampaignHistoryFromChroma(campaignId: string) {
    try {
      console.log(`Carregando histórico do ChromaDB para campanha: ${campaignId}`);
      
      const result = await this.llmService.loadCampaignHistory(campaignId);
      
      if (result.success && result.history.length > 0) {
        console.log(`${result.history.length} mensagens carregadas do histórico`);
        
        this.storyLog = [];
        
        this.addStoryEntry('system', `Histórico carregado: ${result.history.length} interações anteriores recuperadas`);
        
        result.history.forEach((msg: any) => {
          if (msg.role === 'user') {
            this.addStoryEntry('player', msg.content);
          } else if (msg.role === 'assistant') {
            this.addStoryEntry('llm', msg.content);
          }
        });
        
        if (result.lastInteraction > 0) {
          this.currentInteractionCount = result.lastInteraction + 1;
          this.updateProgressionState();
          
          this.addStoryEntry('system', 
            `Continuando do ponto anterior - Interação ${this.currentInteractionCount}/${this.maxInteractions}`
          );
        }
        
        const conversationHistory = result.history.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        this.llmService.setConversation(conversationHistory);
        
      } else {
        console.log('Nenhum histórico encontrado no ChromaDB para esta campanha');
      }
      
    } catch (error) {
      console.error('Erro ao carregar histórico do ChromaDB:', error);
      this.addStoryEntry('system', 'Não foi possível carregar histórico anterior. Iniciando nova sessão.');
    }
  }

  private getChapterMessages(campaignTitle: string): { system: string; narrator: string } {
    const title = campaignTitle.toLowerCase();
    
    if (title.includes('cubo') && title.includes('sombras')) {
      return {
        system: 'Interface neural ativada. Conectando com a catedral em ruínas...',
        narrator: 'CAPÍTULO 1: O CUBO DAS SOMBRAS. Você se encontra nas profundezas de uma catedral em ruínas onde energia sombria pulsa entre as pedras antigas. OBJETIVO: Encontrar a Relíquia Perdida - um cubo pulsante de poder ancestral escondido nos destroços sagrados. Os sussurros das paredes indicam que você não está sozinho aqui.'
      };
    }
    
    if ((title.includes('laboratório') || title.includes('laboratorio')) && title.includes('cristais')) {
      return {
        system: 'Interface neural ativada. Infiltração no complexo científico iniciada...',
        narrator: 'CAPÍTULO 2: LABORATÓRIO DE CRISTAIS ARCANOS. Você infiltra um laboratório subterrâneo onde cristais instáveis emanam energia perigosa em recipientes de contenção. OBJETIVO: Roubar os dados dos experimentos proibidos e escapar antes que os sistemas de segurança detectem sua presença. O ar vibra com magia e tecnologia entrelaçadas.'
      };
    }
    
    if (title.includes('coliseu') && title.includes('neon')) {
      return {
        system: 'Interface neural ativada. Entrando na zona de combate urbana...',
        narrator: 'CAPÍTULO 3: COLISEU DE NEON. Você está nas ruas de uma cidade subterrânea iluminada por luzes vibrantes, onde o rugido da multidão ecoa do grande Coliseu. OBJETIVO: Sobreviver às batalhas da arena e derrotar o campeão cibernético para ganhar sua liberdade. Gladiadores se preparam ao seu redor enquanto o cheiro de ozônio preenche o ar.'
      };
    }
    
    return {
      system: `Interface neural ativada. Conectando com ${campaignTitle}...`,
      narrator: `Você inicia sua jornada em ${campaignTitle}. O ar está carregado de possibilidades enquanto você se prepara para enfrentar os desafios que aguardam. Sua determinação será testada neste mundo onde tecnologia e humanidade se entrelaçam de formas inesperadas.`
    };
  }

  private updateCharacterDisplay(character: CharacterResponse) {
    this.characterName = character.name;
    this.characterLevel = 1;
    
    if (character.atributos) {
      this.characterAttributes = [
        { 
          name: 'Vida', 
          value: Math.min(character.atributos.vida || 20, 20), 
          max: 20 
        },
        { 
          name: 'Energia', 
          value: Math.min(character.atributos.energia || 20, 20), 
          max: 20 
        },
        { 
          name: 'Força', 
          value: Math.min(character.atributos.forca || 10, 20), 
          max: 20 
        },
        { 
          name: 'Inteligência', 
          value: Math.min(character.atributos.inteligencia || 10, 20), 
          max: 20 
        }
      ];
    } else {
      this.characterAttributes = [
        { name: 'Vida', value: 20, max: 20 },
        { name: 'Energia', value: 20, max: 20 },
        { name: 'Força', value: 10, max: 20 },
        { name: 'Inteligência', value: 10, max: 20 }
      ];
    }
  }

  get displayCharacterName(): string {
    return this.activeCharacter?.name || this.characterName;
  }

  get displayCharacterClass(): string {
    return this.activeCharacter?.classe || 'Aventureiro';
  }

  get displayCharacterRace(): string {
    return this.activeCharacter?.raca || 'Humano';
  }

  get displayCharacterDescription(): string {
    return this.activeCharacter?.descricao || 'Personagem padrão';
  }

  get displayCharacterImage(): string {
    return this.activeCharacter?.imageUrl || 'assets/images/character-avatar.jpg';
  }

  getCurrentTimestamp(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  }

  private scrollToBottom() {
    if (this.storyContent) {
      const element = this.storyContent.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private addStoryEntry(type: 'system' | 'narrator' | 'player' | 'llm', message: string) {
    this.storyLog.push({
      timestamp: this.getCurrentTimestamp(),
      type,
      message
    });
    this.shouldScrollToBottom = true;
  }

  async sendLLMMessage() {
    if (!this.customCommand.trim() || this.llmLoading) {
      return;
    }
  
    const message = this.customCommand.trim();
    this.customCommand = '';
  
    this.addStoryEntry('player', message);
  
    this.addStoryEntry('system', 
      `Interação ${this.currentInteractionCount}/10 | Fase: ${this.getPhaseDisplayName()}${
        this.shouldShowFinalRewardHint() ? ' | ZONA DE RECOMPENSA!' : ''
      }`
    );
  
    try {
      const response = await this.llmService.sendMessageWithProgression(
        message, 
        this.currentCharacterId, 
        true, 
        this.currentInteractionCount
      );
  
      if (response.success && response.response) {
        this.addStoryEntry('llm', response.response);
        
        this.currentInteractionCount++;
        this.updateProgressionState();
  
        if (this.currentInteractionCount > this.maxInteractions) {
          this.notification.success('Capítulo concluído!');
          this.addStoryEntry('system', 'Capítulo concluído! Progressão resetada para novo ciclo.');
          this.resetProgressionForNewChapter();
        }
        
        if (response.progression) {
          this.handleProgressionInfo(response.progression);
        }
        
      } else {
        this.notification.error(response.error || 'Falha na comunicação com o Mestre IA');
        this.addStoryEntry('system', `Erro: ${response.error || 'Falha na comunicação'}`);
      }
  
    } catch (error) {
      console.error('Erro ao enviar mensagem para LLM:', error);
      this.notification.error('Erro de conexão com o Mestre IA.');
      this.addStoryEntry('system', 'Erro de conexão com o Mestre IA.');
    }
  }

  handleProgressionInfo(progression: ProgressionInfo) {
    console.log('Informações de progressão:', progression);
    
    if (progression.should_provide_reward) {
      this.addStoryEntry('system', 'O Mestre IA está preparando recompensas finais...');
    }
  }

  async quickLLMAction(action: string) {
    this.customCommand = action;
    await this.sendLLMMessage();
  }

  async performContextAction(action: ContextualAction) {
    this.addStoryEntry('player', `${action.name}: ${action.description}`);
    
    this.addStoryEntry('system', 
      `Interação ${this.currentInteractionCount}/10 | Fase: ${this.getPhaseDisplayName()}`
    );
    
    this.isLoading = true;
    
    try {
      const response = await this.llmService.executeContextualActionWithProgression(
        action, 
        this.currentCharacterId, 
        this.currentInteractionCount
      );
      
      if (response.success && response.response) {
        this.addStoryEntry('llm', response.response);

        this.currentInteractionCount++;
        this.updateProgressionState();
        
        if (this.currentInteractionCount > this.maxInteractions) {
          this.addStoryEntry('system', 'Capítulo concluído! Progressão resetada para novo ciclo.');
          this.resetProgressionForNewChapter();
        }
        
      } else {
        this.addStoryEntry('system', `Erro ao executar ação: ${response.error}`);
      }
    } catch (error) {
      console.error('Erro ao executar ação contextual:', error);
      this.addStoryEntry('system', 'Erro ao processar ação.');
    } finally {
      this.isLoading = false;
    }
  }

  performAction(action: string) {
    this.addStoryEntry('player', `Ação: ${action}`);
    
    switch (action) {
      case 'examine':
        this.addStoryEntry('narrator', 'Você examina cuidadosamente os arredores, notando detalhes que haviam passado despercebidos anteriormente.');
        break;
      case 'inventory':
        this.addStoryEntry('system', 'Verificando inventário... Painel lateral atualizado.');
        break;
      case 'stats':
        this.addStoryEntry('system', 'Analisando status do personagem... Dados biométricos atualizados.');
        break;
      case 'help':
        this.addStoryEntry('system', 'Digite comandos para interagir com o Mestre IA ou use os botões de ação rápida. As ações contextuais são geradas dinamicamente pela IA baseadas na situação atual.');
        break;
    }
  }

  executeCustomCommand() {
    if (this.customCommand.trim()) {
      this.sendLLMMessage();
    }
  }

  applySuggestion(suggestion: string) {
    this.customCommand = suggestion;
  }

  async clearStoryLog() {
    this.confirmation.confirm({
      title: 'Limpar Histórico',
      message: 'Deseja realmente limpar todo o histórico desta campanha? Esta ação não pode ser desfeita.',
      confirmText: 'Limpar',
      cancelText: 'Cancelar',
      type: 'warning'
    }).subscribe(async (confirmed) => {
      if (confirmed) {
        this.storyLog = [];
        this.llmService.clearConversation();
  
        if (this.activeCampaign?.campaign_id) {
          try {
            this.addStoryEntry('system', 'Limpando histórico...');
            
            const success = await this.llmService.clearCampaignHistory(this.activeCampaign.campaign_id);
            
            if (success) {
              this.notification.success('Histórico limpo com sucesso!');
            } else {
              this.notification.warning('Não foi possível limpar o histórico do ChromaDB.');
            }
          } catch (error) {
            console.error('Erro ao limpar ChromaDB:', error);
            this.notification.error('Erro ao limpar histórico do ChromaDB.');
          }
        }
        
        this.addDefaultStoryMessages();
        this.shouldScrollToBottom = true;
        this.resetProgressionForNewChapter();
      }
    });
  }

  toggleCharacterPanel() {
    this.isCharacterPanelCollapsed = !this.isCharacterPanelCollapsed;
    
    if (this.isCharacterPanelCollapsed) {
      this.addStoryEntry('system', 'Painel de personagem ocultado.');
    } else {
      this.addStoryEntry('system', 'Painel de personagem ativado. Dados biométricos e equipamentos carregados.');
    }
  }

  changeAvatar() {
    this.addStoryEntry('system', 'Função de alteração de avatar ainda não implementada.');
  }

  useItemFromSlot(slot: EquipmentSlot) {
    if (!this.activeCharacter?._id || !slot.item) {
      this.notification.warning('Nenhum item para usar');
      return;
    }

    const item = this.activeCharacter.inventory?.find(i => i.name === slot.item?.name);
    
    if (!item) {
      this.notification.warning('Item não encontrado no inventário');
      return;
    }

    this.addStoryEntry('player', `Usar: ${item.name}`);
    this.isLoading = true;

    this.characterService.useItem(this.activeCharacter._id, item.id).subscribe({
      next: (updatedCharacter) => {
        this.activeCharacter = updatedCharacter;
        this.updateCharacterDisplay(updatedCharacter);
        
        this.addStoryEntry('narrator', `Você usou ${item.name}. ${item.description}`);
        this.notification.success(`${item.name} usado com sucesso!`);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao usar item:', error);
        this.notification.error('Erro ao usar item');
        this.addStoryEntry('system', 'Erro ao usar item.');
        this.isLoading = false;
      }
    });
  }

  private getItemIcon(item: InventoryItem): string {
    const itemId = item.id.toLowerCase();
    
    if (itemId.includes('cubo_sombras') || itemId.includes('cubo')) {
      return 'bx bx-cube-alt';
    }
    
    if (itemId.includes('cristal_arcano') || itemId.includes('cristal')) {
      return 'bx bx-diamond';
    }
    
    if (itemId.includes('cinturao') || itemId.includes('campeao')) {
      return 'bx bx-medal';
    }
    
    const typeIcons: { [key: string]: string } = {
      'reward': 'bx bx-gift',
      'weapon': 'bx bx-target-lock',
      'armor': 'bx bx-shield',
      'potion': 'bx bx-first-aid',
      'key': 'bx bx-key',
      'artifact': 'bx bx-diamond',
      'tech': 'bx bx-chip',
      'consumable': 'bx bxs-battery'
    };
    
    return typeIcons[item.type] || 'bx bx-cube';
  }

  private mapRarityToQuality(rarity?: string): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
    const rarityMap: { [key: string]: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' } = {
      'comum': 'common',
      'common': 'common',
      'incomum': 'uncommon',
      'uncommon': 'uncommon',
      'raro': 'rare',
      'rare': 'rare',
      'épico': 'epic',
      'epic': 'epic',
      'lendário': 'legendary',
      'legendary': 'legendary'
    };
    
    return rarityMap[rarity?.toLowerCase() || ''] || 'common';
  }

  getActionsByPriority(): ContextualAction[] {
    return this.llmService.getActionsSortedByPriority();
  }

  getActionsByCategory(category: string): ContextualAction[] {
    return this.llmService.getActionsByCategory(category);
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'combat': '#ff4757',
      'stealth': '#2f3542',
      'social': '#5352ed',
      'exploration': '#ff6348',
      'magic': '#a55eea',
      'tech': '#26d0ce',
      'general': '#747d8c'
    };
    return colors[category] || colors['general'];
  }
}