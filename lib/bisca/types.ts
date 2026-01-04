/**
 * Types for the Bisca card game
 */

/**
 * Card suits in a Bisca deck
 */
export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  SPADES = 'spades',
  CLUBS = 'clubs',
}

/**
 * Card values in Bisca (without 8, 9, 10)
 */
export enum Rank {
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

/**
 * Representation of a playing card
 */
export type Card = {
  rank: Rank;
  suit: Suit;
  points: number;
};

/**
 * Player identifier
 */
export type PlayerId = 'player1' | 'player2' | 'player3' | 'player4';

/**
 * Team identifier (for 4-player mode)
 */
export type TeamId = 'team1' | 'team2';

/**
 * Team information (4-player mode)
 * Team 1: player1 + player3
 * Team 2: player2 + player4
 */
export type Team = {
  id: TeamId;
  name: string;
  points: number;
  wonCards: Card[];
  playerIds: PlayerId[];
};

/**
 * Player information
 */
export type Player = {
  id: PlayerId;
  name: string;
  points: number;
  wonCards: Card[];
  numberOfCardsInHand: number;
  isUser: boolean; // true if this is the main user
};

/**
 * Game configuration
 */
export type GameConfiguration = {
  numberOfPlayers: 2 | 4;
  playerNames: string[];
  userId: PlayerId;
  trump?: Card | null;
};

/**
 * Card played in a round
 */
export type PlayedCard = {
  card: Card;
  playerId: PlayerId;
  order: number; // play order in the round (1, 2, 3, 4)
};

/**
 * Game round
 */
export type Round = {
  number: number;
  playedCards: PlayedCard[];
  winner: PlayerId | null;
  pointsWon: number;
  complete: boolean;
};

/**
 * Detected play style
 */
export enum PlayStyle {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced',
  UNDETERMINED = 'undetermined',
}

/**
 * Player style analysis
 */
export type StyleAnalysis = {
  playerId: PlayerId;
  style: PlayStyle;
  confidence: number; // 0-100
  patterns: {
    aggressivePlays: number;
    defensivePlays: number;
    totalPlays: number;
  };
};

/**
 * Risk level of a play
 */
export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

/**
 * Play recommendation
 */
export type Recommendation = {
  card: Card;
  priority: number; // 0-100 (higher is more recommended)
  reason: string;
  riskLevel: RiskLevel;
  winProbability: number; // 0-100
  details: {
    handStrength: number; // 0-100
    remainingCards: number;
    trumpProbability: number; // chance of opponent having trump
    pointsAtStake: number;
  };
};

/**
 * Game status
 */
export enum GameStatus {
  SETUP = 'setup',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

/**
 * Complete game state
 */
export type GameState = {
  status: GameStatus;
  configuration: GameConfiguration;
  players: Record<PlayerId, Player>;
  teams?: Record<TeamId, Team> | undefined; // Only for 4-player mode
  trump: Card | null;
  rounds: Round[];
  currentRound: Round | null;
  nextPlayer: PlayerId | null;
  firstPlayer: PlayerId | null; // First player of the entire game (set on first card played)
  cardsInDeck: number;
  playedCards: Card[];
  userHand: Card[];
  winner: PlayerId | TeamId | null; // Can be team winner in 4-player mode
  styleAnalyses: Record<PlayerId, StyleAnalysis>;
  currentRecommendation: Recommendation | null;
};

/**
 * User action
 */
export type UserAction =
  | { type: 'START_GAME'; configuration: GameConfiguration }
  | { type: 'REGISTER_PLAYED_CARD'; playerId: PlayerId; card: Card }
  | { type: 'UPDATE_USER_HAND'; cards: Card[] }
  | { type: 'REQUEST_RECOMMENDATION' }
  | { type: 'FINALIZE_ROUND' }
  | { type: 'RESET_GAME' };

/**
 * Action result
 */
export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};
