import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { Router } from '@angular/router';

interface Reward {
  type: string;
  name: string;
  icon: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  thumbnail: string;
  level: number;
  players: string;
  duration: string;
  rewards: Reward[];
  isLocked: boolean;
}

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './campaign.page.html',
  styleUrls: ['./campaign.page.scss']
})
export class CampaignsComponent implements OnInit {
  isLoading: boolean = true;
  campaigns: Campaign[] = [];
  selectedCampaign: Campaign | null = null;
  showDetail: boolean = false;

  private mockCampaigns: Campaign[] = [
    {
      id: 'arena-sombras',
      title: 'Arena das Sombras: O Combate Cibernético',
      description: 'Dois lutadores se enfrentam em uma arena clandestina no coração de uma cidade cyberpunk.',
      fullDescription: 'Dois lutadores se enfrentam em uma arena clandestina no coração de uma cidade cyberpunk. Cercados por uma multidão mascarada e iluminados por letreiros de neon, carne e aço se encaram em um duelo brutal pela sobrevivência. Neste ambiente hostil, apenas o mais forte sobreviverá para contar a história.',
      image: 'assets/images/campaigns/arena-sombras-full.jpg',
      thumbnail: 'assets/images/campaigns/arena-sombras-thumb.jpg',
      level: 15,
      players: '2-4 Jogadores',
      duration: '45 min',
      rewards: [
        { type: 'weapon', name: 'Lâmina Cybernética', icon: 'sword' },
        { type: 'armor', name: 'Escudo Neural', icon: 'shield' },
        { type: 'health', name: 'Vida +100', icon: 'heart' },
        { type: 'tech', name: 'Chip de Combate', icon: 'chip' }
      ],
      isLocked: false
    },
    {
      id: 'laboratorio-cristais',
      title: 'Laboratório de Cristais Arcanos',
      description: 'No subsolo da cidade, um cientista obsecado realiza experimentos com cristais energéticos instáveis.',
      fullDescription: 'No subsolo da cidade, um cientista obsecado realiza experimentos com cristais energéticos instáveis. O ambiente é tomado por tubos cheios de líquidos brilhantes, máquinas pulsantes e explosões ocasionais de energia. Os jogadores devem navegar por este laboratório perigoso, enfrentando mutações e anomalias criadas pelos experimentos.',
      image: 'assets/images/campaigns/laboratorio-cristais-full.jpg',
      thumbnail: 'assets/images/campaign-image1.jpg',
      level: 20,
      players: '3-5 Jogadores',
      duration: '60 min',
      rewards: [
        { type: 'weapon', name: 'Bastão Arcano', icon: 'sword' },
        { type: 'armor', name: 'Manto de Cristal', icon: 'shield' },
        { type: 'health', name: 'Poção Vital', icon: 'heart' },
        { type: 'tech', name: 'Cristal Energético', icon: 'chip' }
      ],
      isLocked: false
    },
    {
      id: 'laboratorio-cristais-2',
      title: 'Laboratório de Cristais Arcanos - Modo Extremo',
      description: 'No subsolo da cidade, um cientista obsecado realiza experimentos com cristais energéticos instáveis.',
      fullDescription: 'Versão extrema do laboratório com desafios adicionais e recompensas aprimoradas. Os jogadores enfrentarão versões mais poderosas dos inimigos e puzzles mais complexos.',
      image: 'assets/images/campaigns/laboratorio-cristais-full2.jpg',
      thumbnail: 'assets/images/campaigns/laboratorio-cristais-thumb2.jpg',
      level: 25,
      players: '4-6 Jogadores',
      duration: '90 min',
      rewards: [
        { type: 'weapon', name: 'Cetro do Caos', icon: 'sword' },
        { type: 'armor', name: 'Armadura Prismática', icon: 'shield' },
        { type: 'health', name: 'Elixir da Vida', icon: 'heart' },
        { type: 'tech', name: 'Núcleo de Energia', icon: 'chip' }
      ],
      isLocked: false
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    setTimeout(() => {
      this.campaigns = this.mockCampaigns;
      this.isLoading = false;
    }, 1500);
  }

  openCampaign(campaignId: string): void {
    const campaign = this.mockCampaigns.find(c => c.id === campaignId);
    
    if (campaign && !campaign.isLocked) {
      this.selectedCampaign = campaign;
      
      setTimeout(() => {
        this.showDetail = true;
      }, 100);
    } else if (campaign && campaign.isLocked) {
      this.showLockedMessage();
    }
  }

  closeDetail(): void {
    this.showDetail = false;
    
    setTimeout(() => {
      this.selectedCampaign = null;
    }, 500);
  }

  startCampaign(campaignId: string): void {
    this.router.navigate(['/game', campaignId]);
  }


  createNewCampaign(): void {
    this.router.navigate(['/campaign/create']);
  }

  private showLockedMessage(): void {
    console.log('Esta campanha está bloqueada. Complete as campanhas anteriores para desbloqueá-la.');
  }
}