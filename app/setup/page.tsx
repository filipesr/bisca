'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/game-store';
import { GameConfiguration, PlayerId } from '@/lib/bisca/types';

const SetupPage = () => {
  const router = useRouter();
  const startGame = useGameStore((state) => state.startGame);

  const [numberOfPlayers, setNumeroJogadores] = useState<2 | 4>(2);
  const [userName, setNomeUsuario] = useState('');
  const [opponentName1, setNomeOponente1] = useState('');
  const [opponentName2, setNomeOponente2] = useState('');
  const [opponentName3, setNomeOponente3] = useState('');

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
    };

    const resultado = startGame(configuracao);

    if (resultado.success) {
      router.push('/game');
    }
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
        </div>

        <button
          onClick={handleIniciar}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Iniciar Partida
        </button>
      </div>
    </div>
  );
};

export default SetupPage;
