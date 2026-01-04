# 📋 Documentação de Desenvolvimento - Bisca Assistant

> **Versão Atual:** 0.1.0
> **Última Atualização:** 04/01/2025
> **Status:** MVP Concluído ✅

---

## 📌 Visão Geral do Projeto

O **Bisca Assistant** é um sistema inteligente de suporte à decisão para o jogo de cartas português "Bisca". O aplicativo funciona como um assistente em tempo real que:

- 🃏 Rastreia todas as cartas jogadas
- 🧠 Analisa padrões de jogo dos oponentes
- 🎯 Fornece recomendações baseadas em IA
- 📊 Calcula probabilidades e riscos
- 💾 Mantém o estado do jogo persistente

### Tecnologias Principais

- **Framework:** Next.js 15.0.3+ (App Router)
- **Linguagem:** TypeScript 5.7.2 (strict mode)
- **UI:** React 19 + Tailwind CSS 3.4.17
- **Estado:** Zustand 5.0.2 (com persistência)
- **PWA:** Service Worker + Web Manifest

---

## ✅ Funcionalidades Implementadas

### 🎮 Core do Jogo

#### 1. Sistema de Cartas Completo
**Arquivos:** `lib/bisca/types.ts`, `lib/bisca/deck.ts`

- ✅ Baralho português de 40 cartas (4 naipes × 10 valores)
- ✅ Sistema de pontuação: Ás(11), 7(10), Rei(4), Valete(3), Dama(2)
- ✅ Total de 120 pontos por jogo
- ✅ Criação e embaralhamento de deck (algoritmo Fisher-Yates)
- ✅ Comparação de cartas com lógica de trunfo
- ✅ Cálculo automático de pontos

**Código:**
```typescript
// Exemplo de criação de deck
const deck = shuffle(createDeck()); // 40 cartas embaralhadas
const trump = deck[deck.length - 1]; // Última carta = trunfo
```

#### 2. Regras do Jogo
**Arquivo:** `lib/bisca/rules.ts`

- ✅ Determinação de vencedor de rodada
- ✅ Ordem de jogada (vencedor da rodada anterior começa)
- ✅ Validação de jogadas
- ✅ Detecção de fim de jogo (40 cartas jogadas)
- ✅ Cálculo de vencedor final
- ✅ Suporte para 2 jogadores (individual)
- ✅ Suporte para 4 jogadores (duplas: 1+3 vs 2+4)

**Lógica de Comparação:**
```
1. Trunfo sempre vence não-trunfo
2. Entre trunfos: comparar força
3. Mesma sequência da primeira carta: comparar força
4. Caso contrário: primeira carta jogada vence
```

#### 3. Sistema de Pontuação
**Arquivo:** `lib/bisca/scoring.ts`

- ✅ Atualização de pontuação por jogador
- ✅ Cálculo de percentual de pontos (0-120 → 0-100%)
- ✅ Estatísticas de jogador:
  - Pontos totais
  - Rodadas vencidas
  - Taxa de vitória
  - Média de pontos por rodada
- ✅ Placar para 2 jogadores (direto)
- ✅ Placar para 4 jogadores (equipes)
- ✅ Pontos restantes no jogo
- ✅ Probabilidade de vitória

#### 4. Gerenciamento de Estado
**Arquivo:** `lib/store/game-store.ts`

- ✅ Zustand store com persistência em localStorage
- ✅ Estados do jogo: SETUP → IN_PROGRESS → FINISHED
- ✅ Ações disponíveis:
  - `startGame()`: Iniciar jogo com configuração
  - `registerPlayedCard()`: Registrar jogada de oponente
  - `updateUserHand()`: Atualizar mão do usuário
  - `requestRecommendation()`: Solicitar recomendação da IA
  - `finalizeRound()`: Finalizar rodada e determinar vencedor
  - `resetGame()`: Reiniciar jogo
- ✅ Validações de turno
- ✅ Atualização automática de análises de estilo
- ✅ Restauração de estado ao recarregar página

