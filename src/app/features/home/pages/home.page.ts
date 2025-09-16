import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { VillainCarouselComponent } from '@app/shared/components/villain-carousel/villain-carousel.component';
import { CharacterCardComponent, Character } from '@app/shared/components/character-card/character-card.component';
import { AuthService, UserOut } from '@app/core/services/auth.service';
import { CharacterService, CharacterResponse } from '@app/core/services/character.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    NavbarComponent, 
    VillainCarouselComponent,
    CharacterCardComponent
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {
  userName: string = 'Jogador';
  isLoading: boolean = true;
  selectedCharacter: Character | null = null;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private characterService: CharacterService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUserData();
    this.loadSelectedCharacter();
    this.subscribeToSelectedCharacter();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private loadUserData(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.me().subscribe({
        next: (user: UserOut) => {
          this.userName = user.nome;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar dados do usuário:', error);
          this.userName = 'Jogador';
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  private loadSelectedCharacter(): void {
    if (this.authService.isAuthenticated()) {
      const sub = this.characterService.getSelectedCharacter().subscribe({
        next: (character: CharacterResponse) => {
          this.selectedCharacter = this.mapToCharacter(character);
        },
        error: (error) => {
          console.log('Nenhum personagem selecionado:', error);
          this.selectedCharacter = null;
        }
      });
      this.subscriptions.add(sub);
    }
  }

  private subscribeToSelectedCharacter(): void {
    const sub = this.characterService.selectedCharacter$.subscribe({
      next: (character: CharacterResponse | null) => {
        this.selectedCharacter = character ? this.mapToCharacter(character) : null;
      }
    });
    this.subscriptions.add(sub);
  }

  private mapToCharacter(characterResponse: CharacterResponse): Character {
    return {
      id: characterResponse._id || characterResponse.id || '',
      name: characterResponse.name,
      raca: characterResponse.raca,
      classe: characterResponse.classe,
      descricao: characterResponse.descricao,
      atributos: characterResponse.atributos,
      imageUrl: characterResponse.imageUrl
    };
  }

  onEditSelectedCharacter(): void {
    if (this.selectedCharacter) {
      console.log('Editar personagem selecionado:', this.selectedCharacter);
    }
  }

  onDeleteSelectedCharacter(): void {
    if (this.selectedCharacter) {
      console.log('Deletar personagem selecionado:', this.selectedCharacter);
    }
  }

  onSelectCharacter(): void {
    this.router.navigate(['/characters']);
  }
}