import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '@app/core/services/character.service';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { NotificationService } from '@app/core/services/notification.service';

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
    attribute_bonus?: { [key: string]: number };
  };
}

@Component({
  selector: 'app-item-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-detail-modal.component.html',
  styleUrls: ['./item-detail-modal.component.scss']
})
export class ItemDetailModalComponent {
  @Input() isOpen = false;
  @Input() item: InventoryItem | null = null;
  @Input() characterId: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() itemUsed = new EventEmitter<void>();

  private characterService = inject(CharacterService);
  private confirmation = inject(ConfirmationService);
  private notification = inject(NotificationService);

  isUsing = false;

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

  close(): void {
    this.closeModal.emit();
  }

  useItem(): void {
    if (this.isUsing || !this.item || !this.characterId) return;
    
    const itemName = this.item.name;
    const itemId = this.item.id;
    const charId = this.characterId;
    
    this.close();
    setTimeout(() => {
      this.confirmation.confirm({
        title: 'Usar Item',
        message: `Tem certeza que deseja usar ${itemName}? Este item será consumido e seus efeitos serão aplicados aos atributos do personagem.`,
        confirmText: 'Usar Item',
        cancelText: 'Cancelar',
        type: 'warning'
      }).subscribe(confirmed => {
        if (confirmed) {
          this.executeUseItem(charId, itemId, itemName);
        }
      });
    }, 100);
  }

  private executeUseItem(characterId: string, itemId: string, itemName: string): void {
    this.isUsing = true;
    
    this.characterService.useItem(characterId, itemId).subscribe({
      next: (updatedCharacter) => {
        this.notification.success(`${itemName} foi usado com sucesso!`);
        this.itemUsed.emit();
        this.isUsing = false;
      },
      error: (error) => {
        console.error('Erro ao usar item:', error);
        this.notification.error(error.error?.detail || 'Erro ao usar item. Tente novamente.');
        this.isUsing = false;
      }
    });
  }

  getItemIcon(): string {
    if (!this.item) return 'bx-package';
    const itemIdPrefix = this.item.id.split('_').slice(0, 2).join('_');
    return this.itemIcons[itemIdPrefix] || 'bx-package';
  }

  getRarityColor(): string {
    if (!this.item) return this.rarityColors['Comum'];
    const rarity = this.item.metadata?.rarity || 'Comum';
    return this.rarityColors[rarity] || this.rarityColors['Comum'];
  }
}