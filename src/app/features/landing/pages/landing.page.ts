import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Icone {
  classe: string;
  tooltip: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit, OnDestroy {
  
  isExiting = false;
  sistemaCarregado = false;
  progressoCarregamento = 0;
  textoCarregamento = 'Iniciando sistema Chromance...';
  mensagemAtual = '';
  
  icones: Icone[] = [
    { classe: 'bx-brain', tooltip: 'Neural Interface' },
    { classe: 'bx-chip', tooltip: 'Cybernetic Core' },
    { classe: 'bx-shield-alt-2', tooltip: 'Firewall System' }
  ];
  
  primeiraLinha: string[] = ['BEM-VINDOS', 'AO', 'RPG'];
  segundaLinha: string[] = ['CHROMANCE'];

  urlSite: string = 'system://chromance.neural.net';

  linhas: number[] = Array(16).fill(0);

  private intervalCarregamento?: ReturnType<typeof setInterval>;
  private timeoutInicial?: ReturnType<typeof setTimeout>;

  private readonly mensagensCompletas = [
    'Inicializando protocolos de segurança...',
    'Conectando à rede neural...',
    'Verificando implantes cibernéticos...',
    'Carregando database de personagens...',
    'Sincronizando com servidor central...',
    'Validando credenciais de acesso...',
    'Sistema Chromance online!'
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log('Chromance RPG iniciando...');
    this.iniciarCarregamentoSistema();
  }

  ngOnDestroy(): void {
    this.limparIntervalos();
  }

  iniciarCarregamentoSistema(): void {
    this.timeoutInicial = setTimeout(() => {
      this.simularCarregamento();
    }, 3000);
  }

  private simularCarregamento(): void {
    let etapaAtual = 0;
    const totalEtapas = this.mensagensCompletas.length;
    
    this.intervalCarregamento = setInterval(() => {
      if (etapaAtual < totalEtapas) {
        this.mensagemAtual = this.mensagensCompletas[etapaAtual];
        this.progressoCarregamento = Math.floor(((etapaAtual + 1) / totalEtapas) * 100);

        if (etapaAtual === totalEtapas - 1) {
          this.textoCarregamento = 'Sistema pronto para acesso';
        } else {
          this.textoCarregamento = this.mensagensCompletas[etapaAtual];
        }
        
        console.log(`⚡ ${this.mensagemAtual} (${this.progressoCarregamento}%)`);
        etapaAtual++;
      } else {
        this.finalizarCarregamento();
      }
    }, 800);
  }

  private finalizarCarregamento(): void {
    if (this.intervalCarregamento) {
      clearInterval(this.intervalCarregamento);
    }
    
    setTimeout(() => {
      this.sistemaCarregado = true;
      console.log('🚀 Sistema Chromance online! Botão de acesso liberado.');
    }, 1000);
  }

  entrarJogo(): void {
    this.router.navigate(['auth/login']);
  }
  onIconeClick(icone: Icone): void {
    console.log(`Sistema ativado: ${icone.tooltip}`);
    this.ativarEfeitoIcone(icone);
    switch (icone.classe) {
      case 'bx-brain':
        this.mostrarNotificacao('Interface Neural Online');
        break;
        
      case 'bx-chip':
        this.mostrarNotificacao('Core Cibernético Ativo');
        break;
        
      case 'bx-shield-alt-2':
        this.mostrarNotificacao('Firewall Sistema Ativo');
        break;
    }
  }

  private ativarEfeitoIcone(icone: Icone): void {
    const elemento = document.querySelector(`[data-tooltip="${icone.tooltip}"]`);
    if (elemento) {
      elemento.classList.add('efeito-ativado');

      setTimeout(() => {
        elemento.classList.remove('efeito-ativado');
      }, 1500);
    }
  }

  private mostrarNotificacao(mensagem: string): void {
    console.log(`Notificação: ${mensagem}`);
    if (!this.sistemaCarregado) {
      const mensagemOriginal = this.mensagemAtual;
      this.mensagemAtual = mensagem;
      
      setTimeout(() => {
        this.mensagemAtual = mensagemOriginal;
      }, 2000);
    }
  }
  copiarUrl(): void {
    navigator.clipboard.writeText(this.urlSite).then(() => {
      this.mostrarNotificacao('URL Copiada');
    }).catch(err => {
      console.error('Erro ao copiar URL:', err);
    });
  }
  resetarSistema(): void {
    console.log('Resetando sistema Chromance...');
    this.limparIntervalos();
    this.sistemaCarregado = false;
    this.progressoCarregamento = 0;
    this.mensagemAtual = '';
    this.textoCarregamento = 'Iniciando sistema Chromance...';
    this.isExiting = false;
    
    this.iniciarCarregamentoSistema();
  }

  private limparIntervalos(): void {
    if (this.intervalCarregamento) {
      clearInterval(this.intervalCarregamento);
      this.intervalCarregamento = undefined;
    }
    
    if (this.timeoutInicial) {
      clearTimeout(this.timeoutInicial);
      this.timeoutInicial = undefined;
    }
  }

  get sistemaCarregando(): boolean {
    return !this.sistemaCarregado && this.progressoCarregamento > 0;
  }

  get statusSistema(): string {
    if (this.isExiting) return 'Saindo do sistema...';
    if (this.sistemaCarregado) return 'Sistema online';
    if (this.sistemaCarregando) return 'Carregando...';
    return 'Inicializando...';
  }
}