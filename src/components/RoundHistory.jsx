import { motion } from 'framer-motion';

// Colored marker strip on the desk. Two stacked markers per round: player (top), opponent (bottom).
// Filled slots stamp in with a spring scale; empty slots are ghost placeholders.
export default function RoundHistory({ history, totalRounds }) {
  const slots = Array.from({ length: totalRounds });

  return (
    <div className="history-strip" style={{ justifyContent: 'space-between' }}>
      {slots.map((_, i) => {
        const round = history[i];
        return (
          <div key={i} className="history-slot">
            {round ? (
              <motion.div
                key={`filled-${i}`}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <div
                  className="history-marker"
                  style={{
                    background: round.playerMove === 'C'
                      ? 'var(--color-cooperate)'
                      : 'var(--color-defect)',
                  }}
                />
                <div
                  className="history-marker"
                  style={{
                    background: round.opponentMove === 'C'
                      ? 'rgba(45, 181, 99, 0.45)'
                      : 'rgba(217, 69, 69, 0.45)',
                  }}
                />
              </motion.div>
            ) : (
              <div key={`empty-${i}`} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div className="history-marker" style={{ background: 'var(--color-text-ghost)', opacity: 0.3 }} />
                <div className="history-marker" style={{ background: 'var(--color-text-ghost)', opacity: 0.3 }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
