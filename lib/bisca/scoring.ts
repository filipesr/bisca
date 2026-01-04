import { Card, Player, PlayerId, Round } from './types';
import { calculatePoints, TOTAL_POINTS } from './deck';

/**
 * Atualiza a pontuação de um jogador
 */
export const updateScore = (
  jogador: Player,
  wonCards: Card[]
): Player => {
  const points = calculatePoints(wonCards);

  return {
    ...jogador,
    points,
    wonCards,
  };
};

/**
 * Calcula o percentage de points de um jogador
 */
export const calculatePointsPercentage = (points: number): number => {
  return Math.round((points / TOTAL_POINTS) * 100);
};

/**
 * Determina se um jogador está ganhando
 */
export const isWinning = (
  playerPoints: number,
  opponentPoints: number
): boolean => {
  return playerPoints > opponentPoints;
};

/**
 * Calcula a diferença de points
 */
export const calculatePointsDifference = (
  playerPoints: number,
  opponentPoints: number
): number => {
  return playerPoints - opponentPoints;
};

/**
 * Calcula points restantes no jogo
 */
export const calculateRemainingPoints = (
  cartasJogadas: Card[]
): number => {
  const playedPoints = calculatePoints(cartasJogadas);
  return TOTAL_POINTS - playedPoints;
};

/**
 * Calcula estatísticas de um jogador
 */
export type PlayerStatistics = {
  points: number;
  percentage: number;
  roundsWon: number;
  totalRounds: number;
  winRate: number;
  averagePointsPerRound: number;
};

export const calculateStatistics = (
  jogador: Player,
  rodadas: Round[]
): PlayerStatistics => {
  const roundsWon = rodadas.filter(
    (r) => r.winner === jogador.id && r.complete
  ).length;

  const completedRounds = rodadas.filter((r) => r.complete).length;

  const winRate = completedRounds > 0
    ? Math.round((roundsWon / completedRounds) * 100)
    : 0;

  const averagePointsPerRound = roundsWon > 0
    ? Math.round(jogador.points / roundsWon)
    : 0;

  return {
    points: jogador.points,
    percentage: calculatePointsPercentage(jogador.points),
    roundsWon,
    totalRounds: completedRounds,
    winRate,
    averagePointsPerRound,
  };
};

/**
 * Calcula placar para jogo de 2 jogadores
 */
export type TwoPlayerScore = {
  jogador1: PlayerStatistics;
  jogador2: PlayerStatistics;
  difference: number;
  leader: PlayerId | null;
  remainingPoints: number;
};

export const calcularTwoPlayerScore = (
  jogador1: Player,
  jogador2: Player,
  rodadas: Round[],
  cartasJogadas: Card[]
): TwoPlayerScore => {
  const stats1 = calculateStatistics(jogador1, rodadas);
  const stats2 = calculateStatistics(jogador2, rodadas);

  const difference = calculatePointsDifference(jogador1.points, jogador2.points);

  let leader: PlayerId | null = null;
  if (jogador1.points > jogador2.points) leader = 'jogador1';
  else if (jogador2.points > jogador1.points) leader = 'jogador2';

  return {
    jogador1: stats1,
    jogador2: stats2,
    difference: Math.abs(difference),
    leader,
    remainingPoints: calculateRemainingPoints(cartasJogadas),
  };
};

/**
 * Calcula placar para jogo de 4 jogadores (equipes)
 */
export type FourPlayerScore = {
  team1: {
    points: number;
    percentage: number;
    jogadores: [PlayerStatistics, PlayerStatistics];
  };
  team2: {
    points: number;
    percentage: number;
    jogadores: [PlayerStatistics, PlayerStatistics];
  };
  difference: number;
  leader: 'team1' | 'team2' | null;
  remainingPoints: number;
};

export const calcularFourPlayerScore = (
  jogadores: Record<PlayerId, Player>,
  rodadas: Round[],
  cartasJogadas: Card[]
): FourPlayerScore => {
  const stats1 = calculateStatistics(jogadores['jogador1']!, rodadas);
  const stats2 = calculateStatistics(jogadores['jogador2']!, rodadas);
  const stats3 = calculateStatistics(jogadores['jogador3']!, rodadas);
  const stats4 = calculateStatistics(jogadores['jogador4']!, rodadas);

  const teamPoints1 = (jogadores['jogador1']?.points ?? 0) + (jogadores['jogador3']?.points ?? 0);
  const teamPoints2 = (jogadores['jogador2']?.points ?? 0) + (jogadores['jogador4']?.points ?? 0);

  const difference = Math.abs(teamPoints1 - teamPoints2);

  let leader: 'team1' | 'team2' | null = null;
  if (teamPoints1 > teamPoints2) leader = 'team1';
  else if (teamPoints2 > teamPoints1) leader = 'team2';

  return {
    team1: {
      points: teamPoints1,
      percentage: calculatePointsPercentage(teamPoints1),
      jogadores: [stats1, stats3],
    },
    team2: {
      points: teamPoints2,
      percentage: calculatePointsPercentage(teamPoints2),
      jogadores: [stats2, stats4],
    },
    difference,
    leader,
    remainingPoints: calculateRemainingPoints(cartasJogadas),
  };
};

/**
 * Determina se ainda é possível vencer
 */
export const canCelebrateVictory = (
  points: number,
  opponentPoints: number,
  remainingPoints: number
): boolean => {
  // Já venceu se tem mais da metade dos points totais
  const halfPoints = TOTAL_POINTS / 2;
  if (points > halfPoints) return true;

  // Ainda pode vencer se somar todos os points restantes
  return points + remainingPoints > opponentPoints;
};

/**
 * Calcula probability de vitória baseada em points
 */
export const calculateWinProbability = (
  points: number,
  opponentPoints: number,
  remainingPoints: number
): number => {
  // Se já é impossível vencer
  if (!canCelebrateVictory(points, opponentPoints, remainingPoints)) {
    return 0;
  }

  // Se já venceu (tem mais que a metade)
  if (points > TOTAL_POINTS / 2) {
    return 100;
  }

  // Calcula probability baseada na diferença e points restantes
  const difference = points - opponentPoints;
  const differenceFactor = difference / remainingPoints;

  // Normaliza entre 0 e 100
  let probability = 50 + (differenceFactor * 50);
  probability = Math.max(0, Math.min(100, probability));

  return Math.round(probability);
};
