import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Narrator from '../components/Narrator.jsx';
import QTableReveal from '../components/QTableReveal.jsx';
import { NARRATOR, CHARACTERS } from '../config/characters.js';
import { heavySpring } from '../config/animations.js';

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

  // Defeated audio plays immediately on win
  useEffect(() => {
    if (!won) return;
    const src = isRL ? CHARACTERS.machine.defeated.audio : opponent?.defeated?.audio;
    if (!src) return;
    const aud = new Audio(src);
    aud.volume = 0.5;
    aud.play().catch(() => {});
    return () => { aud.pause(); aud.src = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Reusable fade-up helper for secondary elements
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay, ease: [0.25, 0.1, 0.25, 1] },
  });

  return (
    <div className="mirror-analysis">
      {/* YOU WON / YOU LOST — drops from above with bounce */}
      <motion.div
        className="font-display font-bold uppercase text-center"
        style={{
          fontSize: '48px',
          letterSpacing: '0.04em',
          color: won ? 'var(--color-win)' : 'var(--color-lose)',
        }}
        initial={{ opacity: 0, y: -30, scale: 1.15 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 14 }}
      >
        {won ? 'YOU WON' : 'YOU LOST'}
      </motion.div>

      {/* Strategy name — types in after YOU WON settles */}
      <motion.div {...fadeUp(0.35)} style={{ textAlign: 'center', width: '100%' }}>
        <div
          className="strategy-name"
          style={{ color: 'var(--color-text-primary)', minHeight: '28px' }}
        >
          {typed}
        </div>
        {typed.length === displayName.length && (
          <motion.p
            className="font-mono text-text-secondary"
            style={{ fontSize: '13px', marginTop: '8px', lineHeight: 1.6 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {explanation}
          </motion.p>
        )}
      </motion.div>

      {/* Round history */}
      <HistoryTimeline history={roundHistory} pivot={isRL ? pivot : null} />

      {/* RL phase comparison */}
      {isRL && phaseScores && (
        <motion.div
          className="font-mono rounded-sm p-4"
          style={{ background: 'rgba(7,7,11,0.4)', border: '1px solid var(--color-border)', fontSize: '12px', lineHeight: 1.8, width: '100%' }}
          {...fadeUp(0.7)}
        >
          <div className="text-text-ghost uppercase tracking-widest mb-2" style={{ fontSize: '10px' }}>
            Phase Comparison
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Phase 1 (1–5)</span>
            <span>
              You <span className="text-text-primary">{phaseScores.phase1Player}</span> — Them <span className="text-text-primary">{phaseScores.phase1Opponent}</span>
            </span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Phase 2 (6–10)</span>
            <span>
              You <span className="text-text-primary">{phaseScores.phase2Player}</span> — Them <span className="text-text-primary">{phaseScores.phase2Opponent}</span>
            </span>
          </div>
        </motion.div>
      )}

      {/* Chungus comment */}
      <motion.div className="rounded-sm p-4" style={{ background: 'var(--color-chungus-dim)', width: '100%' }} {...fadeUp(1.05)}>
        <Narrator text={chungusLine} />
      </motion.div>

      {/* Q-table toggle (RL boss only) */}
      {isRL && (
        <motion.div {...fadeUp(1.15)} style={{ width: '100%' }}>
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
      <motion.div
        className="flex gap-3 justify-center"
        style={{ width: '100%' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...heavySpring, stiffness: 100, delay: 1.4 }}
      >
        <button className="analysis-btn analysis-btn--retry" onClick={onRetry}>
          Retry
        </button>
        {won && (
          <button className="analysis-btn analysis-btn--next" onClick={onNextLevel}>
            {isRL ? 'See Results' : 'Next'}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ── History Timeline — columns stagger in left to right ────────────────────
function HistoryTimeline({ history, pivot }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <motion.div
        className="flex gap-1 flex-wrap justify-center"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.06, delayChildren: 0.6 } } }}
      >
        {history.map((r, i) => (
          <motion.div
            key={i}
            variants={{
              initial: { opacity: 0, y: 10 },
              animate: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 260, damping: 20 },
              },
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
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
          </motion.div>
        ))}
      </motion.div>
      <div className="flex gap-4 justify-center">
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