**Fluxo de Estado:**
```
[SETUP] → startGame() → [IN_PROGRESS]
                              ↓
                    registerPlayedCard() (N jogadores)
                              ↓
                       finalizeRound()
                              ↓
                    [próxima rodada ou FINISHED]
```

---

### 🧠 Sistema de Inteligência Artificial

#### 1. Análise de Estilo de Jogo
**Arquivo:** `lib/bisca/style-analyzer.ts`

- ✅ Detecção de 4 estilos de jogo:
  - **AGGRESSIVE:** Joga cartas de alto valor e trunfos fortes
  - **DEFENSIVE:** Preserva cartas boas, joga cartas fracas
  - **BALANCED:** Mistura de jogadas agressivas e defensivas
  - **UNDETERMINED:** Dados insuficientes (< 3 jogadas)

- ✅ Algoritmo de análise de jogada:
  ```typescript
  analyzePlayType(card, round, trump, playerHand) {
    // Analisa:
    // 1. Valor da carta (pontos)
    // 2. Força relativa (trunfo vs não-trunfo)
    // 3. Contexto da rodada (pontos na mesa)
    // 4. Alternativas disponíveis
    // → Retorna: 'aggressive' | 'defensive' | 'neutral'
  }
  ```

- ✅ Cálculo de confiança:
  ```
  Se jogadas_agressivas ≥ 60%: AGGRESSIVE (confiança = ratio × 100)
  Se jogadas_defensivas ≥ 60%: DEFENSIVE (confiança = ratio × 100)
  Senão: BALANCED (confiança = (1 - |aggRatio - defRatio|) × 100)
  ```

- ✅ Atualização contínua a cada jogada
- ✅ Mínimo de 3 jogadas para determinação

#### 2. Motor de Recomendações
**Arquivo:** `lib/bisca/recommendation-engine.ts`

- ✅ Avaliação de todas as cartas na mão
- ✅ Sistema de priorização (0-100):
  ```
  prioridade = (força_carta × 5) + (pontos_carta × 2)
             + bônus_trunfo(20)
             - fator_risco(cartas_que_vencem / total × 0.5)
             + ajuste_estilo(estilo_oponente)
  ```

- ✅ Cálculo de probabilidade de trunfo do oponente:
  ```
  trunfos_restantes = cartas não jogadas do naipe de trunfo
  cartas_não_vistas = total de cartas não jogadas

  probabilidade = 1 - (1 - trunfos_restantes/cartas_não_vistas)^num_oponentes
  ```

- ✅ Avaliação de risco (5 níveis):
  - **VERY_LOW:** Carta fraca sem valor
  - **LOW:** Carta de baixa força, alguns pontos
  - **MEDIUM:** Carta forte, pontos moderados
  - **HIGH:** Carta de alto valor com risco de trunfo
  - **VERY_HIGH:** Ás/7 com probabilidade >60% de trunfo oponente

- ✅ Geração de explicações contextuais:
  - Análise da primeira jogada vs resposta
  - Pontos em jogo na rodada
  - Situação geral (ganhando/perdendo)
  - Probabilidades de trunfo
  - Recomendação de estratégia

- ✅ Ajuste baseado no estilo do oponente:
  - Contra agressivo: preferir jogadas defensivas
  - Contra defensivo: preferir jogadas agressivas
  - Contra balanceado: ajuste mínimo

**Exemplo de Recomendação:**
```typescript
{
  card: { rank: 'A', suit: 'hearts', points: 11 },
  priority: 85,
  reason: "Trunfo forte para garantir pontos. 15 pontos em jogo, vale tentar ganhar.",
  riskLevel: "HIGH",
  winProbability: 67,
  details: {
    handStrength: 92,
    remainingCards: 28,
    trumpProbability: 45,
    pointsAtStake: 15
  }
}
```

---

### 🎨 Interface do Usuário

