import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GameState,
  GameStatus,
  GameConfiguration,
  Card,
  PlayerId,
  Player,
  Round,
  PlayedCard,
  ActionResult,
  Team,
  TeamId,
} from '../bisca/types';
import {
  createDeck,
  shuffle,
  findCard,
  removeCard,
} from '../bisca/deck';
import {
  determineRoundWinner,
  determinePlayOrder,
  checkGameEnd,
  determineGameWinner,
  getTeamIdByPlayerId,
} from '../bisca/rules';
import {
  createInitialStyleAnalysis,
  updateStyleAnalysis,
} from '../bisca/style-analyzer';
import { getBestRecommendation } from '../bisca/recommendation-engine';

/**
 * Estado inicial do jogo
 */
const createInitialState = (): GameState => ({
  status: GameStatus.SETUP,
  configuration: {
    numberOfPlayers: 2,
    playerNames: [],
    userId: 'player1',
  },
  players: {} as Record<PlayerId, Player>,
  teams: undefined,
  trump: null,
  rounds: [],
  currentRound: null,
  nextPlayer: null,
  firstPlayer: null,
  cardsInDeck: 40,
  playedCards: [],
  userHand: [],
  winner: null,
  styleAnalyses: {} as Record<PlayerId, any>,
  currentRecommendation: null,
});

/**
 * Cria players iniciais
 */
const createPlayers = (configuration: GameConfiguration): Record<PlayerId, Player> => {
  const players: Record<PlayerId, Player> = {} as Record<PlayerId, Player>;

  const ids: PlayerId[] = configuration.numberOfPlayers === 2
    ? ['player1', 'player2']
    : ['player1', 'player2', 'player3', 'player4'];

  ids.forEach((id, index) => {
    players[id] = {
      id,
      name: configuration.playerNames[index] ?? `Player ${index + 1}`,
      points: 0,
      wonCards: [],
      numberOfCardsInHand: configuration.numberOfPlayers === 2 ? 3 : 10,
      isUser: id === configuration.userId,
    };
  });

  return players;
};

/**
 * Zustand Store
 */
