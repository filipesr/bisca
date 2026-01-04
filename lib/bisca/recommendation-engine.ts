import {
  Card,
  GameState,
  RiskLevel,
  Recommendation,
} from './types';
import {
  CARD_STRENGTH,
  CARD_POINTS,
  isTrump,
  compareCards,
  createDeck,
  findCard,
} from './deck';
import { calculateRemainingPoints, calculateWinProbability } from './scoring';
import { calculateStyleAdjustment } from './style-analyzer';

/**
 * Calculates which cards are still in the game (haven't been played)
 */
const calculateRemainingCards = (playedCards: Card[]): Card[] => {
  const completeDeck = createDeck();

  return completeDeck.filter(
    (card) => findCard(playedCards, card) === -1
  );
};

/**
 * Calculates the probability of an opponent having trump
 */
const calculateTrumpProbability = (
  remainingCards: Card[],
  trump: Card | null,
  numberOfOpponents: number
): number => {
  if (!trump) return 0;

  const remainingTrumps = remainingCards.filter((c) =>
    isTrump(c, trump)
  ).length;

  if (remainingTrumps === 0) return 0;

  const unseenCards = remainingCards.length;
  const probabilityPerOpponent = remainingTrumps / unseenCards;

  // Probability of at least one opponent having trump
  const probability = 1 - Math.pow(1 - probabilityPerOpponent, numberOfOpponents);

  return Math.round(probability * 100);
};

/**
 * Evaluates the strength of a card in the current context
 */
const evaluateCardStrength = (
  card: Card,
  trump: Card | null,
  remainingCards: Card[]
): number => {
  const basePoints = CARD_POINTS[card.rank] ?? 0;
  const baseStrength = CARD_STRENGTH[card.rank] ?? 0;

  let score = baseStrength * 5 + basePoints * 2;

  // Bonus if it's trump
  if (isTrump(card, trump)) {
    score += 20;
  }

  // Calculate how many cards can beat this one
  const cardsThatCanWin = remainingCards.filter((c) => {
    return compareCards(c, card, trump, card) > 0;
  }).length;

  // Reduce score based on risk of being beaten
  const riskFactor = cardsThatCanWin / remainingCards.length;
  score *= 1 - riskFactor * 0.5;

  return Math.round(score);
};

/**
 * Determines the risk level of playing a card
 */
const determineRiskLevel = (
  card: Card,
  roundPoints: number,
  trumpProbability: number,
  trump: Card | null
): RiskLevel => {
  const cardPoints = CARD_POINTS[card.rank] ?? 0;
  const totalPointsAtRisk = cardPoints + roundPoints;

  const cardIsTrump = isTrump(card, trump);

  // Strong trump with many points in play = high risk
  if (cardIsTrump && totalPointsAtRisk >= 20 && trumpProbability > 50) {
    return RiskLevel.HIGH;
  }

  // Card with many points = medium/high risk
  if (cardPoints >= 10) {
    return trumpProbability > 60
      ? RiskLevel.VERY_HIGH
      : trumpProbability > 40
      ? RiskLevel.HIGH
      : RiskLevel.MEDIUM;
  }

  // Strong card but no points
  const strength = CARD_STRENGTH[card.rank] ?? 0;
  if (strength >= 9 && totalPointsAtRisk >= 15) {
    return RiskLevel.MEDIUM;
  }

  // Weak card = low risk
  if (strength <= 5 && cardPoints === 0) {
    return RiskLevel.VERY_LOW;
  }

  return RiskLevel.LOW;
};

/**
 * Generates reason for the recommendation
 */
const generateRecommendationReason = (
  card: Card,
  context: {
    roundPoints: number;
    isFirstPlay: boolean;
    isWinning: boolean;
    remainingPoints: number;
    riskLevel: RiskLevel;
    trumpProbability: number;
  },
  trump: Card | null
): string => {
  const cardPoints = CARD_POINTS[card.rank] ?? 0;
  const cardStrength = CARD_STRENGTH[card.rank] ?? 0;
  const cardIsTrump = isTrump(card, trump);

  const reasons: string[] = [];

  // First play
  if (context.isFirstPlay) {
    if (cardPoints === 0 && cardStrength <= 6) {
      reasons.push('Carta fraca ideal para abrir a rodada');
    } else if (cardPoints >= 10 && context.isWinning) {
      reasons.push('Você está à frente, pode arriscar ganhar pontos');
    } else if (cardIsTrump && cardStrength >= 9) {
      reasons.push('Trunfo forte para garantir pontos');
    }
  } else {
    // Responding to a play
    if (context.roundPoints >= 15) {
      if (cardIsTrump || cardStrength >= 9) {
        reasons.push(`${context.roundPoints} pontos em jogo, vale tentar ganhar`);
      } else if (cardPoints === 0 && cardStrength <= 5) {
        reasons.push('Muitos pontos em jogo, melhor não arriscar carta boa');
      }
    } else if (context.roundPoints === 0) {
      reasons.push('Sem pontos na rodada, economize cartas fortes');
    }
  }

  // Consider game situation
  if (!context.isWinning && context.remainingPoints < 40) {
    reasons.push('Você está atrás, precisa ser mais agressivo');
  }

  // Risk
  if (context.riskLevel === RiskLevel.VERY_LOW) {
    reasons.push('Jogada segura');
  } else if (context.riskLevel === RiskLevel.VERY_HIGH) {
    reasons.push('Jogada arriscada, mas pode valer a pena');
  }

  // Trump probability
  if (context.trumpProbability > 70 && !cardIsTrump && cardPoints >= 10) {
    reasons.push('Cuidado: alta chance do oponente ter trunfo');
  }

  return reasons.length > 0
    ? reasons.join('. ') + '.'
    : 'Jogada razoável no contexto atual.';
};

