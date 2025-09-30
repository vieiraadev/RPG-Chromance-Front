import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  @Output() closeModal = new EventEmitter<void>();

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