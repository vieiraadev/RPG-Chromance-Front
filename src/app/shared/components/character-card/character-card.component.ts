import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CharacterAttributes {
  forca: number;
  inteligencia: number;
  carisma: number;
  destreza: number;
}

export interface Character {
  id?: string | number;
  name: string;
  raca: string;
  classe: string;
  descricao?: string;
  atributos: CharacterAttributes;
  imageUrl?: string;
}

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CharacterCardComponent implements OnInit {
  private readonly FALLBACK_IMAGE = 'assets/images/default-avatar.png';

  @Input() character: Character = {
    name: 'Lyra Shadowbane',
    raca: 'Élfica',
    classe: 'Assassina',
    atributos: {
      forca: 14,
      inteligencia: 16,
      carisma: 18,
      destreza: 20,
    },
    imageUrl: 'assets/images/card-image1.jpg',
  };

  @Input() isLoading = false;
  @Input() showActions = true;

  @Output() editClicked = new EventEmitter<Character>();
  @Output() deleteClicked = new EventEmitter<Character>();
  @Output() characterSelected = new EventEmitter<Character>();

  ngOnInit(): void {
    this.validateCharacter();
    this.normalizeImageUrl();
  }

  private validateCharacter(): void {
    if (!this.character.name) console.warn('CharacterCardComponent: Nome do personagem é obrigatório');
    if (!this.character.raca) console.warn('CharacterCardComponent: Raça do personagem é obrigatória');
    if (!this.character.classe) console.warn('CharacterCardComponent: Classe do personagem é obrigatória');

    if (!this.character.atributos) {
      console.warn('CharacterCardComponent: Atributos do personagem são obrigatórios');
      this.character.atributos = { forca: 0, inteligencia: 0, carisma: 0, destreza: 0 };
    }
  }

  private normalizeImageUrl(): void {
    const url = (this.character.imageUrl || '').trim();

    if (!url) {
      this.character.imageUrl = this.FALLBACK_IMAGE;
      return;
    }

    if (url.startsWith('../') || url.startsWith('./')) {
      this.character.imageUrl = url.replace(/^(\.\/|\.\.\/)+/, 'assets/');
    }
  }

  onEdit(): void {
    if (!this.isLoading) this.editClicked.emit(this.character);
  }

  onDelete(): void {
    if (!this.isLoading && confirm(`Tem certeza que deseja deletar o personagem "${this.character.name}"?`)) {
      this.deleteClicked.emit(this.character);
    }
  }

  onCardClick(): void {
    this.characterSelected.emit(this.character);
  }

  get imageSrc(): string {
    const url = (this.character.imageUrl || '').trim();
    return url ? url : this.FALLBACK_IMAGE;
  }

  onImageError(): void {
    if (this.character.imageUrl !== this.FALLBACK_IMAGE) {
      this.character.imageUrl = this.FALLBACK_IMAGE;
    }
  }
  get totalAttributePoints(): number {
    const a = this.character.atributos;
    return a.forca + a.inteligencia + a.carisma + a.destreza;
  }

  get highestAttribute(): { name: string; value: number } {
    const a = this.character.atributos;
    return [
      { name: 'Força', value: a.forca },
      { name: 'Inteligência', value: a.inteligencia },
      { name: 'Carisma', value: a.carisma },
      { name: 'Destreza', value: a.destreza },
    ].reduce((prev, curr) => (curr.value > prev.value ? curr : prev));
  }

  get formattedName(): string {
    return this.character.name
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  get shortDescription(): string {
    const d = this.character.descricao || '';
    return d.length > 100 ? d.substring(0, 97) + '...' : d;
  }

  get hasValidImage(): boolean {
    const u = (this.character.imageUrl || '').trim();
    return !!u && u !== this.FALLBACK_IMAGE;
  }

  getRaceClass(): string {
    return `race-${this.character.raca.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }
}
