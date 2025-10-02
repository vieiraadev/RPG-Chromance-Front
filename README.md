<p align="center">
  <img width="300" height="300" alt="RPG Chromance Logo" src="https://github.com/user-attachments/assets/eab59c4b-d54e-48b7-9e8b-96f39217e270" />
</p>

# 🎮 RPG Chromance - Frontend

Interface web interativa para o jogo de RPG textual com IA "RPG Chromance".
Parte do Programa Trainee da Wise Systems.

---

## 🚀 Sobre o Projeto

O **RPG Chromance Frontend** é a interface de usuário do sistema de RPG textual ambientado em um universo cyberpunk. Desenvolvido com Angular 20+, o projeto oferece uma experiência imersiva com design futurista, animações complexas e integração completa com a API backend para gerenciamento de personagens, campanhas e narrativas geradas por IA.

---

## 🛠️ Tecnologias Principais

- **Framework**: Angular 20.2.0
- **Linguagem**: TypeScript 5.9.2
- **Estilização**: SCSS com design system cyberpunk
- **Ícones**: Boxicons 2.1.4 + Lucide Angular 0.542.0
- **Gerenciamento de Estado**: RxJS 7.8.0
- **Autenticação**: JWT (JSON Web Tokens)
- **Roteamento**: Angular Router com guards
- **HTTP**: HttpClient com interceptors
- **Arquitetura**: Standalone Components (Angular 17+)

---

## ✨ Funcionalidades

### Sistema de Autenticação
- Tela de landing animada com efeitos cyberpunk
- Login e cadastro de usuários com validação em tempo real
- Gerenciamento automático de tokens JWT
- Sistema de refresh token
- Guard de rotas para proteção de páginas

### Gerenciamento de Personagens
- **Criação de personagens em modal de 2 etapas**:
  - **Etapa 1**: Seleção de avatar (10 opções pré-definidas)
  - **Etapa 2**: Distribuição de atributos com sistema de pontos (52 pontos totais)
- Sistema de edição de personagens existentes
- Visualização detalhada com cards responsivos
- Sistema de seleção de personagem ativo
- Inventário funcional com visualização de itens e raridades
- Modal de detalhes de itens com uso e aplicação de bônus

### Sistema de Campanhas
- Galeria visual de 3 capítulos disponíveis
- Sistema de inicialização de campanha com seleção de personagem
- Visualização de progresso e capítulos completados
- Sistema de cancelamento de campanha ativa
- Desbloqueio progressivo de capítulos

### Interface de Jogo (Game Page)
- **Painel de História**: Log de interações com rolagem automática
- **Painel de Ações**:
  - Ações contextuais geradas dinamicamente pela IA
  - Quick actions predefinidas
  - Input de comando livre para interação natural
- **Painel de Personagem** (slide-in lateral):
  - Avatar e informações básicas
  - Barras de atributos animadas
  - Grid de inventário interativo
  - Equipamentos com visual por raridade
- **Sistema de Progressão Narrativa**:
  - Indicador visual de 10 interações
  - 3 fases identificadas por cores (Introdução, Desenvolvimento, Resolução)
  - Hint de recompensa final
  - Botão de reset de capítulo
- **Integração com LLM**:
  - Modo de comunicação com indicador visual
  - Loading states durante processamento
  - Respostas renderizadas em tempo real

### Perfil de Usuário
- Visualização e edição de dados pessoais
- Avatar com iniciais geradas automaticamente
- Cards de estatísticas (membro desde, último acesso, status)
- Alteração de senha com validação
- Sistema de confirmação antes de descartar alterações

### Sistema de Componentes Compartilhados
- **Notification System**: Toast notifications com 4 tipos (success, error, warning, info)
- **Confirmation Modal**: Modal de confirmação reutilizável
- **Loader**: Componente de loading com animações cyber (3 tamanhos)
- **Navbar**: Menu lateral expansível com transições suaves
- **Villain Carousel**: Carrossel de vilões com 6 personagens
- **Location Gallery**: Galeria de localizações do jogo
- **Item Detail Modal**: Visualização detalhada de itens com animações

---

## 🏁 Começando

### Pré-requisitos

- Node.js 18+ e npm
- Angular CLI 20+
- Docker e Docker Compose (para execução com container)

---

## 🐳 Executando com Docker

### Estrutura de Diretórios

```
/sua-pasta-de-projetos
├── /RPG-Chromance-Back/   <-- (repositório backend)
├── /RPG-Chromance-Front/  <-- (repositório frontend)
└── docker-compose.yml     <-- (crie este arquivo na raiz)
```

