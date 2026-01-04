import {
  AnaliseEstilo,
  Carta,
  CartaJogada,
  EstiloJogo,
  JogadorId,
  Rodada,
} from './types';
import { FORCA_CARTA, PONTOS_CARTA, isTrunfo } from './deck';

/**
 * Analisa uma jogada para determinar se é agressiva ou defensiva
 */
type TipoJogada = 'agressiva' | 'defensiva' | 'neutra';

const analisarTipoJogada = (
  cartaJogada: Carta,
  rodada: Rodada,
  trunfo: Carta | null,
  maoJogador: Carta[]
): TipoJogada => {
  const pontosCartaJogada = PONTOS_CARTA[cartaJogada.valor] ?? 0;
  const forcaCartaJogada = FORCA_CARTA[cartaJogada.valor] ?? 0;

  // Analisa contexto da rodada
  const isPrimeiraJogada = rodada.cartasJogadas.length === 0;
  const pontosNaRodada = rodada.cartasJogadas.reduce(
    (sum, cj) => sum + cj.carta.pontos,
    0
  );

  // Jogada agressiva: jogou carta com pontos ou carta forte
  if (pontosCartaJogada >= 10) {
    // Jogou Ás ou 7 (cartas de muitos pontos)
    return 'agressiva';
  }

  if (forcaCartaJogada >= 9 && isTrunfo(cartaJogada, trunfo)) {
    // Jogou trunfo forte (Rei ou melhor)
    return 'agressiva';
  }

  if (!isPrimeiraJogada && pontosNaRodada >= 10 && forcaCartaJogada >= 7) {
    // Tentou ganhar rodada com pontos altos
    return 'agressiva';
  }

  // Jogada defensiva: jogou carta fraca quando tinha cartas fortes
  const temCartasFortes = maoJogador.some(
    (c) => (FORCA_CARTA[c.valor] ?? 0) >= 9 || (PONTOS_CARTA[c.valor] ?? 0) >= 10
  );

  if (forcaCartaJogada <= 5 && temCartasFortes && pontosNaRodada >= 10) {
    // Jogou carta fraca enquanto tinha fortes, com pontos na rodada
    return 'defensiva';
  }

  if (pontosCartaJogada === 0 && forcaCartaJogada <= 6) {
    // Jogou carta sem pontos e fraca
    return 'defensiva';
  }

  return 'neutra';
};

/**
 * Atualiza a análise de estilo de um jogador com base em uma nova jogada
 */
export const atualizarAnaliseEstilo = (
  analiseAtual: AnaliseEstilo,
  novaJogada: CartaJogada,
  rodada: Rodada,
  trunfo: Carta | null,
  maoJogador: Carta[]
): AnaliseEstilo => {
  const tipoJogada = analisarTipoJogada(novaJogada.carta, rodada, trunfo, maoJogador);

  let jogadasAgressivas = analiseAtual.padroes.jogadasAgressivas;
  let jogadasDefensivas = analiseAtual.padroes.jogadasDefensivas;

  if (tipoJogada === 'agressiva') {
    jogadasAgressivas++;
  } else if (tipoJogada === 'defensiva') {
    jogadasDefensivas++;
  }

  const totalJogadas = analiseAtual.padroes.totalJogadas + 1;

  // Determina o estilo baseado nas proporções
  let estilo = EstiloJogo.INDETERMINADO;
  let confianca = 0;

  if (totalJogadas >= 3) {
    // Precisa de pelo menos 3 jogadas para ter uma análise
    const proporcaoAgressiva = jogadasAgressivas / totalJogadas;
    const proporcaoDefensiva = jogadasDefensivas / totalJogadas;

    if (proporcaoAgressiva >= 0.6) {
      estilo = EstiloJogo.AGRESSIVO;
      confianca = Math.min(100, Math.round(proporcaoAgressiva * 100));
    } else if (proporcaoDefensiva >= 0.6) {
      estilo = EstiloJogo.DEFENSIVO;
      confianca = Math.min(100, Math.round(proporcaoDefensiva * 100));
    } else {
      estilo = EstiloJogo.EQUILIBRADO;
      confianca = Math.round(
        (1 - Math.abs(proporcaoAgressiva - proporcaoDefensiva)) * 100
      );
    }
  }

  return {
    jogadorId: analiseAtual.jogadorId,
    estilo,
    confianca,
    padroes: {
      jogadasAgressivas,
      jogadasDefensivas,
      totalJogadas,
    },
  };
};

