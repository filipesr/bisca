# 🏗️ Arquitetura Técnica - Bisca Assistant

> **Documentação técnica profunda da arquitetura, padrões e algoritmos**

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Estrutura de Dados](#estrutura-de-dados)
3. [Fluxos de Dados](#fluxos-de-dados)
4. [Algoritmos Principais](#algoritmos-principais)
5. [Padrões de Código](#padrões-de-código)
6. [Type System](#type-system)
7. [State Management](#state-management)
8. [Performance](#performance)
9. [Segurança](#segurança)

---

## Visão Geral da Arquitetura

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────┐
│           PRESENTATION LAYER                │
│   (React Components + Next.js Pages)       │
│                                             │
│   app/page.tsx  app/setup  app/game       │
│   components/game/*                         │
└──────────────┬──────────────────────────────┘
               │
               │ Props + Hooks
               ↓
┌─────────────────────────────────────────────┐
│          STATE MANAGEMENT LAYER             │
│              (Zustand Store)                │
│                                             │
│   lib/store/game-store.ts                  │
│   - Game state                              │
│   - Actions (6)                             │
│   - Persistence                             │
└──────────────┬──────────────────────────────┘
               │
               │ Function calls
               ↓
┌─────────────────────────────────────────────┐
│          BUSINESS LOGIC LAYER               │
│         (Pure Functions + Types)            │
│                                             │
│   lib/bisca/*                               │
│   - Game rules                              │
│   - AI algorithms                           │
│   - Calculations                            │
└─────────────────────────────────────────────┘
```

### Princípios Arquiteturais

1. **Separation of Concerns**: Cada camada tem responsabilidade única
2. **Unidirectional Data Flow**: Dados fluem de cima para baixo
3. **Pure Functions**: Lógica de negócio sem side effects
4. **Type Safety**: TypeScript strict mode em tudo
5. **Immutability**: Estado nunca é mutado diretamente

---

## Estrutura de Dados

### Type Hierarchy

```
GameState (root)
├── status: GameStatus
├── configuration: GameConfiguration
│   ├── numberOfPlayers: 2 | 4
│   ├── playerNames: string[]
│   └── userId: PlayerId
├── players: Record<PlayerId, Player>
│   └── Player
│       ├── id: PlayerId
│       ├── name: string
│       ├── points: number
│       ├── wonCards: Card[]
│       ├── numberOfCardsInHand: number
│       └── isUser: boolean
├── trump: Card | null
├── rounds: Round[]
│   └── Round
│       ├── number: number
│       ├── playedCards: PlayedCard[]
│       │   └── PlayedCard
│       │       ├── card: Card
│       │       ├── playerId: PlayerId
│       │       └── order: number
│       ├── winner: PlayerId | null
│       ├── pointsWon: number
│       └── complete: boolean
├── currentRound: Round | null
├── nextPlayer: PlayerId | null
├── cardsInDeck: number
├── playedCards: Card[]
├── userHand: Card[]
├── winner: PlayerId | null
├── styleAnalyses: Record<PlayerId, StyleAnalysis>
│   └── StyleAnalysis
│       ├── playerId: PlayerId
│       ├── style: PlayStyle
│       ├── confidence: number
│       └── patterns: PlayPatterns
└── currentRecommendation: Recommendation | null
    └── Recommendation
        ├── card: Card
        ├── priority: number
        ├── reason: string
        ├── riskLevel: RiskLevel
        ├── winProbability: number
        └── details: object
```

### Enums e Union Types

```typescript
// String literal union type
type PlayerId = 'player1' | 'player2' | 'player3' | 'player4';

// Enums
enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  SPADES = 'spades',
  CLUBS = 'clubs',
}

enum Rank {
  ACE = 'A',
  SEVEN = '7',
  KING = 'K',
  JACK = 'J',
  QUEEN = 'Q',
  SIX = '6',
  FIVE = '5',
  FOUR = '4',
  THREE = '3',
  TWO = '2',
}

enum GameStatus {
  SETUP = 'setup',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

enum PlayStyle {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced',
  UNDETERMINED = 'undetermined',
}

enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}
```

### Data Structures

#### Card Representation

```typescript
type Card = {
  rank: Rank;      // Valor da carta (A, 7, K, J, Q, 6, 5, 4, 3, 2)
  suit: Suit;      // Naipe (hearts, diamonds, spades, clubs)
  points: number;  // Pontos da carta (calculado automaticamente)
};

// Exemplo
const aceOfHearts: Card = {
  rank: Rank.ACE,
  suit: Suit.HEARTS,
  points: 11
};
```

#### Constant Maps

```typescript
const CARD_POINTS: Record<Rank, number> = {
  [Rank.ACE]: 11,
  [Rank.SEVEN]: 10,
  [Rank.KING]: 4,
  [Rank.JACK]: 3,
  [Rank.QUEEN]: 2,
  [Rank.SIX]: 0,
  [Rank.FIVE]: 0,
  [Rank.FOUR]: 0,
  [Rank.THREE]: 0,
  [Rank.TWO]: 0,
};

const CARD_STRENGTH: Record<Rank, number> = {
  [Rank.ACE]: 11,
  [Rank.SEVEN]: 10,
  [Rank.KING]: 9,
  [Rank.JACK]: 8,
  [Rank.QUEEN]: 7,
  [Rank.SIX]: 6,
  [Rank.FIVE]: 5,
  [Rank.FOUR]: 4,
  [Rank.THREE]: 3,
  [Rank.TWO]: 2,
};

const TOTAL_POINTS = 120; // Soma de todos os pontos do deck
```

---

## Fluxos de Dados

### 1. Inicialização do Jogo

```
User Action: Click "Iniciar Partida"
              ↓
┌─────────────────────────────────────┐
│ setup/page.tsx                      │
│ - Coleta configuração               │
│ - Valida inputs                     │
└──────────────┬──────────────────────┘
               │
               │ startGame(config)
               ↓
┌─────────────────────────────────────┐
│ game-store.ts                       │
│ 1. Cria e embaralha deck            │
│ 2. Seleciona trunfo (última carta)  │
│ 3. Cria players                     │
│ 4. Inicia análises de estilo        │
│ 5. Define primeira rodada           │
│ 6. Status → IN_PROGRESS             │
└──────────────┬──────────────────────┘
               │
               │ State update
               ↓
┌─────────────────────────────────────┐
│ Zustand notify subscribers          │
│ - Re-render components              │
│ - Salva em localStorage             │
└──────────────┬──────────────────────┘
               │
               │ navigate('/game')
               ↓
┌─────────────────────────────────────┐
│ game/page.tsx                       │
│ - Exibe estado inicial              │
│ - Pronto para jogadas               │
└─────────────────────────────────────┘
```

### 2. Fluxo de uma Jogada

```
User Action: Registra carta jogada por oponente
              ↓
┌─────────────────────────────────────┐
│ CardSelector Component              │
│ - Seleciona rank                    │
│ - Seleciona suit                    │
│ - Retorna Card                      │
└──────────────┬──────────────────────┘
               │
               │ registerPlayedCard(playerId, card)
               ↓
┌─────────────────────────────────────┐
│ game-store.ts                       │
│ 1. Valida turno do jogador          │
│ 2. Cria PlayedCard com ordem        │
│ 3. Adiciona a currentRound          │
│ 4. Atualiza playedCards global      │
│ 5. Remove da mão se for usuário     │
│ 6. ┌─────────────────────────────┐  │
│    │ updateStyleAnalysis()       │  │
│    │ - Analisa tipo de jogada    │  │
│    │ - Atualiza padrões          │  │
│    │ - Recalcula estilo          │  │
│    └─────────────────────────────┘  │
│ 7. Determina próximo jogador        │
│ 8. Verifica se rodada completa      │
└──────────────┬──────────────────────┘
               │
               │ State update
               ↓
┌─────────────────────────────────────┐
│ UI Re-render                        │
│ - Carta aparece na rodada           │
│ - Análise de estilo atualiza        │
│ - Próximo jogador destacado         │
│ - Botão "Finalizar" se completa     │
└─────────────────────────────────────┘
```

### 3. Solicitação de Recomendação

```
User Action: Click "Solicitar Recomendação"
              ↓
┌─────────────────────────────────────┐
│ game/page.tsx                       │
│ requestRecommendation()             │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ game-store.ts                       │
│ 1. Valida userHand não vazia        │
│ 2. ┌─────────────────────────────┐  │
│    │ getBestRecommendation(state)│  │
│    │   ↓                         │  │
│    │ generateRecommendations()   │  │
│    │   ↓                         │  │
│    │ Para cada carta na mão:     │  │
│    │ ┌────────────────────────┐  │  │
│    │ │calculateCardRecommenda-│  │  │
│    │ │tion()                  │  │  │
│    │ │ - evaluateCardStrength │  │  │
│    │ │ - determineRiskLevel   │  │  │
│    │ │ - calculateTrumpProb   │  │  │
│    │ │ - generateReason       │  │  │
│    │ │ - adjust for style     │  │  │
│    │ └────────────────────────┘  │  │
│    │   ↓                         │  │
│    │ Ordena por priority         │  │
│    │ Retorna primeira (melhor)   │  │
│    └─────────────────────────────┘  │
│ 3. Salva em currentRecommendation   │
└──────────────┬──────────────────────┘
               │
               │ State update
               ↓
┌─────────────────────────────────────┐
│ UI Re-render                        │
│ - Carta destacada com ★             │
│ - Painel de recomendação exibe:    │
│   - Carta visual                    │
│   - Explicação                      │
│   - Prioridade (0-100)              │
│   - Nível de risco                  │
│   - Probabilidade de vitória        │
└─────────────────────────────────────┘
```

### 4. Finalização de Rodada

```
User Action: Click "Finalizar Rodada"
              ↓
┌─────────────────────────────────────┐
│ game/page.tsx                       │
│ finalizeRound()                     │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ game-store.ts                       │
│ 1. ┌─────────────────────────────┐  │
│    │ determineRoundWinner()      │  │
│    │ - Ordena cartas por ordem   │  │
│    │ - Compara cartas            │  │
│    │ - Calcula pontos            │  │
│    └─────────────────────────────┘  │
│ 2. Atualiza rodada:                 │
│    - winner                         │
│    - pointsWon                      │
│    - complete = true                │
│ 3. Atualiza jogador vencedor:       │
│    - adiciona cartas a wonCards     │
│    - incrementa points              │
│ 4. Adiciona rodada ao histórico     │
│ 5. ┌─────────────────────────────┐  │
│    │ checkGameEnd()              │  │
│    │ - Verifica 40 cartas        │  │
│    └─────────────────────────────┘  │
│ 6. SE fim de jogo:                  │
│    │ ┌───────────────────────┐     │
│    │ │ determineGameWinner() │     │
│    │ └───────────────────────┘     │
│    │ Status → FINISHED             │
│    SENÃO:                           │
│    │ Cria próxima rodada           │
│    │ Vencedor começa               │
└──────────────┬──────────────────────┘
               │
               │ State update
               ↓
┌─────────────────────────────────────┐
│ UI Re-render                        │
│ - Placar atualizado                 │
│ - Nova rodada iniciada ou           │
│ - Mensagem de fim de jogo           │
└─────────────────────────────────────┘
```

---

## Algoritmos Principais

### 1. Comparação de Cartas

**Função:** `compareCards(card1, card2, trump, firstCard)`

**Objetivo:** Determinar qual das duas cartas vence em uma jogada.

**Retorno:**
- `> 0`: card1 vence
- `< 0`: card2 vence
- `= 0`: empate (raro, apenas cartas idênticas)

**Algoritmo:**

```typescript
function compareCards(
  card1: Card,
  card2: Card,
  trump: Card | null,
  firstCard: Card
): number {
  const card1IsTrump = isTrump(card1, trump);
  const card2IsTrump = isTrump(card2, trump);

  // Caso 1: Ambas são trunfo
  if (card1IsTrump && card2IsTrump) {
    return CARD_STRENGTH[card1.rank]! - CARD_STRENGTH[card2.rank]!;
  }

  // Caso 2: Apenas uma é trunfo → trunfo vence
  if (card1IsTrump) return 1;
  if (card2IsTrump) return -1;

  // Caso 3: Nenhuma é trunfo
  const card1SameAsfirst = card1.suit === firstCard.suit;
  const card2SameAsfirst = card2.suit === firstCard.suit;

  // Caso 3.1: Apenas uma segue a primeira carta
  if (card1SameAsfirst && !card2SameAsfirst) return 1;
  if (card2SameAsfirst && !card1SameAsfirst) return -1;

  // Caso 3.2: Ambas seguem (ou nenhuma segue)
  if (card1SameAsfirst && card2SameAsfirst) {
    return CARD_STRENGTH[card1.rank]! - CARD_STRENGTH[card2.rank]!;
  }

  // Caso 3.3: Nenhuma segue → card1 vence (primeira jogada)
  return 1;
}
```

**Complexidade:** O(1) - tempo constante

**Casos de Teste:**
```typescript
// Trump vs non-trump
compareCards(
  { rank: '2', suit: 'hearts', points: 0 },  // trunfo fraco
  { rank: 'A', suit: 'spades', points: 11 }, // ás não-trunfo
  { rank: 'K', suit: 'hearts', points: 4 },  // trunfo = hearts
  { rank: 'A', suit: 'spades', points: 11 }  // primeira
) > 0 // true, trunfo sempre vence

// Mesma sequência
compareCards(
  { rank: 'A', suit: 'hearts', points: 11 },
  { rank: '7', suit: 'hearts', points: 10 },
  { rank: 'K', suit: 'spades', points: 4 },
  { rank: 'A', suit: 'hearts', points: 11 }
) > 0 // true, Ás > 7
```

---

### 2. Embaralhamento Fisher-Yates

**Função:** `shuffle<T>(array: T[])`

**Objetivo:** Embaralhar array in-place de forma uniforme.

**Algoritmo:**

```typescript
function shuffle<T>(array: T[]): T[] {
  const result = [...array]; // cópia para não mutar original

  for (let i = result.length - 1; i > 0; i--) {
    // Gera índice aleatório entre 0 e i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));

    // Troca elementos i e j
    [result[i], result[j]] = [result[j]!, result[i]!];
  }

  return result;
}
```

**Complexidade:** O(n)

**Propriedades:**
- Distribuição uniforme: cada permutação tem probabilidade 1/n!
- In-place (com cópia inicial para imutabilidade)
- Sem bias de ordenação

---

### 3. Análise de Tipo de Jogada

**Função:** `analyzePlayType(card, round, trump, playerHand)`

**Objetivo:** Classificar uma jogada como agressiva, defensiva ou neutra.

**Algoritmo:**

```typescript
function analyzePlayType(
  card: Card,
  round: Round,
  trump: Card | null,
  playerHand: Card[]
): 'aggressive' | 'defensive' | 'neutral' {
  const cardPoints = card.points;
  const cardIsTrump = isTrump(card, trump);
  const cardStrength = CARD_STRENGTH[card.rank]!;

  // Calcula pontos já na mesa
  const roundPoints = round.playedCards.reduce(
    (sum, pc) => sum + pc.card.points,
    0
  );

  // Analisa alternativas disponíveis
  const hasStrongerCards = playerHand.some(
    (c) => CARD_STRENGTH[c.rank]! > cardStrength
  );
  const hasHigherPoints = playerHand.some((c) => c.points > cardPoints);

  // Decisão baseada em múltiplos fatores
  if (cardPoints >= 10) {
    // Jogou Ás ou 7
    if (roundPoints === 0) {
      return 'aggressive'; // Arrisca carta valiosa sem pontos na mesa
    }
    if (roundPoints >= 10) {
      return 'aggressive'; // Tenta ganhar muitos pontos
    }
  }

  if (cardIsTrump && cardStrength >= 9) {
    // Jogou trunfo forte
    if (roundPoints >= 10) {
      return 'aggressive'; // Usa trunfo para ganhar pontos
    }
  }

  if (cardPoints === 0 && cardStrength <= 5) {
    // Jogou carta fraca e sem valor
    if (hasStrongerCards && hasHigherPoints) {
      return 'defensive'; // Preserva cartas melhores
    }
  }

  if (cardPoints >= 4 && hasHigherPoints && roundPoints === 0) {
    // Jogou Rei/Valete/Dama sem pontos na mesa tendo melhor
    return 'defensive'; // Economiza Ás/7
  }

  return 'neutral'; // Jogada padrão
}
```

**Complexidade:** O(n) onde n = tamanho da mão

**Lógica de Decisão:**

```
AGGRESSIVE:
- Joga cartas de alto valor (Ás, 7)
- Usa trunfos fortes para ganhar pontos
- Arrisca cartas valiosas

DEFENSIVE:
- Joga cartas fracas preservando boas
- Economiza trunfos e cartas valiosas
- Evita arriscar pontos

NEUTRAL:
- Jogadas padrão
- Sem padrão claro
- Situações ambíguas
```

---

### 4. Cálculo de Probabilidade de Trunfo

**Função:** `calculateTrumpProbability(remainingCards, trump, numberOfOpponents)`

**Objetivo:** Calcular probabilidade de pelo menos um oponente ter trunfo.

**Algoritmo:**

```typescript
function calculateTrumpProbability(
  remainingCards: Card[],
  trump: Card | null,
  numberOfOpponents: number
): number {
  if (!trump) return 0;

  // Conta trunfos restantes (não jogados)
  const remainingTrumps = remainingCards.filter((c) =>
    isTrump(c, trump)
  ).length;

  if (remainingTrumps === 0) return 0;

  const unseenCards = remainingCards.length;

  // Probabilidade de UM oponente ter trunfo
  const probabilityPerOpponent = remainingTrumps / unseenCards;

  // Probabilidade de PELO MENOS UM ter trunfo
  // P(pelo menos 1) = 1 - P(nenhum)
  // P(nenhum) = (1 - p)^n
  const probability = 1 - Math.pow(
    1 - probabilityPerOpponent,
    numberOfOpponents
  );

  return Math.round(probability * 100); // 0-100%
}
```

**Exemplo:**
```
Situação:
- 30 cartas restantes
- 6 trunfos restantes
- 2 oponentes

Cálculo:
p_per_opp = 6/30 = 0.2 (20%)
p_none = (1 - 0.2)^2 = 0.64
p_at_least_one = 1 - 0.64 = 0.36 (36%)
```

**Complexidade:** O(n) onde n = cartas restantes (para filtrar trunfos)

---

### 5. Avaliação de Força de Carta

**Função:** `evaluateCardStrength(card, trump, remainingCards)`

**Objetivo:** Pontuar a força de uma carta no contexto atual.

**Algoritmo:**

```typescript
function evaluateCardStrength(
  card: Card,
  trump: Card | null,
  remainingCards: Card[]
): number {
  const basePoints = CARD_POINTS[card.rank] ?? 0;
  const baseStrength = CARD_STRENGTH[card.rank] ?? 0;

  // Score inicial: força ponderada + pontos
  let score = baseStrength * 5 + basePoints * 2;

  // Bônus se for trunfo
  if (isTrump(card, trump)) {
    score += 20;
  }

  // Penalidade baseada em risco
  const cardsThatCanWin = remainingCards.filter((c) => {
    return compareCards(c, card, trump, card) > 0;
  }).length;

  const riskFactor = cardsThatCanWin / remainingCards.length;
  score *= 1 - riskFactor * 0.5; // Reduz até 50% se muitas cartas vencem

  return Math.round(score);
}
```

**Exemplo:**
```
Carta: Ás de Copas (trunfo)
- basePoints = 11
- baseStrength = 11
- score = 11*5 + 11*2 = 77
- bônus trunfo = +20 → 97
- cartas que vencem = 0
- riskFactor = 0
- score final = 97

Carta: 7 não-trunfo
- basePoints = 10
- baseStrength = 10
- score = 10*5 + 10*2 = 70
- não é trunfo
- cartas que vencem = 10 trunfos
- riskFactor = 10/30 = 0.33
- score final = 70 * (1 - 0.33*0.5) = 70 * 0.835 = 58
```

**Complexidade:** O(m * n) onde m = cartas restantes, n = comparações

---

### 6. Determinação de Nível de Risco

**Função:** `determineRiskLevel(card, roundPoints, trumpProbability, trump)`

**Objetivo:** Classificar o risco de jogar uma carta.

**Algoritmo:**

```typescript
function determineRiskLevel(
  card: Card,
  roundPoints: number,
  trumpProbability: number,
  trump: Card | null
): RiskLevel {
  const cardPoints = CARD_POINTS[card.rank] ?? 0;
  const totalPointsAtRisk = cardPoints + roundPoints;
  const cardIsTrump = isTrump(card, trump);
  const strength = CARD_STRENGTH[card.rank] ?? 0;

  // Trunfo forte com muitos pontos em jogo
  if (cardIsTrump && totalPointsAtRisk >= 20 && trumpProbability > 50) {
    return RiskLevel.HIGH;
  }

  // Carta valiosa (Ás ou 7)
  if (cardPoints >= 10) {
    if (trumpProbability > 60) return RiskLevel.VERY_HIGH;
    if (trumpProbability > 40) return RiskLevel.HIGH;
    return RiskLevel.MEDIUM;
  }

  // Carta forte mas sem pontos
  if (strength >= 9 && totalPointsAtRisk >= 15) {
    return RiskLevel.MEDIUM;
  }

  // Carta fraca e sem valor
  if (strength <= 5 && cardPoints === 0) {
    return RiskLevel.VERY_LOW;
  }

  return RiskLevel.LOW;
}
```

**Árvore de Decisão:**

```
┌─ É trunfo forte E total ≥ 20 E prob > 50%?
│  └─ YES → HIGH
│
├─ Tem ≥ 10 pontos?
│  ├─ Prob > 60% → VERY_HIGH
│  ├─ Prob > 40% → HIGH
│  └─ Senão → MEDIUM
│
├─ É forte (≥9) E total ≥ 15?
│  └─ YES → MEDIUM
│
├─ É fraca (≤5) E sem pontos?
│  └─ YES → VERY_LOW
│
└─ DEFAULT → LOW
```

**Complexidade:** O(1)

---

## Padrões de Código

### 1. Pure Functions

Todas as funções de lógica de negócio são puras (sem side effects):

```typescript
// ✅ Pure function
function calculatePoints(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + card.points, 0);
}

// ❌ Impure function (evitada no projeto)
let globalTotal = 0;
function addPoints(card: Card): void {
  globalTotal += card.points; // side effect
}
```

### 2. Immutability

Estado nunca é mutado diretamente:

```typescript
// ✅ Immutable update
const newRound: Round = {
  ...currentRound,
  playedCards: [...currentRound.playedCards, newCard],
  complete: true
};

// ❌ Mutation (evitada)
currentRound.playedCards.push(newCard);
currentRound.complete = true;
```

### 3. Type Guards

Validação de tipos em runtime:

```typescript
function isCard(value: unknown): value is Card {
  return (
    typeof value === 'object' &&
    value !== null &&
    'rank' in value &&
    'suit' in value &&
    'points' in value
  );
}

// Uso
if (isCard(data)) {
  // TypeScript sabe que data é Card aqui
  console.log(data.rank);
}
```

### 4. Exhaustive Checks

Switch statements exaustivos:

```typescript
function getStyleDescription(style: PlayStyle): string {
  switch (style) {
    case PlayStyle.AGGRESSIVE:
      return 'Joga cartas de alto valor';
    case PlayStyle.DEFENSIVE:
      return 'Preserva cartas boas';
    case PlayStyle.BALANCED:
      return 'Equilibrado';
    case PlayStyle.UNDETERMINED:
      return 'Dados insuficientes';
    default:
      // TypeScript garante que todos os casos foram cobertos
      const _exhaustive: never = style;
      return _exhaustive;
  }
}
```

### 5. Optional Chaining e Nullish Coalescing

```typescript
// Optional chaining
const firstCardPoints = round.playedCards[0]?.card?.points;

// Nullish coalescing
const playerName = player.name ?? 'Unknown';

// Combinados
const nextPlayerName = players[nextPlayer ?? 'player1']?.name ?? 'N/A';
```

---

## Type System

### Generic Functions

```typescript
// Shuffle genérico
function shuffle<T>(array: T[]): T[] {
  // Funciona com qualquer tipo
}

// Uso
const shuffledCards = shuffle<Card>(cards);
const shuffledNumbers = shuffle<number>([1, 2, 3]);
```

### Mapped Types

```typescript
// Partial de GameState para updates
type GameStateUpdate = Partial<GameState>;

// Record de estilos por jogador
type StyleAnalyses = Record<PlayerId, StyleAnalysis>;
```

### Utility Types

```typescript
// Omitir propriedades
type PlayerWithoutCards = Omit<Player, 'wonCards'>;

// Pegar apenas algumas propriedades
type PlayerBasicInfo = Pick<Player, 'id' | 'name'>;

// Tornar tudo readonly
type ReadonlyGameState = Readonly<GameState>;
```

### Type Inference

```typescript
// TypeScript infere o tipo de retorno
const createInitialState = () => ({
  status: GameStatus.SETUP,
  // ... resto do estado
});
// Tipo inferido: () => GameState

// Inferência de tipos em arrays
const ranks = [Rank.ACE, Rank.SEVEN]; // Rank[]
const mixed = [1, 'two', 3]; // (string | number)[]
```

---

## State Management

### Zustand Store Pattern

```typescript
type GameStore = {
  // Estado
  state: GameState;

  // Actions (métodos que modificam estado)
  startGame: (config: GameConfiguration) => ActionResult;
  registerPlayedCard: (playerId: PlayerId, card: Card) => ActionResult;
  // ... outras actions
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      state: createInitialState(),

      // Implementação de actions
      startGame: (config) => {
        try {
          // Lógica
          const newState = { /* ... */ };

          set({ state: newState }); // Atualiza estado

          return { success: true, message: '...' };
        } catch (error) {
          return { success: false, error: '...' };
        }
      },

      // ... outras implementações
    }),
    {
      name: 'bisca-game-storage', // localStorage key
      partialize: (state) => ({ state: state.state }), // O que salvar
    }
  )
);
```

### Usage in Components

```typescript
// Hook selector (otimizado)
const playerPoints = useGameStore((state) => state.state.players);

// Action
const startGame = useGameStore((state) => state.startGame);

// Múltiplos seletores
const {
  state,
  registerPlayedCard,
  finalizeRound
} = useGameStore((state) => ({
  state: state.state,
  registerPlayedCard: state.registerPlayedCard,
  finalizeRound: state.finalizeRound,
}));
```

---

## Performance

### Memoization (futuro)

```typescript
// React.memo para componentes
const Card = React.memo<CardProps>(({ card, onClick }) => {
  // Componente só re-renderiza se props mudarem
});

// useMemo para cálculos caros
const sortedCards = useMemo(() => {
  return cards.sort((a, b) => compareCards(a, b, trump, firstCard));
}, [cards, trump, firstCard]);
```

### Zustand Selectors

```typescript
// ✅ Selector otimizado (re-render apenas se pontos mudarem)
const userPoints = useGameStore(
  (state) => state.state.players[state.state.configuration.userId]?.points
);

// ❌ Não otimizado (re-render em qualquer mudança de estado)
const state = useGameStore((state) => state.state);
const userPoints = state.players[state.configuration.userId]?.points;
```

### Bundle Size

- Next.js code splitting automático
- Componentes carregados sob demanda
- Service Worker para cache agressivo

---

## Segurança

### Input Validation

```typescript
// Validação de turno
if (state.nextPlayer !== playerId) {
  return { success: false, error: 'Não é a vez deste jogador' };
}

// Validação de carta na mão
const index = findCard(userHand, card);
if (index === -1) {
  return { success: false, error: 'Carta não está na mão' };
}
```

### XSS Prevention

- Tailwind CSS (sem inline styles perigosos)
- Dados sempre via props (nunca dangerouslySetInnerHTML)
- TypeScript garante tipos corretos

### Data Sanitization

```typescript
// Sanitização de nomes de jogadores
const sanitizeName = (name: string): string => {
  return name.trim().slice(0, 50); // Limita tamanho
};
```

---

## Diagramas

### Fluxo de Estado Completo

```
┌─────────┐
│  SETUP  │
└────┬────┘
     │ startGame()
     ↓
┌─────────────┐
│ IN_PROGRESS │◄────┐
└────┬────────┘     │
     │              │
     ├─ registerPlayedCard()
     │              │
     ├─ updateUserHand()
     │              │
     ├─ requestRecommendation()
     │              │
     └─ finalizeRound() ──┬─ Próxima rodada ──┘
                          │
                          └─ Jogo terminou
                             ↓
                      ┌──────────┐
                      │ FINISHED │
                      └──────────┘
```

### Dependências entre Módulos

```
app/game/page.tsx
      │
      ├──→ components/game/card.tsx
      ├──→ components/game/card-selector.tsx
      │
      └──→ lib/store/game-store.ts
               │
               ├──→ lib/bisca/types.ts
               ├──→ lib/bisca/deck.ts
               ├──→ lib/bisca/rules.ts
               ├──→ lib/bisca/scoring.ts
               ├──→ lib/bisca/style-analyzer.ts
               └──→ lib/bisca/recommendation-engine.ts
                        │
                        └──→ lib/bisca/deck.ts (circular ok)
```

---

**Última Atualização:** 04/01/2025
**Mantido por:** Desenvolvimento Bisca Assistant
