import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared/components/navbar/navbar.component';
import { SelectCharacterModalComponent } from '@app/shared/components/select-character-modal/select-character-modal.component';
import { Character } from '@app/shared/components/character-card/character-card.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CampaignService, Campaign, ActiveCampaignStatus } from '@app/core/services/campaign.service';
import { LLMService } from '@app/core/services/llm.service';
import { NotificationService } from '@app/core/services/notification.service';
import { ConfirmationService } from '@app/core/services/confirmation.service';

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

  activeCampaignStatus: ActiveCampaignStatus = {
    has_active_campaign: false,
    active_campaign: null
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private llmService: LLMService,
    private notification: NotificationService,
    private confirmation: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
    this.loadActiveCampaignStatus();
    
    this.route.queryParams.subscribe(params => {
      if (params['completed']) {
        const chapter = params['completed'];
        this.notification.success(
          `Parabéns por concluir o Capítulo ${chapter}! Todos os capítulos foram liberados novamente.`
        );
        
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {}
        });
      }
    });
  }

  private loadCampaigns(): void {
    this.isLoading = true;
    
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
        this.notification.error('Erro ao carregar campanhas. Tente novamente mais tarde.');
        this.isLoading = false;
        this.loadMockCampaigns();
      }
    });
  }

  private loadActiveCampaignStatus(): void {
    this.campaignService.getActiveCampaignStatus().subscribe({
      next: (status) => {
        this.activeCampaignStatus = status;
      },
      error: (err) => {
        console.error('Erro ao carregar status da campanha ativa:', err);
        this.notification.error('Erro ao verificar status da campanha ativa');
      }
    });
  }

  private loadMockCampaigns(): void {
    this.notification.warning('Usando dados de exemplo');
    
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
          { type: 'artifact', name: 'Cubo das Sombras', icon: 'cubo_sombras' }
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
          { type: 'crystal', name: 'Cristal Arcano Puro', icon: 'cristal_arcano' }
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
          { type: 'belt', name: 'Cinturão do Campeão', icon: 'cinturao_campeao' }
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
    
    if (activeCampaign?.status === 'completed') {
      return false;
    }
    
    return activeCampaign?.campaign_id === campaign.campaign_id;
  }

  isOccupiedByCampaign(campaign: Campaign): boolean {
    if (!this.activeCampaignStatus.has_active_campaign) {
      return false;
    }
    
    const activeCampaign = this.activeCampaignStatus.active_campaign;
    
    if (activeCampaign?.status === 'completed') {
      return false;
    }
    
    return activeCampaign?.campaign_id !== campaign.campaign_id;
  }

  getCampaignButtonText(campaign: Campaign): string {
    if (!this.activeCampaignStatus.has_active_campaign) {
      return 'Iniciar Campanha';
    }
    
    const activeCampaign = this.activeCampaignStatus.active_campaign;
    
    if (activeCampaign?.status === 'completed') {
      return 'Iniciar Campanha';
    }
    
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
    
    if (activeCampaign?.status === 'completed') {
      return true;
    }
    
    return activeCampaign?.campaign_id === campaign.campaign_id;
  }

  onCampaignButtonClick(campaign: Campaign): void {
    if (!this.activeCampaignStatus.has_active_campaign || 
        this.activeCampaignStatus.active_campaign?.status === 'completed') {
      this.startNewCampaign(campaign);
    } else {
      const activeCampaign = this.activeCampaignStatus.active_campaign;
      if (activeCampaign?.campaign_id === campaign.campaign_id) {
        this.continueCampaign(activeCampaign);
      } else {
        this.notification.warning(`Esta campanha está ocupada por ${activeCampaign?.active_character_name || 'outro personagem'}`);
      }
    }
  }

  private startNewCampaign(campaign: Campaign): void {
    this.campaignToStart = campaign;
    this.showCharacterModal = true;
  }

  private continueCampaign(campaign: Campaign): void {
    const navigationData = {
      campaignId: campaign.campaign_id,
      campaignTitle: campaign.title,
      characterId: campaign.active_character_id || '',
      characterName: campaign.active_character_name || '',
      currentChapter: campaign.current_chapter || 1,
      chaptersCompleted: campaign.chapters_completed || []
    };

    localStorage.setItem('gameData', JSON.stringify(navigationData));
    
    this.notification.info(`Continuando campanha: ${campaign.title}`);
    
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
  
    this.confirmation.confirm({
      title: 'Encerrar Campanha',
      message: `Deseja encerrar a campanha ativa "${activeCampaign.title}"? As narrativas atuais serão removidas, mas o conhecimento do mundo será preservado.`,
      confirmText: 'Encerrar',
      cancelText: 'Cancelar',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.campaignService.cancelCampaign(activeCampaign.campaign_id).subscribe({
          next: async (response) => {
            try {
              const currentCleared = await this.llmService.clearCurrentCampaignOnly(activeCampaign.campaign_id);
              
              if (currentCleared) {
                this.notification.success('Campanha encerrada! Conhecimento do mundo preservado.');
              } else {
                this.notification.warning('Campanha encerrada, mas houve problema ao limpar narrativas atuais');
              }
            } catch (error) {
              console.error('Erro ao limpar narrativas:', error);
              this.notification.success('Campanha encerrada com sucesso!');
            }
            
            this.loadActiveCampaignStatus();
            this.loadCampaigns();
          },
          error: (err) => {
            console.error('Erro ao cancelar campanha:', err);
            this.notification.error('Erro ao encerrar campanha');
          }
        });
      }
    });
  }

  openCampaign(campaignId: string): void {
    const campaign = this.campaigns.find(c => c.id === campaignId || c.campaign_id === campaignId);
    
    if (campaign && !campaign.is_locked) {
      this.selectedCampaign = campaign;
      
      setTimeout(() => {
        this.showDetail = true;
      }, 100);
    } else if (campaign && campaign.is_locked) {
      this.notification.warning('Esta campanha está bloqueada. Complete as campanhas anteriores para desbloqueá-la.');
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
    
    if (campaignToStart) {
      this.campaignToStart = campaignToStart;
      this.showCharacterModal = true;
    } else {
      this.notification.error('Nenhuma campanha disponível para iniciar');
    }
  }

  onCharacterSelected(character: Character): void {
    const campaignId = this.campaignToStart?.campaign_id || this.campaignToStart?.id;
    
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
      
      this.notification.success(`Iniciando campanha com ${character.name}!`);
      
      this.router.navigate(['/game'], {
        queryParams: {
          campaign: campaignId,
          character: character.id
        }
      });
    } else {
      this.notification.error('Dados da campanha não foram encontrados. Tente novamente.');
    }
  }

  onCloseCharacterModal(): void {
    this.showCharacterModal = false;
    this.campaignToStart = null;
  }

  getRewardIconClass(icon: string): string {
    const iconMap: { [key: string]: string } = {
      'cubo_sombras': 'bx bx-cube-alt',
      'cristal_arcano': 'bx bx-diamond',
      'cinturao_campeao': 'bx bx-medal'
    };
    return iconMap[icon] || 'bx bx-gift';
  }

  seedCampaigns(): void {
    this.confirmation.confirm({
      title: 'Resetar Campanhas',
      message: 'Isso irá resetar todas as campanhas. Deseja continuar?',
      confirmText: 'Resetar',
      cancelText: 'Cancelar',
      type: 'warning'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.campaignService.seedCampaigns().subscribe({
          next: (campaigns) => {
            this.notification.success('Campanhas populadas com sucesso!');
            this.loadCampaigns();
            this.loadActiveCampaignStatus(); 
          },
          error: (error) => {
            console.error('Erro ao popular campanhas:', error);
            this.notification.error('Erro ao popular campanhas');
          }
        });
      }
    });
  }
}