type GameStore = {
  state: GameState;
  startGame: (configuration: GameConfiguration) => ActionResult;
  registerPlayedCard: (playerId: PlayerId, card: Card) => ActionResult;
  updateUserHand: (cards: Card[]) => ActionResult;
  requestRecommendation: () => ActionResult;
  finalizeRound: () => ActionResult;
  resetGame: () => ActionResult;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      state: createInitialState(),

      startGame: (configuration: GameConfiguration): ActionResult => {
        try {
          // Cria deck e embaralha
          const deck = shuffle(createDeck());

          // Trunfo é o configurado ou a última card do deck
          const trump = configuration.trump ?? deck[deck.length - 1] ?? null;

          // Cria players
          const players = createPlayers(configuration);

          // Cria análises de estilo iniciais
          const styleAnalyses: Record<PlayerId, any> = {} as Record<PlayerId, any>;
          Object.keys(players).forEach((id) => {
            styleAnalyses[id as PlayerId] = createInitialStyleAnalysis(id as PlayerId);
          });

          // Cria times se for 4 jogadores
          const teams = configuration.numberOfPlayers === 4 ? {
            team1: {
              id: 'team1' as TeamId,
              name: `${configuration.playerNames[0]} & ${configuration.playerNames[2]}`,
              points: 0,
              wonCards: [],
              playerIds: ['player1' as PlayerId, 'player3' as PlayerId],
            },
            team2: {
              id: 'team2' as TeamId,
              name: `${configuration.playerNames[1]} & ${configuration.playerNames[3]}`,
              points: 0,
              wonCards: [],
              playerIds: ['player2' as PlayerId, 'player4' as PlayerId],
            },
          } as Record<TeamId, Team> : undefined;

          // Cria primeira rodada
          const firstRound: Round = {
            number: 1,
            playedCards: [],
            winner: null,
            pointsWon: 0,
            complete: false,
          };

          set({
            state: {
              status: GameStatus.IN_PROGRESS,
              configuration: configuration,
              players,
              teams,
              trump,
              rounds: [],
              currentRound: firstRound,
              nextPlayer: null, // Será definido quando a primeira carta for jogada
              firstPlayer: null, // Será definido quando a primeira carta for jogada
              cardsInDeck: 40,
              playedCards: [],
              userHand: [],
              winner: null,
              styleAnalyses,
              currentRecommendation: null,
            },
          });

          return {
            success: true,
            message: 'Jogo iniciado com success! Informe as cards da sua mão.',
          };
        } catch (error) {
          return {
            success: false,
            error: 'Erro ao iniciar o jogo',
          };
        }
      },

      registerPlayedCard: (playerId: PlayerId, card: Card): ActionResult => {
        const { state } = get();

        if (state.status !== GameStatus.IN_PROGRESS) {
          return { success: false, error: 'Jogo não está em andamento' };
        }

        if (!state.currentRound) {
          return { success: false, error: 'Nenhuma rodada ativa' };
        }

        // Verifica se o jogador já jogou nesta rodada
        const alreadyPlayed = state.currentRound.playedCards.some(
          (pc) => pc.playerId === playerId
        );
        if (alreadyPlayed) {
          return {
            success: false,
            error: 'Este jogador já jogou nesta rodada',
          };
        }

        // Registra a jogada
        const order = state.currentRound.playedCards.length + 1;
        const playedCard: PlayedCard = {
          card,
          playerId,
          order,
        };

        const currentRoundizada = {
          ...state.currentRound,
          playedCards: [...state.currentRound.playedCards, playedCard],
        };

        // Atualiza cards jogadas globalmente
        const playedCards = [...state.playedCards, card];

        // Remove da mão do usuário se for ele
        let userHand = state.userHand;
        if (playerId === state.configuration.userId) {
          const index = findCard(userHand, card);
          if (index !== -1) {
            userHand = removeCard(userHand, card);
          }
        }

        // Atualiza análise de estilo
        let styleAnalyses = { ...state.styleAnalyses };
        const currentAnalysis = styleAnalyses[playerId];
        if (currentAnalysis) {
          styleAnalyses[playerId] = updateStyleAnalysis(
            currentAnalysis,
            playedCard,
            currentRoundizada,
            state.trump,
            playerId === state.configuration.userId ? userHand : []
          );
        }

        // LÓGICA DE PRIMEIRA JOGADA DINÂMICA
        let firstPlayer = state.firstPlayer;

        // Se é a primeira carta do jogo (nenhuma rodada completada E firstPlayer não definido)
        // Define o primeiro jogador como quem jogou esta carta
        if (state.firstPlayer === null && state.rounds.length === 0 && order === 1) {
          firstPlayer = playerId;
        }

        // Determina ordem de jogo
        let playOrder: PlayerId[];
        const previousWinner = state.rounds.length > 0
          ? state.rounds[state.rounds.length - 1]?.winner ?? null
          : null;

        playOrder = determinePlayOrder(
          state.configuration.numberOfPlayers,
          previousWinner,
          firstPlayer
        );

        // Determina próximo jogador
        const currentIndex = playOrder.indexOf(playerId);
        const nextPlayer = playOrder[currentIndex + 1] ?? null;

        // Verifica se a rodada está complete
        const roundComplete =
          currentRoundizada.playedCards.length === state.configuration.numberOfPlayers;

        set({
          state: {
            ...state,
            currentRound: currentRoundizada,
            nextPlayer,
            firstPlayer,
            playedCards,
            userHand,
            styleAnalyses,
            currentRecommendation: null, // Limpa recomendação após jogada
          },
        });

        if (roundComplete) {
          return {
            success: true,
            message: 'Round complete! Finalize a rodada para ver o result.',
          };
        }

        return {
          success: true,
          message: `Card registrada. Próximo: ${nextPlayer ?? 'desconhecido'}`,
        };
      },

      finalizeRound: (): ActionResult => {
        const { state } = get();

        if (!state.currentRound) {
          return { success: false, error: 'Nenhuma rodada ativa' };
        }

        // Determina winner
        const result = determineRoundWinner(state.currentRound, state.trump);

        if (!result) {
          return { success: false, error: 'Não foi possível determinar o winner' };
        }

        // Atualiza rodada com winner
        const finalizedRound: Round = {
          ...state.currentRound,
          winner: result.winner,
          pointsWon: result.pointsWon,
          complete: true,
        };

        const roundCards = finalizedRound.playedCards.map((cj) => cj.card);

        // Atualiza pontos: TIMES (4 jogadores) ou JOGADORES (2 jogadores)
        const players = { ...state.players };
        let teams = state.teams ? { ...state.teams } : undefined;

        if (state.teams) {
          // MODO 4 JOGADORES: Atualizar TIME ao invés de jogador individual
          const winnerTeamId = getTeamIdByPlayerId(result.winner);
          const winnerTeam = teams![winnerTeamId];

          teams![winnerTeamId] = {
            ...winnerTeam,
            wonCards: [...winnerTeam.wonCards, ...roundCards],
            points: winnerTeam.points + result.pointsWon,
          };
        } else {
          // MODO 2 JOGADORES: Atualizar jogador individual
          if (players[result.winner]) {
            const winner = players[result.winner];
            players[result.winner] = {
              ...winner,
              wonCards: [...winner.wonCards, ...roundCards],
              points: winner.points + result.pointsWon,
            };
          }
        }

        // Adiciona rodada ao histórico
        const rounds = [...state.rounds, finalizedRound];

        // Verifica fim de jogo
        const gameEnd = checkGameEnd(state.playedCards);

        if (gameEnd) {
          let winnerJogo: PlayerId | TeamId | null;

          if (state.teams) {
            // Determinar time vencedor
            const team1Points = teams!.team1.points;
            const team2Points = teams!.team2.points;

            if (team1Points > team2Points) {
              winnerJogo = 'team1';
            } else if (team2Points > team1Points) {
              winnerJogo = 'team2';
            } else {
              winnerJogo = null; // Empate
            }
          } else {
            // Determinar jogador vencedor
            const pointsPlayeres: Record<PlayerId, number> = {} as Record<PlayerId, number>;
            Object.entries(players).forEach(([id, j]) => {
              pointsPlayeres[id as PlayerId] = j.points;
            });

            winnerJogo = determineGameWinner(
              pointsPlayeres,
              state.configuration.numberOfPlayers
            );
          }

          set({
            state: {
              ...state,
              status: GameStatus.FINISHED,
              rounds,
              currentRound: null,
              players,
              teams,
              winner: winnerJogo,
            },
          });

          const winnerMessage = state.teams
            ? teams![winnerJogo as TeamId]?.name ?? 'Empate'
            : state.players[winnerJogo as PlayerId]?.name ?? 'Empate';

          return {
            success: true,
            message: `Jogo finalizado! Vencedor: ${winnerMessage}`,
          };
        }

        // Cria nova rodada
        const playOrder = determinePlayOrder(
          state.configuration.numberOfPlayers,
          result.winner,
          state.firstPlayer
        );

        const novaRound: Round = {
          number: rounds.length + 1,
          playedCards: [],
          winner: null,
          pointsWon: 0,
          complete: false,
        };

        set({
          state: {
            ...state,
            rounds,
            currentRound: novaRound,
            players,
            teams,
            nextPlayer: playOrder[0] ?? null,
          },
        });

        return {
          success: true,
          message: `Round finalizada! Vencedor: ${result.winner} (+${result.pointsWon} points)`,
        };
      },

      updateUserHand: (cards: Card[]): ActionResult => {
        const { state } = get();

        set({
          state: {
            ...state,
            userHand: cards,
          },
        });

        return {
          success: true,
          message: 'Mão atualizada com success',
        };
      },

      requestRecommendation: (): ActionResult => {
        const { state } = get();

        if (state.userHand.length === 0) {
          return {
            success: false,
            error: 'Informe as cards da sua mão primeiro',
          };
        }

        const recommendation = getBestRecommendation(state);

        set({
          state: {
            ...state,
            currentRecommendation: recommendation,
          },
        });

        return {
          success: true,
          message: recommendation
            ? `Recomendação: ${recommendation.reason}`
            : 'Nenhuma recomendação disponível',
        };
      },

      resetGame: (): ActionResult => {
        set({ state: createInitialState() });

        return {
          success: true,
          message: 'Jogo resetado',
        };
      },
    }),
    {
      name: 'bisca-game-storage',
      partialize: (state) => ({ state: state.state }),
    }
  )
);