### Docker Compose Completo

Crie um arquivo `docker-compose.yml` na raiz que contenha ambos os repositórios:

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./RPG-Chromance-Back
      dockerfile: ./.devcontainer/Dockerfile
    container_name: rpg_chromance_backend
    volumes:
      - ./RPG-Chromance-Back:/workspaces/RPG-Chromance-Back:cached
      - ./RPG-Chromance-Back/chroma_db:/workspaces/RPG-Chromance-Back/chroma_db
    command: sleep infinity
    ports:
      - "8000:8000"
    depends_on:
      - mongo
    env_file:
      - ./RPG-Chromance-Back/.env
    environment:
      MONGO_URI: "mongodb://mongo:27017"
      MONGO_DB: "rpgdb"

  frontend:
    build:
      context: ./RPG-Chromance-Front
      dockerfile: ./.devcontainer/Dockerfile
    container_name: rpg_chromance_frontend
    volumes:
      - ./RPG-Chromance-Front:/workspace:cached
      - /workspace/node_modules
    command: sleep infinity
    ports:
      - "4200:4200"

  mongo:
    image: mongo:7
    container_name: rpg_chromance_mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: rpgdb
    volumes:
      - mongodb_data:/data/db

  mongo-express:
    image: mongo-express:1
    container_name: rpg_chromance_mongo_express
    restart: unless-stopped
    depends_on:
      - mongo
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_SERVER: mongo
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin

volumes:
  mongodb_data:
```

### Passos para Execução

1. **Clone o repositório**:
```bash
git clone https://github.com/seu-usuario/RPG-Chromance-Front
cd RPG-Chromance-Front
```

2. **Instale as dependências** (se não usar Docker):
```bash
npm install
```

3. **Configure o ambiente** (veja seção de configuração)

4. **Inicie o servidor de desenvolvimento**:

**Com Docker:**
```bash
docker-compose up -d frontend
# Acesse o container
docker exec -it rpg_chromance_frontend bash
# Dentro do container
ng serve --host 0.0.0.0 --port 4200
```

**Sem Docker:**
```bash
npm start
# ou
ng serve
```

5. **Acesse** http://localhost:4200

---

## ⚙️ Configuração de Ambiente

### API Base URL

O projeto utiliza um interceptor para configurar a URL base da API.

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8000'
};
```

### CORS

Certifique-se de que o backend está configurado para aceitar requisições do frontend:

```bash
# No .env do backend
CORS_ORIGINS="http://localhost:4200,http://127.0.0.1:4200"
```

### Boxicons

Os ícones são carregados automaticamente via npm. Certifique-se de que o `angular.json` inclui:

```json
"styles": [
  "src/styles.scss",
  "node_modules/boxicons/css/boxicons.min.css"
]
```

---

## 🎨 Design System

### Paleta de Cores Cyberpunk

```scss
// Cores principais
--bg: #0a0a0a                           // Fundo escuro
--card-bg: rgba(10, 10, 20, 0.9)        // Cards translúcidos
--card-border: rgba(0, 255, 255, 0.3)   // Borda cyan

// Texto
--text: #e2e8f0                         // Texto padrão
--text-bright: #f1f5f9                  // Texto destacado
--muted: #64748b                        // Texto secundário

// Acentos
--accent: #00ffff                       // Cyan principal
--accent-blue: #0080ff                  // Azul secundário

// Estados
--success: #2ed573                      // Verde
--danger: #ff4757                       // Vermelho
--warning: #ffa502                      // Laranja

// Efeitos
--shadow-glow: 0 0 30px rgba(0, 255, 255, 0.2)
--brand: linear-gradient(45deg, #0080ff, #00a0ff)
```

### Tipografia

```scss
// Fontes
'Orbitron', monospace    // Títulos e UI especial
'Rajdhani', sans-serif   // Texto geral
```

### Breakpoints Responsivos

```scss
@media (max-width: 1920px)  // Extra large
@media (max-width: 1440px)  // Large desktop
@media (max-width: 1280px)  // Desktop
@media (max-width: 1024px)  // Tablet landscape
@media (max-width: 768px)   // Mobile landscape
@media (max-width: 480px)   // Small mobile
@media (max-width: 375px)   // Extra small
```

---

## 🗂️ Estrutura de Pastas

