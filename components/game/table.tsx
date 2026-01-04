import { Card as CardType, Round, Player, PlayerId } from '@/lib/bisca/types';
import { Card as PlayingCard } from './card';
import { getCurrentWinner } from '@/lib/bisca/round-winner';

type TableProps = {
  currentRound: Round | null;
  trump: CardType | null;
  players: Record<PlayerId, Player>;
};

export const Table = ({ currentRound, trump, players }: TableProps) => {
  if (!currentRound || currentRound.playedCards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🃏</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mesa</h3>
          <p className="text-gray-500">Aguardando a primeira jogada...</p>
        </div>
      </div>
    );
  }

  // Calculate current winner
  const winnerResult = getCurrentWinner(currentRound.playedCards, trump);

  // Sort cards by play order (left to right: 1st, 2nd, 3rd, 4th)
  const sortedCards = [...currentRound.playedCards].sort((a, b) => a.order - b.order);

  // Calculate total points on the table
  const totalPoints = sortedCards.reduce((sum, pc) => sum + pc.card.points, 0);

  const trumpSuit = trump?.suit;

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-white mb-1">🎴 Mesa</h3>
        <p className="text-sm text-green-100">
          {sortedCards.length} carta{sortedCards.length > 1 ? 's' : ''} jogada{sortedCards.length > 1 ? 's' : ''} • {totalPoints} pontos em jogo
        </p>
      </div>

      {/* Cards displayed horizontally in play order */}
      <div className="flex items-end justify-center gap-4 mb-4 min-h-40">
        {sortedCards.map((playedCard) => {
          const player = players[playedCard.playerId];
          const isWinning = winnerResult?.winnerId === playedCard.playerId;
          const isTrump = trumpSuit ? playedCard.card.suit === trumpSuit : false;

          return (
            <div
              key={`${playedCard.playerId}-${playedCard.order}`}
              className="flex flex-col items-center gap-2"
            >
              {/* Card */}
              <PlayingCard
                carta={playedCard.card}
                isWinning={isWinning}
                isTrump={isTrump}
              />

              {/* Player name */}
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                isWinning
                  ? 'bg-green-400 text-green-900'
                  : 'bg-white/20 text-white'
              }`}>
                {player?.name ?? 'Desconhecido'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Winner explanation */}
      {winnerResult && (
        <div className="bg-green-800/40 backdrop-blur-sm rounded-lg p-3 text-center">
          <p className="text-green-100 text-sm font-medium">
            💡 {winnerResult.reason}
          </p>
        </div>
      )}
    </div>
  );
};
