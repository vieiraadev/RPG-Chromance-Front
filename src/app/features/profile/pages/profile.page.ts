import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@shared/components/navbar/navbar.component'; // Ajuste o path conforme sua estrutura

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePageComponent {
  
  constructor() { }

}