#### 1. Página Inicial (`app/page.tsx`)
- ✅ Landing page com overview do produto
- ✅ Lista de funcionalidades
- ✅ Botão "Iniciar Nova Partida"
- ✅ Design responsivo com gradiente verde

#### 2. Configuração de Jogo (`app/setup/page.tsx`)
- ✅ Seleção de modo (2 ou 4 jogadores)
- ✅ Campos de nome para jogadores
- ✅ Campos dinâmicos baseados no modo selecionado
- ✅ Validação e inicialização do estado
- ✅ Navegação automática para tela de jogo

#### 3. Tela Principal de Jogo (`app/game/page.tsx`)

**Layout em Grid:**
- ✅ **Cabeçalho:**
  - Número da rodada atual
  - Próximo jogador
  - Botão de reset

- ✅ **Painel de Trunfo:**
  - Exibição visual da carta de trunfo
  - Tamanho pequeno para economia de espaço

- ✅ **Placar:**
  - Pontos de todos os jogadores
  - Destaque para o usuário (verde)
  - Atualização em tempo real

- ✅ **Rodada Atual:**
  - Cards jogadas na rodada
  - Nome do jogador sob cada carta
  - Ordem de jogada visível
  - Botão "Finalizar Rodada" quando completa

- ✅ **Minha Mão:**
  - Visualização das cartas do usuário
  - Cartas clicáveis para remover
  - Botão "+ Adicionar Card"
  - Botão "⭐ Solicitar Recomendação"
  - Card recomendada com estrela destacada

- ✅ **Painel de Recomendação:**
  - Carta recomendada visualmente
  - Texto de explicação
  - Score de prioridade (0-100)
  - Nível de risco
  - Probabilidade de vitória

- ✅ **Análise de Estilo:**
  - Estilo de cada oponente
  - Percentual de confiança
  - Descrição do padrão detectado

- ✅ **Mensagens Toast:**
  - Feedback de ações do usuário
  - Auto-dismiss após 3-5 segundos

#### 4. Componentes Reutilizáveis

**Card Component** (`components/game/card.tsx`)
- ✅ Representação visual de carta
- ✅ Mostra valor, naipe, pontos
- ✅ Estados: normal, selecionada, recomendada
- ✅ Dois tamanhos: normal e pequeno
- ✅ Interativo (clicável, hover)
- ✅ Símbolos de naipe com cores corretas (vermelho ♥♦, preto ♠♣)

**CardSelector Component** (`components/game/card-selector.tsx`)
- ✅ Modal de seleção de carta
- ✅ Seleção em duas etapas: valor → naipe
- ✅ Layouts em grid
- ✅ Botão de cancelar
- ✅ Design limpo e intuitivo

---

### 📱 Progressive Web App (PWA)

#### 1. Service Worker (`public/sw.js`)
- ✅ Estratégia: Network-first com fallback para cache
- ✅ Cache dinâmico de todas as requisições
- ✅ Pré-cache de rotas essenciais: `/`, `/setup`, `/game`
- ✅ Limpeza de caches antigos na ativação
- ✅ Nome do cache: `'bisca-assistant-v1'`

**Fluxo de Caching:**
```
Requisição
├─ Tenta network primeiro
├─ Sucesso: armazena no cache + retorna
└─ Falha: retorna do cache (ou fallback "/")
```

#### 2. Web Manifest (`app/manifest.ts`)
- ✅ Nome completo e abreviado
- ✅ Modo display: `standalone` (aparência de app nativo)
- ✅ Cor de tema: #16a34a (verde)
- ✅ Orientação: portrait-primary
- ✅ Ícones para Android/iOS:
  - 192×192 (ícone mínimo Android)
  - 512×512 (alta resolução)
  - 180×180 (iOS home screen)
- ✅ Categorias: games, entertainment, utilities
- ✅ Idioma: pt-BR

#### 3. Capacidades Offline
- ✅ Instalável na tela inicial (mobile)
- ✅ Funciona offline com dados em cache
- ✅ localStorage persiste estado do jogo
- ✅ Service worker gerencia falhas de rede
- ✅ Experiência consistente sem conexão

