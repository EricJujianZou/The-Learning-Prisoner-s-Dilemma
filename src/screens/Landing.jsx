import { useState, useEffect, useRef } from 'react';
import { fetchLeaderboard } from '../storage/leaderboard.js';

export default function Landing({ onStart }) {
  const [entries, setEntries] = useState([]);
  const [doorAnimating, setDoorAnimating] = useState(false);
  const doorRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard().then((data) => setEntries(data.slice(0, 10)));
  }, []);

  function handleStart() {
    if (doorAnimating) return;
    setDoorAnimating(true);
    setTimeout(() => onStart(), 600);
  }

  return (
    <div
      className="corridor h-full w-full flex flex-col items-center justify-start overflow-y-auto"
      style={{ perspective: '1000px', perspectiveOrigin: '50% 35%' }}
    >
      <div className="corridor-depth" />

      <div
        className="relative z-10 w-full flex flex-col items-center"
        style={{ maxWidth: '480px', padding: '0 16px', paddingTop: '6vh', paddingBottom: '40px' }}
      >
        {/* ── Door Frame ─────────────────────────────────────────────── */}
        <div
          ref={doorRef}
          className="door-frame w-full"
          style={{
            padding: '40px 32px 32px',
            transformOrigin: '50% 50%',
            transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            transform: doorAnimating ? 'scale(1.05)' : 'scale(1)',
            opacity: doorAnimating ? 0 : 1,
          }}
        >
          {/* Title */}
          <div className="text-center mb-6">
            <h1
              className="font-display font-bold text-text-primary uppercase"
              style={{ fontSize: '28px', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              The Prisoner's Game
            </h1>
            <p className="font-mono text-text-secondary mt-2" style={{ fontSize: '13px', letterSpacing: '0.01em' }}>
              6 opponents. 1 learns.
            </p>
          </div>

          {/* Payoff matrix mini */}
          <div
            className="mb-6 p-4 rounded-mirror"
            style={{ background: 'rgba(7, 7, 11, 0.6)', border: '1px solid var(--color-border)' }}
          >
            <div className="text-2xs font-mono text-text-ghost uppercase tracking-widest mb-3 text-center">
              Payoff Matrix — You / Them
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: '32px 1fr 1fr', gridTemplateRows: '20px 1fr 1fr', fontSize: '11px' }}>
              <div />
              <div className="text-center text-2xs font-mono text-text-ghost flex items-end justify-center pb-1">They C</div>
              <div className="text-center text-2xs font-mono text-text-ghost flex items-end justify-center pb-1">They D</div>
              <div className="text-2xs font-mono text-text-ghost flex items-center justify-end pr-1">You C</div>
              <div className="flex items-center justify-center p-2 rounded-sm font-mono font-medium" style={{ background: 'rgba(45,181,99,0.08)', border: '1px solid rgba(45,181,99,0.2)', color: 'var(--color-cooperate)' }}>3 / 3</div>
              <div className="flex items-center justify-center p-2 rounded-sm font-mono" style={{ background: 'rgba(217,69,69,0.06)', border: '1px solid rgba(217,69,69,0.15)', color: 'var(--color-text-secondary)' }}>0 / 5</div>
              <div className="text-2xs font-mono text-text-ghost flex items-center justify-end pr-1">You D</div>
              <div className="flex items-center justify-center p-2 rounded-sm font-mono" style={{ background: 'rgba(217,69,69,0.06)', border: '1px solid rgba(217,69,69,0.15)', color: 'var(--color-text-secondary)' }}>5 / 0</div>
              <div className="flex items-center justify-center p-2 rounded-sm font-mono text-text-ghost" style={{ background: 'rgba(17,17,25,0.8)', border: '1px solid rgba(34,34,54,0.8)' }}>1 / 1</div>
            </div>
          </div>

          {/* Instructions */}
          <p className="font-mono text-text-secondary text-center mb-4" style={{ fontSize: '12px', lineHeight: 1.5 }}>
            You pick. They pick. You both score. Beat all 6 to make the leaderboard.
          </p>

          {/* Chungus intro */}
          <div
            className="text-center mb-6 py-3 px-4 rounded-sm"
            style={{ background: 'var(--color-chungus-dim)' }}
          >
            <p
              className="font-mono italic text-chungus"
              style={{ fontWeight: 300, fontSize: '14px', lineHeight: 1.6 }}
            >
              &ldquo;Figure it out. That's the game.&rdquo;
            </p>
          </div>

          {/* Start button — the door handle */}
          <button
            onClick={handleStart}
            disabled={doorAnimating}
            className="door-glow w-full font-display font-medium text-accent-bright uppercase"
            style={{
              background: 'rgba(91, 95, 230, 0.08)',
              border: '1px solid var(--color-accent)',
              borderRadius: '6px',
              padding: '16px',
              fontSize: '15px',
              letterSpacing: '0.12em',
              cursor: doorAnimating ? 'not-allowed' : 'pointer',
              touchAction: 'manipulation',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(91, 95, 230, 0.16)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(91, 95, 230, 0.08)'; }}
          >
            ENTER
          </button>
        </div>

        {/* ── Leaderboard preview (clipboard on the wall) ────────────── */}
        {entries.length > 0 && (
          <div className="w-full mt-8">
            <div
              className="rounded-clipboard overflow-hidden"
              style={{ background: '#1A1A24', border: '1px solid var(--color-border)' }}
            >
              {/* Clip */}
              <div
                className="h-4 relative flex items-center justify-center"
                style={{ background: '#1E1E2E', borderBottom: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-8 h-2.5 rounded-sm"
                  style={{ background: 'linear-gradient(180deg, #3A3A52 0%, #2A2A3E 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>

              <div className="p-4">
                <div className="text-2xs font-mono text-text-ghost uppercase tracking-widest mb-3">
                  Leaderboard
                </div>
                {entries.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 font-mono py-1.5"
                    style={{ borderBottom: '1px solid var(--color-border)', fontSize: '12px' }}
                  >
                    <span className="text-text-ghost w-4 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-text-secondary flex-1 truncate">{entry.name}</span>
                    <span className="text-text-primary font-medium">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
