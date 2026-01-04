import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  EstadoJogo,
  StatusJogo,
  ConfiguracaoJogo,
  Carta,
  JogadorId,
  Jogador,
  Rodada,
  CartaJogada,
  ResultadoAcao,
} from '../bisca/types';
import {
  criarBaralho,
  embaralhar,
  encontrarCarta,
  removerCarta,
} from '../bisca/deck';
import {
  determinarVencedorRodada,
  determinarOrdemJogo,
  verificarFimDeJogo,
  determinarVencedorJogo,
} from '../bisca/rules';
import {
  criarAnaliseEstiloInicial,
  atualizarAnaliseEstilo,
} from '../bisca/style-analyzer';
import { obterMelhorRecomendacao } from '../bisca/recommendation-engine';

/**
 * Estado inicial do jogo
 */
const criarEstadoInicial = (): EstadoJogo => ({
  status: StatusJogo.CONFIGURACAO,
  configuracao: {
    numeroJogadores: 2,
    nomesJogadores: [],
    idUsuario: 'jogador1',
  },
  jogadores: {} as Record<JogadorId, Jogador>,
  trunfo: null,
  rodadas: [],
  rodadaAtual: null,
  proximoJogador: null,
  cartasNoBaralho: 40,
  cartasJogadas: [],
  maoUsuario: [],
  vencedor: null,
  analisesEstilo: {} as Record<JogadorId, any>,
  recomendacaoAtual: null,
});

/**
 * Cria jogadores iniciais
 */
const criarJogadores = (config: ConfiguracaoJogo): Record<JogadorId, Jogador> => {
  const jogadores: Record<JogadorId, Jogador> = {} as Record<JogadorId, Jogador>;

  const ids: JogadorId[] = config.numeroJogadores === 2
    ? ['jogador1', 'jogador2']
    : ['jogador1', 'jogador2', 'jogador3', 'jogador4'];

  ids.forEach((id, index) => {
    jogadores[id] = {
      id,
      nome: config.nomesJogadores[index] ?? `Jogador ${index + 1}`,
      pontos: 0,
      cartasGanhas: [],
      numeroCartasNaMao: config.numeroJogadores === 2 ? 3 : 10,
      isUsuario: id === config.idUsuario,
    };
  });

  return jogadores;
};

/**
 * Zustand Store
 */
