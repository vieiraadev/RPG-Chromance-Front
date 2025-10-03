import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Character, InventoryItem } from '../character-card/character-card.component';

@Component({
  selector: 'app-character-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-details-modal.component.html',
  styleUrls: ['./character-details-modal.component.scss']
})
export class CharacterDetailsModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() character: Character | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() itemClicked = new EventEmitter<InventoryItem>();

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  onOverlayClick(): void {
    this.handleClose();
  }

  onCloseButtonClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.handleClose();
  }

  private handleClose(): void {
    document.body.style.overflow = '';
    this.closeModal.emit();
  }

  getItemIcon(item: InventoryItem): string {
    const itemIdPrefix = item.id.split('_').slice(0, 2).join('_');
    return this.itemIcons[itemIdPrefix] || 'bx-package';
  }

  getItemRarityColor(item: InventoryItem): string {
    const rarity = item.metadata?.rarity || 'Comum';
    return this.rarityColors[rarity] || this.rarityColors['Comum'];
  }

  onItemClick(item: InventoryItem): void {
    this.itemClicked.emit(item);
  }
}