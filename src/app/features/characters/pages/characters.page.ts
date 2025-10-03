import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { CharacterCardComponent } from '@app/shared/components/character-card/character-card.component';
import { AddCharacterModalComponent } from '@app/shared/components/add-character-modal/add-character-modal.component';
import { EditCharacterModalComponent } from '@app/shared/components/edit-character-modal/edit-character-modal.component';
import { ItemDetailModalComponent } from '@app/shared/components/item-detail-modal/item-detail-modal.component';
import { CharacterDetailsModalComponent } from '@app/shared/components/character-details-modal/character-details-modal.component';
import { CharacterService, CharacterResponse } from '@app/core/services/character.service';
import { NotificationService } from '@app/core/services/notification.service';
import type { Character, InventoryItem } from '@app/shared/components/character-card/character-card.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    CharacterCardComponent,
    AddCharacterModalComponent,
    EditCharacterModalComponent,
    ItemDetailModalComponent,
    CharacterDetailsModalComponent
  ],
  templateUrl: './characters.page.html',
  styleUrls: ['./characters.page.scss'],
})
export class CharactersPageComponent implements OnInit {
  private characterService = inject(CharacterService);
  private notification = inject(NotificationService);

  characters: Character[] = [];
  isLoading = false;
  isModalOpen = false;
  isEditModalOpen = false;
  isItemModalOpen = false;
  isDetailsModalOpen = false;
  characterToEdit: Character | null = null;
  characterToView: Character | null = null;
  selectedItem: InventoryItem | null = null;
  selectedCharacterId: string | null = null;
  errorMessage = '';
  
