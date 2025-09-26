import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '@app/core/services/character.service';

export interface CharacterAttributes {
  vida: number;
  energia: number;
  forca: number;
  inteligencia: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  chapter: number;
  campaign_id: string;
  obtained_at: string;
  metadata: {
    power?: string;
    rarity?: string;
    effect?: string;
  };
}

export interface Character {
  id: string;
  name: string;
  raca: string;
  classe: string;
  descricao: string;
  atributos: CharacterAttributes;
  imageUrl: string;
  is_selected?: boolean;
  inventory?: InventoryItem[];
}

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent implements OnInit {
  @Input() character!: Character;
  @Input() isLoading = false;
  @Input() showActions = true;
  @Input() showSelectButton = true;
  @Output() editClicked = new EventEmitter<Character>();
  @Output() deleteClicked = new EventEmitter<Character>();
  @Output() characterSelected = new EventEmitter<Character>();

  hasValidImage = false;
  formattedName = '';
  isSelecting = false;

  itemIcons: { [key: string]: string } = {
    'cubo_sombras': 'bx-cube-alt',
    'cristal_arcano': 'bx-diamond',
    'cinturao_campeao': 'bx-medal'
  };

  rarityColors: { [key: string]: string } = {
    'Lendário': '#00D9FF',    
    'Épico': '#00D9FF',     
    'Raro': '#0052CC',        
    'Comum': '#003D7A'        
  };

  constructor(private characterService: CharacterService) {}

  ngOnInit() {
    this.checkImage();
    this.formatName();
  }

  private checkImage(): void {
    if (this.character?.imageUrl && this.character.imageUrl !== 'assets/images/default-avatar.png') {
      this.hasValidImage = true;
    }
  }

  private formatName(): void {
    if (this.character?.name) {
      const nameParts = this.character.name.split(' ');
      if (nameParts.length >= 2) {
        this.formattedName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
      } else {
        this.formattedName = this.character.name;
      }
    }
  }

  getItemIcon(item: InventoryItem): string {
    const itemIdPrefix = item.id.split('_').slice(0, 2).join('_');
    return this.itemIcons[itemIdPrefix] || 'bx-package';
  }

  getItemRarityColor(item: InventoryItem): string {
    const rarity = item.metadata?.rarity || 'Comum';
    return this.rarityColors[rarity] || this.rarityColors['Comum'];
  }

  onEdit(): void {
    this.editClicked.emit(this.character);
  }

  onDelete(): void {
    if (confirm(`Tem certeza que deseja deletar ${this.character.name}?`)) {
      this.deleteClicked.emit(this.character);
    }
  }

  onSelect(): void {
    if (this.character.is_selected) {
      this.characterSelected.emit(this.character);
      return;
    }

    this.isSelecting = true;
    this.characterService.selectCharacter(this.character.id).subscribe({
      next: (selectedCharacter) => {
        this.characterSelected.emit(this.character);
        this.isSelecting = false;
      },
      error: (error) => {
        console.error('Erro ao selecionar personagem:', error);
        this.isSelecting = false;
        alert('Erro ao selecionar personagem. Tente novamente.');
      }
    });
  }

  get selectButtonText(): string {
    if (this.isSelecting) {
      return 'Selecionando...';
    }
    return this.character.is_selected ? 'Selecionado ✓' : 'Selecionar';
  }

  get selectButtonClass(): string {
    let baseClass = 'btn-action';
    if (this.character.is_selected) {
      return `${baseClass} selected`;
    }
    return `${baseClass} select`;
  }
}