```
/
├── src/
│   ├── app/
│   │   ├── core/                      # Funcionalidades centrais
│   │   │   ├── api/
│   │   │   │   └── api.service.ts     # Wrapper HTTP
│   │   │   ├── services/              # Serviços globais
│   │   │   │   ├── auth.service.ts    # Autenticação
│   │   │   │   ├── character.service.ts
│   │   │   │   ├── campaign.service.ts
│   │   │   │   ├── llm.service.ts     # Integração LLM
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── confirmation.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts      # Proteção de rotas
│   │   │   └── interceptors/
│   │   │       ├── auth.interceptor.ts
│   │   │       └── base-url.interceptor.ts
│   │   ├── features/                  # Páginas da aplicação
│   │   │   ├── landing/
│   │   │   │   └── pages/landing.page.ts
│   │   │   ├── auth/
│   │   │   │   └── pages/
│   │   │   │       ├── login.page.ts
│   │   │   │       └── signup.page.ts
│   │   │   ├── home/
│   │   │   │   └── pages/home.page.ts
│   │   │   ├── characters/
│   │   │   │   └── pages/characters.page.ts
│   │   │   ├── campaign/
│   │   │   │   └── pages/campaign.page.ts
│   │   │   ├── game/
│   │   │   │   └── pages/game.page.ts
│   │   │   └── profile/
│   │   │       └── pages/profile.page.ts
│   │   ├── shared/                    # Componentes compartilhados
│   │   │   └── components/
│   │   │       ├── navbar/
│   │   │       ├── loader/
│   │   │       ├── notification/
│   │   │       ├── confirmation-modal/
│   │   │       ├── character-card/
│   │   │       ├── add-character-modal/
│   │   │       ├── edit-character-modal/
│   │   │       ├── item-detail-modal/
│   │   │       ├── select-character-modal/
│   │   │       ├── villain-carousel/
│   │   │       └── location-gallery/
│   │   ├── app.component.ts           # Componente raiz
│   │   ├── app.config.ts              # Configuração global
│   │   └── app.routes.ts              # Definição de rotas
│   ├── assets/                        # Recursos estáticos
│   │   └── images/
│   │       ├── card-image1~10.jpg     # Avatares de personagens
│   │       ├── villain1~6.jpg         # Imagens de vilões
│   │       ├── card-map1~4.jpg        # Localizações
│   │       └── logo-chromance.png     # Logo do jogo
│   ├── styles.scss                    # Estilos globais
│   ├── main.ts                        # Bootstrap da aplicação
│   └── index.html                     # HTML principal
├── .devcontainer/                     # Dev Container config
│   ├── devcontainer.json
│   └── Dockerfile
├── angular.json                       # Configuração Angular
├── tsconfig.json                      # Configuração TypeScript
├── tsconfig.app.json
├── package.json                       # Dependências npm
├── .editorconfig                      # Configuração do editor
├── .gitignore
└── README.md                          # Este arquivo
```

---

## 🎯 Arquitetura e Padrões

### Standalone Components

O projeto utiliza standalone components (Angular 17+), eliminando a necessidade de módulos NgModule:

```typescript
@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent { }
```

### Guards para Proteção de Rotas

```typescript
// auth.guard.ts
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/auth/login']);
  return false;
};
```

### Interceptors

```typescript
// auth.interceptor.ts - Adiciona JWT em todas as requisições
// base-url.interceptor.ts - Configura URL base da API
```

---

## 🎮 Sistema de Progressão Narrativa

### Interface de Jogo

O componente `GamePageComponent` gerencia toda a interação com a narrativa:

```typescript
// Sistema de 10 interações por capítulo
currentInteractionCount: 0-10
maxInteractions: 10

// 3 Fases automáticas
currentPhase: 'introduction' | 'development' | 'resolution'

// Indicador visual
progressPercentage: (currentInteractionCount / maxInteractions) * 100
```

### Integração com LLM Service

```typescript
// Enviar mensagem para IA
llmService.sendMessageWithProgression(message, characterId, true, interactionCount)

// Executar ação contextual
llmService.executeContextualActionWithProgression(action, characterId, interactionCount)

// Carregar histórico do ChromaDB
llmService.loadCampaignHistory(campaignId)
```

### Sistema de Ações Contextuais

```typescript
interface ContextualAction {
  name: string;          // "Investigar Altar"
  description: string;   // "Examine o altar de perto..."
  category: string;      // "exploration"
  priority: number;      // 1-3 (urgência)
}

// Ações são geradas dinamicamente pela IA
// e exibidas como botões clicáveis
```