---

## 🗺️ Roadmap de Desenvolvimento

### Fase 1: MVP ✅ (Concluída - Dez 2024 / Jan 2025)

**Objetivos:**
- [x] Implementar lógica completa do jogo de Bisca
- [x] Sistema de IA para recomendações
- [x] Interface funcional e responsiva
- [x] PWA com suporte offline

**Entregas:**
1. ✅ Core do jogo (cartas, regras, pontuação)
2. ✅ Análise de estilo de jogadores
3. ✅ Motor de recomendações com IA
4. ✅ UI completa (home, setup, game)
5. ✅ PWA funcional
6. ✅ Persistência de dados
7. ✅ Tradução completa para inglês (código)

---

### Fase 2: Melhorias de UX 📋 (Planejada - Q1 2025)

**Objetivos:**
- [ ] Melhorar feedback visual
- [ ] Adicionar animações
- [ ] Tutorial interativo
- [ ] Histórico de jogos

**Features Planejadas:**

#### 2.1. Animações e Transições
- [ ] Animação de cartas sendo jogadas
- [ ] Transição suave entre rodadas
- [ ] Feedback visual ao ganhar/perder rodada
- [ ] Loading states aprimorados

#### 2.2. Tutorial Interativo
- [ ] Passo-a-passo para novos usuários
- [ ] Explicação das regras da Bisca
- [ ] Demonstração do sistema de recomendações
- [ ] Dicas contextuais

#### 2.3. Histórico e Estatísticas
- [ ] Salvar histórico de jogos
- [ ] Estatísticas gerais do usuário
- [ ] Gráficos de performance
- [ ] Comparação de evolução ao longo do tempo

#### 2.4. Melhorias Visuais
- [ ] Temas de cartas (clássico, moderno, minimalista)
- [ ] Modo escuro
- [ ] Animações de vitória/derrota
- [ ] Confete ou celebração ao vencer

---

### Fase 3: Funcionalidades Sociais 🔮 (Futura - Q2/Q3 2025)

**Objetivos:**
- [ ] Modo multiplayer online
- [ ] Sistema de autenticação
- [ ] Rankings e leaderboards
- [ ] Compartilhamento de partidas

**Features Futuras:**

#### 3.1. Autenticação de Usuários
- [ ] Login com email/senha
- [ ] OAuth (Google, GitHub)
- [ ] Perfis de usuário
- [ ] Avatar customizável

#### 3.2. Multiplayer Online
- [ ] WebSockets para jogo em tempo real
- [ ] Matchmaking automático
- [ ] Salas privadas com código
- [ ] Chat entre jogadores

#### 3.3. Rankings e Competições
- [ ] Sistema de ELO/ranking
- [ ] Leaderboards globais e por região
- [ ] Torneios semanais/mensais
- [ ] Conquistas e badges

#### 3.4. Recursos Sociais
- [ ] Compartilhar resultados de jogos
- [ ] Adicionar amigos
- [ ] Histórico de partidas contra amigos
- [ ] Replay de jogos salvos

---

### Fase 4: IA Avançada e Analytics 🔮 (Futura - Q4 2025)

**Objetivos:**
- [ ] Oponente IA jogável
- [ ] Análise post-game detalhada
- [ ] Machine Learning para recomendações
- [ ] Simulações de Monte Carlo

**Features Futuras:**

#### 4.1. Oponente IA
- [ ] Dificuldades: Fácil, Médio, Difícil
- [ ] Personalidades de jogo diferentes
- [ ] Aprendizado adaptativo
- [ ] Modo treino com dicas

#### 4.2. Análise Avançada
- [ ] Revisão de jogadas pós-jogo
- [ ] Identificação de erros críticos
- [ ] Sugestões de melhoria
- [ ] Comparação com jogadas ótimas

#### 4.3. Machine Learning
- [ ] Treinar modelo com jogos reais
- [ ] Recomendações baseadas em ML
- [ ] Predição de jogadas do oponente
- [ ] Otimização contínua

