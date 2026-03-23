// Post-level analysis utilities

// Detects a behavioral shift: if the player's cooperation rate changes by > 0.3
// between the first half and second half, returns the pivot round number (1-indexed).
export function detectPivot(history) {
  if (history.length < 4) return null;
  const mid = Math.floor(history.length / 2);
  const first = history.slice(0, mid);
  const second = history.slice(mid);
  const firstRate = first.filter((r) => r.playerMove === 'C').length / first.length;
  const secondRate = second.filter((r) => r.playerMove === 'C').length / second.length;
  if (Math.abs(firstRate - secondRate) > 0.3) return mid + 1; // 1-indexed
  return null;
}

// Cooperation rates and mutual outcomes for the analysis screen.
export function computeStats(history) {
  const n = history.length;
  return {
    playerCoopRate: history.filter((r) => r.playerMove === 'C').length / n,
    opponentCoopRate: history.filter((r) => r.opponentMove === 'C').length / n,
    mutualCoopRate: history.filter((r) => r.playerMove === 'C' && r.opponentMove === 'C').length / n,
    mutualDefectRate: history.filter((r) => r.playerMove === 'D' && r.opponentMove === 'D').length / n,
  };
}

// RL boss only: splits history into phase 1 (rounds 1–5) and phase 2 (rounds 6–10).
export function computePhaseScores(history) {
  const p1 = history.slice(0, 5);
  const p2 = history.slice(5);
  return {
    phase1Player:   p1.reduce((s, r) => s + r.playerReward, 0),
    phase1Opponent: p1.reduce((s, r) => s + r.opponentReward, 0),
    phase2Player:   p2.reduce((s, r) => s + r.playerReward, 0),
    phase2Opponent: p2.reduce((s, r) => s + r.opponentReward, 0),
  };
}
