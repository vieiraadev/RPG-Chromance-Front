import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { LLMService, ChatMessage, ContextualAction } from '../../../core/services/llm.service';

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

  characterName = 'Neo-Runner';
  characterLevel = 15;
  currentCharacterId: string | undefined;

  private subscriptions: Subscription[] = [];

  storyLog: StoryEntry[] = [
    {
      timestamp: this.getCurrentTimestamp(),
      type: 'system',
      message: 'Interface neural ativada. Bem-vindo ao setor 7.'
    },
    {
      timestamp: this.getCurrentTimestamp(),
      type: 'narrator',
      message: 'Você se encontra em um beco escuro da cidade. O som de sirenes ecoa à distância enquanto as luzes de neon piscam nas paredes molhadas. Sua respiração está pesada após a fuga dos seguranças corporativos.'
    }
  ];

  availableActions: ContextualAction[] = [];

  customCommand = '';

  llmSuggestions = [
    'Continue a história',
    'Descreva o ambiente',
    'O que devo fazer agora?',
    'Crie um novo desafio',
    'Como meu personagem se sente?'
  ];

  characterAttributes: CharacterAttribute[] = [
    { name: 'Força', value: 75, max: 100 },
    { name: 'Agilidade', value: 90, max: 100 },
    { name: 'Intelecto', value: 85, max: 100 },
    { name: 'Carisma', value: 60, max: 100 },
    { name: 'Tecnologia', value: 95, max: 100 },
    { name: 'Combate', value: 80, max: 100 }
  ];

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

  constructor(private llmService: LLMService) { }

  ngOnInit() {
    this.loadGameData();
    this.currentCharacterId = 'char-' + Math.random().toString(36).substr(2, 9);
    
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

    this.addStoryEntry('system', 'Mestre IA ativo. Digite comandos para interagir com o universo Chromance.');
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

  private loadGameData() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
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
    this.storyLog = [
      {
        timestamp: this.getCurrentTimestamp(),
        type: 'system',
        message: 'Log de história limpo. Interface reinicializada.'
      },
      {
        timestamp: this.getCurrentTimestamp(),
        type: 'system',
        message: 'Mestre IA ativo. Digite comandos para interagir.'
      }
    ];
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