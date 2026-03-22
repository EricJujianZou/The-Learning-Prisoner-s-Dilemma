// Opponent strategy functions + payoff utilities.
// Character metadata lives in src/config/characters.js (single source of truth).

import { CHARACTERS } from '../config/characters.js';

// ─── Strategy Functions ────────────────────────────────────────────────────
const STRATEGY_FNS = {
  pushover: () => 'C',

  wall: () => 'D',

  mirror: (history) =>
    history.length === 0 ? 'C' : history[history.length - 1].playerMove,

  grudge: (history) =>
    history.some((r) => r.playerMove === 'D') ? 'D' : 'C',

  coin: (history) => {
    if (history.length === 0) return 'C';
    const last = history[history.length - 1];
    return last.opponentReward >= 3
      ? last.opponentMove
      : last.opponentMove === 'C'
      ? 'D'
      : 'C';
  },
};

// ─── OPPONENTS Array ───────────────────────────────────────────────────────
// Ordered: pushover always index 0 (shuffleOpponents ensures it goes first).
const OPPONENT_IDS = ['pushover', 'wall', 'mirror', 'grudge', 'coin'];

export const OPPONENTS = OPPONENT_IDS.map((id) => {
  const char = CHARACTERS[id];
  return {
    ...char,
    // backwards-compat aliases consumed by App.jsx / PostLevel
    levelName:   char.displayName,
    threshold:   char.winThreshold,
    explanation: char.strategyDescription,
    chungusIntro: char.intro.text,
    fn: STRATEGY_FNS[id],
  };
});

// ─── Payoff Utilities ──────────────────────────────────────────────────────
export function getPayoffs(playerMove, opponentMove) {
  if (playerMove === 'C' && opponentMove === 'C') return { player: 3, opponent: 3 };
  if (playerMove === 'C' && opponentMove === 'D') return { player: 0, opponent: 5 };
  if (playerMove === 'D' && opponentMove === 'C') return { player: 5, opponent: 0 };
  return { player: 1, opponent: 1 };
}

export function checkWin(playerScore, opponentScore, threshold) {
  if (threshold.type === 'outscore') return playerScore > opponentScore;
  return playerScore >= threshold.value;
}

// Always Cooperate (index 0 = pushover) goes first; remaining 4 are shuffled.
export function shuffleOpponents() {
  const rest = [1, 2, 3, 4];
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [0, ...rest];
}
