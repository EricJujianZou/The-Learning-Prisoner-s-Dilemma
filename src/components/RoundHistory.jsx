// Colored marker strip on the desk. Two stacked markers per round: player (top), opponent (bottom).
// Appears instantly on round complete — no fade, just snap.
export default function RoundHistory({ history, totalRounds }) {
  const slots = Array.from({ length: totalRounds });

  return (
    <div className="history-strip" style={{ justifyContent: 'space-between' }}>
      {slots.map((_, i) => {
        const round = history[i];
        return (
          <div key={i} className="history-slot">
            {/* Player marker */}
            <div
              className="history-marker"
              style={{
                background: round
                  ? round.playerMove === 'C'
                    ? 'var(--color-cooperate)'
                    : 'var(--color-defect)'
                  : 'var(--color-text-ghost)',
                opacity: round ? 1 : 0.3,
              }}
            />
            {/* Opponent marker */}
            <div
              className="history-marker"
              style={{
                background: round
                  ? round.opponentMove === 'C'
                    ? 'rgba(45, 181, 99, 0.45)'
                    : 'rgba(217, 69, 69, 0.45)'
                  : 'var(--color-text-ghost)',
                opacity: round ? 1 : 0.3,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
