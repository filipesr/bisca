import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-green-800">♠️ ♥️ ♣️ ♦️</h1>
          <h2 className="text-4xl font-bold text-gray-900">Bisca Assistant</h2>
          <p className="text-xl text-gray-600">
            Seu assistente inteligente para o jogo de cartas Bisca
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-900">
              O que o assistente faz?
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <span>
                  <strong>Rastreia cartas jogadas:</strong> Marca todas as cartas que já foram
                  jogadas na partida
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <span>
                  <strong>Recomenda jogadas:</strong> Sugere qual carta da sua mão você deve
                  jogar baseado em probabilidades
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <span>
                  <strong>Analisa o jogo:</strong> Detecta padrões e estilos de jogo dos
                  oponentes (agressivo/defensivo)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <span>
                  <strong>Calcula pontuação:</strong> Mantém controle dos pontos de cada jogador
                  em tempo real
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <Link
              href="/setup"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg py-4 px-6 rounded-xl transition-colors text-center"
            >
              Iniciar Nova Partida
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Versão 0.1.0 - Progressive Web App</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
