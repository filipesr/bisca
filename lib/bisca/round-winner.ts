import { Card, PlayedCard, PlayerId } from './types';
import { compareCards } from './deck';

/**
 * Result of current winner calculation for an incomplete round
 */
export type CurrentWinnerResult = {
  winningCard: PlayedCard;
  winnerId: PlayerId;
  reason: string;
} | null;

/**
 * Calculates who is currently winning an incomplete round
 * Returns null if no cards have been played yet
 */
export const getCurrentWinner = (
  playedCards: PlayedCard[],
  trump: Card | null
): CurrentWinnerResult => {
  if (playedCards.length === 0) {
    return null;
  }

  // Sort cards by play order (who played first)
  const sortedCards = [...playedCards].sort((a, b) => a.order - b.order);

  // First card sets the leading suit
  const firstPlayedCard = sortedCards[0];
  if (!firstPlayedCard) return null;

  const leadingSuit = firstPlayedCard.card.suit;
  const trumpSuit = trump?.suit ?? null;

  // Start with first card as winner
  let winningCard = firstPlayedCard;
  let winningPlayerId = firstPlayedCard.playerId;

  // Compare each subsequent card
  for (let i = 1; i < sortedCards.length; i++) {
    const currentCard = sortedCards[i];
    if (!currentCard) continue;

    const comparison = compareCards(
      currentCard.card,
      winningCard.card,
      trump,
      firstPlayedCard.card
    );

    // If current card is stronger, it becomes the new winner
    if (comparison > 0) {
      winningCard = currentCard;
      winningPlayerId = currentCard.playerId;
    }
  }

  // Generate explanation for why this card is winning
  const reason = generateWinningReason(
    winningCard.card,
    leadingSuit,
    trumpSuit,
    playedCards.length
  );

  return {
    winningCard,
    winnerId: winningPlayerId,
    reason,
  };
};

/**
 * Generates human-readable explanation for why a card is winning
 */
const generateWinningReason = (
  card: Card,
  leadingSuit: string,
  trumpSuit: string | null,
  totalCards: number
): string => {
  const cardName = `${card.rank}${getSuitSymbol(card.suit)}`;

  // If it's a trump card
  if (trumpSuit && card.suit === trumpSuit) {
    if (totalCards === 1) {
      return `${cardName} - única carta jogada`;
    }
    return `${cardName} vence - trunfo mais forte`;
  }

  // If it's the leading suit
  if (card.suit === leadingSuit) {
    if (totalCards === 1) {
      return `${cardName} - primeira carta (define o naipe)`;
    }
    return `${cardName} vence - mais forte do naipe`;
  }

  // This shouldn't happen if logic is correct, but just in case
  return `${cardName} vence`;
};

/**
 * Converts suit name to symbol
 */
const getSuitSymbol = (suit: string): string => {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'spades':
      return '♠';
    case 'clubs':
      return '♣';
    default:
      return suit;
  }
};
