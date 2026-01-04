'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/game-store';
import { ConfiguracaoJogo, JogadorId } from '@/lib/bisca/types';

const SetupPage = () => {
  const router = useRouter();
  const iniciarJogo = useGameStore((state) => state.iniciarJogo);

  const [numeroJogadores, setNumeroJogadores] = useState<2 | 4>(2);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [nomeOponente1, setNomeOponente1] = useState('');
  const [nomeOponente2, setNomeOponente2] = useState('');
  const [nomeOponente3, setNomeOponente3] = useState('');

  const handleIniciar = (): void => {
    const nomesJogadores: string[] = [nomeUsuario || 'Você'];

    if (numeroJogadores === 2) {
      nomesJogadores.push(nomeOponente1 || 'Oponente');
    } else {
      nomesJogadores.push(
        nomeOponente1 || 'Oponente 1',
        nomeOponente2 || 'Parceiro',
        nomeOponente3 || 'Oponente 2'
      );
    }

    const configuracao: ConfiguracaoJogo = {
      numeroJogadores,
      nomesJogadores,
      idUsuario: 'jogador1' as JogadorId,
    };

    const resultado = iniciarJogo(configuracao);

    if (resultado.sucesso) {
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
                  numeroJogadores === 2
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                2 Jogadores
              </button>
              <button
                onClick={() => setNumeroJogadores(4)}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  numeroJogadores === 4
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                4 Jogadores
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="nomeUsuario" className="block text-sm font-medium text-gray-700 mb-2">
              Seu Nome
            </label>
            <input
              type="text"
              id="nomeUsuario"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label htmlFor="nomeOponente1" className="block text-sm font-medium text-gray-700 mb-2">
              {numeroJogadores === 2 ? 'Nome do Oponente' : 'Oponente 1'}
            </label>
            <input
              type="text"
              id="nomeOponente1"
              value={nomeOponente1}
              onChange={(e) => setNomeOponente1(e.target.value)}
              placeholder={numeroJogadores === 2 ? 'Nome do oponente' : 'Nome do oponente 1'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {numeroJogadores === 4 && (
            <>
              <div>
                <label htmlFor="nomeOponente2" className="block text-sm font-medium text-gray-700 mb-2">
                  Parceiro (Jogador 3)
                </label>
                <input
                  type="text"
                  id="nomeOponente2"
                  value={nomeOponente2}
                  onChange={(e) => setNomeOponente2(e.target.value)}
                  placeholder="Nome do parceiro"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="nomeOponente3" className="block text-sm font-medium text-gray-700 mb-2">
                  Oponente 2 (Jogador 4)
                </label>
                <input
                  type="text"
                  id="nomeOponente3"
                  value={nomeOponente3}
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
