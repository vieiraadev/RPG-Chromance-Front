import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { CharacterCardComponent } from '@app/shared/components/character-card/character-card.component';
import { AddCharacterModalComponent } from '@app/shared/components/add-character-modal/add-character-modal.component';
import { EditCharacterModalComponent } from '@app/shared/components/edit-character-modal/edit-character-modal.component';
import { CharacterService, CharacterResponse } from '@app/core/services/character.service';
import type { Character } from '@app/shared/components/character-card/character-card.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    CharacterCardComponent,
    AddCharacterModalComponent,
    EditCharacterModalComponent
  ],
  templateUrl: './characters.page.html',
  styleUrls: ['./characters.page.scss'],
})
export class CharactersPageComponent implements OnInit {
  characters: Character[] = [];
  isLoading = false;
  isModalOpen = false;
  isEditModalOpen = false;
  characterToEdit: Character | null = null;
  errorMessage = '';
  
  currentPage = 1;
  totalPages = 1;
  totalCharacters = 0;

  constructor(private characterService: CharacterService) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.characterService.listCharacters().subscribe({
      next: (response) => {
        this.characters = response.characters.map(char => this.convertToFrontendFormat(char));
        this.isLoading = false;
        console.log(`${this.characters.length} personagens carregados do banco`);
      },
      error: (error) => {
        console.error('Erro ao carregar personagens:', error);
        this.errorMessage = 'Erro ao carregar personagens. Tentando usar dados locais...';
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
        imageUrl: 'assets/images/card-image2.jpg',
        is_selected: false  
      }
    ];
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
      console.log('Personagem local removido');
      return;
    }
    
    this.characterService.deleteCharacter(String(character.id)).subscribe({
      next: () => {
        this.characters = this.characters.filter((c) => c.id !== character.id);
        console.log('Personagem deletado do banco com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao deletar personagem:', error);
        alert('Erro ao deletar personagem. Tente novamente.');
      }
    });
  }

  onSelectCharacter(character: Character): void {
    console.log('Personagem selecionado:', character.name);
    this.loadCharacters();
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

  onCharacterCreated(newCharacter: any): void {
    const characterToAdd: Character = {
      id: newCharacter._id || newCharacter.id,
      name: newCharacter.name,
      raca: newCharacter.raca,
      classe: newCharacter.classe,
      descricao: newCharacter.descricao || '',
      atributos: newCharacter.atributos,
      imageUrl: newCharacter.imageUrl,
      is_selected: newCharacter.is_selected || false
    };
    
    this.characters.unshift(characterToAdd);
    console.log('Novo personagem adicionado à lista:', characterToAdd.name);
  }

  onCharacterUpdated(updatedCharacter: Character): void {
    if (!updatedCharacter.id) return;
    
    if (String(updatedCharacter.id).startsWith('local-')) {
      const index = this.characters.findIndex(c => c.id === updatedCharacter.id);
      if (index !== -1) {
        this.characters[index] = { ...updatedCharacter };
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
          console.log('Personagem atualizado no banco:', response.name);
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar personagem:', error);
        alert('Erro ao atualizar personagem. Tente novamente.');
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