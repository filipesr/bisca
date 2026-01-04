# 🧠 Motor de IA - Bisca Assistant

> **Documentação completa dos algoritmos de inteligência artificial**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Análise de Estilo de Jogo](#análise-de-estilo-de-jogo)
3. [Motor de Recomendações](#motor-de-recomendações)
4. [Cálculos de Probabilidade](#cálculos-de-probabilidade)
5. [Avaliação de Risco](#avaliação-de-risco)
6. [Geração de Explicações](#geração-de-explicações)
7. [Casos de Uso e Exemplos](#casos-de-uso-e-exemplos)
8. [Calibração e Tuning](#calibração-e-tuning)
9. [Limitações e Melhorias Futuras](#limitações-e-melhorias-futuras)

---

## Visão Geral

O motor de IA do Bisca Assistant é composto por **dois sistemas principais**:

1. **Sistema de Análise de Estilo** (`lib/bisca/style-analyzer.ts`)
   - Detecta padrões de jogo dos oponentes
   - Classifica estilos (agressivo, defensivo, balanceado)
   - Calcula confiança da análise

2. **Sistema de Recomendações** (`lib/bisca/recommendation-engine.ts`)
   - Avalia cada carta da mão do jogador
   - Calcula prioridades baseadas em múltiplos fatores
   - Gera explicações contextuais
   - Ajusta estratégia baseado no estilo do oponente

### Filosofia de Design

- **Baseado em Heurísticas**: Regras programadas, não machine learning
- **Transparente**: Todas as decisões são explicáveis
- **Contextual**: Considera situação completa do jogo
- **Adaptativo**: Ajusta recomendações ao estilo do oponente
- **Probabilístico**: Usa teoria de probabilidade para riscos

---

## Análise de Estilo de Jogo

### Arquivo: `lib/bisca/style-analyzer.ts`

### Estilos de Jogo

| Estilo | Características | Detecção |
|--------|-----------------|----------|
| **AGGRESSIVE** | Joga cartas de alto valor cedo<br>Usa trunfos para ganhar pontos<br>Arrisca cartas valiosas | ≥ 60% jogadas agressivas |
| **DEFENSIVE** | Preserva cartas boas<br>Joga cartas fracas<br>Evita arriscar pontos | ≥ 60% jogadas defensivas |
| **BALANCED** | Mix equilibrado<br>Adapta ao contexto<br>Sem padrão forte | Nem agressivo nem defensivo |
| **UNDETERMINED** | Dados insuficientes | < 3 jogadas analisadas |

---

### Algoritmo Principal: `analyzePlayType()`

**Objetivo:** Classificar uma única jogada como agressiva, defensiva ou neutra.

#### Fatores Analisados

1. **Valor da Carta**
   ```typescript
   const cardPoints = card.points; // 0-11
   ```

2. **Força Relativa**
   ```typescript
   const cardStrength = CARD_STRENGTH[card.rank]; // 2-11
   const cardIsTrump = isTrump(card, trump);
   ```

3. **Contexto da Rodada**
   ```typescript
   const roundPoints = round.playedCards.reduce(
     (sum, pc) => sum + pc.card.points,
     0
   );
   ```

4. **Alternativas Disponíveis**
   ```typescript
   const hasStrongerCards = playerHand.some(
     (c) => CARD_STRENGTH[c.rank]! > cardStrength
   );
   const hasHigherPoints = playerHand.some((c) => c.points > cardPoints);
   ```

#### Árvore de Decisão

```
┌─ Jogou Ás ou 7? (points ≥ 10)
│  ├─ Sem pontos na mesa (roundPoints = 0)?
│  │  └─ AGGRESSIVE (arriscou carta valiosa)
│  ├─ Muitos pontos na mesa (roundPoints ≥ 10)?
│  │  └─ AGGRESSIVE (tenta ganhar muitos pontos)
│
├─ Jogou trunfo forte? (isTrump && strength ≥ 9)
│  └─ Muitos pontos na mesa?
│     └─ AGGRESSIVE (usa trunfo para ganhar)
│
├─ Jogou carta fraca sem valor? (points = 0 && strength ≤ 5)
│  └─ Tinha cartas melhores?
│     └─ DEFENSIVE (preserva cartas boas)
│
├─ Jogou Rei/Valete/Dama? (points ≥ 4)
│  └─ Sem pontos na mesa E tinha cartas melhores?
│     └─ DEFENSIVE (economiza Ás/7)
│
└─ DEFAULT
   └─ NEUTRAL (jogada padrão)
```

#### Exemplos de Classificação

**Exemplo 1: AGGRESSIVE**
```typescript
// Situação
card = { rank: 'A', suit: 'hearts', points: 11 }
roundPoints = 0
playerHand = [
  { rank: '7', suit: 'spades', points: 10 },
  { rank: '6', suit: 'clubs', points: 0 }
]

// Análise
// - Jogou Ás (11 pontos)
// - Sem pontos na mesa
// - Resultado: AGGRESSIVE (arriscou carta valiosa)
```

**Exemplo 2: DEFENSIVE**
```typescript
// Situação
card = { rank: '4', suit: 'diamonds', points: 0 }
roundPoints = 15
playerHand = [
  { rank: 'A', suit: 'hearts', points: 11 },
  { rank: '7', suit: 'spades', points: 10 },
  { rank: 'K', suit: 'clubs', points: 4 }
]

// Análise
// - Jogou carta fraca (força 4, 0 pontos)
// - Tinha cartas muito melhores
// - 15 pontos na mesa mas não tentou ganhar
// - Resultado: DEFENSIVE (preserva cartas boas)
```

**Exemplo 3: NEUTRAL**
```typescript
// Situação
card = { rank: 'Q', suit: 'spades', points: 2 }
roundPoints = 4
playerHand = [
  { rank: 'J', suit: 'hearts', points: 3 },
  { rank: '6', suit: 'clubs', points: 0 }
]

// Análise
// - Jogou Dama (força 7, 2 pontos)
// - Poucos pontos na mesa
// - Não tem cartas muito melhores
// - Resultado: NEUTRAL (jogada razoável)
```

---

### Atualização de Análise: `updateStyleAnalysis()`

**Objetivo:** Atualizar análise acumulada após cada jogada.

#### Algoritmo

```typescript
function updateStyleAnalysis(
  currentAnalysis: StyleAnalysis,
  newPlay: PlayedCard,
  round: Round,
  trump: Card | null,
  playerHand: Card[]
): StyleAnalysis {
  // 1. Analisa nova jogada
  const playType = analyzePlayType(newPlay.card, round, trump, playerHand);

  // 2. Atualiza contadores
  let { aggressivePlays, defensivePlays, totalPlays } = currentAnalysis.patterns;

  totalPlays++;
  if (playType === 'aggressive') aggressivePlays++;
  if (playType === 'defensive') defensivePlays++;

  // 3. Determina estilo
  if (totalPlays < 3) {
    // Dados insuficientes
    return {
      playerId,
      style: PlayStyle.UNDETERMINED,
      confidence: 0,
      patterns: { aggressivePlays, defensivePlays, totalPlays }
    };
  }

  // Calcula ratios
  const aggressiveRatio = aggressivePlays / totalPlays;
  const defensiveRatio = defensivePlays / totalPlays;

  // Determina estilo baseado em threshold de 60%
  if (aggressiveRatio >= 0.6) {
    return {
      playerId,
      style: PlayStyle.AGGRESSIVE,
      confidence: Math.round(aggressiveRatio * 100),
      patterns: { aggressivePlays, defensivePlays, totalPlays }
    };
  }

  if (defensiveRatio >= 0.6) {
    return {
      playerId,
      style: PlayStyle.DEFENSIVE,
      confidence: Math.round(defensiveRatio * 100),
      patterns: { aggressivePlays, defensivePlays, totalPlays }
    };
  }

  // Balanceado: calcula confiança baseada em quão equilibrado é
  const balance = 1 - Math.abs(aggressiveRatio - defensiveRatio);
  return {
    playerId,
    style: PlayStyle.BALANCED,
    confidence: Math.round(balance * 100),
    patterns: { aggressivePlays, defensivePlays, totalPlays }
  };
}
```

#### Evolução da Análise

```
Jogadas:  1    2    3    4    5    6    7    8    9    10
Type:     A    D    A    A    N    A    D    A    N    A

Total:    1    2    3    4    5    6    7    8    9    10
Aggr:     1    1    2    3    3    4    4    5    5    6
Def:      0    1    1    1    1    1    2    2    2    2

Ratio:   1.0  0.5  0.67 0.75 0.6  0.67 0.57 0.63 0.56 0.6
Style:   UND  UND  AGG  AGG  BAL  AGG  BAL  AGG  BAL  AGG
Conf:     0    0    67   75   60   67   57   63   56   60
```

**Legenda:**
- A = Aggressive, D = Defensive, N = Neutral
- UND = Undetermined, AGG = Aggressive, BAL = Balanced

---

### Ajuste de Estratégia: `calculateStyleAdjustment()`

**Objetivo:** Calcular como ajustar recomendações baseado no estilo do oponente.

#### Algoritmo

```typescript
function calculateStyleAdjustment(
  opponentStyle: PlayStyle,
  confidence: number
): {
  preferAggressive: boolean;
  preferDefensive: boolean;
  adjustmentFactor: number;
} {
  // Só ajusta se confiança > 50%
  if (confidence < 50) {
    return {
      preferAggressive: false,
      preferDefensive: false,
      adjustmentFactor: 0
    };
  }

  // Fator de ajuste proporcional à confiança
  const adjustmentFactor = confidence / 100;

  // Contra agressivo: joga defensivo
  if (opponentStyle === PlayStyle.AGGRESSIVE) {
    return {
      preferAggressive: false,
      preferDefensive: true,
      adjustmentFactor
    };
  }

  // Contra defensivo: joga agressivo
  if (opponentStyle === PlayStyle.DEFENSIVE) {
    return {
      preferAggressive: true,
      preferDefensive: false,
      adjustmentFactor
    };
  }

  // Contra balanceado: sem ajuste forte
  return {
    preferAggressive: false,
    preferDefensive: false,
    adjustmentFactor: adjustmentFactor * 0.3 // Ajuste mínimo
  };
}
```

#### Estratégia de Contraste

| Oponente | Sua Estratégia | Razão |
|----------|----------------|-------|
| Agressivo | Defensivo | Preserva cartas valiosas, espera erros dele |
| Defensivo | Agressivo | Aproveita que ele não vai ganhar pontos |
| Balanceado | Neutro | Sem vantagem clara em ajustar |

---

## Motor de Recomendações

### Arquivo: `lib/bisca/recommendation-engine.ts`

### Fluxo Principal

```
generateRecommendations(gameState)
   ↓
Para cada carta na mão do usuário:
   ↓
calculateCardRecommendation(card, state, remainingCards, numOpponents)
   ↓
   ├─ evaluateCardStrength()
   ├─ determineRiskLevel()
   ├─ calculateTrumpProbability()
   ├─ adjust for opponent style
   └─ generateRecommendationReason()
   ↓
Ordena por priority (descendente)
   ↓
Retorna array de Recommendation[]
   ↓
getBestRecommendation() → primeira (maior priority)
```

---

### 1. Avaliação de Força: `evaluateCardStrength()`

**Objetivo:** Pontuar a força de uma carta no contexto atual do jogo.

#### Fórmula

```typescript
score = (cardStrength × 5) + (cardPoints × 2) + trumpBonus - riskPenalty
```

Onde:
- `cardStrength`: 2-11 (ranking de força da carta)
- `cardPoints`: 0-11 (pontos que a carta vale)
- `trumpBonus`: +20 se for trunfo, 0 caso contrário
- `riskPenalty`: `score × (cardsCanWin / totalCards) × 0.5`

#### Exemplo de Cálculo

**Carta: Ás de Copas (trunfo)**
```
Dados:
- rank = ACE
- suit = hearts (trunfo)
- cardStrength = 11
- cardPoints = 11
- 30 cartas restantes
- 0 cartas podem vencer este ás

Cálculo:
score = (11 × 5) + (11 × 2) + 20 - 0
score = 55 + 22 + 20
score = 97

Resultado: 97/100 (excelente)
```

**Carta: 7 de Espadas (não-trunfo, trunfo = hearts)**
```
Dados:
- rank = SEVEN
- suit = spades
- cardStrength = 10
- cardPoints = 10
- 30 cartas restantes
- 10 trunfos podem vencer (todos os trunfos vencem)

Cálculo:
score_base = (10 × 5) + (10 × 2) + 0
score_base = 50 + 20 = 70

riskFactor = 10 / 30 = 0.333
riskPenalty = 70 × 0.333 × 0.5 = 11.655
score_final = 70 - 11.655 = 58.345

Resultado: 58/100 (bom, mas com risco)
```

#### Interpretação de Scores

| Score | Interpretação |
|-------|---------------|
| 90-100 | Carta excelente (trunfo forte) |
| 70-89 | Carta muito boa |
| 50-69 | Carta boa com algum risco |
| 30-49 | Carta média |
| 0-29 | Carta fraca |

---

### 2. Cálculo de Probabilidade de Trunfo

**Objetivo:** Estimar a chance de oponente(s) ter trunfo na mão.

#### Fórmula Matemática

```
P(pelo menos 1 oponente tem trunfo) = 1 - P(nenhum tem)

P(nenhum tem) = (1 - p)^n

onde:
p = probabilidade de um oponente ter trunfo
  = trunfos_restantes / cartas_não_vistas
n = número de oponentes
```

#### Algoritmo

```typescript
function calculateTrumpProbability(
  remainingCards: Card[],
  trump: Card | null,
  numberOfOpponents: number
): number {
  if (!trump) return 0;

  // Filtra trunfos restantes
  const remainingTrumps = remainingCards.filter((c) =>
    isTrump(c, trump)
  ).length;

  if (remainingTrumps === 0) return 0;

  const unseenCards = remainingCards.length;

  // Probabilidade por oponente
  const probabilityPerOpponent = remainingTrumps / unseenCards;

  // Probabilidade de pelo menos um ter
  const probability = 1 - Math.pow(
    1 - probabilityPerOpponent,
    numberOfOpponents
  );

  return Math.round(probability * 100);
}
```

#### Exemplo Numérico

**Situação: 2 oponentes, 30 cartas restantes, 6 trunfos**

```
Passo 1: Probabilidade por oponente
p = 6 / 30 = 0.2 (20%)

Passo 2: Probabilidade de nenhum ter
P(nenhum) = (1 - 0.2)^2 = 0.8^2 = 0.64

Passo 3: Probabilidade de pelo menos um ter
P(pelo menos 1) = 1 - 0.64 = 0.36 = 36%
```

**Situação: 3 oponentes, 20 cartas restantes, 8 trunfos**

```
p = 8 / 20 = 0.4 (40%)
P(nenhum) = (1 - 0.4)^3 = 0.6^3 = 0.216
P(pelo menos 1) = 1 - 0.216 = 0.784 = 78%
```

#### Tabela de Probabilidades

| Trunfos<br>Restantes | Cartas<br>Restantes | 1 Oponente | 2 Oponentes | 3 Oponentes |
|:--------------------:|:-------------------:|:----------:|:-----------:|:-----------:|
| 2 | 10 | 20% | 36% | 49% |
| 4 | 20 | 20% | 36% | 49% |
| 6 | 30 | 20% | 36% | 49% |
| 3 | 10 | 30% | 51% | 66% |
| 6 | 20 | 30% | 51% | 66% |
| 4 | 10 | 40% | 64% | 78% |
| 8 | 20 | 40% | 64% | 78% |
| 5 | 10 | 50% | 75% | 88% |
| 8 | 12 | 67% | 89% | 96% |

---

### 3. Determinação de Nível de Risco

**Objetivo:** Classificar o risco de jogar uma carta específica.

#### Níveis de Risco

```typescript
enum RiskLevel {
  VERY_LOW = 'very_low',     // 🟢 Seguro
  LOW = 'low',                // 🟡 Baixo risco
  MEDIUM = 'medium',          // 🟠 Risco moderado
  HIGH = 'high',              // 🔴 Alto risco
  VERY_HIGH = 'very_high',    // 🔴🔴 Risco muito alto
}
```

#### Árvore de Decisão

```
┌─ É trunfo forte (strength ≥ 9)?
│  └─ Pontos em risco ≥ 20 E prob_trunfo > 50%?
│     └─ YES → HIGH
│
├─ Tem ≥ 10 pontos? (Ás ou 7)
│  ├─ prob_trunfo > 60% → VERY_HIGH
│  ├─ prob_trunfo > 40% → HIGH
│  └─ Senão → MEDIUM
│
├─ É forte (≥ 9) E pontos em risco ≥ 15?
│  └─ YES → MEDIUM
│
├─ É fraca (≤ 5) E sem pontos?
│  └─ YES → VERY_LOW
│
└─ DEFAULT → LOW
```

#### Exemplos

**VERY_HIGH: Ás com alta probabilidade de trunfo oponente**
```typescript
card = { rank: 'A', suit: 'spades', points: 11 }
cardPoints = 11
roundPoints = 4
totalPointsAtRisk = 15
trumpProbability = 75% // muitos trunfos restantes
cardIsTrump = false

// Lógica
// cardPoints ≥ 10 → true
// trumpProbability > 60% → true
// Resultado: VERY_HIGH
```

**VERY_LOW: 6 sem valor**
```typescript
card = { rank: '6', suit: 'clubs', points: 0 }
cardStrength = 6
cardPoints = 0

// Lógica
// strength ≤ 5? → false (é 6)
// Mas é fraca e sem valor
// Resultado: VERY_LOW
```

**MEDIUM: Rei em rodada com pontos**
```typescript
card = { rank: 'K', suit: 'hearts', points: 4 }
cardStrength = 9
roundPoints = 11
totalPointsAtRisk = 15

// Lógica
// strength ≥ 9 AND totalPointsAtRisk ≥ 15 → true
// Resultado: MEDIUM
```

---

### 4. Cálculo de Prioridade Final

**Objetivo:** Combinar todos os fatores para score final de 0-100.

#### Fórmula Completa

```typescript
priority = handStrength + contextAdjustments + styleAdjustments

// Normalização
priority = Math.max(0, Math.min(100, priority))
```

Onde:
- `handStrength`: Score de `evaluateCardStrength()` (0-100)
- `contextAdjustments`: Ajustes baseados em situação do jogo
- `styleAdjustments`: Ajustes baseados no estilo do oponente

#### Ajustes de Contexto

```typescript
// Exemplo de ajustes aplicados

// Se está perdendo e restam poucos pontos
if (!isWinning && remainingPoints < 40) {
  priority += 5; // Precisa ser mais agressivo
}

// Se está ganhando significativamente
if (isWinning && pointsDifference > 30) {
  priority -= 5; // Pode ser mais conservador
}

// Se é primeira jogada e carta fraca
if (isFirstPlay && cardStrength <= 5 && cardPoints === 0) {
  priority += 10; // Ideal para abrir rodada
}
```

#### Ajustes por Estilo do Oponente

```typescript
// Para cada oponente com estilo detectado
for (const opponentAnalysis of opponentsAnalyses) {
  const adjustment = calculateStyleAdjustment(
    opponentAnalysis.style,
    opponentAnalysis.confidence
  );

  const cardPoints = CARD_POINTS[card.rank] ?? 0;
  const cardStrength = CARD_STRENGTH[card.rank] ?? 0;

  // Se ajuste prefere agressivo E carta é boa
  if (adjustment.preferAggressive && (cardPoints >= 10 || cardStrength >= 9)) {
    priority += 10 * adjustment.adjustmentFactor;
  }

  // Se ajuste prefere defensivo E carta é fraca
  if (adjustment.preferDefensive && cardPoints === 0 && cardStrength <= 6) {
    priority += 10 * adjustment.adjustmentFactor;
  }
}
```

#### Exemplo Completo de Cálculo

**Situação do Jogo:**
```
Mão do usuário: [A♥, 7♠, K♦]
Trunfo: ♥ (hearts)
Rodada atual: vazia (primeira jogada)
Oponente 1: Estilo AGGRESSIVE (70% confiança)
Pontos do usuário: 45
Pontos do oponente: 38
Cartas restantes: 24
Trunfos restantes: 6
```

**Avaliando Ás de Copas (A♥ - trunfo):**

1. **Hand Strength:**
   ```
   cardStrength = 11
   cardPoints = 11
   trumpBonus = 20
   cardsCanWin = 0 (é o Ás de trunfo)

   score = (11 × 5) + (11 × 2) + 20 = 97
   ```

2. **Context Adjustments:**
   ```
   isFirstPlay = true
   cardStrength = 11 (não é fraca)
   → Sem ajuste de primeira jogada

   isWinning = true (45 > 38)
   pointsDifference = 7 (não > 30)
   → Sem ajuste de vantagem

   Total context = 0
   ```

3. **Style Adjustments:**
   ```
   Oponente AGGRESSIVE, confidence 70%
   → preferDefensive = true, adjustmentFactor = 0.7

   Esta carta é agressiva (11 pontos, força 11)
   → Não ganha bônus (bônus é para cartas defensivas)

   Total style = 0
   ```

4. **Priority Final:**
   ```
   priority = 97 + 0 + 0 = 97
   (normalizado: min(max(97, 0), 100) = 97)
   ```

**Avaliando 7 de Espadas (7♠ - não-trunfo):**

1. **Hand Strength:**
   ```
   cardStrength = 10
   cardPoints = 10
   trumpBonus = 0
   cardsCanWin = 6 (todos os trunfos)
   riskFactor = 6/24 = 0.25

   score_base = (10 × 5) + (10 × 2) = 70
   score_final = 70 × (1 - 0.25 × 0.5) = 70 × 0.875 = 61
   ```

2. **Context + Style:**
   ```
   (similar ao anterior, sem bônus)
   Total = 0
   ```

3. **Priority Final:**
   ```
   priority = 61
   ```

**Avaliando Rei de Ouros (K♦ - não-trunfo, não-sequência):**

1. **Hand Strength:**
   ```
   score_base = (9 × 5) + (4 × 2) = 53
   riskFactor similar
   score_final ≈ 46
   ```

2. **Style Adjustment:**
   ```
   Contra AGGRESSIVE, esta carta vale 4 pontos
   → Não é tão defensiva quanto seria ideal
   Ajuste mínimo
   ```

3. **Priority Final:**
   ```
   priority ≈ 48
   ```

**Ranking Final:**
```
1. A♥ (trunfo) - Priority: 97
2. 7♠          - Priority: 61
3. K♦          - Priority: 48

Recomendação: A♥
```

---

## Geração de Explicações

### Arquivo: `lib/bisca/recommendation-engine.ts`

### Função: `generateRecommendationReason()`

**Objetivo:** Criar explicação em linguagem natural da recomendação.

#### Estrutura da Explicação

```
[Razão principal] [Contexto da rodada] [Situação do jogo] [Avaliação de risco]
```

#### Razões Principais (isFirstPlay = true)

| Condição | Texto |
|----------|-------|
| Carta fraca sem valor | "Carta fraca ideal para abrir a rodada" |
| Carta valiosa E ganhando | "Você está à frente, pode arriscar ganhar pontos" |
| Trunfo forte | "Trunfo forte para garantir pontos" |

#### Razões Principais (isFirstPlay = false)

| Condição | Texto |
|----------|-------|
| Muitos pontos na mesa E carta forte | "X pontos em jogo, vale tentar ganhar" |
| Muitos pontos na mesa E carta fraca | "Muitos pontos em jogo, melhor não arriscar carta boa" |
| Sem pontos na mesa | "Sem pontos na rodada, economize cartas fortes" |

#### Considerações de Jogo

| Condição | Texto |
|----------|-------|
| Perdendo E poucas cartas | "Você está atrás, precisa ser mais agressivo" |
| Risco VERY_LOW | "Jogada segura" |
| Risco VERY_HIGH | "Jogada arriscada, mas pode valer a pena" |
| Alta prob. trunfo E carta valiosa | "Cuidado: alta chance do oponente ter trunfo" |

#### Exemplo de Geração

**Input:**
```typescript
card = { rank: 'A', suit: 'hearts', points: 11 }
context = {
  roundPoints: 15,
  isFirstPlay: false,
  isWinning: false,
  remainingPoints: 35,
  riskLevel: RiskLevel.HIGH,
  trumpProbability: 45
}
trump = { rank: 'K', suit: 'hearts', points: 4 }
```

**Processamento:**
```typescript
const reasons: string[] = [];

// É trunfo forte + muitos pontos na mesa
if (!isFirstPlay && roundPoints >= 15) {
  if (isTrump(card, trump) || cardStrength >= 9) {
    reasons.push("15 pontos em jogo, vale tentar ganhar");
  }
}

// Está perdendo + poucas cartas
if (!isWinning && remainingPoints < 40) {
  reasons.push("Você está atrás, precisa ser mais agressivo");
}

// Risco alto
if (riskLevel === RiskLevel.HIGH) {
  // (Não adiciona texto específico para HIGH, apenas VERY_HIGH/VERY_LOW)
}

// Probabilidade de trunfo
if (trumpProbability > 70 && !cardIsTrump && cardPoints >= 10) {
  // 45% não passa do threshold de 70%
}
```

**Output:**
```
"15 pontos em jogo, vale tentar ganhar. Você está atrás, precisa ser mais agressivo."
```

---

## Casos de Uso e Exemplos

### Caso 1: Início de Jogo

**Situação:**
- Rodada 1
- Nenhuma carta jogada ainda
- Mão: [A♥, 7♠, 6♣]
- Trunfo: ♥

**Análise:**
```
A♥ (trunfo):
  - handStrength: 97 (excelente)
  - isFirstPlay: true
  - É carta valiosa
  - Risco: MEDIUM (é primeira, mas vale 11)
  - Priority: 92
  - Razão: "Trunfo forte para garantir pontos"

7♠:
  - handStrength: 61
  - isFirstPlay: true
  - Carta valiosa
  - Risco: HIGH (não é trunfo)
  - Priority: 58
  - Razão: "Carta de alto valor, mas cuidado com trunfos"

6♣:
  - handStrength: 18
  - isFirstPlay: true
  - Carta fraca sem valor
  - Risco: VERY_LOW
  - Priority: 75 (ganha bônus de primeira jogada)
  - Razão: "Carta fraca ideal para abrir a rodada"
```

**Recomendação:** 6♣
**Estratégia:** Conservar cartas valiosas, abrir com carta descartável

---

### Caso 2: Meio de Jogo - Muitos Pontos na Mesa

**Situação:**
- Rodada 8
- Cards na mesa: 7♥ (oponente)
- Pontos na mesa: 10
- Mão: [A♦, K♠, 4♣]
- Trunfo: ♥
- Estilo oponente: DEFENSIVE (65%)

**Análise:**
```
A♦ (não-trunfo, não-sequência):
  - handStrength: 58 (muitos trunfos restantes)
  - roundPoints: 10
  - Carta valiosa mas não vence trunfo
  - Risco: VERY_HIGH
  - Priority: 55
  - Razão: "11 pontos em jogo, mas alta chance do oponente ter trunfo. Arriscado."

K♠:
  - handStrength: 42
  - Não vence trunfo
  - Risco: HIGH
  - Priority: 40
  - Razão: "Muitos pontos em jogo, melhor não arriscar carta boa"

4♣:
  - handStrength: 12
  - Carta fraca
  - Risco: VERY_LOW
  - Priority: 78 (ganha bônus contra defensivo)
  - Razão: "Oponente joga defensivo, economize cartas. Sem chances de ganhar a rodada."
```

**Recomendação:** 4♣
**Estratégia:** Contra oponente defensivo que jogou 7 (alto valor), preservar cartas valiosas

---

### Caso 3: Final de Jogo - Perdendo

**Situação:**
- Rodada 18 (poucas cartas restantes)
- Pontos usuário: 48
- Pontos oponente: 58
- Mão: [K♥, Q♦]
- Trunfo: ♥
- Cartas restantes: 8

**Análise:**
```
K♥ (trunfo):
  - handStrength: 84
  - Perdendo por 10 pontos
  - Poucos pontos restantes (~12)
  - Precisa ganhar para recuperar
  - Priority: 92
  - Razão: "Você está atrás, precisa ser mais agressivo. Trunfo forte."

Q♦:
  - handStrength: 38
  - Não é trunfo
  - Muito arriscado
  - Priority: 35
  - Razão: "Perdendo e sem força para garantir vitória"
```

**Recomendação:** K♥
**Estratégia:** Agressividade necessária para recuperar pontos

---

## Calibração e Tuning

### Parâmetros Ajustáveis

#### 1. Pesos da Fórmula de Força

```typescript
// Atual
score = (cardStrength × 5) + (cardPoints × 2) + trumpBonus - riskPenalty

// Ajustável
const STRENGTH_WEIGHT = 5;   // ↑ = prioriza força, ↓ = prioriza pontos
const POINTS_WEIGHT = 2;      // ↑ = prioriza pontos, ↓ = prioriza força
const TRUMP_BONUS = 20;       // ↑ = favorece trunfos, ↓ = atenua
const RISK_MULTIPLIER = 0.5;  // ↑ = mais conservador, ↓ = mais agressivo
```

#### 2. Thresholds de Estilo

```typescript
// Atual
const AGGRESSIVE_THRESHOLD = 0.6;  // 60%
const DEFENSIVE_THRESHOLD = 0.6;   // 60%
const MIN_PLAYS = 3;

// Ajustável
// ↑ THRESHOLD = mais difícil classificar como extremo
// ↓ THRESHOLD = classifica mais facilmente
// ↑ MIN_PLAYS = mais dados necessários
```

#### 3. Níveis de Risco

```typescript
// Thresholds atuais
const RISK_HIGH_POINTS = 10;          // Ás ou 7
const RISK_MEDIUM_STRENGTH = 9;       // Rei ou mais
const RISK_LOW_STRENGTH = 5;          // 6 ou menos
const TRUMP_PROB_VERY_HIGH = 60;      // %
const TRUMP_PROB_HIGH = 40;           // %
```

### Testes de Validação

#### Cenário de Teste 1: Primeira Jogada

```typescript
const testCase = {
  hand: [
    { rank: 'A', suit: 'hearts', points: 11 },  // Trunfo forte
    { rank: '6', suit: 'clubs', points: 0 }     // Carta fraca
  ],
  trump: { rank: 'K', suit: 'hearts', points: 4 },
  round: { playedCards: [] },
  expected: '6 de clubs' // Deve recomendar carta fraca
};
```

**Resultado Esperado:** Carta fraca (6♣) para preservar trunfo

#### Cenário de Teste 2: Contra Agressivo

```typescript
const testCase = {
  hand: [
    { rank: 'A', suit: 'spades', points: 11 },
    { rank: '4', suit: 'diamonds', points: 0 }
  ],
  opponentStyle: { style: 'AGGRESSIVE', confidence: 75 },
  expected: '4 de diamonds' // Deve recomendar defensivo
};
```

**Resultado Esperado:** Jogada defensiva contra agressivo

---

## Limitações e Melhorias Futuras

### Limitações Atuais

1. **Heurísticas Fixas**
   - Não aprende com jogos anteriores
   - Pesos são fixos, não adaptativos

2. **Análise de Estilo Simples**
   - Apenas 3 jogadas para determinar
   - Não considera evolução durante o jogo
   - Não detecta bluffs ou mudanças táticas

3. **Sem Simulação**
   - Não simula jogadas futuras
   - Não calcula árvore de possibilidades
   - Avaliação apenas da jogada imediata

4. **Probabilidades Simplificadas**
   - Assume distribuição uniforme de cartas
   - Não considera histórico de jogadas
   - Não usa inferência bayesiana

### Melhorias Futuras

#### Fase 1: Machine Learning

```
1. Coletar dados de jogos reais
2. Treinar modelo de classificação de estilo
3. Treinar modelo de recomendação
4. Validar com partidas de teste
```

**Algoritmos Candidatos:**
- Random Forest para classificação de estilo
- Neural Network para avaliação de jogadas
- Reinforcement Learning para estratégia ótima

#### Fase 2: Simulação Monte Carlo

```typescript
function simulateMoves(
  gameState: GameState,
  possibleMoves: Card[],
  numSimulations: 1000
): Recommendation[] {
  const results = possibleMoves.map(move => {
    let wins = 0;

    for (let i = 0; i < numSimulations; i++) {
      const simulation = simulateGame(gameState, move);
      if (simulation.userWins) wins++;
    }

    return {
      card: move,
      winRate: wins / numSimulations,
      priority: (wins / numSimulations) * 100
    };
  });

  return results.sort((a, b) => b.winRate - a.winRate);
}
```

#### Fase 3: Inferência Bayesiana

```
P(oponente tem carta X | histórico de jogadas)

Atualizar probabilidades a cada jogada:
- Se jogou carta fraca quando tinha forte → defensivo
- Se não jogou trunfo quando perdeu → não tem trunfo
- Se sempre vence quando possível → tem cartas fortes
```

#### Fase 4: Análise de Partidas Completas

```typescript
type GameAnalysis = {
  optimalPlays: number;
  suboptimalPlays: number;
  mistakes: Mistake[];
  suggestions: Suggestion[];
  finalScore: number;
  potentialScore: number; // Se jogasse otimamente
};

function analyzeGame(gameHistory: GameState[]): GameAnalysis {
  // Analisa cada jogada retroativamente
  // Compara com jogada ótima
  // Identifica erros críticos
  // Sugere melhorias
}
```

---

## Glossário de Termos

| Termo | Definição |
|-------|-----------|
| **handStrength** | Score de força da carta (0-100) |
| **priority** | Score final de recomendação (0-100) |
| **riskLevel** | Classificação de risco (VERY_LOW a VERY_HIGH) |
| **trumpProbability** | Probabilidade de oponente ter trunfo (0-100%) |
| **styleAnalysis** | Análise acumulada do padrão de jogo |
| **confidence** | Confiança na classificação de estilo (0-100%) |
| **aggressiveRatio** | Proporção de jogadas agressivas |
| **defensiveRatio** | Proporção de jogadas defensivas |
| **adjustmentFactor** | Multiplicador de ajuste baseado em estilo (0-1) |
| **remainingCards** | Cartas ainda não jogadas |
| **roundPoints** | Pontos acumulados na rodada atual |
| **pointsAtStake** | Total de pontos em risco (rodada + carta) |

---

**Última Atualização:** 04/01/2025
**Mantido por:** Desenvolvimento Bisca Assistant
