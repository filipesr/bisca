import { Card, Suit, Rank } from './types';

/**
 * Card points table in Bisca
 */
export const CARD_POINTS: Record<Rank, number> = {
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

/**
 * Card strength order (to determine winner)
 * Higher value = stronger card
 */
export const CARD_STRENGTH: Record<Rank, number> = {
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

/**
 * All possible values in a Bisca deck
 */
export const DECK_RANKS: Rank[] = [
  Rank.ACE,
  Rank.SEVEN,
  Rank.KING,
  Rank.JACK,
  Rank.QUEEN,
  Rank.SIX,
  Rank.FIVE,
  Rank.FOUR,
  Rank.THREE,
  Rank.TWO,
];

/**
 * All suits
 */
export const DECK_SUITS: Suit[] = [
  Suit.HEARTS,
  Suit.DIAMONDS,
  Suit.SPADES,
  Suit.CLUBS,
];

/**
 * Total points in a Bisca game
 */
export const TOTAL_POINTS = 120;

/**
 * Number of cards in the deck
 */
export const TOTAL_CARDS = 40;

/**
 * Creates a card
 */
export const createCard = (rank: Rank, suit: Suit): Card => ({
  rank,
  suit,
  points: CARD_POINTS[rank] ?? 0,
});

/**
 * Creates a complete Bisca deck (40 cards)
 */
export const createDeck = (): Card[] => {
  const deck: Card[] = [];

  for (const suit of DECK_SUITS) {
    for (const rank of DECK_RANKS) {
      deck.push(createCard(rank, suit));
    }
  }

  return deck;
};

/**
 * Shuffles an array (Fisher-Yates shuffle)
 */
export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    if (temp !== undefined && shuffled[j] !== undefined) {
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }
  }

  return shuffled;
};

/**
 * Compares two cards (for equality)
 */
export const cardsEqual = (card1: Card, card2: Card): boolean => {
  return card1.rank === card2.rank && card1.suit === card2.suit;
};

/**
 * Finds a card in an array
 */
export const findCard = (cards: Card[], target: Card): number => {
  return cards.findIndex((card) => cardsEqual(card, target));
};

/**
 * Removes a card from an array
 */
export const removeCard = (cards: Card[], target: Card): Card[] => {
  const index = findCard(cards, target);
  if (index === -1) {
    return cards;
  }

  return [...cards.slice(0, index), ...cards.slice(index + 1)];
};

/**
 * Calculates total points in a set of cards
 */
export const calculatePoints = (cards: Card[]): number => {
  return cards.reduce((total, card) => total + card.points, 0);
};

/**
 * Checks if a card is trump
 */
export const isTrump = (card: Card, trump: Card | null): boolean => {
  if (!trump) return false;
  return card.suit === trump.suit;
};

/**
 * Compares two cards and determines which is stronger
 * Returns: 1 if card1 wins, -1 if card2 wins, 0 if tie (shouldn't happen)
 */
export const compareCards = (
  card1: Card,
  card2: Card,
  trump: Card | null,
  firstCard: Card
): number => {
  const card1Trump = isTrump(card1, trump);
  const card2Trump = isTrump(card2, trump);

  // Trump always wins over non-trump
  if (card1Trump && !card2Trump) return 1;
  if (card2Trump && !card1Trump) return -1;

  // Both are trump: compare strength
  if (card1Trump && card2Trump) {
    const strength1 = CARD_STRENGTH[card1.rank] ?? 0;
    const strength2 = CARD_STRENGTH[card2.rank] ?? 0;
    return strength1 > strength2 ? 1 : strength1 < strength2 ? -1 : 0;
  }

  // Neither is trump: only cards of the same suit as first card compete
  const card1SameSuit = card1.suit === firstCard.suit;
  const card2SameSuit = card2.suit === firstCard.suit;

  // If only one is same suit as first, it wins
  if (card1SameSuit && !card2SameSuit) return 1;
  if (card2SameSuit && !card1SameSuit) return -1;

  // Both same suit or both different suits: compare strength
  if (card1SameSuit && card2SameSuit) {
    const strength1 = CARD_STRENGTH[card1.rank] ?? 0;
    const strength2 = CARD_STRENGTH[card2.rank] ?? 0;
    return strength1 > strength2 ? 1 : strength1 < strength2 ? -1 : 0;
  }

  // Both different suits from first: first played wins
  return 0;
};

/**
 * Converts a card to a readable string
 */
export const cardToString = (card: Card): string => {
  const symbols: Record<Suit, string> = {
    [Suit.HEARTS]: '♥️',
    [Suit.DIAMONDS]: '♦️',
    [Suit.SPADES]: '♠️',
    [Suit.CLUBS]: '♣️',
  };

  return `${card.rank}${symbols[card.suit] ?? ''}`;
};

/**
 * Converts string to card (parsing)
 */
export const stringToCard = (str: string): Card | null => {
  const symbols: Record<string, Suit> = {
    '♥️': Suit.HEARTS,
    '♥': Suit.HEARTS,
    '♦️': Suit.DIAMONDS,
    '♦': Suit.DIAMONDS,
    '♠️': Suit.SPADES,
    '♠': Suit.SPADES,
    '♣️': Suit.CLUBS,
    '♣': Suit.CLUBS,
  };

  // Extract rank and suit
  const match = str.match(/^([AKQJ0-9]+)(♥️|♥|♦️|♦|♠️|♠|♣️|♣)$/);
  if (!match) return null;

  const rankStr = match[1];
  const suitStr = match[2];

  const rank = Object.values(Rank).find((v) => v === rankStr);
  const suit = suitStr ? symbols[suitStr] : undefined;

  if (!rank || !suit) return null;

  return createCard(rank, suit);
};