/**
 * Calculates recommendation for a specific card
 */
const calculateCardRecommendation = (
  card: Card,
  state: GameState,
  remainingCards: Card[],
  numberOfOpponents: number
): Recommendation => {
  const currentRound = state.currentRound;
  const isFirstPlay = !currentRound || currentRound.playedCards.length === 0;

  const roundPoints = currentRound
    ? currentRound.playedCards.reduce((sum, pc) => sum + pc.card.points, 0)
    : 0;

  const trumpProbability = calculateTrumpProbability(
    remainingCards,
    state.trump,
    numberOfOpponents
  );

  // Evaluate card strength
  const handStrength = evaluateCardStrength(card, state.trump, remainingCards);

  // Determine risk level
  const riskLevel = determineRiskLevel(
    card,
    roundPoints,
    trumpProbability,
    state.trump
  );

  // Calculate base priority
  let priority = handStrength;

  // Adjust based on context
  const userId = state.configuration.userId;
  const userPlayer = state.players[userId];
  const userPoints = userPlayer?.points ?? 0;

  // Calculate opponent(s) points
  const opponentsPoints = Object.values(state.players)
    .filter((p) => p.id !== userId)
    .reduce((sum, p) => sum + p.points, 0);

  const isWinning = userPoints > opponentsPoints / numberOfOpponents;
  const remainingPoints = calculateRemainingPoints(state.playedCards);

  // Adjust priority based on opponents' style
  const opponentsAnalyses = Object.values(state.styleAnalyses).filter(
    (a) => a.playerId !== userId
  );

  for (const analysis of opponentsAnalyses) {
    const adjustment = calculateStyleAdjustment(analysis.style, analysis.confidence);

    const cardPoints = CARD_POINTS[card.rank] ?? 0;
    const cardStrength = CARD_STRENGTH[card.rank] ?? 0;

    if (adjustment.preferAggressive && (cardPoints >= 10 || cardStrength >= 9)) {
      priority += 10 * adjustment.adjustmentFactor;
    } else if (adjustment.preferDefensive && cardPoints === 0 && cardStrength <= 6) {
      priority += 10 * adjustment.adjustmentFactor;
    }
  }

  // Normalize priority (0-100)
  priority = Math.max(0, Math.min(100, priority));

  // Calculate win probability if playing this card
  const winProbability = calculateWinProbability(
    userPoints,
    opponentsPoints / numberOfOpponents,
    remainingPoints
  );

  // Generate reason
  const reason = generateRecommendationReason(
    card,
    {
      roundPoints,
      isFirstPlay,
      isWinning,
      remainingPoints,
      riskLevel,
      trumpProbability,
    },
    state.trump
  );

  return {
    card,
    priority: Math.round(priority),
    reason,
    riskLevel,
    winProbability,
    details: {
      handStrength: Math.round(handStrength),
      remainingCards: remainingCards.length,
      trumpProbability,
      pointsAtStake: roundPoints + (CARD_POINTS[card.rank] ?? 0),
    },
  };
};

/**
 * Generates recommendations for all cards in hand
 */
export const generateRecommendations = (state: GameState): Recommendation[] => {
  const userHand = state.userHand;

  if (userHand.length === 0) {
    return [];
  }

  const remainingCards = calculateRemainingCards(state.playedCards);
  const numberOfOpponents = state.configuration.numberOfPlayers - 1;

  const recommendations = userHand.map((card) =>
    calculateCardRecommendation(card, state, remainingCards, numberOfOpponents)
  );

  // Sort by priority (highest first)
  return recommendations.sort((a, b) => b.priority - a.priority);
};

/**
 * Returns the best recommendation
 */
export const getBestRecommendation = (state: GameState): Recommendation | null => {
  const recommendations = generateRecommendations(state);
  return recommendations[0] ?? null;
};

/**
 * Explains why a specific card is good or bad
 */
export const explainCard = (
  card: Card,
  state: GameState
): string => {
  const remainingCards = calculateRemainingCards(state.playedCards);
  const numberOfOpponents = state.configuration.numberOfPlayers - 1;

  const recommendation = calculateCardRecommendation(
    card,
    state,
    remainingCards,
    numberOfOpponents
  );

  return `${recommendation.reason} (Prioridade: ${recommendation.priority}/100, Risco: ${recommendation.riskLevel})`;
};
