import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { CharacterCardComponent } from '@app/shared/components/character-card/character-card.component';
import type { Character } from '@app/shared/components/character-card/character-card.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CharacterCardComponent],
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
      
      {
        id: 3,
        name: 'Netrunner',
        raca: 'Humano',
        classe: 'Hacker Sombrio',
        descricao: 'Um gênio da tecnologia e mestre da invasão digital. Kael é capaz de romper firewalls impenetráveis, manipular inteligências artificiais e controlar sistemas inteiros à distância. Sua mente afiada e sua frieza o tornaram um dos hackers mais temidos do submundo corporativo.',
        atributos: { forca: 10, inteligencia: 22, carisma: 14, destreza: 18 },
        imageUrl: 'assets/images/card-image3.jpg'
      },
      
      
  ];

  isLoading = false;

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
    console.log('Editando personagem:', character.name);
  }

  onDeleteCharacter(character: Character): void {
    this.characters = this.characters.filter((c) => c.id !== character.id);
    console.log('Personagem deletado com sucesso!');
  }

  onSelectCharacter(character: Character): void {
    console.log('Personagem selecionado:', character.name);
  }

  createNewCharacter(): void {
    console.log('Criando novo personagem...');
  }

  addCharacter(newCharacter: Character): void {
    const maxId = this.characters.length
      ? Math.max(...this.characters.map((c) => Number(c.id) || 0))
      : 0;
    newCharacter.id = maxId + 1;
    this.characters.push(newCharacter);
  }
}
