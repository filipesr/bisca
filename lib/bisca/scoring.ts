import { Carta, Jogador, JogadorId, Rodada } from './types';
import { calcularPontos, TOTAL_PONTOS } from './deck';

/**
 * Atualiza a pontuação de um jogador
 */
export const atualizarPontuacao = (
  jogador: Jogador,
  cartasGanhas: Carta[]
): Jogador => {
  const pontos = calcularPontos(cartasGanhas);

  return {
    ...jogador,
    pontos,
    cartasGanhas,
  };
};

/**
 * Calcula o percentual de pontos de um jogador
 */
export const calcularPercentualPontos = (pontos: number): number => {
  return Math.round((pontos / TOTAL_PONTOS) * 100);
};

/**
 * Determina se um jogador está ganhando
 */
export const estaGanhando = (
  pontosJogador: number,
  pontosOponente: number
): boolean => {
  return pontosJogador > pontosOponente;
};

/**
 * Calcula a diferença de pontos
 */
export const calcularDiferencaPontos = (
  pontosJogador: number,
  pontosOponente: number
): number => {
  return pontosJogador - pontosOponente;
};

/**
 * Calcula pontos restantes no jogo
 */
export const calcularPontosRestantes = (
  cartasJogadas: Carta[]
): number => {
  const pontosJogados = calcularPontos(cartasJogadas);
  return TOTAL_PONTOS - pontosJogados;
};

/**
 * Calcula estatísticas de um jogador
 */
export type EstatisticasJogador = {
  pontos: number;
  percentual: number;
  rodadasGanhas: number;
  totalRodadas: number;
  taxaVitoria: number;
  mediapontosRodadas: number;
};

export const calcularEstatisticas = (
  jogador: Jogador,
  rodadas: Rodada[]
): EstatisticasJogador => {
  const rodadasGanhas = rodadas.filter(
    (r) => r.vencedor === jogador.id && r.completa
  ).length;

  const rodadasCompletas = rodadas.filter((r) => r.completa).length;

  const taxaVitoria = rodadasCompletas > 0
    ? Math.round((rodadasGanhas / rodadasCompletas) * 100)
    : 0;

  const mediapontosRodadas = rodadasGanhas > 0
    ? Math.round(jogador.pontos / rodadasGanhas)
    : 0;

  return {
    pontos: jogador.pontos,
    percentual: calcularPercentualPontos(jogador.pontos),
    rodadasGanhas,
    totalRodadas: rodadasCompletas,
    taxaVitoria,
    mediapontosRodadas,
  };
};

/**
 * Calcula placar para jogo de 2 jogadores
 */
export type Placar2Jogadores = {
  jogador1: EstatisticasJogador;
  jogador2: EstatisticasJogador;
  diferenca: number;
  lider: JogadorId | null;
  pontosRestantes: number;
};

export const calcularPlacar2Jogadores = (
  jogador1: Jogador,
  jogador2: Jogador,
  rodadas: Rodada[],
  cartasJogadas: Carta[]
): Placar2Jogadores => {
  const stats1 = calcularEstatisticas(jogador1, rodadas);
  const stats2 = calcularEstatisticas(jogador2, rodadas);

  const diferenca = calcularDiferencaPontos(jogador1.pontos, jogador2.pontos);

  let lider: JogadorId | null = null;
  if (jogador1.pontos > jogador2.pontos) lider = 'jogador1';
  else if (jogador2.pontos > jogador1.pontos) lider = 'jogador2';

  return {
    jogador1: stats1,
    jogador2: stats2,
    diferenca: Math.abs(diferenca),
    lider,
    pontosRestantes: calcularPontosRestantes(cartasJogadas),
  };
};

/**
 * Calcula placar para jogo de 4 jogadores (equipes)
 */
export type Placar4Jogadores = {
  equipe1: {
    pontos: number;
    percentual: number;
    jogadores: [EstatisticasJogador, EstatisticasJogador];
  };
  equipe2: {
    pontos: number;
    percentual: number;
    jogadores: [EstatisticasJogador, EstatisticasJogador];
  };
  diferenca: number;
  lider: 'equipe1' | 'equipe2' | null;
  pontosRestantes: number;
};

export const calcularPlacar4Jogadores = (
  jogadores: Record<JogadorId, Jogador>,
  rodadas: Rodada[],
  cartasJogadas: Carta[]
): Placar4Jogadores => {
  const stats1 = calcularEstatisticas(jogadores['jogador1']!, rodadas);
  const stats2 = calcularEstatisticas(jogadores['jogador2']!, rodadas);
  const stats3 = calcularEstatisticas(jogadores['jogador3']!, rodadas);
  const stats4 = calcularEstatisticas(jogadores['jogador4']!, rodadas);

  const pontosEquipe1 = (jogadores['jogador1']?.pontos ?? 0) + (jogadores['jogador3']?.pontos ?? 0);
  const pontosEquipe2 = (jogadores['jogador2']?.pontos ?? 0) + (jogadores['jogador4']?.pontos ?? 0);

  const diferenca = Math.abs(pontosEquipe1 - pontosEquipe2);

  let lider: 'equipe1' | 'equipe2' | null = null;
  if (pontosEquipe1 > pontosEquipe2) lider = 'equipe1';
  else if (pontosEquipe2 > pontosEquipe1) lider = 'equipe2';

  return {
    equipe1: {
      pontos: pontosEquipe1,
      percentual: calcularPercentualPontos(pontosEquipe1),
      jogadores: [stats1, stats3],
    },
    equipe2: {
      pontos: pontosEquipe2,
      percentual: calcularPercentualPontos(pontosEquipe2),
      jogadores: [stats2, stats4],
    },
    diferenca,
    lider,
    pontosRestantes: calcularPontosRestantes(cartasJogadas),
  };
};

/**
 * Determina se ainda é possível vencer
 */
export const podeComemorVitoria = (
  pontos: number,
  pontosOponente: number,
  pontosRestantes: number
): boolean => {
  // Já venceu se tem mais da metade dos pontos totais
  const metadePontos = TOTAL_PONTOS / 2;
  if (pontos > metadePontos) return true;

  // Ainda pode vencer se somar todos os pontos restantes
  return pontos + pontosRestantes > pontosOponente;
};

/**
 * Calcula probabilidade de vitória baseada em pontos
 */
export const calcularProbabilidadeVitoria = (
  pontos: number,
  pontosOponente: number,
  pontosRestantes: number
): number => {
  // Se já é impossível vencer
  if (!podeComemorVitoria(pontos, pontosOponente, pontosRestantes)) {
    return 0;
  }

  // Se já venceu (tem mais que a metade)
  if (pontos > TOTAL_PONTOS / 2) {
    return 100;
  }

  // Calcula probabilidade baseada na diferença e pontos restantes
  const diferenca = pontos - pontosOponente;
  const fatorDiferenca = diferenca / pontosRestantes;

  // Normaliza entre 0 e 100
  let probabilidade = 50 + (fatorDiferenca * 50);
  probabilidade = Math.max(0, Math.min(100, probabilidade));

  return Math.round(probabilidade);
};
