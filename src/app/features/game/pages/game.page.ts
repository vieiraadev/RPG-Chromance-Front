import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { LLMService, ChatMessage, ContextualAction } from '../../../core/services/llm.service';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { CharacterService, CharacterResponse } from '../../../core/services/character.service';

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

interface InventoryItem {
  id: string;
  icon: string;
  count: number;
  description: string;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss']
})
export class GamePageComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('storyContent') storyContent!: ElementRef;

  isLoading = false;
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
    'Continue a história',
    'Descreva o ambiente',
    'O que devo fazer agora?',
    'Crie um novo desafio',
    'Como meu personagem se sente?'
  ];

  characterAttributes: CharacterAttribute[] = [];

  equipmentSlots: EquipmentSlot[] = [
    {
      type: 'weapon',
      icon: 'bx bx-target-lock',
      item: {
        name: 'Pistola Neural',
        quality: 'rare'
      }
    },
    {
      type: 'armor',
      icon: 'bx bx-shield',
      item: {
        name: 'Jacket Reforçado',
        quality: 'uncommon'
      }
    },
    {
      type: 'cybernetic',
      icon: 'bx bx-chip',
      item: {
        name: 'Implante Ótico',
        quality: 'epic'
      }
    },
    {
      type: 'accessory',
      icon: 'bx bx-diamond'
    }
  ];

  quickInventory: InventoryItem[] = [
    {
      id: 'medkit',
      icon: 'bx bx-first-aid',
      count: 3,
      description: 'Kit médico básico'
    },
    {
      id: 'energy_drink',
      icon: 'bx bxs-battery',
      count: 2,
      description: 'Bebida energética'
    },
    {
      id: 'hack_device',
      icon: 'bx bx-mobile-alt',
      count: 1,
      description: 'Dispositivo de hacking'
    },
    {
      id: 'ammo',
      icon: 'bx bx-square-rounded',
      count: 24,
      description: 'Munição para pistola'
    }
  ];

  emptySlots = new Array(8);
  private shouldScrollToBottom = false;

  constructor(
    private llmService: LLMService,
    private campaignService: CampaignService,
    private characterService: CharacterService
  ) {}

  ngOnInit() {
    this.loadGameData();

    const loadingSub = this.llmService.loading$.subscribe(loading => {
      this.llmLoading = loading;
    });
    this.subscriptions.push(loadingSub);

    const actionsSub = this.llmService.contextualActions$.subscribe(actions => {
      this.availableActions = actions;
      if (actions.length > 0) {
        this.addStoryEntry('system', `${actions.length} novas ações contextuais disponíveis.`);
      }
    });
    this.subscriptions.push(actionsSub);
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

  private async loadGameData() {
    this.isLoading = true;
    
    try {
      const activeCampaignStatus = await this.campaignService.getActiveCampaignStatus().toPromise();
      
      if (activeCampaignStatus && activeCampaignStatus.has_active_campaign && activeCampaignStatus.active_campaign) {
        this.activeCampaign = activeCampaignStatus.active_campaign;
        
        this.addDefaultStoryMessages();
        
        if (this.activeCampaign.active_character_id) {
          try {
            const character = await this.characterService.getCharacter(this.activeCampaign.active_character_id).toPromise();
            
            if (character) {
              this.activeCharacter = character;
              this.updateCharacterDisplay(character);
              this.currentCharacterId = character._id;
              
              this.addStoryEntry('system', `Personagem carregado: ${character.name} (${character.raca} ${character.classe})`);
            }
          } catch (characterError) {
            console.error('Erro ao carregar personagem ativo:', characterError);
            this.addStoryEntry('system', 'Erro ao carregar dados do personagem. Usando dados padrão.');
          }
        } else {
          this.addStoryEntry('system', `Campanha ${this.activeCampaign.title} ativa, mas sem personagem definido.`);
        }
      } else {
        this.addDefaultStoryMessages();
        
        try {
          const character = await this.characterService.getSelectedCharacter().toPromise();
          if (character) {
            this.activeCharacter = character;
            this.updateCharacterDisplay(character);
            this.currentCharacterId = character._id;
            this.addStoryEntry('system', `Personagem selecionado carregado: ${character.name}`);
          } else {
            this.addStoryEntry('system', 'Nenhuma campanha ativa ou personagem selecionado encontrado.');
          }
        } catch (selectedError) {
          console.error('Erro ao carregar personagem selecionado:', selectedError);
          this.addStoryEntry('system', 'Nenhum personagem encontrado. Usando dados padrão.');
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do jogo:', error);
      this.addDefaultStoryMessages();
      this.addStoryEntry('system', 'Erro ao carregar dados. Usando configurações padrão.');
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

    try {
      const response = await this.llmService.sendMessage(message, this.currentCharacterId, true);

      if (response.success && response.response) {
        this.addStoryEntry('llm', response.response);
      } else {
        this.addStoryEntry('system', `Erro: ${response.error || 'Falha na comunicação'}`);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem para LLM:', error);
      this.addStoryEntry('system', 'Erro de conexão com o Mestre IA.');
    }
  }

  async quickLLMAction(action: string) {
    this.customCommand = action;
    await this.sendLLMMessage();
  }

  async performContextAction(action: ContextualAction) {
    this.addStoryEntry('player', `${action.name}: ${action.description}`);
    this.isLoading = true;
    
    try {
      const response = await this.llmService.executeContextualAction(action, this.currentCharacterId);
      
      if (response.success && response.response) {
        this.addStoryEntry('llm', response.response);
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

  clearStoryLog() {
    this.storyLog = [];
    this.addDefaultStoryMessages();
    this.shouldScrollToBottom = true;
    this.llmService.clearConversation();
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

  useItem(item: InventoryItem) {
    this.addStoryEntry('player', `Usar: ${item.description}`);
    
    switch (item.id) {
      case 'medkit':
        this.addStoryEntry('narrator', 'Você usa o kit médico. Seus ferimentos começam a cicatrizar e você se sente revigorado.');
        break;
      case 'energy_drink':
        this.addStoryEntry('narrator', 'A bebida energética percorre seu sistema, restaurando sua energia neural.');
        break;
      case 'hack_device':
        this.addStoryEntry('narrator', 'Você prepara o dispositivo de hacking, pronto para quebrar sistemas de segurança.');
        break;
      case 'ammo':
        this.addStoryEntry('narrator', 'Você recarrega sua arma. Clique metálico ecoa enquanto a munição é inserida.');
        break;
    }
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