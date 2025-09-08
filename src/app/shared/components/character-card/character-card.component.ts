import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CharacterAttributes {
  vida: number;
  energia: number;
  forca: number;
  inteligencia: number;
}

export interface Character {
  id?: string;
  name: string;
  raca: string;
  classe: string;
  descricao: string;
  atributos: CharacterAttributes;
  imageUrl: string;
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
  
  @Output() editClicked = new EventEmitter<Character>();
  @Output() deleteClicked = new EventEmitter<Character>();
  @Output() characterSelected = new EventEmitter<Character>();

  hasValidImage = false;
  formattedName = '';

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

  onEdit(): void {
    this.editClicked.emit(this.character);
  }

  onDelete(): void {
    if (confirm(`Tem certeza que deseja deletar ${this.character.name}?`)) {
      this.deleteClicked.emit(this.character);
    }
  }

  onSelect(): void {
    this.characterSelected.emit(this.character);
  }
}