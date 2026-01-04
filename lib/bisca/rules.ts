import { Carta, JogadorId, Rodada } from './types';
import { compararCartas, calcularPontos } from './deck';

/**
 * Determina o vencedor de uma rodada
 */
export const determinarVencedorRodada = (
  rodada: Rodada,
  trunfo: Carta | null
): { vencedor: JogadorId; pontosGanhos: number } | null => {
  if (rodada.cartasJogadas.length === 0) {
    return null;
  }

  // Ordena as cartas jogadas por ordem de jogada
  const cartasOrdenadas = [...rodada.cartasJogadas].sort((a, b) => a.ordem - b.ordem);

  const primeiraCarta = cartasOrdenadas[0];
  if (!primeiraCarta) {
    return null;
  }

  let cartaVencedora = primeiraCarta;

  // Compara cada carta com a atual vencedora
  for (const cartaJogada of cartasOrdenadas.slice(1)) {
    const resultado = compararCartas(
      cartaJogada.carta,
      cartaVencedora.carta,
      trunfo,
      primeiraCarta.carta
    );

    if (resultado > 0) {
      cartaVencedora = cartaJogada;
    }
  }

  // Calcula pontos ganhos
  const todasCartas = cartasOrdenadas.map((cj) => cj.carta);
  const pontosGanhos = calcularPontos(todasCartas);

  return {
    vencedor: cartaVencedora.jogadorId,
    pontosGanhos,
  };
};

/**
 * Valida se uma carta pode ser jogada
 * Em Bisca, não há restrições - qualquer carta da mão pode ser jogada
 */
export const validarJogada = (carta: Carta, mao: Carta[]): boolean => {
  return mao.some((c) => c.valor === carta.valor && c.naipe === carta.naipe);
};

/**
 * Determina a ordem de jogo em uma rodada de 2 jogadores
 */
export const determinarOrdemJogo2Jogadores = (
  vencedorRodadaAnterior: JogadorId | null
): JogadorId[] => {
  if (!vencedorRodadaAnterior) {
    // Primeira rodada: jogador 1 começa
    return ['jogador1', 'jogador2'];
  }

  // Vencedor da rodada anterior começa
  const outro: JogadorId = vencedorRodadaAnterior === 'jogador1' ? 'jogador2' : 'jogador1';
  return [vencedorRodadaAnterior, outro];
};

/**
 * Determina a ordem de jogo em uma rodada de 4 jogadores
 */
export const determinarOrdemJogo4Jogadores = (
  vencedorRodadaAnterior: JogadorId | null,
  primeiroJogadorPartida: JogadorId = 'jogador1'
): JogadorId[] => {
  const ordemCompleta: JogadorId[] = ['jogador1', 'jogador2', 'jogador3', 'jogador4'];

  if (!vencedorRodadaAnterior) {
    // Primeira rodada: ordem padrão começando pelo primeiro jogador
    const index = ordemCompleta.indexOf(primeiroJogadorPartida);
    return [...ordemCompleta.slice(index), ...ordemCompleta.slice(0, index)];
  }

  // Vencedor da rodada anterior começa
  const index = ordemCompleta.indexOf(vencedorRodadaAnterior);
  return [...ordemCompleta.slice(index), ...ordemCompleta.slice(0, index)];
};

/**
 * Determina a ordem de jogo baseado no número de jogadores
 */
export const determinarOrdemJogo = (
  numeroJogadores: 2 | 4,
  vencedorRodadaAnterior: JogadorId | null,
  primeiroJogadorPartida: JogadorId = 'jogador1'
): JogadorId[] => {
  if (numeroJogadores === 2) {
    return determinarOrdemJogo2Jogadores(vencedorRodadaAnterior);
  }

  return determinarOrdemJogo4Jogadores(vencedorRodadaAnterior, primeiroJogadorPartida);
};

/**
 * Verifica se o jogo terminou
 * O jogo termina quando todas as cartas foram jogadas
 */
export const verificarFimDeJogo = (
  cartasJogadas: Carta[]
): boolean => {
  // Total de cartas no baralho
  const totalCartas = 40;
  return cartasJogadas.length === totalCartas;
};

/**
 * Determina o vencedor do jogo baseado na pontuação
 */
export const determinarVencedorJogo = (
  pontosJogadores: Record<JogadorId, number>,
  numeroJogadores: 2 | 4
): JogadorId | null => {
  if (numeroJogadores === 2) {
    const pontos1 = pontosJogadores['jogador1'] ?? 0;
    const pontos2 = pontosJogadores['jogador2'] ?? 0;

    if (pontos1 > pontos2) return 'jogador1';
    if (pontos2 > pontos1) return 'jogador2';
    return null; // Empate
  }

  // 4 jogadores: equipes (1+3 vs 2+4)
  const pontosEquipe1 = (pontosJogadores['jogador1'] ?? 0) + (pontosJogadores['jogador3'] ?? 0);
  const pontosEquipe2 = (pontosJogadores['jogador2'] ?? 0) + (pontosJogadores['jogador4'] ?? 0);

  if (pontosEquipe1 > pontosEquipe2) return 'jogador1'; // Representa equipe 1
  if (pontosEquipe2 > pontosEquipe1) return 'jogador2'; // Representa equipe 2
  return null; // Empate
};

/**
 * Calcula quantas cartas cada jogador deve ter na mão
 */
export const calcularCartasNaMao = (
  rodadaAtual: number,
  numeroJogadores: 2 | 4
): number => {
  if (numeroJogadores === 2) {
    // Cada jogador começa com 3 cartas, compra 1 após cada rodada até acabar o baralho
    const cartasIniciais = 3;
    const totalCartas = 40;
    const cartasDistribuidas = cartasIniciais * 2; // 6 cartas
    const cartasRestantes = totalCartas - cartasDistribuidas - (rodadaAtual - 1) * 2;

    if (cartasRestantes >= 2) {
      return cartasIniciais;
    }

    // Últimas rodadas: vai diminuindo
    return Math.max(0, cartasIniciais - (rodadaAtual - (totalCartas / 2 - cartasIniciais)));
  }

  // 4 jogadores: 10 cartas cada, sem compra
  return Math.max(0, 10 - (rodadaAtual - 1));
};

/**
 * Verifica se é necessário comprar cartas do baralho
 */
export const deveComprarCartas = (
  cartasNoBaralho: number,
  numeroJogadores: 2 | 4
): boolean => {
  // Em jogo de 2, compra enquanto houver cartas
  // Em jogo de 4, não compra (todas as cartas são distribuídas no início)
  return numeroJogadores === 2 && cartasNoBaralho > 0;
};
