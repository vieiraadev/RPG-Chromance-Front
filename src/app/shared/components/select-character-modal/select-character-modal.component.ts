import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCardComponent, Character } from '../character-card/character-card.component';
import { CharacterService, CharacterResponse } from '@app/core/services/character.service';

@Component({
  selector: 'app-select-character-modal',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent],
  templateUrl: './select-character-modal.component.html',
  styleUrls: ['./select-character-modal.component.scss']
})
export class SelectCharacterModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() campaignTitle = '';
  @Output() close = new EventEmitter<void>();
  @Output() characterSelected = new EventEmitter<Character>();

  characters: Character[] = [];
  selectedCharacter: Character | null = null;
  isLoading = false;
  error: string | null = null;
  private hasLoadedCharacters = false;

  constructor(private characterService: CharacterService) {}

  ngOnInit() {
    this.loadMockCharacters();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      console.log('Modal aberto, carregando personagens...');
      
      if (!this.hasLoadedCharacters) {
        this.loadCharacters();
      }
      
      this.selectedCharacter = null;
    }
  }

  loadCharacters() {
    console.log('Iniciando carregamento de personagens...');
    this.isLoading = true;
    this.error = null;

    this.characterService.listCharacters().subscribe({
      next: (response) => {
        console.log('Personagens carregados da API:', response);
        this.characters = response.characters.map(char => this.mapCharacterResponse(char));
        this.isLoading = false;
        this.hasLoadedCharacters = true;
      },
      error: (err) => {
        console.error('Erro ao carregar personagens da API:', err);
        this.error = 'Erro ao carregar personagens da API. Usando dados locais.';
        this.isLoading = false;
        
        console.log('Usando personagens mock como fallback');
      }
    });
  }

  private mapCharacterResponse(char: CharacterResponse): Character {
    return {
      id: char._id,
      name: char.name,
      raca: char.raca,
      classe: char.classe,
      descricao: char.descricao,
      atributos: char.atributos,
      imageUrl: char.imageUrl || 'assets/images/default-avatar.png'
    };
  }

  private loadMockCharacters() {
    this.characters = [
      {
        id: '1',
        name: 'Lyra Shadowbane',
        raca: 'Élfica',
        classe: 'Assassina',
        descricao: '',
        atributos: {
          forca: 14,
          inteligencia: 16,
          carisma: 18,
          destreza: 20
        },
        imageUrl: 'assets/images/card-image1.jpg'
      },
      {
        id: '2',
        name: 'Thorin Ironforge',
        raca: 'Anão',
        classe: 'Guerreiro',
        descricao: '',
        atributos: {
          forca: 20,
          inteligencia: 12,
          carisma: 14,
          destreza: 16
        },
        imageUrl: 'assets/images/card-image2.jpg'
      },
      {
        id: '3',
        name: 'Zara Mindweaver',
        raca: 'Humana',
        classe: 'Maga',
        descricao: '',
        atributos: {
          forca: 10,
          inteligencia: 20,
          carisma: 16,
          destreza: 14
        },
        imageUrl: 'assets/images/card-image3.jpg'
      }
    ];
    
    console.log('Personagens mock carregados:', this.characters);
  }

  onCharacterSelect(character: Character) {
    console.log('Personagem selecionado:', character);
    this.selectedCharacter = character;
  }

  onConfirmSelection() {
    if (this.selectedCharacter) {
      console.log('Confirmando seleção de:', this.selectedCharacter);
      this.characterSelected.emit(this.selectedCharacter);
      this.onClose();
    }
  }

  onClose() {
    console.log('Fechando modal');
    this.close.emit();
    this.selectedCharacter = null;
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}