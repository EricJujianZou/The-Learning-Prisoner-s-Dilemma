import { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../storage/leaderboard.js';

// Pure display component — no name entry (handled by Card screen).
// Accepts playerName to highlight the player's row.
export default function Leaderboard({ playerName = '', onPlayAgain }) {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('score'); // 'score' | 'integrity'

  useEffect(() => {
    fetchLeaderboard().then(setEntries);
  }, []);

  const scoreEntries = [...entries].sort((a, b) => b.score - a.score).slice(0, 20);
  const integrityEntries = [...entries]
    .sort((a, b) => (b.integrityScore ?? 0) - (a.integrityScore ?? 0))
    .slice(0, 20);

  const rows = tab === 'score' ? scoreEntries : integrityEntries;
  const valueKey = tab === 'score' ? 'score' : 'integrityScore';
  const valueLabel = tab === 'score' ? 'Score' : 'Integrity';

  return (
    <div style={{ width: '100%' }}>
      {/* Tabs */}
      <div className="lb-tabs">
        <button
          className={`lb-tab${tab === 'score' ? ' active' : ''}`}
          onClick={() => setTab('score')}
        >
          Score
        </button>
        <button
          className={`lb-tab${tab === 'integrity' ? ' active' : ''}`}
          onClick={() => setTab('integrity')}
        >
          Integrity
        </button>
      </div>

      {/* Table header */}
      <div
        className="lb-table-row"
        style={{ paddingTop: '10px', paddingBottom: '4px' }}
      >
        <span className="font-mono text-text-ghost" style={{ fontSize: '10px', letterSpacing: '0.08em' }}>#</span>
        <span className="font-mono text-text-ghost" style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Name</span>
        <span className="font-mono text-text-ghost" style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{valueLabel}</span>
      </div>

      {/* Rows */}
      {rows.length === 0 && (
        <div className="font-mono text-text-ghost" style={{ fontSize: '11px', padding: '12px 0' }}>
          No entries yet.
        </div>
      )}
      {rows.map((entry, i) => {
        const isPlayer = playerName && entry.name === playerName;
        const value = entry[valueKey] ?? 0;
        const displayValue = tab === 'integrity'
          ? (value >= 0 ? `+${value}` : `${value}`)
          : value;
        return (
          <div
            key={i}
            className={`lb-table-row${isPlayer ? ' lb-table-row--player' : ''}`}
          >
            <span
              className="font-mono"
              style={{ color: isPlayer ? 'var(--color-chungus)' : 'var(--color-text-ghost)', fontSize: '11px' }}
            >
              {i + 1}
            </span>
            <span
              className="font-mono truncate"
              style={{ color: isPlayer ? 'var(--color-chungus)' : 'var(--color-text-secondary)', fontSize: '12px' }}
            >
              {entry.name}
            </span>
            <span
              className="font-mono font-medium"
              style={{
                fontSize: '12px',
                color: isPlayer
                  ? 'var(--color-chungus)'
                  : tab === 'integrity' && value > 0
                  ? 'var(--color-cooperate)'
                  : tab === 'integrity' && value < 0
                  ? 'var(--color-defect)'
                  : 'var(--color-text-primary)',
              }}
            >
              {displayValue}
            </span>
          </div>
        );
      })}

      {/* Play again */}
      {onPlayAgain && (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={onPlayAgain}
            className="w-full analysis-btn analysis-btn--retry"
            style={{ textAlign: 'center' }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
