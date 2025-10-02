import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService, CharacterCreate, CharacterResponse } from '../../../core/services/character.service';

export interface Character {
  _id?: string;
  name: string;
  raca: string;
  classe: string;
  descricao: string;
  atributos: CharacterAttributes;
  imageUrl: string;
}

export interface CharacterAttributes {
  vida: number;
  energia: number;
  forca: number;
  inteligencia: number;
}

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
  isLoading = false;
  errorMessage = '';
  currentStep = 1; 
  
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
      vida: 10,
      energia: 10,
      forca: 10,
      inteligencia: 10
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

  constructor(private characterService: CharacterService) {}

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

  nextStep(): void {
    if (this.currentStep === 1) {
      this.currentStep = 2;
    }
  }

  previousStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  onClose(): void {
    this.closeModal.emit();
    this.errorMessage = '';
    this.currentStep = 1;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    if (this.remainingPoints < 0) {
      this.errorMessage = 'Você excedeu o limite de pontos de atributos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const characterData: CharacterCreate = {
      name: this.newCharacter.name.trim(),
      raca: this.newCharacter.raca,
      classe: this.newCharacter.classe,
      descricao: this.newCharacter.descricao || '',
      atributos: this.newCharacter.atributos,
      imageUrl: this.newCharacter.imageUrl
    };

    this.characterService.createCharacter(characterData).subscribe({
      next: (response: CharacterResponse) => {
        const createdCharacter: Character = {
          _id: response._id,
          name: response.name,
          raca: response.raca,
          classe: response.classe,
          descricao: response.descricao,
          atributos: response.atributos,
          imageUrl: response.imageUrl
        };

        this.characterCreated.emit(createdCharacter);
        
        this.resetForm();
        this.onClose();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao criar personagem:', error);
        this.errorMessage = error.error?.detail || 'Erro ao criar personagem. Tente novamente.';
        this.isLoading = false;
      }
    });
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
        vida: 10,
        energia: 10,
        forca: 10,
        inteligencia: 10
      },
      imageUrl: 'assets/images/card-image1.jpg'
    };
    this.selectedImageIndex = 0;
    this.closeDropdowns();
    this.errorMessage = '';
    this.currentStep = 1;
  }

  get totalPoints(): number {
    const attr = this.newCharacter.atributos;
    return attr.vida + attr.energia + attr.forca + attr.inteligencia;
  }

  get remainingPoints(): number {
    return 52 - this.totalPoints;
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