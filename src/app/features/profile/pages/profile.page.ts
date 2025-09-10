import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';

interface UserProfile {
  name: string;
  email: string;
  password: string;
  memberSince: Date;
  lastLogin: Date;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePageComponent implements OnInit {
  userProfile: UserProfile = {
    name: '',
    email: '',
    password: '',
    memberSince: new Date(),
    lastLogin: new Date()
  };

  originalProfile: UserProfile = {
    name: '',
    email: '',
    password: '',
    memberSince: new Date(),
    lastLogin: new Date()
  };

  isEditing: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor() { }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      this.userProfile = {
        name: userData.name || 'Nome do Usuário',
        email: userData.email || 'usuario@email.com',
        password: userData.password || '••••••••',
        memberSince: new Date(userData.memberSince) || new Date(),
        lastLogin: new Date(userData.lastLogin) || new Date()
      };
    } else {
      this.userProfile = {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: 'minhasenha123',
        memberSince: new Date('2024-01-15'),
        lastLogin: new Date()
      };
    }

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

  async saveProfile() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    try {
      await this.delay(1500);

      const updatedUser = {
        ...this.userProfile,
        lastLogin: new Date()
      };

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      this.originalProfile = { ...this.userProfile };
      
      this.isEditing = false;
      this.isLoading = false;
      
      console.log('Perfil salvo com sucesso!');
      
    } catch (error) {
      this.isLoading = false;
      console.error('Erro ao salvar perfil:', error);
    }
  }

  cancelEdit() {
    this.userProfile = { ...this.originalProfile };
    this.isEditing = false;
    this.showPassword = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  changeAvatar() {
    console.log('Alterar avatar...');
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
      alert('Nome é obrigatório');
      return false;
    }

    if (!this.userProfile.email.trim()) {
      alert('Email é obrigatório');
      return false;
    }

    if (!this.isValidEmail(this.userProfile.email)) {
      alert('Email inválido');
      return false;
    }

    if (!this.userProfile.password.trim()) {
      alert('Senha é obrigatória');
      return false;
    }

    if (this.userProfile.password.length < 6) {
      alert('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  logout() {
    localStorage.removeItem('currentUser');
    console.log('Usuário deslogado');
  }
}