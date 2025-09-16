import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GameLocation {
  id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
}

@Component({
  selector: 'app-location-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-gallery.component.html',
  styleUrls: ['./location-gallery.component.scss']
})
export class LocationGalleryComponent {
  gameLocations: GameLocation[] = [
    {
      id: '1',
      name: 'Neo-Tokyo',
      subtitle: 'Distrito 7',
      imageUrl: 'assets/images/card-map1.jpg'
    },
    {
      id: '2',
      name: 'Laboratórios',
      subtitle: 'Subterrâneos',
      imageUrl: 'assets/images/card-map2.jpg'
    },
    {
      id: '3',
      name: 'Cidade Flutuante',
      subtitle: 'Aether',
      imageUrl: 'assets/images/card-map3.jpg'
    },
    {
      id: '4',
      name: 'Núcleo Central',
      subtitle: 'Matrix',
      imageUrl: 'assets/images/card-map4.jpg'
    }
  ];

  hasValidImage(imageUrl: string): boolean {
    return !!(imageUrl && imageUrl.trim() !== '' && imageUrl !== 'assets/images/default-location.jpg');
  }
}