---

## 🧠 Sistema de Memória Contextual

### Integração com ChromaDB

O frontend consome endpoints que utilizam o sistema RAG do backend:

```typescript
// Carregar histórico de campanha
GET /api/llm/load-campaign-history/{campaign_id}
// Retorna mensagens anteriores do ChromaDB

// Limpar histórico
DELETE /api/llm/clear-campaign-history/{campaign_id}

// Reset de progressão
POST /api/llm/reset-chapter-progression
```

### Persistência de Conversas

- Todas as interações são salvas no ChromaDB
- Ao retornar a uma campanha, o histórico é carregado automaticamente
- Sistema de scroll automático para última mensagem

---

## 🎨 Componentes de UI Destacados

### 1. Loader Component (Cyber Loader)
- 3 tamanhos: small, medium, large
- Modo overlay: Fullscreen com backdrop blur
- Animações: Hexágonos pulsantes + anéis rotativos + partículas flutuantes

### 2. Notification System
- 4 tipos: success, error, warning, info
- Auto-dismiss: 5 segundos (configurável)
- Posicionamento responsivo: Top-right (desktop) / Top-center (mobile)
- Animações: Slide-in com cubic-bezier bounce

### 3. Confirmation Modal
- Reutilizável: Via service injectable
- Observable pattern: Retorna resposta via subscription
- 3 variantes: danger, warning, info
- Backdrop blur + animações de entrada

### 4. Character Card
- Layout desktop: Grid com avatar (300px) + informações
- Layout mobile: Coluna + modal de detalhes fullscreen
- **Features**:
  - Progress bars animadas (vida, energia, força, inteligência)
  - Grid de inventário com ícones e raridades
  - Botões de ação (editar, deletar, selecionar)
  - Estado visual para personagem selecionado

---

## 🔒 Segurança

### JWT Token Management

```typescript
// Armazenamento seguro
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);

// Interceptor automático
// Adiciona Bearer token em todas as requisições autenticadas
```

### CORS

Configurado no backend para aceitar requisições do frontend:

```bash
CORS_ORIGINS="http://localhost:4200"
```

### Guards de Rota

```typescript
// Todas as rotas protegidas usam AuthGuard
{
  path: 'characters',
  component: CharactersPage,
  canActivate: [AuthGuard]
}
```

---

## 🧪 Testando a Aplicação

### Fluxo Completo

1. **Cadastro/Login**
   - Acesse http://localhost:4200
   - Clique em "Acessar Chromance"
   - Crie uma conta ou faça login

2. **Criar Personagem**
   - Vá para "Meus Personagens"
   - Clique em "Adicionar Novo Personagem"
   - Escolha avatar e distribua atributos
   - Salve

3. **Iniciar Campanha**
   - Vá para "Campanhas"
   - Selecione um capítulo (Cubo das Sombras recomendado)
   - Escolha seu personagem
   - Clique em "Iniciar Campanha"

4. **Jogar**
   - Leia a narrativa inicial
   - Use ações contextuais ou digite comandos livres
   - Complete as 10 interações
   - Receba sua recompensa e extraia o lore

---

## 📱 Responsividade

O projeto é 100% responsivo com breakpoints otimizados:

- **Desktop (1920px+)**: Experiência completa com sidebars
- **Laptop (1280px-1920px)**: Layout otimizado
- **Tablet (768px-1024px)**: Menu colapsável, grid ajustado
- **Mobile (< 768px)**: Layout vertical, modals fullscreen, menu hamburguer

---

## 📝 Boas Práticas Implementadas

- ✅ Standalone Components (Angular 17+)
- ✅ Strict TypeScript mode
- ✅ RxJS para state management reativo
- ✅ Path aliases para imports limpos
- ✅ Unsubscribe automático (OnDestroy)
- ✅ Loading states em todas as operações assíncronas
- ✅ Error handling completo
- ✅ Validações client-side e server-side
- ✅ Confirmações antes de ações destrutivas
- ✅ Feedback visual constante (notifications)
- ✅ Mobile-first approach
- ✅ Acessibilidade (ARIA labels, keyboard navigation)

---

## 📄 Licença

Este projeto faz parte do Programa Trainee da Wise Systems.

---

## 🙏 Agradecimentos

- Wise Systems pelo programa de trainee

---

## 🔗 Links Úteis

- Backend Repository: [RPG-Chromance-Back](https://github.com/seu-usuario/RPG-Chromance-Back)
