import { QL_CONFIG } from '../config.js';

// State space: what happened last round (from agent's POV: agentMove + playerMove)
// 'start' = first round, no history
// 'CC' = agent cooperated, player cooperated
// 'CD' = agent cooperated, player defected
// 'DC' = agent defected, player cooperated
// 'DD' = agent defected, player defected
const STATES = ['start', 'CC', 'CD', 'DC', 'DD'];

// Initialize all Q values to Q_INIT (neutral/average payoff).
export function initQTable(config = QL_CONFIG) {
  const table = {};
  for (const state of STATES) {
    table[state] = { C: config.Q_INIT, D: config.Q_INIT };
  }
  return table;
}

// Derive the new state from this round's moves (from agent's perspective).
export function getNextState(agentMove, playerMove) {
  return agentMove + playerMove; // e.g. 'CD' = agent cooperated, player defected
}

// Epsilon-greedy action selection.
export function chooseAction(state, qTable, epsilon) {
  if (Math.random() < epsilon) {
    return Math.random() < 0.5 ? 'C' : 'D';
  }
  if (qTable[state].C > qTable[state].D) return 'C';
  if (qTable[state].D > qTable[state].C) return 'D';
  return Math.random() < 0.5 ? 'C' : 'D'; // tie-break randomly
}

// Bellman update: Q(s,a) ← Q(s,a) + α[r + γ·max_a'Q(s',a') - Q(s,a)]
export function updateQTable(qTable, state, action, reward, nextState, config = QL_CONFIG) {
  const { ALPHA, GAMMA } = config;
  const currentQ = qTable[state][action];
  const maxNextQ = Math.max(qTable[nextState].C, qTable[nextState].D);
  const target = reward + GAMMA * maxNextQ;
  const newQ = currentQ + ALPHA * (target - currentQ);

  return {
    ...qTable,
    [state]: {
      ...qTable[state],
      [action]: newQ,
    },
  };
}

// Post-game: compare the agent's policy against known strategy fingerprints.
// Only evaluates states the agent actually visited.
export function identifyStrategy(qTable, visitedStates) {
  const policy = {};
  for (const state of visitedStates) {
    if (state === 'start') continue;
    if (qTable[state].C > qTable[state].D) policy[state] = 'C';
    else if (qTable[state].D > qTable[state].C) policy[state] = 'D';
    // ties: leave undefined
  }

  const decided = Object.keys(policy).filter((s) => policy[s] !== undefined);
  if (decided.length === 0) return 'Unknown';

  const fingerprints = {
    'Tit for Tat':      { CC: 'C', CD: 'D', DC: 'C', DD: 'D' },
    'Always Defect':    { CC: 'D', CD: 'D', DC: 'D', DD: 'D' },
    'Always Cooperate': { CC: 'C', CD: 'C', DC: 'C', DD: 'C' },
    'Pavlov':           { CC: 'C', CD: 'D', DC: 'D', DD: 'C' },
    'Grim Trigger':     { CC: 'C', CD: 'D', DC: 'D', DD: 'D' },
  };

  for (const [name, fp] of Object.entries(fingerprints)) {
    const match = decided.every((s) => !(s in fp) || fp[s] === policy[s]);
    if (match) return name;
  }

  // Fallback: ratio-based label
  const cCount = decided.filter((s) => policy[s] === 'C').length;
  const ratio = cCount / decided.length;
  if (ratio >= 0.75) return 'Mostly Cooperate';
  if (ratio <= 0.25) return 'Mostly Defect';
  return 'Mixed';
}

// Returns a human-readable policy summary for the Q-table reveal.
export function extractPolicy(qTable, visitedStates) {
  const result = {};
  for (const state of STATES) {
    if (state === 'start') continue;
    const visited = visitedStates.has(state);
    const preferred = qTable[state].C > qTable[state].D
      ? 'C'
      : qTable[state].D > qTable[state].C
      ? 'D'
      : '~'; // tie
    result[state] = { visited, preferred, C: qTable[state].C, D: qTable[state].D };
  }
  return result;
}
