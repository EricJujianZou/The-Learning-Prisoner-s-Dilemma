import { useState, useEffect, useRef } from 'react';
import Narrator from '../components/Narrator.jsx';
import QTableReveal from '../components/QTableReveal.jsx';

const WIN_LINES = [
  "You figured it out. Most don't.",
  "Clean. Next.",
  "That was the easy part.",
];
const LOSE_LINES = [
  "Hm. Try again.",
  "It's not random. Think.",
  "You're smarter than that. Probably.",
];

function useTypewriter(text, speed = 40) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return displayed;
}

export default function PostLevel({ analysisData, onRetry, onNextLevel }) {
  const {
    won,
    pivot,
    playerScore,
    opponentScore,
    roundHistory,
    isRL,
    opponent,
    threshold,
    phaseScores,
    strategyName: rlStrategy,
    qTable,
    visitedStates,
  } = analysisData;

  const [showQTable, setShowQTable] = useState(false);

  // Pick chungus comment once on mount
  const chungusLine = useRef(
    isRL
      ? won
        ? 'It studied you and you still won. Interesting.'
        : 'It learned faster than you adapted. That happens.'
      : won
      ? WIN_LINES[Math.floor(Math.random() * WIN_LINES.length)]
      : LOSE_LINES[Math.floor(Math.random() * LOSE_LINES.length)]
  ).current;

  const displayName = isRL ? 'THE MACHINE' : opponent?.levelName ?? '';
  const typed = useTypewriter(displayName, 40);

  const explanation = isRL
    ? `Converged toward: ${rlStrategy}`
    : opponent?.explanation ?? '';

  let scoreText;
  if (isRL) {
    scoreText = `You ${playerScore} — Them ${opponentScore}.`;
  } else if (threshold?.type === 'outscore') {
    scoreText = `You ${playerScore} — Them ${opponentScore}. ${won ? 'You outscored them.' : 'They outscored you.'}`;
  } else {
    scoreText = `You scored ${playerScore}. Needed ${threshold?.value} to pass.`;
  }

  return (
    <div className="mirror-analysis animate-fade-in">
      {/* Win / Lose */}
      <div
        className="font-display font-bold uppercase text-center"
        style={{
          fontSize: '22px',
          letterSpacing: '0.04em',
          color: won ? 'var(--color-win)' : 'var(--color-lose)',
        }}
      >
        {won ? 'CLEAR' : 'FAILED'}
      </div>

      {/* Strategy name — types in */}
      <div>
        <div
          className="strategy-name cursor-blink"
          style={{ color: 'var(--color-text-primary)', minHeight: '28px' }}
        >
          {typed}
        </div>
        {typed.length === displayName.length && (
          <p
            className="font-mono text-text-secondary animate-fade-in"
            style={{ fontSize: '12px', marginTop: '6px', lineHeight: 1.5 }}
          >
            {explanation}
          </p>
        )}
      </div>

      {/* Round history timeline */}
      <HistoryTimeline history={roundHistory} pivot={pivot} />

      {/* RL phase comparison */}
      {isRL && phaseScores && (
        <div
          className="font-mono rounded-sm p-3"
          style={{ background: 'rgba(7,7,11,0.4)', border: '1px solid var(--color-border)', fontSize: '11px', lineHeight: 1.8 }}
        >
          <div className="text-text-ghost uppercase tracking-widest mb-1" style={{ fontSize: '10px' }}>
            Phase Comparison
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Phase 1 (1–10)</span>
            <span>
              You <span className="text-text-primary">{phaseScores.phase1Player}</span> — Them <span className="text-text-primary">{phaseScores.phase1Opponent}</span>
            </span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Phase 2 (11–20)</span>
            <span>
              You <span className="text-text-primary">{phaseScores.phase2Player}</span> — Them <span className="text-text-primary">{phaseScores.phase2Opponent}</span>
            </span>
          </div>
        </div>
      )}

      {/* Score summary */}
      <p className="font-mono text-text-secondary" style={{ fontSize: '12px' }}>
        {scoreText}
      </p>

      {/* Chungus comment */}
      <div
        className="rounded-sm p-3"
        style={{ background: 'var(--color-chungus-dim)' }}
      >
        <Narrator text={chungusLine} />
      </div>

      {/* Q-table toggle (RL boss only) */}
      {isRL && (
        <div>
          <button
            onClick={() => setShowQTable((v) => !v)}
            className="font-mono text-text-ghost underline"
            style={{ fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {showQTable ? 'Hide Q Table' : "View Q Table — skip this if you're not a nerd"}
          </button>
          {showQTable && (
            <div className="mt-2">
              <QTableReveal qTable={qTable} visitedStates={visitedStates} />
            </div>
          )}
        </div>
      )}

      {/* Retry / Next */}
      <div className="flex gap-3 pb-2">
        <button className="analysis-btn analysis-btn--retry" onClick={onRetry}>
          Retry
        </button>
        {won && (
          <button className="analysis-btn analysis-btn--next" onClick={onNextLevel}>
            {isRL ? 'Leaderboard' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}

// Inline history timeline component
function HistoryTimeline({ history, pivot }) {
  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {history.map((r, i) => (
          <div
            key={i}
            className="flex flex-col gap-0.5"
            style={{
              outline: pivot && i + 1 === pivot ? '1px solid rgba(91,95,230,0.5)' : 'none',
              outlineOffset: '1px',
              borderRadius: '2px',
              padding: pivot && i + 1 === pivot ? '1px' : '0',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '6px',
                borderRadius: '2px',
                background: r.playerMove === 'C' ? 'var(--color-cooperate)' : 'var(--color-defect)',
              }}
            />
            <div
              style={{
                width: '18px',
                height: '6px',
                borderRadius: '2px',
                background:
                  r.opponentMove === 'C'
                    ? 'rgba(45, 181, 99, 0.4)'
                    : 'rgba(217, 69, 69, 0.4)',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-1.5">
        {pivot && (
          <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>
            shift at round {pivot}
          </span>
        )}
        <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>
          top = you · bottom = them
        </span>
      </div>
    </div>
  );
}
