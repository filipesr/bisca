import {
  Carta,
  EstadoJogo,
  NivelRisco,
  Recomendacao,
} from './types';
import {
  FORCA_CARTA,
  PONTOS_CARTA,
  isTrunfo,
  compararCartas,
  criarBaralho,
  encontrarCarta,
} from './deck';
import { calcularPontosRestantes, calcularProbabilidadeVitoria } from './scoring';
import { calcularAjusteEstilo } from './style-analyzer';

/**
 * Calcula quais cartas ainda estão no jogo (não foram jogadas)
 */
const calcularCartasRestantes = (cartasJogadas: Carta[]): Carta[] => {
  const baralhoCompleto = criarBaralho();

  return baralhoCompleto.filter(
    (carta) => encontrarCarta(cartasJogadas, carta) === -1
  );
};

/**
 * Calcula a probabilidade de um oponente ter trunfo
 */
const calcularProbabilidadeTrunfo = (
  cartasRestantes: Carta[],
  trunfo: Carta | null,
  numeroOponentes: number
): number => {
  if (!trunfo) return 0;

  const trunfosRestantes = cartasRestantes.filter((c) =>
    isTrunfo(c, trunfo)
  ).length;

  if (trunfosRestantes === 0) return 0;

  const cartasNaoVistas = cartasRestantes.length;
  const probabilidadePorOponente = trunfosRestantes / cartasNaoVistas;

  // Probabilidade de pelo menos um oponente ter trunfo
  const probabilidade = 1 - Math.pow(1 - probabilidadePorOponente, numeroOponentes);

  return Math.round(probabilidade * 100);
};

/**
 * Avalia a força de uma carta no contexto atual
 */
const avaliarForcaCarta = (
  carta: Carta,
  trunfo: Carta | null,
  cartasRestantes: Carta[]
): number => {
  const pontosBase = PONTOS_CARTA[carta.valor] ?? 0;
  const forcaBase = FORCA_CARTA[carta.valor] ?? 0;

  let pontuacao = forcaBase * 5 + pontosBase * 2;

  // Bônus se é trunfo
  if (isTrunfo(carta, trunfo)) {
    pontuacao += 20;
  }

  // Calcula quantas cartas podem vencer esta
  const cartasQuePodeVencer = cartasRestantes.filter((c) => {
    return compararCartas(c, carta, trunfo, carta) > 0;
  }).length;

  // Reduz pontuação baseado no risco de ser vencida
  const fatorRisco = cartasQuePodeVencer / cartasRestantes.length;
  pontuacao *= 1 - fatorRisco * 0.5;

  return Math.round(pontuacao);
};

/**
 * Determina o nível de risco de jogar uma carta
 */
const determinarNivelRisco = (
  carta: Carta,
  pontosNaRodada: number,
  probabilidadeTrunfo: number,
  trunfo: Carta | null
): NivelRisco => {
  const pontosCarta = PONTOS_CARTA[carta.valor] ?? 0;
  const totalPontosEmRisco = pontosCarta + pontosNaRodada;

  const eTrunfo = isTrunfo(carta, trunfo);

  // Trunfo forte com muitos pontos em jogo = alto risco
  if (eTrunfo && totalPontosEmRisco >= 20 && probabilidadeTrunfo > 50) {
    return NivelRisco.ALTO;
  }

  // Carta com muitos pontos = risco médio/alto
  if (pontosCarta >= 10) {
    return probabilidadeTrunfo > 60
      ? NivelRisco.MUITO_ALTO
      : probabilidadeTrunfo > 40
      ? NivelRisco.ALTO
      : NivelRisco.MEDIO;
  }

  // Carta forte mas sem pontos
  const forca = FORCA_CARTA[carta.valor] ?? 0;
  if (forca >= 9 && totalPontosEmRisco >= 15) {
    return NivelRisco.MEDIO;
  }

  // Carta fraca = baixo risco
  if (forca <= 5 && pontosCarta === 0) {
    return NivelRisco.MUITO_BAIXO;
  }

  return NivelRisco.BAIXO;
};

