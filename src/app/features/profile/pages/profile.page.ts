import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { AuthService, UserOut } from '@core/services/auth.service';
import { ApiService } from '@core/api/api.service';
import { NotificationService } from '@core/services/notification.service';
import { ConfirmationService } from '@core/services/confirmation.service';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  password: string;
  memberSince: Date;
  lastLogin: Date;
}

interface UpdateProfileRequest {
  nome: string;
  email: string;
  senha?: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePageComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private confirmation = inject(ConfirmationService);

  userProfile: UserProfile = {
    id: '',
    name: '',
    email: '',
    password: '',
    memberSince: new Date(),
    lastLogin: new Date()
  };

  originalProfile: UserProfile = {
    id: '',
    name: '',
    email: '',
    password: '',
    memberSince: new Date(),
    lastLogin: new Date()
  };

  isEditing: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  isLoadingProfile: boolean = true;

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoadingProfile = true;
  
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
  
    this.authService.me().subscribe({
      next: (userData) => {
        if (userData) {
          this.userProfile = {
            id: userData.id,
            name: userData.nome,
            email: userData.email,
            password: '', 
            memberSince: new Date(userData.created_at), 
            lastLogin: new Date()   
          };
  
          this.originalProfile = { ...this.userProfile };
        }
        this.isLoadingProfile = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar perfil:', error);
        
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          return;
        }
  
        this.notification.error('Erro ao carregar dados do perfil. Tente novamente.');
        this.loadMockData();
        this.isLoadingProfile = false;
      }
    });
  }

  private loadMockData() {
    this.notification.warning('Usando dados de exemplo');
    this.userProfile = {
      id: 'mock-id',
      name: 'Usuário Teste',
      email: 'teste@email.com',
      password: '',
      memberSince: new Date('2024-01-15'),
      lastLogin: new Date()
    };
    this.originalProfile = { ...this.userProfile };
  }

  getInitials(): string {
    if (!this.userProfile.name) return 'UN';
    
    const names = this.userProfile.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  toggleEdit() {
    if (this.isEditing) {
      this.saveProfile();
    } else {
      this.isEditing = true;
    }
  }

  saveProfile() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    const updateData: UpdateProfileRequest = {
      nome: this.userProfile.name.trim(),
      email: this.userProfile.email.trim()
    };

    if (this.userProfile.password && this.userProfile.password.trim()) {
      updateData.senha = this.userProfile.password.trim();
    }

    this.apiService.put('/api/auth/profile', updateData).subscribe({
      next: (response) => {
        this.originalProfile = { ...this.userProfile };
        this.isEditing = false;
        this.showPassword = false;
        this.notification.success('Perfil atualizado com sucesso!');

        this.userProfile.password = '';

        setTimeout(() => {
          this.loadUserProfile();
        }, 1000);

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erro ao salvar perfil:', error);
        
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          return;
        }

        if (error.status === 400) {
          this.notification.error(error.error?.detail || 'Dados inválidos. Verifique as informações.');
        } else if (error.status === 409) {
          this.notification.error('Este email já está sendo usado por outro usuário.');
        } else {
          this.notification.error('Erro ao salvar perfil. Tente novamente.');
        }

        this.isLoading = false;
      }
    });
  }

  cancelEdit() {
    if (this.hasChanges()) {
      this.confirmation.confirm({
        title: 'Descartar Alterações',
        message: 'Você tem alterações não salvas. Deseja descartar?',
        confirmText: 'Descartar',
        cancelText: 'Continuar Editando',
        type: 'warning'
      }).subscribe(confirmed => {
        if (confirmed) {
          this.userProfile = { ...this.originalProfile };
          this.isEditing = false;
          this.showPassword = false;
          this.notification.info('Alterações descartadas');
        }
      });
    } else {
      this.userProfile = { ...this.originalProfile };
      this.isEditing = false;
      this.showPassword = false;
    }
  }
  
  private hasChanges(): boolean {
    const nameChanged = this.userProfile.name !== this.originalProfile.name;
    const emailChanged = this.userProfile.email !== this.originalProfile.email;
    const passwordChanged = !!(this.userProfile.password && this.userProfile.password.trim().length > 0);
    
    return nameChanged || emailChanged || passwordChanged;
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  changeAvatar() {
    this.notification.info('Função de alterar avatar será implementada em breve');
  }

  getMemberSince(): string {
    if (!this.userProfile.memberSince) return 'N/A';
    return this.formatDate(this.userProfile.memberSince);
  }

  getLastLogin(): string {
    if (!this.userProfile.lastLogin) return 'N/A';
    
    const now = new Date();
    const lastLogin = new Date(this.userProfile.lastLogin);
    const diffInMinutes = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      return this.formatDate(lastLogin);
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  private validateForm(): boolean {
    if (!this.userProfile.name.trim()) {
      this.notification.warning('Nome é obrigatório');
      return false;
    }

    if (this.userProfile.name.trim().length < 2) {
      this.notification.warning('Nome deve ter pelo menos 2 caracteres');
      return false;
    }

    if (!this.userProfile.email.trim()) {
      this.notification.warning('Email é obrigatório');
      return false;
    }

    if (!this.isValidEmail(this.userProfile.email)) {
      this.notification.warning('Email inválido');
      return false;
    }

    if (this.userProfile.password && this.userProfile.password.trim()) {
      if (this.userProfile.password.length < 6) {
        this.notification.warning('Senha deve ter pelo menos 6 caracteres');
        return false;
      }
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  logout() {
    this.confirmation.confirm({
      title: 'Sair da Conta',
      message: 'Deseja realmente sair da sua conta?',
      confirmText: 'Sair',
      cancelText: 'Cancelar',
      type: 'info'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.authService.logout();
        this.notification.info('Você saiu da sua conta');
        this.router.navigate(['/auth/login']);
      }
    });
  }
}