import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() navigationChange = new EventEmitter<string>();
  @Output() logoutEmitter = new EventEmitter<void>(); 
  @Input() initialActive: string = 'home';
  
  activeIcon: string = 'home';
  
  navigationItems = [
    { id: 'home', label: 'Home', icon: 'bx-home' },
    { id: 'characters', label: 'Meus Personagens', icon: 'bx-group' },
    { id: 'campaigns', label: 'Campanhas', icon: 'bx-map-alt' },
    { id: 'play', label: 'Jogar', icon: 'bx-joystick' },
    { id: 'profile', label: 'Perfil', icon: 'bx-user' }
  ];

  ngOnInit(): void {
    this.activeIcon = this.initialActive;
  }

  setActive(iconId: string): void {
    if (this.activeIcon !== iconId) {
      this.activeIcon = iconId;
      this.navigationChange.emit(iconId);
    }
  }

  isActive(iconId: string): boolean {
    return this.activeIcon === iconId;
  }

  logout(): void {
    this.logoutEmitter.emit();
  }
}