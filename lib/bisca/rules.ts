import { Card, PlayerId, Round, TeamId } from './types';
import { compareCards, calculatePoints } from './deck';

/**
 * Gets the team ID for a given player
 * Team 1: player1 + player3
 * Team 2: player2 + player4
 */
export const getTeamIdByPlayerId = (playerId: PlayerId): TeamId => {
  if (playerId === 'player1' || playerId === 'player3') {
    return 'team1';
  }
  return 'team2';
};

/**
 * Determines the winner of a round
 */
export const determineRoundWinner = (
  round: Round,
  trump: Card | null
): { winner: PlayerId; pointsWon: number } | null => {
  if (round.playedCards.length === 0) {
    return null;
  }

  // Sort played cards by play order
  const orderedCards = [...round.playedCards].sort((a, b) => a.order - b.order);

  const firstCard = orderedCards[0];
  if (!firstCard) {
    return null;
  }

  let winningCard = firstCard;

  // Compare each card with the current winner
  for (const playedCard of orderedCards.slice(1)) {
    const result = compareCards(
      playedCard.card,
      winningCard.card,
      trump,
      firstCard.card
    );

    if (result > 0) {
      winningCard = playedCard;
    }
  }

  // Calculate points won
  const allCards = orderedCards.map((pc) => pc.card);
  const pointsWon = calculatePoints(allCards);

  return {
    winner: winningCard.playerId,
    pointsWon,
  };
};

/**
 * Validates if a card can be played
 * In Bisca, there are no restrictions - any card from hand can be played
 */
export const validatePlay = (card: Card, hand: Card[]): boolean => {
  return hand.some((c) => c.rank === card.rank && c.suit === card.suit);
};

/**
 * Determines play order in a 2-player round
 */
export const determine2PlayerPlayOrder = (
  previousRoundWinner: PlayerId | null
): PlayerId[] => {
  if (!previousRoundWinner) {
    // First round: player 1 starts
    return ['player1', 'player2'];
  }

  // Previous round winner starts
  const other: PlayerId = previousRoundWinner === 'player1' ? 'player2' : 'player1';
  return [previousRoundWinner, other];
};

/**
 * Determines play order in a 4-player round
 */
export const determine4PlayerPlayOrder = (
  previousRoundWinner: PlayerId | null,
  firstPlayerOfMatch: PlayerId = 'player1'
): PlayerId[] => {
  const completeOrder: PlayerId[] = ['player1', 'player2', 'player3', 'player4'];

  if (!previousRoundWinner) {
    // First round: default order starting from first player
    const index = completeOrder.indexOf(firstPlayerOfMatch);
    return [...completeOrder.slice(index), ...completeOrder.slice(0, index)];
  }

  // Previous round winner starts
  const index = completeOrder.indexOf(previousRoundWinner);
  return [...completeOrder.slice(index), ...completeOrder.slice(0, index)];
};

/**
 * Determines play order based on number of players
 * firstPlayerOfGame can be null if first player hasn't been determined yet
 */
export const determinePlayOrder = (
  numberOfPlayers: 2 | 4,
  previousRoundWinner: PlayerId | null,
  firstPlayerOfGame: PlayerId | null = null
): PlayerId[] => {
  if (numberOfPlayers === 2) {
    return determine2PlayerPlayOrder(previousRoundWinner);
  }

  // If firstPlayerOfGame is null, return default order (will be reordered after first play)
  return determine4PlayerPlayOrder(previousRoundWinner, firstPlayerOfGame ?? 'player1');
};

/**
 * Checks if the game is over
 * The game ends when all cards have been played
 */
export const checkGameEnd = (
  playedCards: Card[]
): boolean => {
  // Total cards in deck
  const totalCards = 40;
  return playedCards.length === totalCards;
};

/**
 * Determines the game winner based on score
 */
export const determineGameWinner = (
  playersPoints: Record<PlayerId, number>,
  numberOfPlayers: 2 | 4
): PlayerId | null => {
  if (numberOfPlayers === 2) {
    const points1 = playersPoints['player1'] ?? 0;
    const points2 = playersPoints['player2'] ?? 0;

    if (points1 > points2) return 'player1';
    if (points2 > points1) return 'player2';
    return null; // Tie
  }

  // 4 players: teams (1+3 vs 2+4)
  const team1Points = (playersPoints['player1'] ?? 0) + (playersPoints['player3'] ?? 0);
  const team2Points = (playersPoints['player2'] ?? 0) + (playersPoints['player4'] ?? 0);

  if (team1Points > team2Points) return 'player1'; // Represents team 1
  if (team2Points > team1Points) return 'player2'; // Represents team 2
  return null; // Tie
};

/**
 * Calculates how many cards each player should have in hand
 */
export const calculateCardsInHand = (
  currentRound: number,
  numberOfPlayers: 2 | 4
): number => {
  if (numberOfPlayers === 2) {
    // Each player starts with 3 cards, draws 1 after each round until deck is empty
    const initialCards = 3;
    const totalCards = 40;
    const distributedCards = initialCards * 2; // 6 cards
    const remainingCards = totalCards - distributedCards - (currentRound - 1) * 2;

    if (remainingCards >= 2) {
      return initialCards;
    }

    // Last rounds: decreasing
    return Math.max(0, initialCards - (currentRound - (totalCards / 2 - initialCards)));
  }

  // 4 players: 10 cards each, no draw
  return Math.max(0, 10 - (currentRound - 1));
};

/**
 * Checks if cards should be drawn from deck
 */
export const shouldDrawCards = (
  cardsInDeck: number,
  numberOfPlayers: 2 | 4
): boolean => {
  // In 2-player, draw while there are cards
  // In 4-player, don't draw (all cards are distributed at start)
  return numberOfPlayers === 2 && cardsInDeck > 0;
};
