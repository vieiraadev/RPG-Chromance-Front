import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';

interface StoryEntry {
  timestamp: string;
  type: 'system' | 'narrator' | 'player';
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

  characterName = 'Neo-Runner';
  characterLevel = 15;

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
    },
    {
      timestamp: this.getCurrentTimestamp(),
      type: 'player',
      message: 'Examino os arredores em busca de uma saída segura.'
    },
    {
      timestamp: this.getCurrentTimestamp(),
      type: 'narrator',
      message: 'Ao examinar o beco, você nota três possíveis rotas: uma escada de incêndio que leva aos telhados, uma tampa de esgoto levemente entreaberta, e uma porta lateral com uma fechadura eletrônica piscando em vermelho.'
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
  commandSuggestions = [
    'examinar área',
    'verificar inventário',
    'usar equipamento',
    'esconder-se',
    'correr'
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

  constructor() { }

  ngOnInit() {
    this.loadGameData();
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

  private getCurrentTimestamp(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  }

  private scrollToBottom() {
    if (this.storyContent) {
      const element = this.storyContent.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private addStoryEntry(type: 'system' | 'narrator' | 'player', message: string) {
    this.storyLog.push({
      timestamp: this.getCurrentTimestamp(),
      type,
      message
    });
    this.shouldScrollToBottom = true;
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
        this.addStoryEntry('system', 'Comandos disponíveis: examinar, usar [item], mover [direção], atacar [alvo], falar [personagem]');
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
          this.addStoryEntry('narrator', 'Você escala a escada de incêndio com agilidade. Do telhado, tem uma visão panorâmica da cidade cyberpunk. Luzes neon se estendem até o horizonte.');
          this.availableActions = [
            {
              id: 'jump_building',
              name: 'Pular Prédio',
              description: 'Saltar para o prédio vizinho',
              icon: 'bx bx-run'
            },
            {
              id: 'use_zipline',
              name: 'Usar Tirolesa',
              description: 'Deslizar pelos cabos',
              icon: 'bx bx-minus'
            }
          ];
          break;
          
        case 'check_sewer':
          this.addStoryEntry('narrator', 'Você levanta a tampa do esgoto. Um odor forte sobe, mas também ouve vozes distantes ecoando pelos túneis. Pode ser uma rota de fuga segura.');
          this.availableActions = [
            {
              id: 'enter_sewer',
              name: 'Entrar no Esgoto',
              description: 'Descer pelos túneis',
              icon: 'bx bx-down-arrow-alt'
            },
            {
              id: 'listen_voices',
              name: 'Escutar Vozes',
              description: 'Tentar identificar quem está lá',
              icon: 'bx bx-volume-full'
            }
          ];
          break;
          
        case 'hack_door':
          this.addStoryEntry('narrator', 'Você conecta seu dispositivo de hacking na fechadura. Após alguns segundos, a luz vermelha pisca e se torna verde. A porta se abre revelando um corredor mal iluminado.');
          this.availableActions = [
            {
              id: 'enter_building',
              name: 'Entrar no Prédio',
              description: 'Atravessar a porta',
              icon: 'bx bx-door-open'
            },
            {
              id: 'scan_corridor',
              name: 'Escanear Corredor',
              description: 'Usar implantes para análise',
              icon: 'bx bx-radar'
            }
          ];
          break;
      }
    }, 2000);
  }

  executeCustomCommand() {
    if (this.customCommand.trim()) {
      this.addStoryEntry('player', this.customCommand);
      
      this.isLoading = true;
      
      setTimeout(() => {
        this.isLoading = false;
        this.addStoryEntry('narrator', `Processando: "${this.customCommand}". O sistema analisa sua ação e calcula os resultados...`);
        this.customCommand = '';
      }, 1500);
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
      }
    ];
    this.shouldScrollToBottom = true;
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
        this.addStoryEntry('narrator', 'Você recarrega sua arma. Clique metálico ecoa enquindo a munição é inserida.');
        break;
    }
  }
}