import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Character {
  id: string;
  name: string;
  classe: string;
  imageUrl: string;
}

@Component({
  selector: 'app-villain-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './villain-carousel.component.html',
  styleUrls: ['./villain-carousel.component.scss']
})
export class VillainCarouselComponent implements OnInit, OnDestroy {
  @ViewChild('carouselContainer', { static: true }) carouselContainer!: ElementRef;

  currentIndex = 0;
  isAnimating = false;
  autoPlayInterval?: number;

  villains: Character[] = [
    {
      id: '1',
      name: 'Dr. Malrik Veyran – O Engenheiro da Peste',
      classe: 'Alquimista Biocibernético',
      imageUrl: 'assets/images/villain1.jpg'
    },
    {
      id: '2',
      name: 'Drax - O Esfacelador',
      classe: 'Gladiador Cibernético',
      imageUrl: 'assets/images/villain2.jpg'
    },
    {
      id: '3',
      name: 'Arkhon Seraph – Guardião Tecno-Arcano',
      classe: 'Tecnomago da Relíquia',
      imageUrl: 'assets/images/villain3.jpg'
    },
    {
      id: '4',
      name: 'Venomatrix - A Aranha Sintética',
      classe: 'Assassina Biocibernética',
      imageUrl: 'assets/images/villain4.jpg'
    },
    {
      id: '5',
      name: 'Oblivion Harvester – O Ceifador de Almas',
      classe: 'Ceifador Cibernético',
      imageUrl: 'assets/images/villain5.jpg'
    },
    {
      id: '6',
      name: 'Revenant-X – O Ressuscitado',
      classe: 'Aberração Cibermântica',
      imageUrl: 'assets/images/villain6.jpg'
    }
  ];

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  get visibleVillains(): Character[] {
    const totalVillains = this.villains.length;
    const result: Character[] = [];
    
    for (let i = 0; i < 3; i++) {
      const index = (this.currentIndex + i) % totalVillains;
      result.push(this.villains[index]);
    }
    
    return result;
  }

  hasValidImage(imageUrl: string): boolean {
    return !!(imageUrl && imageUrl.trim() !== '' && imageUrl !== 'assets/images/default-avatar.png');
  }

  nextVillain() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex + 1) % this.villains.length;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
    
    this.resetAutoPlay();
  }

  prevVillain() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentIndex = this.currentIndex === 0 ? this.villains.length - 1 : this.currentIndex - 1;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
    
    this.resetAutoPlay();
  }

  goToSlide(index: number) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    this.isAnimating = true;
    this.currentIndex = index;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
    
    this.resetAutoPlay();
  }

  private startAutoPlay() {
    this.autoPlayInterval = window.setInterval(() => {
      if (!this.isAnimating) {
        this.nextVillain();
      }
    }, 8000);
  }

  private stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  private resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}