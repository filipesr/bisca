/**
 * Tipos para o jogo de Bisca
 */

// Naipes do baralho
export enum Naipe {
  COPAS = 'copas',
  OUROS = 'ouros',
  ESPADAS = 'espadas',
  PAUS = 'paus',
}

// Valores das cartas (sem 8, 9, 10)
export enum Valor {
  AS = 'A',
  SETE = '7',
  REI = 'K',
  VALETE = 'J',
  DAMA = 'Q',
  SEIS = '6',
  CINCO = '5',
  QUATRO = '4',
  TRES = '3',
  DOIS = '2',
}

// Representação de uma carta
export type Carta = {
  valor: Valor;
  naipe: Naipe;
  pontos: number;
};

// ID do jogador
export type JogadorId = 'jogador1' | 'jogador2' | 'jogador3' | 'jogador4';

// Informações de um jogador
export type Jogador = {
  id: JogadorId;
  nome: string;
  pontos: number;
  cartasGanhas: Carta[];
  numeroCartasNaMao: number;
  isUsuario: boolean; // true se é o usuário principal
};

// Configuração do jogo
export type ConfiguracaoJogo = {
  numeroJogadores: 2 | 4;
  nomesJogadores: string[];
  idUsuario: JogadorId;
};

// Carta jogada em uma rodada
export type CartaJogada = {
  carta: Carta;
  jogadorId: JogadorId;
  ordem: number; // ordem de jogada na rodada (1, 2, 3, 4)
};

// Rodada do jogo
export type Rodada = {
  numero: number;
  cartasJogadas: CartaJogada[];
  vencedor: JogadorId | null;
  pontosGanhos: number;
  completa: boolean;
};

// Estilo de jogo detectado
export enum EstiloJogo {
  AGRESSIVO = 'agressivo',
  DEFENSIVO = 'defensivo',
  EQUILIBRADO = 'equilibrado',
  INDETERMINADO = 'indeterminado',
}

// Análise de estilo de um jogador
export type AnaliseEstilo = {
  jogadorId: JogadorId;
  estilo: EstiloJogo;
  confianca: number; // 0-100
  padroes: {
    jogadasAgressivas: number;
    jogadasDefensivas: number;
    totalJogadas: number;
  };
};

// Nível de risco de uma jogada
export enum NivelRisco {
  MUITO_BAIXO = 'muito_baixo',
  BAIXO = 'baixo',
  MEDIO = 'medio',
  ALTO = 'alto',
  MUITO_ALTO = 'muito_alto',
}

// Recomendação de jogada
export type Recomendacao = {
  carta: Carta;
  prioridade: number; // 0-100 (quanto maior, mais recomendada)
  motivo: string;
  nivelRisco: NivelRisco;
  probabilidadeVitoria: number; // 0-100
  detalhes: {
    forcaDaMao: number; // 0-100
    cartasRestantes: number;
    probabilidadeTrunfo: number; // chance do oponente ter trunfo
    pontosEmJogo: number;
  };
};

// Status do jogo
export enum StatusJogo {
  CONFIGURACAO = 'configuracao',
  EM_ANDAMENTO = 'em_andamento',
  FINALIZADO = 'finalizado',
}

// Estado completo do jogo
export type EstadoJogo = {
  status: StatusJogo;
  configuracao: ConfiguracaoJogo;
  jogadores: Record<JogadorId, Jogador>;
  trunfo: Carta | null;
  rodadas: Rodada[];
  rodadaAtual: Rodada | null;
  proximoJogador: JogadorId | null;
  cartasNoBaralho: number;
  cartasJogadas: Carta[];
  maoUsuario: Carta[];
  vencedor: JogadorId | null;
  analisesEstilo: Record<JogadorId, AnaliseEstilo>;
  recomendacaoAtual: Recomendacao | null;
};

// Ação do usuário
export type AcaoUsuario =
  | { tipo: 'INICIAR_JOGO'; configuracao: ConfiguracaoJogo }
  | { tipo: 'REGISTRAR_CARTA_JOGADA'; jogadorId: JogadorId; carta: Carta }
  | { tipo: 'ATUALIZAR_MAO_USUARIO'; cartas: Carta[] }
  | { tipo: 'SOLICITAR_RECOMENDACAO' }
  | { tipo: 'FINALIZAR_RODADA' }
  | { tipo: 'RESETAR_JOGO' };

// Resultado de uma ação
export type ResultadoAcao = {
  sucesso: boolean;
  mensagem?: string;
  erro?: string;
};
