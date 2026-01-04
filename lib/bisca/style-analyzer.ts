import {
  StyleAnalysis,
  Card,
  PlayedCard,
  PlayStyle,
  PlayerId,
  Round,
} from './types';
import { CARD_STRENGTH, CARD_POINTS, isTrump } from './deck';

/**
 * Analyzes a play to determine if it's aggressive or defensive
 */
type PlayType = 'aggressive' | 'defensive' | 'neutral';

const analyzePlayType = (
  playedCard: Card,
  round: Round,
  trump: Card | null,
  playerHand: Card[]
): PlayType => {
  const playedCardPoints = CARD_POINTS[playedCard.rank] ?? 0;
  const playedCardStrength = CARD_STRENGTH[playedCard.rank] ?? 0;

  // Analyze round context
  const isFirstPlay = round.playedCards.length === 0;
  const roundPoints = round.playedCards.reduce(
    (sum, pc) => sum + pc.card.points,
    0
  );

  // Aggressive play: played card with points or strong card
  if (playedCardPoints >= 10) {
    // Played Ace or 7 (cards with many points)
    return 'aggressive';
  }

  if (playedCardStrength >= 9 && isTrump(playedCard, trump)) {
    // Played strong trump (King or better)
    return 'aggressive';
  }

  if (!isFirstPlay && roundPoints >= 10 && playedCardStrength >= 7) {
    // Tried to win round with high points
    return 'aggressive';
  }

  // Defensive play: played weak card when had strong cards
  const hasStrongCards = playerHand.some(
    (c) => (CARD_STRENGTH[c.rank] ?? 0) >= 9 || (CARD_POINTS[c.rank] ?? 0) >= 10
  );

  if (playedCardStrength <= 5 && hasStrongCards && roundPoints >= 10) {
    // Played weak card while having strong ones, with points in round
    return 'defensive';
  }

  if (playedCardPoints === 0 && playedCardStrength <= 6) {
    // Played card without points and weak
    return 'defensive';
  }

  return 'neutral';
};

/**
 * Updates a player's style analysis based on a new play
 */
export const updateStyleAnalysis = (
  currentAnalysis: StyleAnalysis,
  newPlay: PlayedCard,
  round: Round,
  trump: Card | null,
  playerHand: Card[]
): StyleAnalysis => {
  const playType = analyzePlayType(newPlay.card, round, trump, playerHand);

  let aggressivePlays = currentAnalysis.patterns.aggressivePlays;
  let defensivePlays = currentAnalysis.patterns.defensivePlays;

  if (playType === 'aggressive') {
    aggressivePlays++;
  } else if (playType === 'defensive') {
    defensivePlays++;
  }

  const totalPlays = currentAnalysis.patterns.totalPlays + 1;

  // Determine style based on proportions
  let style = PlayStyle.UNDETERMINED;
  let confidence = 0;

  if (totalPlays >= 3) {
    // Need at least 3 plays to have an analysis
    const aggressiveRatio = aggressivePlays / totalPlays;
    const defensiveRatio = defensivePlays / totalPlays;

    if (aggressiveRatio >= 0.6) {
      style = PlayStyle.AGGRESSIVE;
      confidence = Math.min(100, Math.round(aggressiveRatio * 100));
    } else if (defensiveRatio >= 0.6) {
      style = PlayStyle.DEFENSIVE;
      confidence = Math.min(100, Math.round(defensiveRatio * 100));
    } else {
      style = PlayStyle.BALANCED;
      confidence = Math.round(
        (1 - Math.abs(aggressiveRatio - defensiveRatio)) * 100
      );
    }
  }

  return {
    playerId: currentAnalysis.playerId,
    style,
    confidence,
    patterns: {
      aggressivePlays,
      defensivePlays,
      totalPlays,
    },
  };
};

/**
 * Creates an initial style analysis
 */
export const createInitialStyleAnalysis = (
  playerId: PlayerId
): StyleAnalysis => {
  return {
    playerId,
    style: PlayStyle.UNDETERMINED,
    confidence: 0,
    patterns: {
      aggressivePlays: 0,
      defensivePlays: 0,
      totalPlays: 0,
    },
  };
};

/**
 * Analyzes all of a player's plays so far
 */
export const analyzeCompleteStyle = (
  playerId: PlayerId,
  rounds: Round[],
  trump: Card | null,
  currentHand: Card[]
): StyleAnalysis => {
  let analysis = createInitialStyleAnalysis(playerId);

  for (const round of rounds) {
    const playerPlay = round.playedCards.find(
      (pc) => pc.playerId === playerId
    );

    if (playerPlay) {
      // For historical analysis, we use current hand as approximation
      // In a real system, you would store the hand from each round
      analysis = updateStyleAnalysis(
        analysis,
        playerPlay,
        round,
        trump,
        currentHand
      );
    }
  }

  return analysis;
};

/**
 * Generates textual description of the style
 */
export const describeStyle = (analysis: StyleAnalysis): string => {
  if (analysis.confidence < 40) {
    return 'Padrão de jogo ainda indeterminado. Preciso de mais jogadas para análise.';
  }

  switch (analysis.style) {
    case PlayStyle.AGGRESSIVE:
      return `Jogador agressivo (${analysis.confidence}% confiança). Tende a jogar cartas fortes para ganhar pontos.`;
    case PlayStyle.DEFENSIVE:
      return `Jogador defensivo (${analysis.confidence}% confiança). Tende a preservar cartas fortes e jogar cartas fracas.`;
    case PlayStyle.BALANCED:
      return `Jogador equilibrado (${analysis.confidence}% confiança). Alterna entre jogadas agressivas e defensivas.`;
    default:
      return 'Padrão de jogo ainda indeterminado.';
  }
};

/**
 * Calculates recommendation adjustment based on opponent's style
 */
export const calculateStyleAdjustment = (
  opponentStyle: PlayStyle,
  confidence: number
): {
  preferAggressive: boolean;
  preferDefensive: boolean;
  adjustmentFactor: number;
} => {
  // Only adjust if there's reasonable confidence
  if (confidence < 50) {
    return {
      preferAggressive: false,
      preferDefensive: false,
      adjustmentFactor: 0,
    };
  }

  const adjustmentFactor = confidence / 100;

  switch (opponentStyle) {
    case PlayStyle.AGGRESSIVE:
      // Against aggressive player, can be defensive
      return {
        preferAggressive: false,
        preferDefensive: true,
        adjustmentFactor,
      };

    case PlayStyle.DEFENSIVE:
      // Against defensive player, be aggressive
      return {
        preferAggressive: true,
        preferDefensive: false,
        adjustmentFactor,
      };

    case PlayStyle.BALANCED:
      // Against balanced, maintain balance
      return {
        preferAggressive: false,
        preferDefensive: false,
        adjustmentFactor: adjustmentFactor * 0.5,
      };

    default:
      return {
        preferAggressive: false,
        preferDefensive: false,
        adjustmentFactor: 0,
      };
  }
};
