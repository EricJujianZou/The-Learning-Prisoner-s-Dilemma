// achievements.js — Single source of truth for badges and archetypes.
// Add badges by pushing to BADGES. Add archetypes by adding to ARCHETYPES.
// criteria functions receive a stats object computed from the full game history.

// ─── Badges ────────────────────────────────────────────────────────────────
// Each badge: { id, name, description, cssClass, symbol, criteria(stats) }
// symbol: 2-3 character text shown inside the badge circle (no icons/emoji)
// criteria: ({ totalRounds, totalCoops, totalDefects, integrityScore,
//              finalScore, levelHistories }) => boolean

export const BADGES = [
  {
    id: 'kind_hearted',
    name: 'Kind Hearted',
    description: 'Never betrayed someone who cooperated with you every round.',
    symbol: 'KH',
    cssClass: 'badge--kind-hearted',
    criteria: ({ levelHistories }) => {
      const level = levelHistories.find((l) => l.opponentId === 'pushover');
      if (!level || level.roundHistory.length === 0) return false;
      return level.roundHistory.every((r) => r.playerMove === 'C');
    },
  },

  {
    id: 'ruthless',
    name: 'Ruthless',
    description: 'Defected every single round without exception.',
    symbol: 'RU',
    cssClass: 'badge--ruthless',
    criteria: ({ totalDefects, totalRounds }) =>
      totalRounds > 0 && totalDefects === totalRounds,
  },

  {
    id: 'honorable',
    name: 'Honorable',
    description: 'Opened with cooperation against every opponent.',
    symbol: 'HN',
    cssClass: 'badge--honorable',
    criteria: ({ levelHistories }) =>
      levelHistories.length > 0 &&
      levelHistories.every(
        (l) => l.roundHistory.length > 0 && l.roundHistory[0].playerMove === 'C'
      ),
  },

  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Defeated the AI.',
    symbol: 'AI',
    cssClass: 'badge--survivor',
    criteria: ({ levelHistories }) => {
      const rl = levelHistories.find((l) => l.opponentId === 'machine');
      if (!rl || rl.roundHistory.length === 0) return false;
      const pTotal = rl.roundHistory.reduce((s, r) => s + r.playerReward, 0);
      const oTotal = rl.roundHistory.reduce((s, r) => s + r.opponentReward, 0);
      return pTotal > oTotal;
    },
  },

  {
    id: 'redeemer',
    name: 'Redeemer',
    description: 'Chose to cooperate immediately after being betrayed.',
    symbol: 'RD',
    cssClass: 'badge--redeemer',
    criteria: ({ levelHistories }) => {
      for (const level of levelHistories) {
        const h = level.roundHistory;
        for (let i = 1; i < h.length; i++) {
          if (h[i - 1].opponentMove === 'D' && h[i].playerMove === 'C') return true;
        }
      }
      return false;
    },
  },

  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Played the same move in 80% or more of all rounds.',
    symbol: '==',
    cssClass: 'badge--consistent',
    criteria: ({ totalCoops, totalDefects, totalRounds }) =>
      totalRounds > 0 &&
      Math.max(totalCoops, totalDefects) / totalRounds >= 0.8,
  },

  {
    id: 'diplomat',
    name: 'Diplomat',
    description: 'Achieved mutual cooperation in every round of at least one level.',
    symbol: 'CC',
    cssClass: 'badge--diplomat',
    criteria: ({ levelHistories }) =>
      levelHistories.some(
        (l) =>
          l.roundHistory.length > 0 &&
          l.roundHistory.every((r) => r.playerMove === 'C' && r.opponentMove === 'C')
      ),
  },

  {
    id: 'unpredictable',
    name: 'Unpredictable',
    description: 'Mixed cooperation and defection against every opponent.',
    symbol: '?!',
    cssClass: 'badge--unpredictable',
    criteria: ({ levelHistories }) =>
      levelHistories.length > 0 &&
      levelHistories.every((l) => {
        const coops = l.roundHistory.filter((r) => r.playerMove === 'C').length;
        const defects = l.roundHistory.filter((r) => r.playerMove === 'D').length;
        return coops > 0 && defects > 0;
      }),
  },
];

// ─── Archetypes ────────────────────────────────────────────────────────────
// Each archetype: { id, name, description, cssClass, criteria(stats) }
// Listed from most specific to least — first match wins.
// The last archetype should have criteria: () => true as a fallback.

export const ARCHETYPES = [
  {
    id: 'predator',
    name: 'The Predator',
    description: 'You defected relentlessly. Everyone saw it coming eventually.',
    cssClass: 'archetype--predator',
    criteria: ({ integrityScore, totalRounds }) =>
      totalRounds > 0 && integrityScore / totalRounds <= -0.5,
  },
  {
    id: 'martyr',
    name: 'The Martyr',
    description: 'You trusted everyone, even those who hurt you. Admirable. Costly.',
    cssClass: 'archetype--martyr',
    criteria: ({ integrityScore, totalRounds, finalScore }) =>
      totalRounds > 0 &&
      integrityScore / totalRounds >= 0.5 &&
      finalScore < 120,
  },
  {
    id: 'idealist',
    name: 'The Idealist',
    description: 'You cooperated as principle, not just strategy.',
    cssClass: 'archetype--idealist',
    criteria: ({ integrityScore, totalRounds, finalScore }) =>
      totalRounds > 0 &&
      integrityScore / totalRounds >= 0.5 &&
      finalScore >= 120,
  },
  {
    id: 'strategist',
    name: 'The Strategist',
    description: 'You read the room and cooperated when it paid. Cold, but effective.',
    cssClass: 'archetype--strategist',
    criteria: ({ integrityScore, totalRounds, finalScore }) =>
      totalRounds > 0 &&
      integrityScore / totalRounds >= 0.1 &&
      finalScore >= 140,
  },
  {
    id: 'pragmatist',
    name: 'The Pragmatist',
    description: 'Points over people. You optimized what was asked of you.',
    cssClass: 'archetype--pragmatist',
    criteria: ({ finalScore }) => finalScore >= 120,
  },
  {
    id: 'survivor',
    name: 'The Survivor',
    description: 'You adapted. Not always right, not always wrong. Still standing.',
    cssClass: 'archetype--survivor',
    criteria: () => true, // fallback
  },
];

// ─── Helper: compute stats from game history ───────────────────────────────
export function computeAchievementStats({ levelHistories, totalIntegrityScore, totalScore }) {
  const allRounds = levelHistories.flatMap((l) => l.roundHistory);
  const totalRounds = allRounds.length;
  const totalCoops = allRounds.filter((r) => r.playerMove === 'C').length;
  const totalDefects = allRounds.filter((r) => r.playerMove === 'D').length;

  return {
    totalRounds,
    totalCoops,
    totalDefects,
    integrityScore: totalIntegrityScore,
    finalScore: totalScore,
    levelHistories,
  };
}

// ─── Helper: get the player's archetype ───────────────────────────────────
export function getArchetype(stats) {
  return ARCHETYPES.find((a) => a.criteria(stats)) ?? ARCHETYPES[ARCHETYPES.length - 1];
}

// ─── Helper: get all earned badges ────────────────────────────────────────
export function getEarnedBadges(stats) {
  return BADGES.filter((b) => b.criteria(stats));
}
