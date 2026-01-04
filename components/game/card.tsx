import { Card as CardType, Suit } from '@/lib/bisca/types';

type CardProps = {
  carta: CardType;
  onClick?: () => void;
  selected?: boolean;
  recommended?: boolean;
  small?: boolean;
  isWinning?: boolean;
  isTrump?: boolean;
};

const simbolos: Record<Suit, { simbolo: string; cor: string }> = {
  [Suit.HEARTS]: { simbolo: '♥', cor: 'text-red-600' },
  [Suit.DIAMONDS]: { simbolo: '♦', cor: 'text-red-600' },
  [Suit.SPADES]: { simbolo: '♠', cor: 'text-gray-900' },
  [Suit.CLUBS]: { simbolo: '♣', cor: 'text-gray-900' },
};

export const Card = ({ carta, onClick, selected, recommended, small, isWinning, isTrump }: CardProps) => {
  const { simbolo, cor } = simbolos[carta.suit] ?? { simbolo: '?', cor: 'text-gray-500' };

  const tamanho = small ? 'w-16 h-24' : 'w-20 h-32';
  const textoTamanho = small ? 'text-sm' : 'text-lg';
  const simboloTamanho = small ? 'text-2xl' : 'text-4xl';

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${tamanho}
        bg-white
        rounded-lg
        shadow-lg
        border-2
        ${selected ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-300'}
        ${recommended ? 'border-yellow-500 ring-2 ring-yellow-300' : ''}
        ${isWinning ? 'border-green-600 ring-4 ring-green-400' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'cursor-default'}
        transition-all
        flex
        flex-col
        items-center
        justify-between
        p-2
        relative
      `}
    >
      {/* Rank no topo */}
      <div className={`${textoTamanho} font-bold ${cor}`}>{carta.rank}</div>

      {/* Símbolo no centro */}
      <div className={`${simboloTamanho} ${cor}`}>{simbolo}</div>

      {/* Pontos no rodapé */}
      {carta.points > 0 && (
        <div className="text-xs font-semibold text-gray-600 bg-yellow-100 px-1.5 py-0.5 rounded">
          {carta.points}
        </div>
      )}

      {/* Indicador de recomendada */}
      {recommended && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          ★
        </div>
      )}

      {/* Badge de GANHANDO */}
      {isWinning && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
          GANHANDO
        </div>
      )}

      {/* Badge de TRUNFO */}
      {isTrump && !isWinning && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
          T
        </div>
      )}
    </button>
  );
};
