import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Character, CharacterAttributes } from '../character-card/character-card.component';

@Component({
  selector: 'app-edit-character-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-character-modal.component.html',
  styleUrls: ['./edit-character-modal.component.scss']
})
export class EditCharacterModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() character: Character | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() characterUpdated = new EventEmitter<Character>();

  selectedImageIndex = 0;
  isRacaDropdownOpen = false;
  isClasseDropdownOpen = false;
  originalTotalPoints = 0;
  currentStep: number = 1;
  
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

  editingCharacter: Character = {
    id: '',
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['character'] && this.character) {
      this.initializeEditingCharacter();
    }
  }

  private initializeEditingCharacter(): void {
    if (this.character) {
      this.editingCharacter = {
        id: this.character.id,
        name: this.character.name,
        raca: this.character.raca,
        classe: this.character.classe,
        descricao: this.character.descricao,
        atributos: { ...this.character.atributos },
        imageUrl: this.character.imageUrl
      };

      this.originalTotalPoints = this.character.atributos.vida + 
                                this.character.atributos.energia +
                                this.character.atributos.forca + 
                                this.character.atributos.inteligencia;

      const imageIndex = this.availableImages.indexOf(this.character.imageUrl || '');
      this.selectedImageIndex = imageIndex >= 0 ? imageIndex : 0;
      
      if (imageIndex >= 0) {
        this.editingCharacter.imageUrl = this.availableImages[imageIndex];
      } else {
        this.editingCharacter.imageUrl = this.availableImages[0];
        this.selectedImageIndex = 0;
      }

      this.currentStep = 1;
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
    this.editingCharacter.imageUrl = this.availableImages[index];
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
    this.editingCharacter.raca = raca.value;
    this.isRacaDropdownOpen = false;
  }

  selectClasse(classe: any): void {
    this.editingCharacter.classe = classe.value;
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
    this.closeDropdowns();
    this.currentStep = 1;
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.characterUpdated.emit({ 
        ...this.editingCharacter,
        id: this.editingCharacter.id || this.character?.id || ''
      });
      this.onClose();
    }
  }

  isFormValid(): boolean {
    return !!(this.editingCharacter.name.trim() && 
             this.editingCharacter.raca.trim() && 
             this.editingCharacter.classe.trim() &&
             this.editingCharacter.id); 
  }

  get totalPoints(): number {
    const attr = this.editingCharacter.atributos;
    return attr.vida + attr.energia + attr.forca + attr.inteligencia;
  }

  get remainingPoints(): number {
    return this.originalTotalPoints - this.totalPoints;
  }

  incrementAttribute(attr: keyof CharacterAttributes): void {
    if (this.remainingPoints > 0 && this.editingCharacter.atributos[attr] < 20) {
      this.editingCharacter.atributos[attr]++;
    }
  }

  decrementAttribute(attr: keyof CharacterAttributes): void {
    if (this.editingCharacter.atributos[attr] > 8) {
      this.editingCharacter.atributos[attr]--;
    }
  }

  getSelectedRaca() {
    return this.racas.find(r => r.value === this.editingCharacter.raca);
  }

  getSelectedClasse() {
    return this.classes.find(c => c.value === this.editingCharacter.classe);
  }

  trackByRaca(index: number, item: any): string {
    return item.value;
  }

  trackByClasse(index: number, item: any): string {
    return item.value;
  }

  trackByImage(index: number, item: string): string {
    return item;
  }
}