/**
 * Gera motivo para a recomendação
 */
const gerarMotivoRecomendacao = (
  carta: Carta,
  contexto: {
    pontosNaRodada: number;
    isPrimeiraJogada: boolean;
    estaGanhando: boolean;
    pontosRestantes: number;
    nivelRisco: NivelRisco;
    probabilidadeTrunfo: number;
  },
  trunfo: Carta | null
): string => {
  const pontosCarta = PONTOS_CARTA[carta.valor] ?? 0;
  const forcaCarta = FORCA_CARTA[carta.valor] ?? 0;
  const eTrunfo = isTrunfo(carta, trunfo);

  const motivos: string[] = [];

  // Primeira jogada
  if (contexto.isPrimeiraJogada) {
    if (pontosCarta === 0 && forcaCarta <= 6) {
      motivos.push('Carta fraca ideal para abrir a rodada');
    } else if (pontosCarta >= 10 && contexto.estaGanhando) {
      motivos.push('Você está à frente, pode arriscar ganhar pontos');
    } else if (eTrunfo && forcaCarta >= 9) {
      motivos.push('Trunfo forte para garantir pontos');
    }
  } else {
    // Respondendo a uma jogada
    if (contexto.pontosNaRodada >= 15) {
      if (eTrunfo || forcaCarta >= 9) {
        motivos.push(`${contexto.pontosNaRodada} pontos em jogo, vale tentar ganhar`);
      } else if (pontosCarta === 0 && forcaCarta <= 5) {
        motivos.push('Muitos pontos em jogo, melhor não arriscar carta boa');
      }
    } else if (contexto.pontosNaRodada === 0) {
      motivos.push('Sem pontos na rodada, economize cartas fortes');
    }
  }

  // Considera situação do jogo
  if (!contexto.estaGanhando && contexto.pontosRestantes < 40) {
    motivos.push('Você está atrás, precisa ser mais agressivo');
  }

  // Risco
  if (contexto.nivelRisco === NivelRisco.MUITO_BAIXO) {
    motivos.push('Jogada segura');
  } else if (contexto.nivelRisco === NivelRisco.MUITO_ALTO) {
    motivos.push('Jogada arriscada, mas pode valer a pena');
  }

  // Probabilidade de trunfo
  if (contexto.probabilidadeTrunfo > 70 && !eTrunfo && pontosCarta >= 10) {
    motivos.push('Cuidado: alta chance do oponente ter trunfo');
  }

  return motivos.length > 0
    ? motivos.join('. ') + '.'
    : 'Jogada razoável no contexto atual.';
};

/**
 * Calcula recomendação para uma carta específica
 */
