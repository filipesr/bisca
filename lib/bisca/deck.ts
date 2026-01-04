import { Carta, Naipe, Valor } from './types';

/**
 * Tabela de pontuação das cartas em Bisca
 */
export const PONTOS_CARTA: Record<Valor, number> = {
  [Valor.AS]: 11,
  [Valor.SETE]: 10,
  [Valor.REI]: 4,
  [Valor.VALETE]: 3,
  [Valor.DAMA]: 2,
  [Valor.SEIS]: 0,
  [Valor.CINCO]: 0,
  [Valor.QUATRO]: 0,
  [Valor.TRES]: 0,
  [Valor.DOIS]: 0,
};

/**
 * Ordem de força das cartas (para determinar vencedor)
 * Maior valor = carta mais forte
 */
export const FORCA_CARTA: Record<Valor, number> = {
  [Valor.AS]: 11,
  [Valor.SETE]: 10,
  [Valor.REI]: 9,
  [Valor.VALETE]: 8,
  [Valor.DAMA]: 7,
  [Valor.SEIS]: 6,
  [Valor.CINCO]: 5,
  [Valor.QUATRO]: 4,
  [Valor.TRES]: 3,
  [Valor.DOIS]: 2,
};

/**
 * Todos os valores possíveis no baralho de Bisca
 */
export const VALORES_BARALHO: Valor[] = [
  Valor.AS,
  Valor.SETE,
  Valor.REI,
  Valor.VALETE,
  Valor.DAMA,
  Valor.SEIS,
  Valor.CINCO,
  Valor.QUATRO,
  Valor.TRES,
  Valor.DOIS,
];

/**
 * Todos os naipes
 */
export const NAIPES_BARALHO: Naipe[] = [
  Naipe.COPAS,
  Naipe.OUROS,
  Naipe.ESPADAS,
  Naipe.PAUS,
];

/**
 * Total de pontos em um jogo de Bisca
 */
export const TOTAL_PONTOS = 120;

/**
 * Número de cartas no baralho
 */
export const TOTAL_CARTAS = 40;

/**
 * Cria uma carta
 */
export const criarCarta = (valor: Valor, naipe: Naipe): Carta => ({
  valor,
  naipe,
  pontos: PONTOS_CARTA[valor] ?? 0,
});

/**
 * Cria um baralho completo de Bisca (40 cartas)
 */
export const criarBaralho = (): Carta[] => {
  const baralho: Carta[] = [];

  for (const naipe of NAIPES_BARALHO) {
    for (const valor of VALORES_BARALHO) {
      baralho.push(criarCarta(valor, naipe));
    }
  }

  return baralho;
};

/**
 * Embaralha um array (Fisher-Yates shuffle)
 */
export const embaralhar = <T>(array: T[]): T[] => {
  const embaralhado = [...array];

  for (let i = embaralhado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = embaralhado[i];
    if (temp !== undefined && embaralhado[j] !== undefined) {
      embaralhado[i] = embaralhado[j]!;
      embaralhado[j] = temp;
    }
  }

  return embaralhado;
};

/**
 * Compara duas cartas (para igualdade)
 */
export const cartasIguais = (carta1: Carta, carta2: Carta): boolean => {
  return carta1.valor === carta2.valor && carta1.naipe === carta2.naipe;
};

/**
 * Encontra uma carta em um array
 */
export const encontrarCarta = (cartas: Carta[], alvo: Carta): number => {
  return cartas.findIndex((carta) => cartasIguais(carta, alvo));
};

/**
 * Remove uma carta de um array
 */
export const removerCarta = (cartas: Carta[], alvo: Carta): Carta[] => {
  const index = encontrarCarta(cartas, alvo);
  if (index === -1) {
    return cartas;
  }

  return [...cartas.slice(0, index), ...cartas.slice(index + 1)];
};

/**
 * Calcula o total de pontos em um conjunto de cartas
 */
export const calcularPontos = (cartas: Carta[]): number => {
  return cartas.reduce((total, carta) => total + carta.pontos, 0);
};

/**
 * Verifica se uma carta é trunfo
 */
export const isTrunfo = (carta: Carta, trunfo: Carta | null): boolean => {
  if (!trunfo) return false;
  return carta.naipe === trunfo.naipe;
};

/**
 * Compara duas cartas e determina qual é mais forte
 * Retorna: 1 se carta1 vence, -1 se carta2 vence, 0 se empate (não deveria acontecer)
 */
export const compararCartas = (
  carta1: Carta,
  carta2: Carta,
  trunfo: Carta | null,
  primeiraCarta: Carta
): number => {
  const carta1Trunfo = isTrunfo(carta1, trunfo);
  const carta2Trunfo = isTrunfo(carta2, trunfo);

  // Trunfo sempre vence carta normal
  if (carta1Trunfo && !carta2Trunfo) return 1;
  if (carta2Trunfo && !carta1Trunfo) return -1;

  // Ambas são trunfo: compara força
  if (carta1Trunfo && carta2Trunfo) {
    const forca1 = FORCA_CARTA[carta1.valor] ?? 0;
    const forca2 = FORCA_CARTA[carta2.valor] ?? 0;
    return forca1 > forca2 ? 1 : forca1 < forca2 ? -1 : 0;
  }

  // Nenhuma é trunfo: apenas cartas do mesmo naipe da primeira carta competem
  const carta1MesmoNaipe = carta1.naipe === primeiraCarta.naipe;
  const carta2MesmoNaipe = carta2.naipe === primeiraCarta.naipe;

  // Se apenas uma é do mesmo naipe que a primeira, ela vence
  if (carta1MesmoNaipe && !carta2MesmoNaipe) return 1;
  if (carta2MesmoNaipe && !carta1MesmoNaipe) return -1;

  // Ambas do mesmo naipe ou ambas de naipes diferentes: compara força
  if (carta1MesmoNaipe && carta2MesmoNaipe) {
    const forca1 = FORCA_CARTA[carta1.valor] ?? 0;
    const forca2 = FORCA_CARTA[carta2.valor] ?? 0;
    return forca1 > forca2 ? 1 : forca1 < forca2 ? -1 : 0;
  }

  // Ambas de naipes diferentes da primeira: primeira jogada vence
  return 0;
};

/**
 * Converte uma carta para string legível
 */
export const cartaParaString = (carta: Carta): string => {
  const simbolos: Record<Naipe, string> = {
    [Naipe.COPAS]: '♥️',
    [Naipe.OUROS]: '♦️',
    [Naipe.ESPADAS]: '♠️',
    [Naipe.PAUS]: '♣️',
  };

  return `${carta.valor}${simbolos[carta.naipe] ?? ''}`;
};

/**
 * Converte string para carta (parseamento)
 */
export const stringParaCarta = (str: string): Carta | null => {
  const simbolos: Record<string, Naipe> = {
    '♥️': Naipe.COPAS,
    '♥': Naipe.COPAS,
    '♦️': Naipe.OUROS,
    '♦': Naipe.OUROS,
    '♠️': Naipe.ESPADAS,
    '♠': Naipe.ESPADAS,
    '♣️': Naipe.PAUS,
    '♣': Naipe.PAUS,
  };

  // Extrai valor e naipe
  const match = str.match(/^([AKQJ0-9]+)(♥️|♥|♦️|♦|♠️|♠|♣️|♣)$/);
  if (!match) return null;

  const valorStr = match[1];
  const naipeStr = match[2];

  const valor = Object.values(Valor).find((v) => v === valorStr);
  const naipe = naipeStr ? simbolos[naipeStr] : undefined;

  if (!valor || !naipe) return null;

  return criarCarta(valor, naipe);
};
