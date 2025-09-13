import { Component } from '@angular/core';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { VillainCarouselComponent } from '@app/shared/components/villain-carousel/villain-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, VillainCarouselComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePageComponent {
  constructor() { }

  ngOnInit() {
  }
}