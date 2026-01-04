'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/game-store';
import { GameConfiguration, PlayerId, Card } from '@/lib/bisca/types';
import { CardSelector } from '@/components/game/card-selector';
import { Card as PlayingCard } from '@/components/game/card';

const SetupPage = () => {
  const router = useRouter();
  const startGame = useGameStore((state) => state.startGame);

  const [numberOfPlayers, setNumeroJogadores] = useState<2 | 4>(2);
  const [userName, setNomeUsuario] = useState('');
  const [opponentName1, setNomeOponente1] = useState('');
  const [opponentName2, setNomeOponente2] = useState('');
  const [opponentName3, setNomeOponente3] = useState('');
  const [trump, setTrump] = useState<Card | null>(null);
  const [showTrumpSelector, setShowTrumpSelector] = useState(false);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedNumberOfPlayers = localStorage.getItem('bisca-numberOfPlayers');
    const savedUserName = localStorage.getItem('bisca-userName');
    const savedOpponent1 = localStorage.getItem('bisca-opponent1');
    const savedOpponent2 = localStorage.getItem('bisca-opponent2');
    const savedOpponent3 = localStorage.getItem('bisca-opponent3');

    if (savedNumberOfPlayers) {
      setNumeroJogadores(parseInt(savedNumberOfPlayers) as 2 | 4);
    }
    if (savedUserName) setNomeUsuario(savedUserName);
    if (savedOpponent1) setNomeOponente1(savedOpponent1);
    if (savedOpponent2) setNomeOponente2(savedOpponent2);
    if (savedOpponent3) setNomeOponente3(savedOpponent3);
  }, []);

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('bisca-numberOfPlayers', numberOfPlayers.toString());
  }, [numberOfPlayers]);

  useEffect(() => {
    if (userName) localStorage.setItem('bisca-userName', userName);
  }, [userName]);

  useEffect(() => {
    if (opponentName1) localStorage.setItem('bisca-opponent1', opponentName1);
  }, [opponentName1]);

  useEffect(() => {
    if (opponentName2) localStorage.setItem('bisca-opponent2', opponentName2);
  }, [opponentName2]);

  useEffect(() => {
    if (opponentName3) localStorage.setItem('bisca-opponent3', opponentName3);
  }, [opponentName3]);

  const handleIniciar = (): void => {
    const playerNames: string[] = [userName || 'Você'];

    if (numberOfPlayers === 2) {
      playerNames.push(opponentName1 || 'Oponente');
    } else {
      playerNames.push(
        opponentName1 || 'Oponente 1',
        opponentName2 || 'Parceiro',
        opponentName3 || 'Oponente 2'
      );
    }

    const configuracao: GameConfiguration = {
      numberOfPlayers,
      playerNames,
      userId: 'player1' as PlayerId,
      trump: trump,
    };

    const resultado = startGame(configuracao);

    if (resultado.success) {
      router.push('/game');
    }
  };

  const handleSelectTrump = (card: Card): void => {
    setTrump(card);
    setShowTrumpSelector(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Configurar Partida</h1>
          <p className="text-gray-600 mt-2">Configure sua partida de Bisca</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Jogadores
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNumeroJogadores(2)}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  numberOfPlayers === 2
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                2 Jogadores
              </button>
              <button
                onClick={() => setNumeroJogadores(4)}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  numberOfPlayers === 4
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                4 Jogadores
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              Seu Nome
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setNomeUsuario(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label htmlFor="opponentName1" className="block text-sm font-medium text-gray-700 mb-2">
              {numberOfPlayers === 2 ? 'Nome do Oponente' : 'Oponente 1'}
            </label>
            <input
              type="text"
              id="opponentName1"
              value={opponentName1}
              onChange={(e) => setNomeOponente1(e.target.value)}
              placeholder={numberOfPlayers === 2 ? 'Nome do oponente' : 'Nome do oponente 1'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {numberOfPlayers === 4 && (
            <>
              <div>
                <label htmlFor="opponentName2" className="block text-sm font-medium text-gray-700 mb-2">
                  Parceiro (Jogador 3)
                </label>
                <input
                  type="text"
                  id="opponentName2"
                  value={opponentName2}
                  onChange={(e) => setNomeOponente2(e.target.value)}
                  placeholder="Nome do parceiro"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="opponentName3" className="block text-sm font-medium text-gray-700 mb-2">
                  Oponente 2 (Jogador 4)
                </label>
                <input
                  type="text"
                  id="opponentName3"
                  value={opponentName3}
                  onChange={(e) => setNomeOponente3(e.target.value)}
                  placeholder="Nome do oponente 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trunfo (Opcional)
            </label>
            <div className="space-y-2">
              {trump ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <PlayingCard carta={trump} small />
                  <button
                    onClick={() => setTrump(null)}
                    className="ml-auto px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTrumpSelector(true)}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-gray-600 hover:text-green-600"
                >
                  + Selecionar Trunfo
                </button>
              )}
              <p className="text-xs text-gray-500">
                Se não selecionar, será usada a última carta do baralho
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleIniciar}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Iniciar Partida
        </button>
      </div>

      {/* Modal do Seletor de Trunfo */}
      {showTrumpSelector && (
        <CardSelector
          title="Selecionar Trunfo"
          onSelect={handleSelectTrump}
          onCancel={() => setShowTrumpSelector(false)}
        />
      )}
    </div>
  );
};

export default SetupPage;
