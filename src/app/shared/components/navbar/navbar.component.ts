import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() navigationChange = new EventEmitter<string>();
  @Output() logoutEmitter = new EventEmitter<void>();
  @Input() initialActive: string = 'home';
  
  activeIcon: string = 'home';
  navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', icon: 'bx-home', path: '/home' },
    { id: 'characters', label: 'Meus Personagens', icon: 'bx-group', path: '/characters' },
    { id: 'campaigns', label: 'Campanhas', icon: 'bx-map-alt', path: '/campaigns' },
    { id: 'profile', label: 'Perfil', icon: 'bx-user', path: '/profile' },
  ];

  constructor(
    private authService: AuthService,  
    private router: Router          
  ) {}

  ngOnInit(): void {
    this.activeIcon = this.initialActive;
  }

  isActive(iconId: string): boolean {
    return this.activeIcon === iconId;
  }

  logout(): void {
    this.authService.logout();       
    this.router.navigate(['/login']);   
  }
}