/**
 * Cria uma análise de estilo inicial
 */
export const criarAnaliseEstiloInicial = (
  jogadorId: JogadorId
): AnaliseEstilo => {
  return {
    jogadorId,
    estilo: EstiloJogo.INDETERMINADO,
    confianca: 0,
    padroes: {
      jogadasAgressivas: 0,
      jogadasDefensivas: 0,
      totalJogadas: 0,
    },
  };
};

/**
 * Analisa todas as jogadas de um jogador até agora
 */
export const analisarEstiloCompleto = (
  jogadorId: JogadorId,
  rodadas: Rodada[],
  trunfo: Carta | null,
  maoAtual: Carta[]
): AnaliseEstilo => {
  let analise = criarAnaliseEstiloInicial(jogadorId);

  for (const rodada of rodadas) {
    const jogadaDoJogador = rodada.cartasJogadas.find(
      (cj) => cj.jogadorId === jogadorId
    );

    if (jogadaDoJogador) {
      // Para análise histórica, usamos a mão atual como aproximação
      // Em um sistema real, você guardaria a mão de cada rodada
      analise = atualizarAnaliseEstilo(
        analise,
        jogadaDoJogador,
        rodada,
        trunfo,
        maoAtual
      );
    }
  }

  return analise;
};

/**
 * Gera descrição textual do estilo
 */
export const descreverEstilo = (analise: AnaliseEstilo): string => {
  if (analise.confianca < 40) {
    return 'Padrão de jogo ainda indeterminado. Preciso de mais jogadas para análise.';
  }

  switch (analise.estilo) {
    case EstiloJogo.AGRESSIVO:
      return `Jogador agressivo (${analise.confianca}% confiança). Tende a jogar cartas fortes para ganhar pontos.`;
    case EstiloJogo.DEFENSIVO:
      return `Jogador defensivo (${analise.confianca}% confiança). Tende a preservar cartas fortes e jogar cartas fracas.`;
    case EstiloJogo.EQUILIBRADO:
      return `Jogador equilibrado (${analise.confianca}% confiança). Alterna entre jogadas agressivas e defensivas.`;
    default:
      return 'Padrão de jogo ainda indeterminado.';
  }
};

/**
 * Calcula ajuste na recomendação baseado no estilo do oponente
 */
export const calcularAjusteEstilo = (
  estiloOponente: EstiloJogo,
  confianca: number
): {
  preferirAgressivo: boolean;
  preferirDefensivo: boolean;
  fatorAjuste: number;
} => {
  // Só ajusta se tiver confiança razoável
  if (confianca < 50) {
    return {
      preferirAgressivo: false,
      preferirDefensivo: false,
      fatorAjuste: 0,
    };
  }

  const fatorAjuste = confianca / 100;

  switch (estiloOponente) {
    case EstiloJogo.AGRESSIVO:
      // Contra jogador agressivo, pode ser defensivo
      return {
        preferirAgressivo: false,
        preferirDefensivo: true,
        fatorAjuste,
      };

    case EstiloJogo.DEFENSIVO:
      // Contra jogador defensivo, seja agressivo
      return {
        preferirAgressivo: true,
        preferirDefensivo: false,
        fatorAjuste,
      };

    case EstiloJogo.EQUILIBRADO:
      // Contra equilibrado, mantenha equilíbrio
      return {
        preferirAgressivo: false,
        preferirDefensivo: false,
        fatorAjuste: fatorAjuste * 0.5,
      };

    default:
      return {
        preferirAgressivo: false,
        preferirDefensivo: false,
        fatorAjuste: 0,
      };
  }
};