  currentPage = 1;
  totalPages = 1;
  totalCharacters = 0;

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.characterService.listCharacters().subscribe({
      next: (response) => {
        console.log('Raw response from API:', response);
        
        this.characters = response.characters.map(char => this.convertToFrontendFormat(char));
        
        console.log('Characters after conversion:', this.characters);
        
        this.isLoading = false;
        console.log(`${this.characters.length} personagens carregados do banco`);
      },
      error: (error) => {
        console.error('Erro ao carregar personagens:', error);
        this.notification.warning('Erro ao carregar personagens. Usando dados locais...');
        this.isLoading = false;
        
        this.loadLocalCharacters();
      }
    });
  }

  private convertToFrontendFormat(backendChar: CharacterResponse): Character {
    return {
      id: backendChar._id,
      name: backendChar.name,
      raca: backendChar.raca,
      classe: backendChar.classe,
      descricao: backendChar.descricao || '',
      atributos: backendChar.atributos,
      inventory: backendChar.inventory || [],
      imageUrl: backendChar.imageUrl,
      is_selected: backendChar.is_selected || false  
    };
  }

  private loadLocalCharacters(): void {
    this.characters = [
      {
        id: 'local-1',
        name: 'Dorian Blackthorn',
        raca: 'Humano',
        classe: 'Guerreiro',
        descricao: 'Um humano forte e disciplinado, treinado em batalhas corpo a corpo e liderança em campo de guerra.',
        atributos: { vida: 16, energia: 12, forca: 14, inteligencia: 10 },
        inventory: [],
        imageUrl: 'assets/images/card-image1.jpg',
        is_selected: false 
      },
      {
        id: 'local-2',
        name: 'Raven Steele',
        raca: 'Humana',
        classe: 'Guerreira',
        descricao: 'Uma combatente implacável das ruas neon da cidade.',
        atributos: { vida: 14, energia: 16, forca: 10, inteligencia: 12 },
        inventory: [],
        imageUrl: 'assets/images/card-image2.jpg',
        is_selected: false  
      }
    ];
  }

  onDetailsClicked(character: Character): void {
    console.log('Abrindo modal de detalhes para:', character.name);
    this.characterToView = character;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.characterToView = null;
  }

  onEditCharacter(character: Character): void {
    console.log('Abrindo modal de edição para:', character.name);
    this.characterToEdit = { ...character };
    this.isEditModalOpen = true;
  }

  onDeleteCharacter(character: Character): void {
    if (!character.id) return;
    
    if (String(character.id).startsWith('local-')) {
      this.characters = this.characters.filter((c) => c.id !== character.id);
      this.notification.success(`${character.name} foi removido com sucesso!`);
      console.log('Personagem local removido');
      return;
    }
    
    this.characterService.deleteCharacter(String(character.id)).subscribe({
      next: () => {
        this.characters = this.characters.filter((c) => c.id !== character.id);
        this.notification.success(`${character.name} foi deletado com sucesso!`);
        console.log('Personagem deletado do banco com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao deletar personagem:', error);
        this.notification.error('Erro ao deletar personagem. Tente novamente.');
      }
    });
  }

  onSelectCharacter(character: Character): void {
    console.log('Personagem selecionado:', character.name);
    this.loadCharacters();
  }

  onItemClick(item: InventoryItem): void {
    console.log('Item clicado:', item);
    
    const character = this.characters.find(c => 
      c.inventory?.some(i => i.id === item.id)
    );
    
    if (character) {
      this.selectedCharacterId = character.id;
      this.selectedItem = item;
      this.isItemModalOpen = true;
      
      if (this.isDetailsModalOpen) {
        this.isDetailsModalOpen = false;
      }
    }
  }

  createNewCharacter(): void {
    this.isModalOpen = true;
    console.log('Abrindo modal para criar novo personagem');
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.characterToEdit = null;
  }

  closeItemModal(): void {
    this.isItemModalOpen = false;
    this.selectedItem = null;
    this.selectedCharacterId = null;
  }

  onItemUsed(): void {
    console.log('Item usado, recarregando personagens...');
    this.notification.success('Item usado com sucesso!');
    this.loadCharacters();
  }

  onCharacterCreated(newCharacter: any): void {
    const characterToAdd: Character = {
      id: newCharacter._id || newCharacter.id,
      name: newCharacter.name,
      raca: newCharacter.raca,
      classe: newCharacter.classe,
      descricao: newCharacter.descricao || '',
      atributos: newCharacter.atributos,
      inventory: newCharacter.inventory || [],
      imageUrl: newCharacter.imageUrl,
      is_selected: newCharacter.is_selected || false
    };
    
    this.characters.unshift(characterToAdd);
    this.notification.success(`Personagem ${characterToAdd.name} criado com sucesso!`);
    console.log('Novo personagem adicionado à lista:', characterToAdd.name);
  }

  onCharacterUpdated(updatedCharacter: Character): void {
    if (!updatedCharacter.id) return;
    
    if (String(updatedCharacter.id).startsWith('local-')) {
      const index = this.characters.findIndex(c => c.id === updatedCharacter.id);
      if (index !== -1) {
        this.characters[index] = { ...updatedCharacter };
        this.notification.success('Personagem atualizado com sucesso!');
        console.log('Personagem local atualizado');
      }
      return;
    }
    
    const updateData = {
      name: updatedCharacter.name,
      raca: updatedCharacter.raca,
      classe: updatedCharacter.classe,
      descricao: updatedCharacter.descricao,
      atributos: updatedCharacter.atributos,
      imageUrl: updatedCharacter.imageUrl
    };
    
    this.characterService.updateCharacter(String(updatedCharacter.id), updateData).subscribe({
      next: (response) => {
        const index = this.characters.findIndex(c => c.id === updatedCharacter.id);
        if (index !== -1) {
          this.characters[index] = this.convertToFrontendFormat(response);
          this.notification.success(`${response.name} atualizado com sucesso!`);
          console.log('Personagem atualizado no banco:', response.name);
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar personagem:', error);
        this.notification.error('Erro ao atualizar personagem. Tente novamente.');
      }
    });
  }

  loadMoreCharacters(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCharacters();
    }
  }

  refreshCharacters(): void {
    this.currentPage = 1;
    this.loadCharacters();
  }
}