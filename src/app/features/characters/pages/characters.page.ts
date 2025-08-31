import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { CharacterCardComponent } from '@app/shared/components/character-card/character-card.component';
import { AddCharacterModalComponent } from '@app/shared/components/add-character-modal/add-character-modal.component';
import { EditCharacterModalComponent } from '@app/shared/components/edit-character-modal/edit-character-modal.component';
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
  characters: Character[] = [
    {
      id: 1,
      name: 'Dorian Blackthorn',
      raca: 'Humano',
      classe: 'Guerreiro',
      descricao: 'Um humano forte e disciplinado, treinado em batalhas corpo a corpo e liderança em campo de guerra. Conhecido por sua coragem inabalável e senso de honra.',
      atributos: { forca: 18, inteligencia: 14, carisma: 15, destreza: 16 },
      imageUrl: 'assets/images/card-image1.jpg'
    },
    {
      id: 2,
      name: 'Lord Veynar Kron',
      raca: 'Humano',
      classe: 'Magnata Sombrio',
      descricao: 'Um humano implacável e manipulador, chefe supremo da Corporação Obsidian. Sua inteligência estratégica e sede de poder o tornaram o homem mais temido do mundo, controlando governos, exércitos e mercados das sombras.',
      atributos: { forca: 15, inteligencia: 22, carisma: 20, destreza: 14 },
      imageUrl: 'assets/images/card-image2.jpg'
    },
  ];
  
  isLoading = false;
  isModalOpen = false;
  isEditModalOpen = false;
  characterToEdit: Character | null = null;

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.isLoading = true;
    setTimeout(() => {
      console.log('Personagens carregados:', this.characters.length);
      this.isLoading = false;
    }, 600);
  }

  onEditCharacter(character: Character): void {
    console.log('Abrindo modal de edição para:', character.name);
    this.characterToEdit = { ...character };
    this.isEditModalOpen = true;
  }

  onDeleteCharacter(character: Character): void {
    this.characters = this.characters.filter((c) => c.id !== character.id);
    console.log('Personagem deletado com sucesso!');
  }

  onSelectCharacter(character: Character): void {
    console.log('Personagem selecionado:', character.name);
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

  onCharacterCreated(newCharacter: Character): void {
    this.addCharacter(newCharacter);
    console.log('Novo personagem criado:', newCharacter.name);
  }

  onCharacterUpdated(updatedCharacter: Character): void {
    const index = this.characters.findIndex(c => c.id === updatedCharacter.id);
    if (index !== -1) {
      this.characters[index] = { ...updatedCharacter };
      console.log('Personagem atualizado com sucesso:', updatedCharacter.name);
    }
  }

  addCharacter(newCharacter: Character): void {
    const maxId = this.characters.length
      ? Math.max(...this.characters.map((c) => Number(c.id) || 0))
      : 0;
    newCharacter.id = maxId + 1;
    this.characters.push(newCharacter);
  }
}