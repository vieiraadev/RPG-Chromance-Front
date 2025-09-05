import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { SelectCharacterModalComponent } from '@app/shared/components/select-character-modal/select-character-modal.component';
import { Character } from '@app/shared/components/character-card/character-card.component';
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
  imports: [CommonModule, NavbarComponent, SelectCharacterModalComponent],
  templateUrl: './campaign.page.html',
  styleUrls: ['./campaign.page.scss']
})
export class CampaignsComponent implements OnInit {
  isLoading: boolean = true;
  campaigns: Campaign[] = [];
  selectedCampaign: Campaign | null = null;
  showDetail: boolean = false;
  showCharacterModal: boolean = false;
  campaignToStart: Campaign | null = null;

  private mockCampaigns: Campaign[] = [
    {
      id: 'arena-sombras',
      title: 'Capítulo 1 : O Cubo das Sombras',
      description: 'Nas profundezas de uma catedral em ruínas, o guerreiro sombrio encontra a Relíquia Perdida — um cubo pulsante de energia ancestral. Para conquistá-lo, deve enfrentar as armadilhas ocultas que protegem seu poder e resistir à corrupção que emana da própria relíquia. Cada passo ecoa no salão silencioso, enquanto a luz azul da espada e do artefato guia seu caminho através da escuridão. O destino do mundo depende de sua escolha: dominar o cubo ou ser consumido por ele.',
      fullDescription: 'Nas profundezas de uma catedral em ruínas, o guerreiro sombrio encontra a Relíquia Perdida — um cubo pulsante de energia ancestral. Para conquistá-lo, deve enfrentar as armadilhas ocultas que protegem seu poder e resistir à corrupção que emana da própria relíquia. Cada passo ecoa no salão silencioso, enquanto a luz azul da espada e do artefato guia seu caminho através da escuridão. O destino do mundo depende de sua escolha: dominar o cubo ou ser consumido por ele.',
      image: './assets/images/campaign-thumb1.jpg',
      thumbnail: './assets/images/campaign-thumb1.jpg',
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
      title: 'Capítulo 2 : Laboratório de Cristais Arcanos',
      description: 'Em um laboratório oculto nas profundezas da fortaleza inimiga, um cientista obcecado conduz experiências proibidas com fragmentos de energia arcana. Sua última criação gerou uma reação instável, transformando o local em um campo de chamas e caos. O jogador deve atravessar o laboratório em colapso, evitando explosões e defendendo-se das máquinas de defesa ativadas pelo surto de energia.',
      fullDescription: 'Em um laboratório oculto nas profundezas da fortaleza inimiga, um cientista obcecado conduz experiências proibidas com fragmentos de energia arcana. Sua última criação gerou uma reação instável, transformando o local em um campo de chamas e caos. O jogador deve atravessar o laboratório em colapso, evitando explosões e defendendo-se das máquinas de defesa ativadas pelo surto de energia.',
      image: './assets/images/campaign-thumb2.jpg',
      thumbnail: './assets/images/campaign-thumb2.jpg',
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
      id: 'coliseu-de-Neon',
      title: 'Capítulo 3 : Coliseu de Neon',
      description: 'No coração da cidade subterrânea, em um beco cercado por prédios decadentes e iluminado apenas por letreiros de neon, ocorre o torneio clandestino mais brutal do submundo. Aqui, guerreiros e máquinas se enfrentam em lutas sangrentas, enquanto a multidão mascarada assiste em êxtase.',
      fullDescription: 'No coração da cidade subterrânea, em um beco cercado por prédios decadentes e iluminado apenas por letreiros de neon, ocorre o torneio clandestino mais brutal do submundo. Aqui, guerreiros e máquinas se enfrentam em lutas sangrentas, enquanto a multidão mascarada assiste em êxtase.',
      image: './assets/images/campaign-image3.jpg',
      thumbnail: './assets/images/campaign-image3.jpg',
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

  startCampaign(campaign?: Campaign): void {
    const campaignToStart = campaign || this.selectedCampaign;
    
    console.log('startCampaign chamado com:', campaignToStart);
    
    if (campaignToStart) {
      this.campaignToStart = campaignToStart;
      this.showCharacterModal = true;
      console.log('Modal deveria abrir. showCharacterModal:', this.showCharacterModal);
    } else {
      console.error('Nenhuma campanha disponível para iniciar');
    }
  }

  onCharacterSelected(character: Character): void {
    console.log('Personagem selecionado:', character);
    console.log('Iniciando campanha:', this.campaignToStart?.id);
    
    localStorage.setItem('selectedCharacter', JSON.stringify(character));
    localStorage.setItem('currentCampaign', JSON.stringify(this.campaignToStart));
    
    if (this.campaignToStart) {
      this.router.navigate(['/game', this.campaignToStart.id], {
        queryParams: { characterId: character.id }
      });
    }
  }

  onCloseCharacterModal(): void {
    this.showCharacterModal = false;
    this.campaignToStart = null;
  }

  createNewCampaign(): void {
    this.router.navigate(['/campaign/create']);
  }

  private showLockedMessage(): void {
    console.log('Esta campanha está bloqueada. Complete as campanhas anteriores para desbloqueá-la.');
  }
}