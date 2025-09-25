import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCardComponent, Character } from '../character-card/character-card.component';
import { CharacterService, CharacterResponse } from '@app/core/services/character.service';
import { CampaignService } from '@app/core/services/campaign.service';

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
  @Input() campaignId = '';
  @Input() campaignChapter = 1;
  @Output() close = new EventEmitter<void>();
  @Output() characterSelected = new EventEmitter<Character>();

  characters: Character[] = [];
  selectedCharacter: Character | null = null;
  isLoading = false;
  error: string | null = null;
  isStartingCampaign = false;
  private hasLoadedCharacters = false;

  constructor(
    private characterService: CharacterService,
    private campaignService: CampaignService
  ) {}

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
      error: (err: any) => {
        console.error('Erro ao carregar personagens da API:', err);
        this.error = 'Erro ao carregar personagens da API. Usando dados locais.';
        this.isLoading = false;
        
        console.log('Usando personagens mock como fallback');
      }
    });
  }

  private mapCharacterResponse(char: CharacterResponse): Character {
    const characterId = char._id || char.id || `temp-${Date.now()}`;
    
    return {
      id: characterId,
      name: char.name || 'Nome não informado',
      raca: char.raca || 'Raça não informada',
      classe: char.classe || 'Classe não informada', 
      descricao: char.descricao || '',
      atributos: char.atributos || { vida: 10, energia: 10, forca: 10, inteligencia: 10 },
      inventory: char.inventory || [], 
      imageUrl: char.imageUrl || 'assets/images/default-avatar.png',
      is_selected: char.is_selected || false 
    };
  }

  private loadMockCharacters() {
    this.characters = [
      {
        id: 'mock-1',
        name: 'Lyra Shadowbane',
        raca: 'Élfica',
        classe: 'Assassina',
        descricao: 'Uma assassina élfica habilidosa.',
        atributos: {
          vida: 14,
          energia: 16,
          forca: 18,
          inteligencia: 20
        },
        imageUrl: 'assets/images/card-image1.jpg'
      },
      {
        id: 'mock-2',
        name: 'Thorin Ironforge',
        raca: 'Anão',
        classe: 'Guerreiro',
        descricao: 'Um guerreiro anão resistente.',
        atributos: {
          vida: 20,
          energia: 12,
          forca: 14,
          inteligencia: 16
        },
        imageUrl: 'assets/images/card-image2.jpg'
      },
      {
        id: 'mock-3',
        name: 'Zara Mindweaver',
        raca: 'Humana',
        classe: 'Maga',
        descricao: 'Uma maga humana poderosa.',
        atributos: {
          vida: 10,
          energia: 20,
          forca: 16,
          inteligencia: 14
        },
        imageUrl: 'assets/images/card-image3.jpg'
      }
    ];
  }

  onCharacterSelect(character: Character) {
    console.log('Personagem selecionado:', character);
    this.selectedCharacter = character;
  }

  onConfirmSelection() {
    if (this.selectedCharacter && this.campaignId) {
      console.log('Confirmando seleção de:', this.selectedCharacter);
      
      this.isStartingCampaign = true;
      this.campaignService.startCampaign(
        this.selectedCharacter.id, 
        this.campaignId,
        this.selectedCharacter.name
      ).subscribe({
        next: (response: any) => {
          console.log('Campanha iniciada:', response);
          
          this.characterSelected.emit(this.selectedCharacter!);
          
          setTimeout(() => {
            this.onClose();
          }, 100);
        },
        error: (err: any) => {
          console.error('Erro ao iniciar campanha:', err);
          this.isStartingCampaign = false;
          
          if (err.error?.detail) {
            alert(`Erro: ${err.error.detail}`);
          } else {
            alert('Erro ao iniciar campanha. Tente novamente.');
          }
        }
      });
    }
  }

  onClose() {
    console.log('Fechando modal');
    this.isStartingCampaign = false;
    this.close.emit();
    this.selectedCharacter = null;
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }

  goToCharacters() {
    this.onClose();
  }
}