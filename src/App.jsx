import { useReducer, useCallback, useState, useEffect } from 'react';
import { OPPONENTS, getPayoffs, checkWin, shuffleOpponents } from './game/opponents.js';
import {
  initQTable,
  chooseAction,
  updateQTable,
  getNextState,
  identifyStrategy,
} from './game/qlearner.js';
import { detectPivot, computeStats, computePhaseScores } from './game/analysis.js';
import { QL_CONFIG, GAME_CONFIG } from './config.js';
import Landing from './screens/Landing.jsx';
import GameRoom from './screens/GameRoom.jsx';
import Leaderboard from './screens/Leaderboard.jsx';

// ─── Initial State ──────────────────────────────────────────────────────────
const BLANK = {
  phase: 'landing',
  levelOrder: [],
  currentLevelIndex: 0,
  round: 1,
  playerScore: 0,
  opponentScore: 0,
  totalScore: 0,
  roundHistory: [],
  completedLevels: [],
  // RL boss
  qTable: null,
  epsilon: QL_CONFIG.EPSILON_START,
  visitedStates: new Set(),
  currentRLState: 'start',
  phase2Active: false,
  // Analysis
  analysisData: null,
  // Round result (briefly shown after each move)
  roundResult: null,
};

// ─── Reducer ────────────────────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {

    case 'START_GAME': {
      return {
        ...BLANK,
        phase: 'playing',
        levelOrder: shuffleOpponents(),
      };
    }

    // ── Standard level move ────────────────────────────────────────────────
    case 'PLAYER_MOVE_STANDARD': {
      const { move } = action;
      const opponent = OPPONENTS[state.levelOrder[state.currentLevelIndex]];
      const opponentMove = opponent.fn(state.roundHistory);
      const payoffs = getPayoffs(move, opponentMove);

      const roundRecord = {
        playerMove: move,
        opponentMove,
        playerReward: payoffs.player,
        opponentReward: payoffs.opponent,
        round: state.round,
      };

      return {
        ...state,
        playerScore: state.playerScore + payoffs.player,
        opponentScore: state.opponentScore + payoffs.opponent,
        roundHistory: [...state.roundHistory, roundRecord],
        roundResult: roundRecord,
      };
    }

    // ── RL boss move ───────────────────────────────────────────────────────
    case 'PLAYER_MOVE_RL': {
      const { move } = action;
      const rlState = state.currentRLState;

      // Agent picks its action based on current state + epsilon
      const agentMove = chooseAction(rlState, state.qTable, state.epsilon);

      // Payoffs: from player's perspective and agent's perspective
      const playerPayoffs = getPayoffs(move, agentMove);
      const agentPayoffs  = getPayoffs(agentMove, move);

      const roundRecord = {
        playerMove: move,
        opponentMove: agentMove,
        playerReward: playerPayoffs.player,
        opponentReward: agentPayoffs.player,
        round: state.round,
      };

      // Q-table update: agent learns from its own reward
      const nextRLState  = getNextState(agentMove, move);
      const updatedQTable = updateQTable(
        state.qTable,
        rlState,
        agentMove,
        agentPayoffs.player,
        nextRLState,
        QL_CONFIG
      );

      const newVisited = new Set([...state.visitedStates, rlState]);
      const newEpsilon = state.epsilon * QL_CONFIG.EPSILON_DECAY;
      // Phase 2 kicks in when we START round 11 (i.e., after round 10 completes)
      const newPhase2 = state.phase2Active || state.round >= 10;

      return {
        ...state,
        playerScore:    state.playerScore + playerPayoffs.player,
        opponentScore:  state.opponentScore + agentPayoffs.player,
        roundHistory:   [...state.roundHistory, roundRecord],
        qTable:         updatedQTable,
        epsilon:        newEpsilon,
        visitedStates:  newVisited,
        currentRLState: nextRLState,
        phase2Active:   newPhase2,
        roundResult:    roundRecord,
      };
    }

    // ── Advance to next round (or end level) ───────────────────────────────
    case 'ADVANCE_ROUND': {
      const isRLPhase = state.phase === 'rlBoss';
      const maxRounds = isRLPhase ? GAME_CONFIG.ROUNDS_RL : GAME_CONFIG.ROUNDS_STANDARD;

      if (state.round >= maxRounds) {
        // Level complete — build analysis data
        const opponent = !isRLPhase
          ? OPPONENTS[state.levelOrder[state.currentLevelIndex]]
          : null;

        const won = isRLPhase
          ? state.playerScore > state.opponentScore
          : checkWin(state.playerScore, state.opponentScore, opponent.threshold);

        const analysisData = {
          won,
          pivot: detectPivot(state.roundHistory),
          stats: computeStats(state.roundHistory),
          playerScore: state.playerScore,
          opponentScore: state.opponentScore,
          roundHistory: [...state.roundHistory],
          isRL: isRLPhase,
          // Standard level fields
          ...(!isRLPhase && {
            opponent,
            threshold: opponent.threshold,
          }),
          // RL boss fields
          ...(isRLPhase && {
            phaseScores:  computePhaseScores(state.roundHistory),
            strategyName: identifyStrategy(state.qTable, state.visitedStates),
            qTable:       state.qTable,
            visitedStates: state.visitedStates,
          }),
        };

        return {
          ...state,
          roundResult: null,
          phase: 'postLevel',
          analysisData,
        };
      }

      return {
        ...state,
        round: state.round + 1,
        roundResult: null,
      };
    }

    // ── Retry current level ────────────────────────────────────────────────
    case 'RETRY_LEVEL': {
      const wasRL = state.analysisData?.isRL;
      return {
        ...state,
        phase: wasRL ? 'rlBoss' : 'playing',
        round: 1,
        playerScore: 0,
        opponentScore: 0,
        roundHistory: [],
        roundResult: null,
        analysisData: null,
        ...(wasRL && {
          qTable:         initQTable(QL_CONFIG),
          epsilon:        QL_CONFIG.EPSILON_START,
          visitedStates:  new Set(),
          currentRLState: 'start',
          phase2Active:   false,
        }),
      };
    }

    // ── Advance to next level (or leaderboard after RL boss) ───────────────
    case 'NEXT_LEVEL': {
      // After RL boss → leaderboard
      if (state.currentLevelIndex === 5) {
        return {
          ...state,
          phase: 'leaderboard',
          totalScore: state.totalScore + state.playerScore,
          analysisData: null,
        };
      }

      const nextIndex = state.currentLevelIndex + 1;

      // After level 4 → RL boss
      if (nextIndex >= 5) {
        return {
          ...state,
          phase: 'rlBoss',
          currentLevelIndex: 5,
          round: 1,
          playerScore: 0,
          opponentScore: 0,
          roundHistory: [],
          roundResult: null,
          analysisData: null,
          totalScore: state.totalScore + state.playerScore,
          completedLevels: [...state.completedLevels, state.currentLevelIndex],
          qTable:         initQTable(QL_CONFIG),
          epsilon:        QL_CONFIG.EPSILON_START,
          visitedStates:  new Set(),
          currentRLState: 'start',
          phase2Active:   false,
        };
      }

      return {
        ...state,
        phase: 'playing',
        currentLevelIndex: nextIndex,
        round: 1,
        playerScore: 0,
        opponentScore: 0,
        roundHistory: [],
        roundResult: null,
        analysisData: null,
        totalScore: state.totalScore + state.playerScore,
        completedLevels: [...state.completedLevels, state.currentLevelIndex],
      };
    }

    case 'RESET':
      return { ...BLANK };

    default:
      return state;
  }
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [gameState, dispatch] = useReducer(gameReducer, BLANK);
  const [visible, setVisible] = useState(true);

  const startGame    = useCallback(() => dispatch({ type: 'START_GAME' }), []);
  const moveStandard = useCallback((move) => dispatch({ type: 'PLAYER_MOVE_STANDARD', move }), []);
  const moveRL       = useCallback((move) => dispatch({ type: 'PLAYER_MOVE_RL', move }), []);
  const advanceRound = useCallback(() => dispatch({ type: 'ADVANCE_ROUND' }), []);
  const retry        = useCallback(() => dispatch({ type: 'RETRY_LEVEL' }), []);
  const nextLevel    = useCallback(() => dispatch({ type: 'NEXT_LEVEL' }), []);
  const reset        = useCallback(() => dispatch({ type: 'RESET' }), []);

  const { phase } = gameState;

  // Screen fade transition
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [phase]);

  const screenStyle = {
    transition: 'opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
    opacity: visible ? 1 : 0,
    height: '100%',
    width: '100%',
    position: 'relative',
  };

  if (phase === 'landing') {
    return (
      <div style={screenStyle}>
        <Landing onStart={startGame} />
      </div>
    );
  }

  if (phase === 'leaderboard') {
    return (
      <div style={screenStyle}>
        <Leaderboard totalScore={gameState.totalScore} onPlayAgain={reset} />
      </div>
    );
  }

  // playing | postLevel | rlBoss
  return (
    <div style={screenStyle}>
      <GameRoom
        gameState={gameState}
        onMoveStandard={moveStandard}
        onMoveRL={moveRL}
        onAdvanceRound={advanceRound}
        onRetry={retry}
        onNextLevel={nextLevel}
      />
    </div>
  );
}
