import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from './Leaderboard.jsx';
import { submitScore } from '../storage/leaderboard.js';
import {
  computeAchievementStats,
  getArchetype,
  getEarnedBadges,
} from '../config/achievements.js';

// Max possible score across 35 rounds: 5 × (5 × 5) + 10 × 5 = 175
// Max integrity across 35 rounds: +35
const MAX_SCORE = 225; // as shown in old leaderboard
const MAX_INTEGRITY = 35;

export default function Card({ totalScore, totalIntegrityScore, levelHistories, onPlayAgain }) {
  const cardRef = useRef(null);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const stats = computeAchievementStats({
    levelHistories,
    totalIntegrityScore,
    totalScore,
  });

  const archetype = getArchetype(stats);
  const earnedBadges = getEarnedBadges(stats);

  const integrityDisplay = totalIntegrityScore >= 0
    ? `+${totalIntegrityScore}`
    : `${totalIntegrityScore}`;
  const integrityColor = totalIntegrityScore > 0
    ? 'var(--color-cooperate)'
    : totalIntegrityScore < 0
    ? 'var(--color-defect)'
    : 'var(--color-text-secondary)';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || submitted || submitting) return;
    setSubmitting(true);
    await submitScore(name.trim(), totalScore, totalIntegrityScore);
    setSubmitted(true);
    setSubmitting(false);
    setShowLeaderboard(true);
  }

  async function handleDownload() {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `prisoner-${archetype.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Download failed. Make sure html2canvas is installed: npm install html2canvas');
    }
  }

  async function handleCopy() {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
        } catch {
          // Fallback: download instead
          const link = document.createElement('a');
          link.download = `prisoner-${archetype.id}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      }, 'image/png');
    } catch {
      alert('Copy failed. Make sure html2canvas is installed: npm install html2canvas');
    }
  }

  return (
    <div className="card-screen">
      {/* ── Portrait Card ──────────────────────────────────────────────── */}
      <motion.div
        ref={cardRef}
        className="player-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Top accent bar */}
        <div className="player-card-accent" />

        <div className="player-card-body">
          {/* Archetype name + description */}
          <div>
            <div
              className="font-display font-bold uppercase"
              style={{ fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--color-text-primary)', lineHeight: 1.1 }}
            >
              {archetype.name}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: 1.5 }}
            >
              {archetype.description}
            </div>
          </div>

          {/* Stats */}
          <div className="card-stat-row">
            <div className="card-stat">
              <span className="card-stat-label">Score</span>
              <span className="card-stat-value">{totalScore}</span>
              <span className="font-mono" style={{ fontSize: '9px', color: 'var(--color-text-ghost)' }}>
                / {MAX_SCORE}
              </span>
            </div>
            <div className="card-stat">
              <span className="card-stat-label">Integrity</span>
              <span className="card-stat-value" style={{ color: integrityColor }}>
                {integrityDisplay}
              </span>
              <span className="font-mono" style={{ fontSize: '9px', color: 'var(--color-text-ghost)' }}>
                / {MAX_INTEGRITY}
              </span>
            </div>
          </div>

          {/* Badges */}
          {earnedBadges.length > 0 && (
            <div>
              <div className="card-stat-label" style={{ marginBottom: '10px' }}>
                Badges ({earnedBadges.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {earnedBadges.map((badge) => (
                  <div key={badge.id} className={`badge ${badge.cssClass}`}>
                    <div className="badge-icon">{badge.symbol}</div>
                    <span className="badge-label">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {earnedBadges.length === 0 && (
            <div className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>
              No badges earned.
            </div>
          )}

          <div className="card-divider" />

          {/* Player name area */}
          {submitted ? (
            <div>
              <div className="card-stat-label" style={{ marginBottom: '4px' }}>Player</div>
              <div className="card-player-name">{name}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="card-stat-label" style={{ marginBottom: '6px' }}>Your name</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <input
                  type="text"
                  className="card-name-input"
                  placeholder="enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={32}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={!name.trim() || submitting}
                  className="font-display font-medium uppercase"
                  style={{
                    background: 'rgba(91,95,230,0.1)',
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-accent-bright)',
                    borderRadius: '4px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    cursor: name.trim() && !submitting ? 'pointer' : 'not-allowed',
                    opacity: name.trim() && !submitting ? 1 : 0.35,
                    flexShrink: 0,
                    touchAction: 'manipulation',
                  }}
                >
                  {submitting ? '...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>

      {/* ── Action buttons ─────────────────────────────────────────────── */}
      <motion.div
        style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '320px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: submitted ? 1 : 0.4 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={handleDownload}
          disabled={!submitted}
          className="analysis-btn analysis-btn--next"
          style={{ flex: 1, textAlign: 'center', opacity: submitted ? 1 : 0.35, cursor: submitted ? 'pointer' : 'not-allowed' }}
        >
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={!submitted}
          className="analysis-btn analysis-btn--retry"
          style={{ flex: 1, textAlign: 'center', opacity: submitted ? 1 : 0.35, cursor: submitted ? 'pointer' : 'not-allowed' }}
        >
          Copy Image
        </button>
      </motion.div>

      {/* ── Play Again ─────────────────────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: '320px' }}>
        <button onClick={onPlayAgain} className="analysis-btn analysis-btn--retry w-full" style={{ textAlign: 'center' }}>
          Play Again
        </button>
      </div>

      {/* ── Leaderboard ────────────────────────────────────────────────── */}
      {submitted && !showLeaderboard && (
        <button
          onClick={() => setShowLeaderboard(true)}
          className="font-mono text-text-ghost underline"
          style={{ fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          View leaderboard
        </button>
      )}

      {showLeaderboard && (
        <motion.div
          style={{
            width: '100%',
            maxWidth: '480px',
            background: '#1A1A24',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            padding: '16px',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Leaderboard playerName={submitted ? name : ''} />
        </motion.div>
      )}
    </div>
  );
}