---

## 📊 Etapas de Desenvolvimento Realizadas

### Etapa 1: Setup Inicial do Projeto
**Data:** Dez 2024
**Status:** ✅ Concluída

**Objetivos:**
- [x] Configurar Next.js 15 com TypeScript
- [x] Setup de Tailwind CSS
- [x] Configurar Zustand
- [x] Estrutura de pastas

**Implementações:**
- Projeto Next.js com App Router
- TypeScript em modo strict
- Configuração de ESLint e Prettier
- Estrutura `/lib`, `/components`, `/app`

**Commits Relacionados:**
- Commit inicial do projeto

---

### Etapa 2: Sistema de Cartas e Regras
**Data:** Dez 2024
**Status:** ✅ Concluída

**Objetivos:**
- [x] Implementar tipos TypeScript do jogo
- [x] Criar sistema de deck
- [x] Implementar regras da Bisca

**Implementações:**
- `lib/bisca/types.ts`: Todos os tipos do jogo
- `lib/bisca/deck.ts`: Criação, embaralhamento, comparação de cartas
- `lib/bisca/rules.ts`: Lógica de vencedor, ordem de jogo, fim de jogo

**Desafios & Soluções:**
- **Desafio:** Lógica complexa de comparação de cartas
- **Solução:** Implementar função `compareCards()` com priorização clara: trunfo > sequência > primeira carta

---

### Etapa 3: Sistema de Pontuação
**Data:** Dez 2024
**Status:** ✅ Concluída

**Objetivos:**
- [x] Calcular pontos de cartas
- [x] Estatísticas de jogadores
- [x] Placar para 2 e 4 jogadores

**Implementações:**
- `lib/bisca/scoring.ts`: Todas as funções de pontuação e estatísticas
- Cálculo de probabilidade de vitória
- Sistema de times para 4 jogadores

---

### Etapa 4: Motor de IA - Análise de Estilo
**Data:** Dez 2024
**Status:** ✅ Concluída

**Objetivos:**
- [x] Detectar padrões de jogo
- [x] Classificar estilos (agressivo, defensivo, balanceado)
- [x] Calcular confiança da análise

**Implementações:**
- `lib/bisca/style-analyzer.ts`: Sistema completo de análise
- Algoritmo de classificação de jogadas
- Atualização contínua de análise

**Desafios & Soluções:**
- **Desafio:** Como determinar se uma jogada é agressiva ou defensiva?
- **Solução:** Analisar contexto (pontos na mesa, alternativas na mão, força relativa da carta)

---

### Etapa 5: Motor de IA - Recomendações
**Data:** Dez 2024
**Status:** ✅ Concluída

**Objetivos:**
- [x] Avaliar cartas da mão do jogador
- [x] Calcular prioridades
- [x] Gerar explicações contextuais
- [x] Avaliar riscos

**Implementações:**
- `lib/bisca/recommendation-engine.ts`: Engine completa de recomendações
- Cálculo de probabilidade de trunfo
- Sistema de priorização multifatorial
- Geração automática de explicações

**Desafios & Soluções:**
- **Desafio:** Balancear múltiplos fatores (pontos, força, risco, contexto)
- **Solução:** Sistema de pesos ajustáveis + normalização 0-100

---

### Etapa 6: Gerenciamento de Estado
**Data:** Dez 2024
**Status:** ✅ Concluída

**Objetivos:**
- [x] Criar Zustand store
- [x] Implementar persistência
- [x] Criar todas as actions

**Implementações:**
- `lib/store/game-store.ts`: Store completa com 6 actions
- Middleware de persistência em localStorage
- Validações de turno e estado

---

### Etapa 7: Interface - Componentes Base
**Data:** Dez 2024
**Status:** ✅ Concluída

**Objetivos:**
- [x] Componente de carta
- [x] Seletor de carta
- [x] Service worker registration

