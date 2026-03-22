import { useState, useEffect, useRef } from 'react';
import { OPPONENTS } from '../game/opponents.js';
import { GAME_CONFIG } from '../config.js';
import PayoffMatrix from '../components/PayoffMatrix.jsx';
import RoundHistory from '../components/RoundHistory.jsx';
import ActionButton from '../components/ActionButton.jsx';
import Narrator from '../components/Narrator.jsx';
import PostLevel from './PostLevel.jsx';

export default function GameRoom({
  gameState,
  onMoveStandard,
  onMoveRL,
  onAdvanceRound,
  onRetry,
  onNextLevel,
}) {
  const {
    phase,
    round,
    playerScore,
    opponentScore,
    roundHistory,
    roundResult,
    analysisData,
    currentLevelIndex,
    levelOrder,
    phase2Active,
  } = gameState;

  const isRL = phase === 'rlBoss';
  const isAnalysis = phase === 'postLevel';
  const maxRounds = isRL ? GAME_CONFIG.ROUNDS_RL : GAME_CONFIG.ROUNDS_STANDARD;
  const currentOpponent = !isRL && levelOrder.length > 0
    ? OPPONENTS[levelOrder[currentLevelIndex]]
    : null;

  // ── Intro state ───────────────────────────────────────────────────────────
  const [showIntro, setShowIntro] = useState(true);
  const [introKey, setIntroKey] = useState('');
  const [phase2Flicker, setPhase2Flicker] = useState(false);

  useEffect(() => {
    if (isAnalysis) return;
    const key = isRL ? 'rl' : `level-${currentLevelIndex}`;
    if (key === introKey) return; // same level (retry) — skip intro
    setIntroKey(key);
    setShowIntro(true);
    const t = setTimeout(() => setShowIntro(false), GAME_CONFIG.INTRO_DISPLAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelIndex, isRL, isAnalysis]);

  // ── Round result auto-advance ─────────────────────────────────────────────
  useEffect(() => {
    if (!roundResult) return;
    const t = setTimeout(() => onAdvanceRound(), GAME_CONFIG.RESULT_DISPLAY_MS);
    return () => clearTimeout(t);
  }, [roundResult, onAdvanceRound]);

  // ── Phase 2 flicker at round 11 ───────────────────────────────────────────
  const prevRound = useRef(round);
  useEffect(() => {
    if (isRL && prevRound.current === 10 && round === 11) {
      setPhase2Flicker(true);
      const t = setTimeout(() => setPhase2Flicker(false), 300);
      return () => clearTimeout(t);
    }
    prevRound.current = round;
  }, [round, isRL]);

  const buttonsDisabled = !!roundResult || showIntro || isAnalysis;
  const makeMove = isRL ? onMoveRL : onMoveStandard;

  const introText = isRL
    ? "This one is different. It's watching you. It's learning. 20 rounds. Good luck."
    : currentOpponent?.chungusIntro ?? '';

  const roomClass = [
    'room',
    isRL && phase2Active ? 'room--phase2' : '',
    isAnalysis && analysisData?.won ? 'room--win' : '',
    isAnalysis && analysisData && !analysisData.won ? 'room--lose' : '',
    phase2Flicker ? 'animate-phase-shift' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Phase indicator text for RL boss
  const phaseLabel = isRL
    ? round <= 10
      ? 'Phase 1: It\'s studying you.'
      : 'Phase 2: It has adapted.'
    : null;

  return (
    <div className={roomClass}>
      {/* ── Wall Labels ─────────────────────────────────────────────────── */}
      <div className="wall-labels">
        <div className="flex flex-col gap-0.5">
          <span
            className="font-display font-medium uppercase text-text-secondary"
            style={{ fontSize: '11px', letterSpacing: '0.08em' }}
          >
            {isRL ? 'THE MACHINE' : currentOpponent?.levelName ?? ''}
          </span>
          {phaseLabel && (
            <span className="phase-indicator" style={{ color: phase2Active ? 'var(--color-defect)' : 'var(--color-text-secondary)' }}>
              {phaseLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Scores */}
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>YOU</span>
              <span className="font-mono font-medium text-text-primary" style={{ fontSize: '16px' }}>
                {playerScore}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>THEM</span>
              <span className="font-mono font-medium text-text-secondary" style={{ fontSize: '16px' }}>
                {opponentScore}
              </span>
            </div>
          </div>

          {/* Round counter */}
          <div className="flex flex-col items-center">
            <span className="font-mono font-medium text-text-primary" style={{ fontSize: '18px' }}>
              {round}
            </span>
            <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>
              / {maxRounds}
            </span>
          </div>
        </div>
      </div>

      {/* ── Mirror ──────────────────────────────────────────────────────── */}
      <div className={`mirror ${isRL ? 'mirror--rl' : ''} ${isRL && phase2Active ? 'mirror--phase2' : ''}`}>
        {isAnalysis ? (
          <PostLevel
            analysisData={analysisData}
            onRetry={onRetry}
            onNextLevel={onNextLevel}
          />
        ) : showIntro ? (
          <div className="mirror-narrator">
            <Narrator text={introText} />
          </div>
        ) : (
          <div className="mirror-gameplay">
            <PayoffMatrix />
            {roundResult && <RoundResultDisplay result={roundResult} />}
          </div>
        )}
      </div>

      {/* ── Desk + History ───────────────────────────────────────────────── */}
      <div className="desk">
        <RoundHistory history={roundHistory} totalRounds={maxRounds} />
      </div>

      {/* ── Action Buttons ───────────────────────────────────────────────── */}
      <div className="buttons-row">
        <ActionButton
          action="cooperate"
          onPress={() => makeMove('C')}
          disabled={buttonsDisabled}
        />
        <ActionButton
          action="defect"
          onPress={() => makeMove('D')}
          disabled={buttonsDisabled}
        />
      </div>
    </div>
  );
}

// ── Round Result Overlay ───────────────────────────────────────────────────
function RoundResultDisplay({ result }) {
  const { playerMove, opponentMove, playerReward, opponentReward } = result;
  const moveColor = (m) => (m === 'C' ? 'var(--color-cooperate)' : 'var(--color-defect)');
  const moveName = (m) => (m === 'C' ? 'COOPERATE' : 'DEFECT');

  return (
    <div className="round-result">
      <div className="result-row result-stagger-0">
        <span className="font-mono text-text-ghost" style={{ fontSize: '11px', width: '40px', textAlign: 'right' }}>
          YOU
        </span>
        <span
          className="font-display font-medium uppercase"
          style={{ fontSize: '14px', letterSpacing: '0.06em', color: moveColor(playerMove) }}
        >
          {moveName(playerMove)}
        </span>
        <span
          className="font-mono font-medium"
          style={{ fontSize: '18px', color: 'var(--color-text-primary)' }}
        >
          +{playerReward}
        </span>
      </div>

      <div className="result-row result-stagger-1">
        <span className="font-mono text-text-ghost" style={{ fontSize: '11px', width: '40px', textAlign: 'right' }}>
          THEM
        </span>
        <span
          className="font-display font-medium uppercase"
          style={{ fontSize: '14px', letterSpacing: '0.06em', color: moveColor(opponentMove) }}
        >
          {moveName(opponentMove)}
        </span>
        <span
          className="font-mono font-medium text-text-secondary"
          style={{ fontSize: '18px' }}
        >
          +{opponentReward}
        </span>
      </div>

      <div
        className="result-stagger-2 font-mono text-text-ghost"
        style={{ fontSize: '11px', marginTop: '4px' }}
      >
        click to continue
      </div>
    </div>
  );
}
