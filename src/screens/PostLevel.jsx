import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Narrator from '../components/Narrator.jsx';
import QTableReveal from '../components/QTableReveal.jsx';
import { NARRATOR, CHARACTERS } from '../config/characters.js';

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

  const chungusLine = useRef(
    won
      ? (isRL ? CHARACTERS.machine.defeated.text : opponent?.defeated?.text ?? '')
      : (isRL ? NARRATOR.rlLose : NARRATOR.lose[Math.floor(Math.random() * NARRATOR.lose.length)])
  ).current;

  const displayName = isRL ? 'THE MACHINE' : opponent?.levelName ?? '';
  const typed = useTypewriter(displayName, 40);

  const explanation = isRL
    ? `Converged toward: ${rlStrategy}`
    : opponent?.strategyDescription ?? opponent?.explanation ?? '';

  let scoreText;
  if (isRL) {
    scoreText = `You ${playerScore} — Them ${opponentScore}.`;
  } else if (threshold?.type === 'outscore') {
    scoreText = `You ${playerScore} — Them ${opponentScore}. ${won ? 'You outscored them.' : 'They outscored you.'}`;
  } else {
    scoreText = `You scored ${playerScore}. Needed ${threshold?.value} to pass.`;
  }

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay, ease: [0.25, 0.1, 0.25, 1] },
  });

  return (
    <div className="mirror-analysis">
      {/* Win / Lose */}
      <motion.div
        className="font-display font-bold uppercase text-center"
        style={{
          fontSize: '22px',
          letterSpacing: '0.04em',
          color: won ? 'var(--color-win)' : 'var(--color-lose)',
        }}
        {...fadeUp(0)}
      >
        {won ? 'YOU WON' : 'YOU LOST'}
      </motion.div>

      {/* Strategy name — types in */}
      <motion.div {...fadeUp(0.1)}>
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
      </motion.div>

      {/* Defeated text removed — narrator chungusLine covers this */}

      {/* Round history timeline */}
      <motion.div {...fadeUp(0.2)}>
        <HistoryTimeline history={roundHistory} pivot={pivot} />
      </motion.div>

      {/* RL phase comparison */}
      {isRL && phaseScores && (
        <motion.div
          className="font-mono rounded-sm p-3"
          style={{ background: 'rgba(7,7,11,0.4)', border: '1px solid var(--color-border)', fontSize: '11px', lineHeight: 1.8 }}
          {...fadeUp(0.25)}
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
        </motion.div>
      )}

      {/* Score summary */}
      <motion.p className="font-mono text-text-secondary" style={{ fontSize: '12px' }} {...fadeUp(0.3)}>
        {scoreText}
      </motion.p>

      {/* Chungus comment */}
      <motion.div className="rounded-sm p-3" style={{ background: 'var(--color-chungus-dim)' }} {...fadeUp(0.35)}>
        <Narrator text={chungusLine} audio={won ? opponent?.defeated?.audio : undefined} />
      </motion.div>

      {/* Q-table toggle (RL boss only) */}
      {isRL && (
        <motion.div {...fadeUp(0.4)}>
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
        </motion.div>
      )}

      {/* Retry / Next */}
      <motion.div className="flex gap-3 pb-2" {...fadeUp(0.45)}>
        <button className="analysis-btn analysis-btn--retry" onClick={onRetry}>
          Retry
        </button>
        {won && (
          <button className="analysis-btn analysis-btn--next" onClick={onNextLevel}>
            {isRL ? 'Leaderboard' : 'Next'}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// Inline history timeline — 18×18px cells with C/D labels
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
              outlineOffset: '2px',
              borderRadius: '2px',
            }}
          >
            {/* Player row */}
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '2px',
                background: r.playerMove === 'C' ? 'var(--color-cooperate)' : 'var(--color-defect)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500,
                color: '#07070B',
              }}
            >
              {r.playerMove}
            </div>
            {/* Opponent row */}
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '2px',
                background: r.opponentMove === 'C' ? 'rgba(45,181,99,0.4)' : 'rgba(217,69,69,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
              }}
            >
              {r.opponentMove}
            </div>
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