**Implementações:**
- `components/game/card.tsx`: Representação visual de carta
- `components/game/card-selector.tsx`: Modal de seleção em 2 etapas
- `components/service-worker-registration.tsx`: Registro do SW

**Desafios & Soluções:**
- **Desafio:** Conflito entre tipo `Card` e componente `Card`
- **Solução:** Usar alias de importação `Card as CardType`

---

### Etapa 8: Interface - Páginas
**Data:** Dez 2024
**Status:** ✅ Concluída

**Objetivos:**
- [x] Página inicial
- [x] Página de setup
- [x] Página de jogo

**Implementações:**
- `app/page.tsx`: Landing page
- `app/setup/page.tsx`: Configuração do jogo
- `app/game/page.tsx`: Interface completa do jogo

---

### Etapa 9: PWA
**Data:** Dez 2024 / Jan 2025
**Status:** ✅ Concluída

**Objetivos:**
- [x] Service Worker
- [x] Web Manifest
- [x] Ícones PWA
- [x] Suporte offline

**Implementações:**
- `public/sw.js`: Service worker com cache strategy
- `app/manifest.ts`: Web manifest dinâmico
- Ícones 192×192, 512×512, apple-touch-icon

---

### Etapa 10: Documentação e Tradução
**Data:** Jan 2025
**Status:** ✅ Concluída

**Objetivos:**
- [x] Adicionar JSDoc em todos os arquivos
- [x] Traduzir código para inglês
- [x] Manter UI em português

**Implementações:**
- Comentários JSDoc em todas as funções
- Tradução completa de:
  - Nomes de funções
  - Variáveis e parâmetros
  - Tipos e interfaces
  - Propriedades
  - Enums e valores
- Build verificado sem erros TypeScript

**Desafios & Soluções:**
- **Desafio:** Traduções parciais causando erros de compilação
- **Solução:** Aplicação sistemática de sed commands + verificação incremental

**Commits Relacionados:**
- `docs: add comprehensive JSDoc comments to all functions`
- `feat: translate all code structures from Portuguese to English`

---

## 🎯 Próximos Passos Imediatos

### Prioridade Alta 🔴

1. **Testes Automatizados**
   - [ ] Testes unitários para funções de jogo (`deck.ts`, `rules.ts`)
   - [ ] Testes para motor de IA
   - [ ] Testes de componentes React
   - **Estimativa:** 2-3 dias

2. **Melhorias de UX**
   - [ ] Adicionar loading states
   - [ ] Melhorar feedback de erros
   - [ ] Animação de transição de rodadas
   - **Estimativa:** 1-2 dias

3. **Tutorial Inicial**
   - [ ] Modal de boas-vindas
   - [ ] Explicação das regras
   - [ ] Demonstração de funcionalidades
   - **Estimativa:** 2 dias

### Prioridade Média 🟡

4. **Histórico de Jogos**
   - [ ] Salvar jogos finalizados
   - [ ] Página de histórico
   - [ ] Estatísticas agregadas
   - **Estimativa:** 3-4 dias

5. **Themes e Personalização**
   - [ ] Modo escuro
   - [ ] Temas de cartas
   - [ ] Preferências do usuário
   - **Estimativa:** 2-3 dias

### Prioridade Baixa 🟢

6. **Analytics**
   - [ ] Integrar Google Analytics ou similar
   - [ ] Rastrear eventos importantes
   - [ ] Dashboard de métricas
   - **Estimativa:** 1 dia

7. **SEO e Marketing**
   - [ ] Otimizar metadata
   - [ ] Open Graph tags
   - [ ] Sitemap
   - **Estimativa:** 1 dia

---

## 🏗️ Arquitetura Técnica (Resumo)

### Padrões Utilizados

1. **Separation of Concerns**
   - Lógica de jogo (`lib/bisca`) separada de UI (`components`, `app`)
   - Pura funções sem side effects na lógica

2. **Type Safety**
   - TypeScript strict mode
   - Tipos abrangentes para todos os conceitos
   - Validação em tempo de compilação

