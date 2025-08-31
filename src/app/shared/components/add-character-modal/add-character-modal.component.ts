import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Character, CharacterAttributes } from '../character-card/character-card.component';

@Component({
  selector: 'app-add-character-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-character-modal.component.html',
  styleUrls: ['./add-character-modal.component.scss']
})
export class AddCharacterModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() characterCreated = new EventEmitter<Character>();

  selectedImageIndex = 0;
  isRacaDropdownOpen = false;
  isClasseDropdownOpen = false;
  
  availableImages = [
    'assets/images/card-image1.jpg',
    'assets/images/card-image2.jpg', 
    'assets/images/card-image3.jpg',
    'assets/images/card-image4.jpg',
    'assets/images/card-image5.jpg',
    'assets/images/card-image6.jpg',
    'assets/images/card-image7.jpg',
    'assets/images/card-image8.jpg',
    'assets/images/card-image9.jpg',
    'assets/images/card-image10.jpg'
  ];

  newCharacter: Character = {
    name: '',
    raca: '',
    classe: '',
    descricao: '',
    atributos: {
      forca: 10,
      inteligencia: 10,
      carisma: 10,
      destreza: 10
    },
    imageUrl: 'assets/images/card-image1.jpg'
  };

  racas = [
    { value: 'Humano', label: 'Humano' },
    { value: 'Androide', label: 'Androide' },
    { value: 'Cyborg', label: 'Cyborg' },
    { value: 'Mutante', label: 'Mutante' },
    { value: 'Sintético', label: 'Sintético' }
  ];

  classes = [
    { value: 'Netrunner', label: 'Netrunner' },
    { value: 'Soldado Cibernético', label: 'Soldado Cibernético' },
    { value: 'Hacker', label: 'Hacker' },
    { value: 'Mercenário', label: 'Mercenário' },
    { value: 'Tecno-Mago', label: 'Tecno-Mago' },
    { value: 'Assassino Digital', label: 'Assassino Digital' }
  ];

  selectImage(index: number): void {
    this.selectedImageIndex = index;
    this.newCharacter.imageUrl = this.availableImages[index];
  }

  toggleRacaDropdown(): void {
    this.isRacaDropdownOpen = !this.isRacaDropdownOpen;
    if (this.isRacaDropdownOpen) {
      this.isClasseDropdownOpen = false;
    }
  }

  toggleClasseDropdown(): void {
    this.isClasseDropdownOpen = !this.isClasseDropdownOpen;
    if (this.isClasseDropdownOpen) {
      this.isRacaDropdownOpen = false;
    }
  }

  selectRaca(raca: any): void {
    this.newCharacter.raca = raca.value;
    this.isRacaDropdownOpen = false;
  }

  selectClasse(classe: any): void {
    this.newCharacter.classe = classe.value;
    this.isClasseDropdownOpen = false;
  }

  closeDropdowns(): void {
    this.isRacaDropdownOpen = false;
    this.isClasseDropdownOpen = false;
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.characterCreated.emit({ ...this.newCharacter });
      this.resetForm();
      this.onClose();
    }
  }

  isFormValid(): boolean {
    return !!(this.newCharacter.name.trim() && 
             this.newCharacter.raca.trim() && 
             this.newCharacter.classe.trim());
  }

  resetForm(): void {
    this.newCharacter = {
      name: '',
      raca: '',
      classe: '',
      descricao: '',
      atributos: {
        forca: 10,
        inteligencia: 10,
        carisma: 10,
        destreza: 10
      },
      imageUrl: 'assets/images/card-image1.jpg'
    };
    this.selectedImageIndex = 0;
    this.closeDropdowns();
  }

  get totalPoints(): number {
    const attr = this.newCharacter.atributos;
    return attr.forca + attr.inteligencia + attr.carisma + attr.destreza;
  }

  get remainingPoints(): number {
    return 72 - this.totalPoints;
  }

  incrementAttribute(attr: keyof CharacterAttributes): void {
    if (this.remainingPoints > 0 && this.newCharacter.atributos[attr] < 20) {
      this.newCharacter.atributos[attr]++;
    }
  }

  decrementAttribute(attr: keyof CharacterAttributes): void {
    if (this.newCharacter.atributos[attr] > 8) {
      this.newCharacter.atributos[attr]--;
    }
  }

  getSelectedRaca() {
    return this.racas.find(r => r.value === this.newCharacter.raca);
  }

  getSelectedClasse() {
    return this.classes.find(c => c.value === this.newCharacter.classe);
  }
}