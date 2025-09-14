import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { VillainCarouselComponent } from '@app/shared/components/villain-carousel/villain-carousel.component';
import { AuthService, UserOut } from '@app/core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, VillainCarouselComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePageComponent implements OnInit {
  userName: string = 'Jogador';
  isLoading: boolean = true;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.loadUserData();
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
}