const calcularRecomendacaoCarta = (
  carta: Carta,
  estado: EstadoJogo,
  cartasRestantes: Carta[],
  numeroOponentes: number
): Recomendacao => {
  const rodadaAtual = estado.rodadaAtual;
  const isPrimeiraJogada = !rodadaAtual || rodadaAtual.cartasJogadas.length === 0;

  const pontosNaRodada = rodadaAtual
    ? rodadaAtual.cartasJogadas.reduce((sum, cj) => sum + cj.carta.pontos, 0)
    : 0;

  const probabilidadeTrunfo = calcularProbabilidadeTrunfo(
    cartasRestantes,
    estado.trunfo,
    numeroOponentes
  );

  // Avalia força da carta
  const forcaDaMao = avaliarForcaCarta(carta, estado.trunfo, cartasRestantes);

  // Determina nível de risco
  const nivelRisco = determinarNivelRisco(
    carta,
    pontosNaRodada,
    probabilidadeTrunfo,
    estado.trunfo
  );

  // Calcula prioridade base
  let prioridade = forcaDaMao;

  // Ajusta baseado no contexto
  const usuarioId = estado.configuracao.idUsuario;
  const jogadorUsuario = estado.jogadores[usuarioId];
  const pontosUsuario = jogadorUsuario?.pontos ?? 0;

  // Calcula pontos do(s) oponente(s)
  const pontosOponentes = Object.values(estado.jogadores)
    .filter((j) => j.id !== usuarioId)
    .reduce((sum, j) => sum + j.pontos, 0);

  const estaGanhando = pontosUsuario > pontosOponentes / numeroOponentes;
  const pontosRestantes = calcularPontosRestantes(estado.cartasJogadas);

  // Ajusta prioridade baseado em estilo dos oponentes
  const analisesOponentes = Object.values(estado.analisesEstilo).filter(
    (a) => a.jogadorId !== usuarioId
  );

  for (const analise of analisesOponentes) {
    const ajuste = calcularAjusteEstilo(analise.estilo, analise.confianca);

    const pontosCarta = PONTOS_CARTA[carta.valor] ?? 0;
    const forcaCarta = FORCA_CARTA[carta.valor] ?? 0;

    if (ajuste.preferirAgressivo && (pontosCarta >= 10 || forcaCarta >= 9)) {
      prioridade += 10 * ajuste.fatorAjuste;
    } else if (ajuste.preferirDefensivo && pontosCarta === 0 && forcaCarta <= 6) {
      prioridade += 10 * ajuste.fatorAjuste;
    }
  }

  // Normaliza prioridade (0-100)
  prioridade = Math.max(0, Math.min(100, prioridade));

  // Calcula probabilidade de vitória se jogar esta carta
  const probabilidadeVitoria = calcularProbabilidadeVitoria(
    pontosUsuario,
    pontosOponentes / numeroOponentes,
    pontosRestantes
  );

  // Gera motivo
  const motivo = gerarMotivoRecomendacao(
    carta,
    {
      pontosNaRodada,
      isPrimeiraJogada,
      estaGanhando,
      pontosRestantes,
      nivelRisco,
      probabilidadeTrunfo,
    },
    estado.trunfo
  );

  return {
    carta,
    prioridade: Math.round(prioridade),
    motivo,
    nivelRisco,
    probabilidadeVitoria,
    detalhes: {
      forcaDaMao: Math.round(forcaDaMao),
      cartasRestantes: cartasRestantes.length,
      probabilidadeTrunfo,
      pontosEmJogo: pontosNaRodada + (PONTOS_CARTA[carta.valor] ?? 0),
    },
  };
};

/**
 * Gera recomendações para todas as cartas da mão
 */
export const gerarRecomendacoes = (estado: EstadoJogo): Recomendacao[] => {
  const maoUsuario = estado.maoUsuario;

  if (maoUsuario.length === 0) {
    return [];
  }

  const cartasRestantes = calcularCartasRestantes(estado.cartasJogadas);
  const numeroOponentes = estado.configuracao.numeroJogadores - 1;

  const recomendacoes = maoUsuario.map((carta) =>
    calcularRecomendacaoCarta(carta, estado, cartasRestantes, numeroOponentes)
  );

  // Ordena por prioridade (maior primeiro)
  return recomendacoes.sort((a, b) => b.prioridade - a.prioridade);
};

/**
 * Retorna a melhor recomendação
 */
export const obterMelhorRecomendacao = (estado: EstadoJogo): Recomendacao | null => {
  const recomendacoes = gerarRecomendacoes(estado);
  return recomendacoes[0] ?? null;
};

/**
 * Explica por que uma carta específica é boa ou ruim
 */
export const explicarCarta = (
  carta: Carta,
  estado: EstadoJogo
): string => {
  const cartasRestantes = calcularCartasRestantes(estado.cartasJogadas);
  const numeroOponentes = estado.configuracao.numeroJogadores - 1;

  const recomendacao = calcularRecomendacaoCarta(
    carta,
    estado,
    cartasRestantes,
    numeroOponentes
  );

  return `${recomendacao.motivo} (Prioridade: ${recomendacao.prioridade}/100, Risco: ${recomendacao.nivelRisco})`;
};
