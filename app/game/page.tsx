'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/game-store';
import { Card, PlayerId, GameStatus } from '@/lib/bisca/types';
import { Card as PlayingCard } from '@/components/game/card';
import { CardSelector } from '@/components/game/card-selector';
import { Table } from '@/components/game/table';
import { cardToString } from '@/lib/bisca/deck';
import { describeStyle } from '@/lib/bisca/style-analyzer';

const GamePage = () => {
  const router = useRouter();
  const {
    state,
    registerPlayedCard,
    updateUserHand,
    requestRecommendation,
    finalizeRound,
    resetGame,
  } = useGameStore();

  const [mostrarSeletorMao, setMostrarSeletorMao] = useState(false);
  const [mostrarSeletorJogada, setMostrarSeletorJogada] = useState(false);
  const [jogadorSelecionado, setJogadorSelecionado] = useState<PlayerId | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    if (state.status === GameStatus.SETUP) {
      router.push('/setup');
    }
  }, [state.status, router]);

  const handleAdicionarCardMao = (carta: Card): void => {
    const novaMao = [...state.userHand, carta];
    updateUserHand(novaMao);

    // Auto-fechar modal quando atingir 3 cartas
    if (novaMao.length === 3) {
      setMostrarSeletorMao(false);
      setMensagem(`${cardToString(carta)} adicionada. Mão completa!`);
    } else {
      setMensagem(`${cardToString(carta)} adicionada à sua mão`);
    }

    setTimeout(() => setMensagem(''), 3000);
  };

  const handleRemoverCardMao = (carta: Card): void => {
    const novaMao = state.userHand.filter(
      (c) => !(c.rank === carta.rank && c.suit === carta.suit)
    );
    updateUserHand(novaMao);
    setMensagem(`${cardToString(carta)} removida da mão`);
    setTimeout(() => setMensagem(''), 3000);
  };

  const handleRegistrarJogada = (carta: Card): void => {
    if (!jogadorSelecionado) return;

    const resultado = registerPlayedCard(jogadorSelecionado, carta);
    setMensagem(resultado.message ?? resultado.error ?? '');
    setMostrarSeletorJogada(false);
    setJogadorSelecionado(null);
    setTimeout(() => setMensagem(''), 3000);
  };

  const handleSolicitarRecomendacao = (): void => {
    const resultado = requestRecommendation();
    setMensagem(resultado.message ?? resultado.error ?? '');
    setTimeout(() => setMensagem(''), 5000);
  };

  const handleJogarCartaSelecionada = (): void => {
    if (!selectedCard) return;

    const resultado = registerPlayedCard(usuarioId, selectedCard);
    setMensagem(resultado.message ?? resultado.error ?? '');
    setSelectedCard(null); // Limpar seleção após jogar
    setTimeout(() => setMensagem(''), 3000);
  };

  const handleFinalizarRodada = (): void => {
    console.log('🎯 Finalizando rodada...', {
      currentRound: state.currentRound,
      playedCards: state.currentRound?.playedCards.length,
      numberOfPlayers: state.configuration.numberOfPlayers,
    });

    const resultado = finalizeRound();

    console.log('📊 Resultado finalizeRound:', resultado);
    console.log('📈 State após finalizar:', {
      roundsCount: state.rounds.length,
      players: state.players,
    });

    setMensagem(resultado.message ?? resultado.error ?? '');
    setTimeout(() => setMensagem(''), 3000);
  };

  const handleResetar = (): void => {
    if (confirm('Tem certeza que deseja resetar o jogo?')) {
      resetGame();
      router.push('/');
    }
  };

  const rodadaCompleta =
    state.currentRound &&
    state.currentRound.playedCards.length === state.configuration.numberOfPlayers;

  const jogadores = Object.values(state.players);
  const usuarioId = state.configuration.userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bisca Assistant</h1>
            <p className="text-sm text-gray-600">
              Rodada {state.currentRound?.number ?? '-'} | Próximo:{' '}
              {state.nextPlayer ? state.players[state.nextPlayer]?.name : '-'}
            </p>
          </div>
          <button
            onClick={handleResetar}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Resetar
          </button>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg">
            {mensagem}
          </div>
        )}

        {/* Trunfo e Placar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trunfo */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Trunfo</h3>
            {state.trump ? (
              <div className="flex justify-center">
                <PlayingCard carta={state.trump} small />
              </div>
            ) : (
              <p className="text-gray-500 text-center">Nenhum trunfo definido</p>
            )}
          </div>

          {/* Placar */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Placar</h3>
            {state.teams ? (
              // MODO 4 JOGADORES - Mostrar TIMES
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-900">🔵 {state.teams.team1.name}</span>
                    <span className="font-bold text-2xl text-blue-600">{state.teams.team1.points}</span>
                  </div>
                  <div className="text-xs text-blue-700 flex gap-2">
                    {state.teams.team1.playerIds.map((pid) => (
                      <span key={pid} className={state.players[pid]?.isUser ? 'font-semibold' : ''}>
                        {state.players[pid]?.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border-2 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-red-900">🔴 {state.teams.team2.name}</span>
                    <span className="font-bold text-2xl text-red-600">{state.teams.team2.points}</span>
                  </div>
                  <div className="text-xs text-red-700 flex gap-2">
                    {state.teams.team2.playerIds.map((pid) => (
                      <span key={pid} className={state.players[pid]?.isUser ? 'font-semibold' : ''}>
                        {state.players[pid]?.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // MODO 2 JOGADORES - Mostrar jogadores individuais
              <div className="space-y-2">
                {jogadores.map((jogador) => (
                  <div
                    key={jogador.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      jogador.id === usuarioId ? 'bg-green-100' : 'bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{jogador.name}</span>
                    <span className="font-bold text-green-600">{jogador.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mesa */}
        <Table
          currentRound={state.currentRound}
          trump={state.trump}
          players={state.players}
        />

        {/* Indicador de Próximo Jogador */}
        {state.nextPlayer && !rodadaCompleta && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Vez de jogar:</p>
                <p className="text-xl font-bold text-blue-600">
                  {state.players[state.nextPlayer]?.name}
                </p>
              </div>
              {state.nextPlayer !== usuarioId && (
                <button
                  onClick={() => {
                    setJogadorSelecionado(state.nextPlayer);
                    setMostrarSeletorJogada(true);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Registrar Jogada
                </button>
              )}
            </div>
          </div>
        )}

        {/* Registrar Jogadas dos Oponentes - SEMPRE VISÍVEL */}
        {!rodadaCompleta && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Registrar Jogadas</h3>
            <p className="text-sm text-gray-600 mb-3">
              Registre as cartas jogadas pelos oponentes conforme eles jogam
            </p>
            <div className="flex flex-col gap-2">
              {jogadores
                .filter((j) => j.id !== usuarioId)
                .filter((j) => !state.currentRound?.playedCards.some((pc) => pc.playerId === j.id))
                .length > 0 ? (
                jogadores
                  .filter((j) => j.id !== usuarioId)
                  .filter((j) => !state.currentRound?.playedCards.some((pc) => pc.playerId === j.id))
                  .map((jogador) => {
                    const isNextPlayer = jogador.id === state.nextPlayer;

                    return (
                      <button
                        key={jogador.id}
                        onClick={() => {
                          setJogadorSelecionado(jogador.id);
                          setMostrarSeletorJogada(true);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors text-left ${
                          isNextPlayer
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{jogador.name}</span>
                          {isNextPlayer && <span className="text-sm">⬅️ Próximo</span>}
                        </span>
                      </button>
                    );
                  })
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Todos os oponentes já jogaram
                </p>
              )}
            </div>
          </div>
        )}

        {/* Finalizar Rodada */}
        {rodadaCompleta && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium mb-3 text-center">
              ✅ Todos jogaram! Finalize a rodada para ver o vencedor e continuar.
            </p>
            <button
              onClick={handleFinalizarRodada}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              🏆 Finalizar Rodada
            </button>
          </div>
        )}

        {/* Minha Mão */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Minha Mão</h3>
            <button
              onClick={() => setMostrarSeletorMao(true)}
              disabled={state.userHand.length >= 3}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                state.userHand.length >= 3
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              + Adicionar Card {state.userHand.length >= 3 && '(Mão cheia)'}
            </button>
          </div>

          {state.userHand.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-4 justify-center">
                {state.userHand.map((carta, index) => {
                  const isSelected = selectedCard?.rank === carta.rank && selectedCard?.suit === carta.suit;
                  const isRecommended = state.currentRecommendation?.card.rank === carta.rank &&
                                       state.currentRecommendation?.card.suit === carta.suit;

                  return (
                    <div key={index} className="relative group">
                      <PlayingCard
                        carta={carta}
                        onClick={() => setSelectedCard(isSelected ? null : carta)}
                        selected={isSelected}
                        recommended={isRecommended}
                      />
                      {/* Botão de remover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoverCardMao(carta);
                          if (isSelected) setSelectedCard(null);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                        title="Remover carta"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Botão para Jogar Carta Selecionada */}
              {selectedCard && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <button
                    onClick={handleJogarCartaSelecionada}
                    className="w-full max-w-xs px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    🎯 Jogar {cardToString(selectedCard)}
                  </button>
                  {state.nextPlayer && state.nextPlayer !== usuarioId && (
                    <p className="text-xs text-gray-500">
                      Sugestão: aguardar {state.players[state.nextPlayer]?.name}
                    </p>
                  )}
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancelar seleção
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center">
              Adicione as cartas da sua mão usando o botão acima
            </p>
          )}

          {state.userHand.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleSolicitarRecomendacao}
                className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors"
              >
                ⭐ Solicitar Recomendação
              </button>
            </div>
          )}
        </div>

        {/* Recomendação */}
        {state.currentRecommendation && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl shadow-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Recomendação</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <PlayingCard carta={state.currentRecommendation.card} small />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {state.currentRecommendation.reason}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    <span>Prioridade: {state.currentRecommendation.priority}/100</span>
                    <span>Risco: {state.currentRecommendation.riskLevel}</span>
                    <span>
                      Prob. Vitória: {state.currentRecommendation.winProbability}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Análises de Estilo */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Análise de Estilo dos Jogadores</h3>
          <div className="space-y-2">
            {Object.values(state.styleAnalyses).map((analise) => (
              <div key={analise.playerId} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {state.players[analise.playerId]?.name}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {analise.style}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{describeStyle(analise)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico de Rodadas */}
        {state.rounds.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Histórico de Rodadas</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {state.rounds
                .slice()
                .reverse()
                .map((rodada) => {
                  const vencedor = state.players[rodada.winner!];

                  return (
                    <div
                      key={rodada.number}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">
                          Rodada {rodada.number}
                        </span>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{vencedor?.name} venceu</div>
                          <div className="text-sm text-gray-500">+{rodada.pointsWon} pontos</div>
                        </div>
                      </div>

                      {/* Cards jogadas */}
                      <div className="flex gap-2 flex-wrap mt-2">
                        {rodada.playedCards
                          .sort((a, b) => a.order - b.order)
                          .map((pc, idx) => {
                            const jogador = state.players[pc.playerId];
                            return (
                              <div
                                key={idx}
                                className="flex flex-col items-center bg-gray-50 rounded p-2"
                              >
                                <div className="text-xs text-gray-500 mb-1">
                                  {jogador?.name}
                                </div>
                                <PlayingCard carta={pc.card} small />
                                <div className="text-xs font-medium mt-1">{pc.card.points} pts</div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {mostrarSeletorMao && (
        <CardSelector
          title="Adicionar Card à Mão"
          onSelect={handleAdicionarCardMao}
          onCancel={() => setMostrarSeletorMao(false)}
        />
      )}

      {mostrarSeletorJogada && jogadorSelecionado && (
        <CardSelector
          title={`Registrar jogada de ${state.players[jogadorSelecionado]?.name}`}
          onSelect={handleRegistrarJogada}
          onCancel={() => {
            setMostrarSeletorJogada(false);
            setJogadorSelecionado(null);
          }}
        />
      )}
    </div>
  );
};

export default GamePage;
