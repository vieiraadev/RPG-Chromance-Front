import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { SelectCharacterModalComponent } from '@app/shared/components/select-character-modal/select-character-modal.component';
import { Character } from '@app/shared/components/character-card/character-card.component';
import { Router } from '@angular/router';
import { CampaignService, Campaign, ActiveCampaignStatus } from '@app/core/services/campaign.service';

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
  errorMessage: string = '';

  activeCampaignStatus: ActiveCampaignStatus = {
    has_active_campaign: false,
    active_campaign: null
  };

  constructor(
    private router: Router,
    private campaignService: CampaignService
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
    this.loadActiveCampaignStatus();
  }

  private loadCampaigns(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.campaignService.getCampaigns().subscribe({
      next: (response) => {
        this.campaigns = response.campaigns.map(campaign => ({
          ...campaign,
          id: campaign.campaign_id
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar campanhas:', error);
        this.errorMessage = 'Erro ao carregar campanhas. Tente novamente mais tarde.';
        this.isLoading = false;
        
        this.loadMockCampaigns();
      }
    });
  }

  private loadActiveCampaignStatus(): void {
    this.campaignService.getActiveCampaignStatus().subscribe({
      next: (status) => {
        this.activeCampaignStatus = status;
        console.log('Status campanha ativa:', status);
      },
      error: (err) => {
        console.error('Erro ao carregar status da campanha ativa:', err);
      }
    });
  }

  private loadMockCampaigns(): void {
    console.warn('Usando dados mockados como fallback');
    
    this.campaigns = [
      {
        id: 'arena-sombras',
        campaign_id: 'arena-sombras',
        title: 'Capítulo 1 : O Cubo das Sombras',
        chapter: 1,
        description: 'Nas profundezas de uma catedral em ruínas, o guerreiro sombrio encontra a Relíquia Perdida — um cubo pulsante de energia ancestral.',
        full_description: 'Nas profundezas de uma catedral em ruínas, o guerreiro sombrio encontra a Relíquia Perdida — um cubo pulsante de energia ancestral. Para conquistá-lo, deve enfrentar as armadilhas ocultas que protegem seu poder e resistir à corrupção que emana da própria relíquia.',
        image: './assets/images/campaign-thumb1.jpg',
        thumbnail: './assets/images/campaign-thumb1.jpg',
        rewards: [
          { type: 'weapon', name: 'Lâmina Cybernética', icon: 'sword' },
          { type: 'armor', name: 'Escudo Neural', icon: 'shield' },
          { type: 'health', name: 'Vida +100', icon: 'heart' },
          { type: 'tech', name: 'Chip de Combate', icon: 'chip' }
        ],
        is_locked: false
      },
      {
        id: 'laboratorio-cristais',
        campaign_id: 'laboratorio-cristais',
        title: 'Capítulo 2 : Laboratório de Cristais Arcanos',
        chapter: 2,
        description: 'Em um laboratório oculto nas profundezas da fortaleza inimiga, um cientista obcecado conduz experiências proibidas.',
        full_description: 'Em um laboratório oculto nas profundezas da fortaleza inimiga, um cientista obcecado conduz experiências proibidas com fragmentos de energia arcana.',
        image: './assets/images/campaign-thumb2.jpg',
        thumbnail: './assets/images/campaign-thumb2.jpg',
        rewards: [
          { type: 'weapon', name: 'Bastão Arcano', icon: 'sword' },
          { type: 'armor', name: 'Manto de Cristal', icon: 'shield' },
          { type: 'health', name: 'Poção Vital', icon: 'heart' },
          { type: 'tech', name: 'Cristal Energético', icon: 'chip' }
        ],
        is_locked: false
      },
      {
        id: 'coliseu-de-neon',
        campaign_id: 'coliseu-de-neon',
        title: 'Capítulo 3 : Coliseu de Neon',
        chapter: 3,
        description: 'No coração da cidade subterrânea, em um beco cercado por prédios decadentes.',
        full_description: 'No coração da cidade subterrânea, em um beco cercado por prédios decadentes e iluminado apenas por letreiros de neon.',
        image: './assets/images/campaign-image3.jpg',
        thumbnail: './assets/images/campaign-image3.jpg',
        rewards: [
          { type: 'weapon', name: 'Cetro do Caos', icon: 'sword' },
          { type: 'armor', name: 'Armadura Prismática', icon: 'shield' },
          { type: 'health', name: 'Elixir da Vida', icon: 'heart' },
          { type: 'tech', name: 'Núcleo de Energia', icon: 'chip' }
        ],
        is_locked: false
      }
    ];
  }

  isActiveCampaign(campaign: Campaign): boolean {
    if (!this.activeCampaignStatus.has_active_campaign) {
      return false;
    }
    
    const activeCampaign = this.activeCampaignStatus.active_campaign;
    return activeCampaign?.campaign_id === campaign.campaign_id;
  }

  isOccupiedByCampaign(campaign: Campaign): boolean {
    if (!this.activeCampaignStatus.has_active_campaign) {
      return false;
    }
    
    const activeCampaign = this.activeCampaignStatus.active_campaign;
    return activeCampaign?.campaign_id !== campaign.campaign_id;
  }

  getCampaignButtonText(campaign: Campaign): string {
    if (!this.activeCampaignStatus.has_active_campaign) {
      return 'Iniciar Campanha';
    }
    
    const activeCampaign = this.activeCampaignStatus.active_campaign;
    if (activeCampaign && activeCampaign.campaign_id === campaign.campaign_id) {
      return 'Continue';
    }
    
    return `Ocupado por ${activeCampaign?.active_character_name || 'outro jogador'}`;
  }

  isCampaignButtonEnabled(campaign: Campaign): boolean {
    if (!this.activeCampaignStatus.has_active_campaign) {
      return true;
    }
    
    const activeCampaign = this.activeCampaignStatus.active_campaign;
    return activeCampaign?.campaign_id === campaign.campaign_id;
  }

  onCampaignButtonClick(campaign: Campaign): void {
    if (!this.activeCampaignStatus.has_active_campaign) {
      this.startNewCampaign(campaign);
    } else {
      const activeCampaign = this.activeCampaignStatus.active_campaign;
      if (activeCampaign?.campaign_id === campaign.campaign_id) {
        this.continueCampaign(activeCampaign);
      }
    }
  }

  private startNewCampaign(campaign: Campaign): void {
    console.log('Iniciando nova campanha:', campaign);
    this.campaignToStart = campaign;
    this.showCharacterModal = true;
  }

  private continueCampaign(campaign: Campaign): void {
    console.log('Continuando campanha:', campaign);
    
    const navigationData = {
      campaignId: campaign.campaign_id,
      campaignTitle: campaign.title,
      characterId: campaign.active_character_id || '',
      characterName: campaign.active_character_name || '',
      currentChapter: campaign.current_chapter || 1,
      chaptersCompleted: campaign.chapters_completed || []
    };

    localStorage.setItem('gameData', JSON.stringify(navigationData));
    
    this.router.navigate(['/game'], {
      queryParams: {
        campaign: campaign.campaign_id,
        character: campaign.active_character_id || '',
        continue: 'true'
      }
    });
  }

  cancelActiveCampaign(): void {
    const activeCampaign = this.activeCampaignStatus.active_campaign;
    if (!activeCampaign) return;

    if (confirm(`Deseja encerrar a campanha ativa "${activeCampaign.title}"? O progresso será perdido.`)) {
      this.campaignService.cancelCampaign(activeCampaign.campaign_id).subscribe({
        next: (response) => {
          console.log('Campanha cancelada:', response);
          alert('Campanha encerrada com sucesso!');
          this.loadActiveCampaignStatus();
          this.loadCampaigns();
        },
        error: (err) => {
          console.error('Erro ao cancelar campanha:', err);
          alert('Erro ao encerrar campanha.');
        }
      });
    }
  }

  openCampaign(campaignId: string): void {
    const campaign = this.campaigns.find(c => c.id === campaignId || c.campaign_id === campaignId);
    
    if (campaign && !campaign.is_locked) {
      this.selectedCampaign = campaign;
      
      setTimeout(() => {
        this.showDetail = true;
      }, 100);
    } else if (campaign && campaign.is_locked) {
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
    console.log('Dados da campanha:', this.campaignToStart);
    
    const campaignId = this.campaignToStart?.campaign_id || this.campaignToStart?.id;
    console.log('Campaign ID a ser usado:', campaignId);
    
    if (this.campaignToStart && campaignId) {
      const navigationData = {
        campaignId: campaignId,
        campaignTitle: this.campaignToStart.title,
        characterId: character.id,
        characterName: character.name,
        characterClass: character.classe,
        characterRace: character.raca,
        characterAttributes: character.atributos,
        characterImage: character.imageUrl,
        currentChapter: 1,
        chaptersCompleted: []
      };

      localStorage.setItem('gameData', JSON.stringify(navigationData));
      
      this.router.navigate(['/game'], {
        queryParams: {
          campaign: campaignId,
          character: character.id
        }
      });
    } else {
      console.error('Dados da campanha incompletos:', {
        campaignToStart: this.campaignToStart,
        campaignId: campaignId
      });
      alert('Erro: Dados da campanha não foram encontrados. Tente novamente.');
    }
  }

  onCloseCharacterModal(): void {
    this.showCharacterModal = false;
    this.campaignToStart = null;
  }

  private showLockedMessage(): void {
    console.log('Esta campanha está bloqueada. Complete as campanhas anteriores para desbloqueá-la.');
  }

  getRewardIconClass(icon: string): string {
    const iconMap: { [key: string]: string } = {
      'sword': 'bx bx-sword',
      'shield': 'bx bx-shield',
      'heart': 'bx bx-heart',
      'chip': 'bx bx-chip'
    };
    return iconMap[icon] || 'bx bx-gift';
  }

  seedCampaigns(): void {
    if (confirm('Isso irá resetar todas as campanhas. Deseja continuar?')) {
      this.campaignService.seedCampaigns().subscribe({
        next: (campaigns) => {
          console.log('Campanhas populadas com sucesso:', campaigns);
          this.loadCampaigns();
          this.loadActiveCampaignStatus(); 
        },
        error: (error) => {
          console.error('Erro ao popular campanhas:', error);
        }
      });
    }
  }
}