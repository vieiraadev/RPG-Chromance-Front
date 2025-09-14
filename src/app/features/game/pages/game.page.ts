import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { LLMService, ChatMessage } from '../../../core/services/llm.service';

interface StoryEntry {
  timestamp: string;
  type: 'system' | 'narrator' | 'player' | 'llm';
  message: string;
}

interface ContextAction {
  id: string;
  name: string;
  description: string;
  icon: string;
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
export class GamePageComponent implements OnInit, AfterViewChecked {
  @ViewChild('storyContent') storyContent!: ElementRef;

  isLoading = false;
  isCharacterPanelCollapsed = true;
  llmLoading = false;

  characterName = 'Neo-Runner';
  characterLevel = 15;
  currentCharacterId: string | undefined;

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

  availableActions: ContextAction[] = [
    {
      id: 'climb_stairs',
      name: 'Subir Escada',
      description: 'Escalar até o telhado',
      icon: 'bx bx-up-arrow-alt'
    },
    {
      id: 'check_sewer',
      name: 'Verificar Esgoto',
      description: 'Investigar a tampa',
      icon: 'bx bx-search-alt'
    },
    {
      id: 'hack_door',
      name: 'Hackear Porta',
      description: 'Tentar quebrar a segurança',
      icon: 'bx bx-lock-open'
    }
  ];

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
    
    this.llmService.loading$.subscribe(loading => {
      this.llmLoading = loading;
    });

    this.addStoryEntry('system', ' Mestre IA ativo. Digite comandos para interagir com o universo Chromance.');
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
      const response = await this.llmService.sendMessage(message, this.currentCharacterId);

      if (response.success && response.response) {
        this.addStoryEntry('llm', response.response);
        
        this.updateActionsBasedOnLLMResponse(response.response);
      } else {
        this.addStoryEntry('system', ` Erro: ${response.error || 'Falha na comunicação'}`);
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

  private updateActionsBasedOnLLMResponse(response: string) {
    const newActions: ContextAction[] = [];
    
    if (response.includes('porta') || response.includes('entrada')) {
      newActions.push({
        id: 'approach_door',
        name: 'Aproximar da Porta',
        description: 'Investigar a entrada',
        icon: 'bx bx-door-open'
      });
    }
    
    if (response.includes('inimigo') || response.includes('ameaça')) {
      newActions.push({
        id: 'prepare_combat',
        name: 'Preparar Combate',
        description: 'Posição defensiva',
        icon: 'bx bx-shield'
      });
    }
    
    if (response.includes('item') || response.includes('objeto')) {
      newActions.push({
        id: 'examine_item',
        name: 'Examinar Item',
        description: 'Investigar objeto',
        icon: 'bx bx-search'
      });
    }

    if (newActions.length > 0) {
      this.availableActions = [...this.availableActions, ...newActions];
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
        this.addStoryEntry('system', 'Digite comandos para interagir com o Mestre IA ou use os botões de ação rápida.');
        break;
    }
  }

  performContextAction(action: ContextAction) {
    this.addStoryEntry('player', `${action.name}: ${action.description}`);
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      
      switch (action.id) {
        case 'climb_stairs':
          this.addStoryEntry('narrator', 'Você escala a escada de incêndio com agilidade. Do telhado, tem uma visão panorâmica da cidade cyberpunk.');
          break;
        case 'check_sewer':
          this.addStoryEntry('narrator', 'Você levanta a tampa do esgoto. Um odor forte sobe, mas também ouve vozes distantes ecoando pelos túneis.');
          break;
        case 'hack_door':
          this.addStoryEntry('narrator', 'Você conecta seu dispositivo de hacking na fechadura. A porta se abre revelando um corredor mal iluminado.');
          break;
      }
    }, 2000);
  }

  // Agora sempre envia para LLM
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
}