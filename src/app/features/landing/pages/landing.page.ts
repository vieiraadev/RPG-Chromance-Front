import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
      console.log('Sistema Chromance online! Botão de acesso liberado.');
    }, 1000);
  }

  entrarJogo(): void {
    console.log('Navegando para tela de login...');
    this.router.navigate(['auth/login']);
  }

  copiarUrl(): void {
    navigator.clipboard.writeText(this.urlSite).then(() => {
      console.log('URL copiada para área de transferência');
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