3. **State Management**
   - Zustand como single source of truth
   - Persistência automática
   - Actions isoladas e testáveis

4. **Component Composition**
   - Componentes reutilizáveis (Card, CardSelector)
   - Props tipadas
   - Client vs Server Components separados

### Estrutura de Diretórios

```
bisca/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home
│   ├── manifest.ts          # PWA manifest
│   ├── setup/               # Game setup
│   └── game/                # Main game UI
├── components/              # React components
│   ├── game/                # Game-specific
│   └── service-worker-registration.tsx
├── lib/                     # Business logic
│   ├── bisca/               # Game logic
│   │   ├── types.ts         # Type definitions
│   │   ├── deck.ts          # Deck management
│   │   ├── rules.ts         # Game rules
│   │   ├── scoring.ts       # Scoring system
│   │   ├── style-analyzer.ts    # AI style detection
│   │   └── recommendation-engine.ts # AI recommendations
│   └── store/               # State management
│       └── game-store.ts    # Zustand store
├── public/                  # Static assets
│   ├── sw.js                # Service Worker
│   └── icons/               # PWA icons
└── docs/                    # Documentation
    └── (arquivos .md)
```

---

## 📈 Métricas de Código

**Linhas de Código (estimado):**
- TypeScript: ~2.500 linhas
- React/TSX: ~800 linhas
- CSS/Tailwind: ~300 linhas (via classes)
- **Total:** ~3.600 linhas

**Arquivos:**
- TypeScript: 12 arquivos
- React Components: 6 arquivos
- Páginas: 3 páginas
- Documentação: 5 arquivos .md

**Cobertura de Testes:**
- [ ] Atual: 0% (testes não implementados ainda)
- [ ] Meta: 80%+ para lógica de negócio

---

## 🐛 Problemas Conhecidos e Limitações

### Limitações Atuais

1. **Sem Multiplayer Online**
   - Apenas rastreamento manual de jogos presenciais
   - Sem sincronização em tempo real

2. **IA Baseada em Heurísticas**
   - Não usa machine learning
   - Recomendações baseadas em regras fixas
   - Sem aprendizado adaptativo

3. **Histórico de Jogos**
   - Não salva jogos finalizados
   - Sem estatísticas de longo prazo

4. **Sem Autenticação**
   - Dados apenas em localStorage
   - Sem sincronização entre dispositivos

### Bugs Conhecidos

- Nenhum bug crítico conhecido atualmente

---

## 🔄 Processo de Desenvolvimento

### Workflow

1. **Planejamento**
   - Definir feature ou bugfix
   - Atualizar DEVELOPMENT.md (esta seção)

2. **Implementação**
   - Escrever código
   - Seguir padrões estabelecidos
   - Adicionar JSDoc

3. **Testes**
   - Testar manualmente
   - Escrever testes automatizados (quando aplicável)
   - Verificar build (`pnpm build`)

4. **Documentação**
   - Atualizar DEVELOPMENT.md
   - Adicionar entrada em CHANGELOG.md
   - Atualizar README.md se necessário

5. **Commit**
   - Mensagens descritivas
   - Seguir Conventional Commits
   - Incluir co-author do Claude

### Conventional Commits

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

---

## 📚 Recursos Adicionais

### Documentação Relacionada

- **README.md** - Overview do projeto e guia de uso
- **ARCHITECTURE.md** - Arquitetura técnica detalhada
- **AI-ENGINE.md** - Detalhes dos algoritmos de IA
- **CHANGELOG.md** - Histórico de versões

### Referências Externas

- [Regras da Bisca](https://pt.wikipedia.org/wiki/Bisca)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 👥 Contribuição

Este projeto foi desenvolvido com assistência de Claude Code (Anthropic).

### Como Contribuir

1. Ler esta documentação
2. Verificar issues/roadmap
3. Seguir padrões de código estabelecidos
4. Atualizar documentação relevante
5. Submeter com testes

---

**Última Atualização:** 04/01/2025
**Próxima Revisão:** Após completar Fase 2