type GameStore = {
  estado: EstadoJogo;
  iniciarJogo: (config: ConfiguracaoJogo) => ResultadoAcao;
  registrarCartaJogada: (jogadorId: JogadorId, carta: Carta) => ResultadoAcao;
  atualizarMaoUsuario: (cartas: Carta[]) => ResultadoAcao;
  solicitarRecomendacao: () => ResultadoAcao;
  finalizarRodada: () => ResultadoAcao;
  resetarJogo: () => ResultadoAcao;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      estado: criarEstadoInicial(),

      iniciarJogo: (config: ConfiguracaoJogo): ResultadoAcao => {
        try {
          // Cria baralho e embaralha
          const baralho = embaralhar(criarBaralho());

          // Trunfo é a última carta do baralho
          const trunfo = baralho[baralho.length - 1] ?? null;

          // Cria jogadores
          const jogadores = criarJogadores(config);

          // Cria análises de estilo iniciais
          const analisesEstilo: Record<JogadorId, any> = {} as Record<JogadorId, any>;
          Object.keys(jogadores).forEach((id) => {
            analisesEstilo[id as JogadorId] = criarAnaliseEstiloInicial(id as JogadorId);
          });

          // Define primeiro jogador
          const ordemJogo = determinarOrdemJogo(config.numeroJogadores, null, config.idUsuario);

          // Cria primeira rodada
          const primeiraRodada: Rodada = {
            numero: 1,
            cartasJogadas: [],
            vencedor: null,
            pontosGanhos: 0,
            completa: false,
          };

          set({
            estado: {
              status: StatusJogo.EM_ANDAMENTO,
              configuracao: config,
              jogadores,
              trunfo,
              rodadas: [],
              rodadaAtual: primeiraRodada,
              proximoJogador: ordemJogo[0] ?? null,
              cartasNoBaralho: 40,
              cartasJogadas: [],
              maoUsuario: [],
              vencedor: null,
              analisesEstilo,
              recomendacaoAtual: null,
            },
          });

          return {
            sucesso: true,
            mensagem: 'Jogo iniciado com sucesso! Informe as cartas da sua mão.',
          };
        } catch (erro) {
          return {
            sucesso: false,
            erro: 'Erro ao iniciar o jogo',
          };
        }
      },

      registrarCartaJogada: (jogadorId: JogadorId, carta: Carta): ResultadoAcao => {
        const { estado } = get();

        if (estado.status !== StatusJogo.EM_ANDAMENTO) {
          return { sucesso: false, erro: 'Jogo não está em andamento' };
        }

        if (!estado.rodadaAtual) {
          return { sucesso: false, erro: 'Nenhuma rodada ativa' };
        }

        if (estado.proximoJogador !== jogadorId) {
          return { sucesso: false, erro: 'Não é a vez deste jogador' };
        }

        // Registra a jogada
        const ordem = estado.rodadaAtual.cartasJogadas.length + 1;
        const cartaJogada: CartaJogada = {
          carta,
          jogadorId,
          ordem,
        };

        const rodadaAtualizada = {
          ...estado.rodadaAtual,
          cartasJogadas: [...estado.rodadaAtual.cartasJogadas, cartaJogada],
        };

        // Atualiza cartas jogadas globalmente
        const cartasJogadas = [...estado.cartasJogadas, carta];

        // Remove da mão do usuário se for ele
        let maoUsuario = estado.maoUsuario;
        if (jogadorId === estado.configuracao.idUsuario) {
          const index = encontrarCarta(maoUsuario, carta);
          if (index !== -1) {
            maoUsuario = removerCarta(maoUsuario, carta);
          }
        }

        // Atualiza análise de estilo
        let analisesEstilo = { ...estado.analisesEstilo };
        const analiseAtual = analisesEstilo[jogadorId];
        if (analiseAtual) {
          analisesEstilo[jogadorId] = atualizarAnaliseEstilo(
            analiseAtual,
            cartaJogada,
            rodadaAtualizada,
            estado.trunfo,
            jogadorId === estado.configuracao.idUsuario ? maoUsuario : []
          );
        }

        // Determina próximo jogador
        const ordemJogo = determinarOrdemJogo(
          estado.configuracao.numeroJogadores,
          estado.rodadas.length > 0
            ? estado.rodadas[estado.rodadas.length - 1]?.vencedor ?? null
            : null,
          estado.configuracao.idUsuario
        );

        const indexAtual = ordemJogo.indexOf(jogadorId);
        const proximoJogador = ordemJogo[indexAtual + 1] ?? null;

        // Verifica se a rodada está completa
        const rodadaCompleta =
          rodadaAtualizada.cartasJogadas.length === estado.configuracao.numeroJogadores;

        set({
          estado: {
            ...estado,
            rodadaAtual: rodadaAtualizada,
            proximoJogador,
            cartasJogadas,
            maoUsuario,
            analisesEstilo,
            recomendacaoAtual: null, // Limpa recomendação após jogada
          },
        });

        if (rodadaCompleta) {
          return {
            sucesso: true,
            mensagem: 'Rodada completa! Finalize a rodada para ver o resultado.',
          };
        }

        return {
          sucesso: true,
          mensagem: `Carta registrada. Próximo: ${proximoJogador ?? 'desconhecido'}`,
        };
      },

      finalizarRodada: (): ResultadoAcao => {
        const { estado } = get();

        if (!estado.rodadaAtual) {
          return { sucesso: false, erro: 'Nenhuma rodada ativa' };
        }

        // Determina vencedor
        const resultado = determinarVencedorRodada(estado.rodadaAtual, estado.trunfo);

        if (!resultado) {
          return { sucesso: false, erro: 'Não foi possível determinar o vencedor' };
        }

        // Atualiza rodada com vencedor
        const rodadaFinalizada: Rodada = {
          ...estado.rodadaAtual,
          vencedor: resultado.vencedor,
          pontosGanhos: resultado.pontosGanhos,
          completa: true,
        };

        // Atualiza pontos do jogador vencedor
        const jogadores = { ...estado.jogadores };
        const vencedor = jogadores[resultado.vencedor];

        if (vencedor) {
          const cartasDaRodada = rodadaFinalizada.cartasJogadas.map((cj) => cj.carta);
          vencedor.cartasGanhas = [...vencedor.cartasGanhas, ...cartasDaRodada];
          vencedor.pontos += resultado.pontosGanhos;
          jogadores[resultado.vencedor] = vencedor;
        }

        // Adiciona rodada ao histórico
        const rodadas = [...estado.rodadas, rodadaFinalizada];

        // Verifica fim de jogo
        const fimDeJogo = verificarFimDeJogo(estado.cartasJogadas);

        if (fimDeJogo) {
          const pontosJogadores: Record<JogadorId, number> = {} as Record<
            JogadorId,
            number
          >;
          Object.entries(jogadores).forEach(([id, j]) => {
            pontosJogadores[id as JogadorId] = j.pontos;
          });

          const vencedorJogo = determinarVencedorJogo(
            pontosJogadores,
            estado.configuracao.numeroJogadores
          );

          set({
            estado: {
              ...estado,
              status: StatusJogo.FINALIZADO,
              rodadas,
              rodadaAtual: null,
              jogadores,
              vencedor: vencedorJogo,
            },
          });

          return {
            sucesso: true,
            mensagem: `Jogo finalizado! Vencedor: ${vencedorJogo ?? 'Empate'}`,
          };
        }

        // Cria nova rodada
        const ordemJogo = determinarOrdemJogo(
          estado.configuracao.numeroJogadores,
          resultado.vencedor,
          estado.configuracao.idUsuario
        );

        const novaRodada: Rodada = {
          numero: rodadas.length + 1,
          cartasJogadas: [],
          vencedor: null,
          pontosGanhos: 0,
          completa: false,
        };

        set({
          estado: {
            ...estado,
            rodadas,
            rodadaAtual: novaRodada,
            jogadores,
            proximoJogador: ordemJogo[0] ?? null,
          },
        });

        return {
          sucesso: true,
          mensagem: `Rodada finalizada! Vencedor: ${resultado.vencedor} (+${resultado.pontosGanhos} pontos)`,
        };
      },

      atualizarMaoUsuario: (cartas: Carta[]): ResultadoAcao => {
        const { estado } = get();

        set({
          estado: {
            ...estado,
            maoUsuario: cartas,
          },
        });

        return {
          sucesso: true,
          mensagem: 'Mão atualizada com sucesso',
        };
      },

      solicitarRecomendacao: (): ResultadoAcao => {
        const { estado } = get();

        if (estado.maoUsuario.length === 0) {
          return {
            sucesso: false,
            erro: 'Informe as cartas da sua mão primeiro',
          };
        }

        const recomendacao = obterMelhorRecomendacao(estado);

        set({
          estado: {
            ...estado,
            recomendacaoAtual: recomendacao,
          },
        });

        return {
          sucesso: true,
          mensagem: recomendacao
            ? `Recomendação: ${recomendacao.motivo}`
            : 'Nenhuma recomendação disponível',
        };
      },

      resetarJogo: (): ResultadoAcao => {
        set({ estado: criarEstadoInicial() });

        return {
          sucesso: true,
          mensagem: 'Jogo resetado',
        };
      },
    }),
    {
      name: 'bisca-game-storage',
      partialize: (state) => ({ estado: state.estado }),
    }
  )
);
