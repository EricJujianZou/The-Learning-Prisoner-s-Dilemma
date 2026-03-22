import { useState, useEffect, useRef } from 'react';
import { fetchLeaderboard, submitScore } from '../storage/leaderboard.js';
import Narrator from '../components/Narrator.jsx';

export default function Leaderboard({ totalScore, onPlayAgain }) {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard().then(setEntries);
    // Trigger slide-up animation
    const t = setTimeout(() => setOpen(true), 50);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || submitted || submitting) return;
    setSubmitting(true);
    const ok = await submitScore(name.trim(), totalScore);
    if (ok) {
      setSubmitted(true);
      const updated = await fetchLeaderboard();
      setEntries(updated);
    }
    setSubmitting(false);
  }

  // Find player rank in entries
  const playerEntryIndex = submitted
    ? entries.findIndex((e) => e.name === name.trim() && e.score === totalScore)
    : -1;

  return (
    <div className="h-full w-full room flex flex-col items-center justify-end relative">
      {/* Background room */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ opacity: 0.3 }}
      >
        <div
          className="font-display font-bold text-text-primary uppercase text-center"
          style={{ fontSize: '14px', letterSpacing: '0.12em' }}
        >
          Game Complete
        </div>
        <div
          className="font-mono text-text-primary mt-2"
          style={{ fontSize: '48px', fontWeight: 500 }}
        >
          {totalScore}
        </div>
        <div className="font-mono text-text-ghost" style={{ fontSize: '11px' }}>
          total score
        </div>
      </div>

      {/* Clipboard overlay */}
      <div className="clipboard-overlay">
        <div className={`clipboard ${open ? 'open' : ''}`}>
          {/* Clip */}
          <div className="clipboard-clip" />

          <div className="clipboard-body">
            {/* Score header */}
            <div className="text-center mb-6">
              <div
                className="font-display font-bold text-text-primary uppercase"
                style={{ fontSize: '13px', letterSpacing: '0.1em', marginBottom: '4px' }}
              >
                Your Score
              </div>
              <div
                className="font-mono text-text-primary"
                style={{ fontSize: '40px', fontWeight: 500, lineHeight: 1 }}
              >
                {totalScore}
              </div>
              <div className="font-mono text-text-ghost mt-1" style={{ fontSize: '11px' }}>
                max 350
              </div>
            </div>

            {/* Chungus */}
            <div className="mb-5 p-3 rounded-sm" style={{ background: 'var(--color-chungus-dim)' }}>
              <Narrator text="Put your name down. Let them know you were here." />
            </div>

            {/* Name input */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-3 mb-5 items-end">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    className="name-input"
                    placeholder="your name here"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={32}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim() || submitting}
                  className="font-display font-medium uppercase"
                  style={{
                    background: 'rgba(91,95,230,0.12)',
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-accent-bright)',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    cursor: name.trim() && !submitting ? 'pointer' : 'not-allowed',
                    opacity: name.trim() && !submitting ? 1 : 0.4,
                    flexShrink: 0,
                    touchAction: 'manipulation',
                  }}
                >
                  {submitting ? '...' : 'Submit'}
                </button>
              </form>
            ) : (
              <div className="font-mono text-text-secondary mb-5" style={{ fontSize: '12px' }}>
                Submitted as <span className="text-text-primary">{name}</span>.
              </div>
            )}

            {/* Leaderboard */}
            {entries.length > 0 && (
              <div>
                <div
                  className="font-mono text-text-ghost uppercase tracking-widest mb-3"
                  style={{ fontSize: '10px' }}
                >
                  Leaderboard
                </div>
                {entries.slice(0, 20).map((entry, i) => {
                  const isPlayer = i === playerEntryIndex;
                  return (
                    <div
                      key={i}
                      className={`leaderboard-row ${isPlayer ? 'leaderboard-row--player' : ''}`}
                    >
                      <span
                        className="font-mono w-5 text-right flex-shrink-0"
                        style={{
                          color: isPlayer ? 'var(--color-chungus)' : 'var(--color-text-ghost)',
                          fontSize: '12px',
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="flex-1 truncate font-mono"
                        style={{
                          color: isPlayer ? 'var(--color-chungus)' : 'var(--color-text-secondary)',
                          fontSize: '13px',
                        }}
                      >
                        {entry.name}
                      </span>
                      <span
                        className="font-mono font-medium flex-shrink-0"
                        style={{
                          color: isPlayer ? 'var(--color-chungus)' : 'var(--color-text-primary)',
                          fontSize: '13px',
                        }}
                      >
                        {entry.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Play again */}
            <div className="mt-6 pb-2">
              <button
                onClick={onPlayAgain}
                className="w-full analysis-btn analysis-btn--retry"
                style={{ textAlign: 'center' }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
