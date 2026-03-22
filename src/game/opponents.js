// All 5 hardcoded opponents + payoff utilities

export const OPPONENTS = [
  {
    id: 'alwaysCooperate',
    levelName: 'THE PUSHOVER',
    strategyName: 'Always Cooperate',
    explanation: 'Cooperates every single round, no matter what you do.',
    chungusIntro: 'This one never learned to fight back.',
    threshold: { type: 'outscore' },
    fn: () => 'C',
  },
  {
    id: 'alwaysDefect',
    levelName: 'THE WALL',
    strategyName: 'Always Defect',
    explanation: "Defects every round. It made up its mind before you sat down.",
    chungusIntro: 'This one has made up its mind. Have you?',
    threshold: { type: 'minimum', value: 5 },
    fn: () => 'D',
  },
  {
    id: 'titForTat',
    levelName: 'THE MIRROR',
    strategyName: 'Tit for Tat',
    explanation: 'Starts by cooperating. Then copies your previous move exactly.',
    chungusIntro: 'Whatever you do, it does. Eventually.',
    threshold: { type: 'minimum', value: 12 },
    fn: (history) =>
      history.length === 0 ? 'C' : history[history.length - 1].playerMove,
  },
  {
    id: 'grimTrigger',
    levelName: 'THE GRUDGE',
    strategyName: 'Grim Trigger',
    explanation: 'Cooperates until you defect once. After that, defects forever.',
    chungusIntro: 'It remembers everything. Especially the first cut.',
    threshold: { type: 'minimum', value: 10 },
    fn: (history) =>
      history.some((r) => r.playerMove === 'D') ? 'D' : 'C',
  },
  {
    id: 'pavlov',
    levelName: 'THE COIN',
    strategyName: 'Pavlov (Win-Stay, Lose-Shift)',
    explanation:
      "If its last payoff was 3 or more, it repeats its move. Otherwise it switches.",
    chungusIntro: "It doesn't care what you did. It cares what happened to it.",
    threshold: { type: 'minimum', value: 8 },
    fn: (history) => {
      if (history.length === 0) return 'C';
      const last = history[history.length - 1];
      return last.opponentReward >= 3
        ? last.opponentMove
        : last.opponentMove === 'C'
        ? 'D'
        : 'C';
    },
  },
];

// Returns { player, opponent } payoffs for a given move pair.
export function getPayoffs(playerMove, opponentMove) {
  if (playerMove === 'C' && opponentMove === 'C') return { player: 3, opponent: 3 };
  if (playerMove === 'C' && opponentMove === 'D') return { player: 0, opponent: 5 };
  if (playerMove === 'D' && opponentMove === 'C') return { player: 5, opponent: 0 };
  return { player: 1, opponent: 1 };
}

// Checks win condition against the level threshold.
export function checkWin(playerScore, opponentScore, threshold) {
  if (threshold.type === 'outscore') return playerScore > opponentScore;
  return playerScore >= threshold.value;
}

// Always Cooperate (index 0) goes first; remaining 4 are shuffled.
export function shuffleOpponents() {
  const rest = [1, 2, 3, 4];
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [0, ...rest];
}
