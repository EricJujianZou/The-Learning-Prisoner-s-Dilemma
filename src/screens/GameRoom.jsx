import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OPPONENTS } from '../game/opponents.js';
import { CHARACTERS, SFX } from '../config/characters.js';
import { GAME_CONFIG } from '../config.js';
import PayoffMatrix from '../components/PayoffMatrix.jsx';
import RoundHistory from '../components/RoundHistory.jsx';
import ActionButton from '../components/ActionButton.jsx';
import Narrator from '../components/Narrator.jsx';
import CharacterSilhouette from '../components/CharacterSilhouette.jsx';
import PostLevel from './PostLevel.jsx';
import { useSafeSound } from '../hooks/useSafeSound.js';

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

  // ── Anticipation delay state ──────────────────────────────────────────────
  const [awaitingResult, setAwaitingResult] = useState(false);
  const awaitingTimerRef = useRef(null);

  // ── Mid-round dialogue state ──────────────────────────────────────────────
  const [midRoundDialogue, setMidRoundDialogue] = useState(null);
  const lastDialogueRound = useRef(null);

  // ── Sound hooks ───────────────────────────────────────────────────────────
  const [playCooperate] = useSafeSound(SFX.buttonCooperate);
  const [playDefect]    = useSafeSound(SFX.buttonDefect);
  const [playReveal]    = useSafeSound(SFX.roundReveal);
  const [playPhaseShift] = useSafeSound(SFX.phaseShift);

  // ── Intro voiceline via HTMLAudioElement ──────────────────────────────────
  // use-sound destroys its Howl on component unmount, cutting audio mid-sentence.
  // HTMLAudioElement persists independently of React's lifecycle.
  const introAudioRef = useRef(null);

  useEffect(() => {
    if (isAnalysis) return;
    const key = isRL ? 'rl' : `level-${currentLevelIndex}`;
    if (key === introKey) return;
    setIntroKey(key);
    setShowIntro(true);

    if (introAudio) {
      if (introAudioRef.current) { introAudioRef.current.onended = null; introAudioRef.current.pause(); introAudioRef.current.src = ''; }
      const aud = new Audio(introAudio);
      aud.volume = 0.5;
      aud.onended = () => setShowIntro(false);
      aud.play().catch(() => {});
      introAudioRef.current = aud;
      return () => { aud.onended = null; aud.pause(); aud.src = ''; };
    } else {
      const t = setTimeout(() => setShowIntro(false), GAME_CONFIG.INTRO_DISPLAY_MS);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelIndex, isRL, isAnalysis]);

  // ── Round result auto-advance + sound + mid-round dialogue ────────────────
  useEffect(() => {
    if (!roundResult) return;
    setAwaitingResult(false);
    playReveal();
    triggerMidRoundDialogue(roundResult);
    const t = setTimeout(() => {
      setMidRoundDialogue(null);
      onAdvanceRound();
    }, GAME_CONFIG.RESULT_DISPLAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundResult]);

  // ── Phase 2 flicker at round 11 ───────────────────────────────────────────
  const prevRound = useRef(round);
  useEffect(() => {
    if (isRL && prevRound.current === 10 && round === 11) {
      setPhase2Flicker(true);
      playPhaseShift();
      const t = setTimeout(() => setPhase2Flicker(false), 300);
      return () => clearTimeout(t);
    }
    prevRound.current = round;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, isRL]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => { if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current); };
  }, []);

  // ── 800ms anticipation move handler ──────────────────────────────────────
  function handleMove(moveValue) {
    if (buttonsDisabled) return;
    if (moveValue === 'C') playCooperate();
    else playDefect();
    setAwaitingResult(true);
    awaitingTimerRef.current = setTimeout(() => {
      if (isRL) onMoveRL(moveValue);
      else onMoveStandard(moveValue);
    }, 800);
  }

  // ── Mid-round dialogue detection ──────────────────────────────────────────
  function triggerMidRoundDialogue(result) {
    const character = isRL ? CHARACTERS.machine : currentOpponent;
    if (!character?.midRound) return;
    // Never fire two consecutive rounds
    if (lastDialogueRound.current === round - 1) return;
    // 45% probability gate
    if (Math.random() > 0.45) return;

    const history = roundHistory; // history before this round
    const events = [];

    if (result.playerMove === 'C') events.push('onPlayerCooperate');
    if (result.playerMove === 'D') events.push('onPlayerDefect');
    if (result.playerMove === 'D' && !history.some((r) => r.playerMove === 'D'))
      events.push('onFirstDefect');
    if (!history.some((r) => r.playerMove === 'D') && result.playerMove !== 'D')
      events.push('onNoDefect');
    if (isRL && result.wasExploring === true)  events.push('onAgentExplore');
    if (isRL && result.wasExploring === false) events.push('onAgentExploit');
    if (isRL && round === 11) events.push('onPhaseShift');

    // Pick a matching event that has dialogue lines
    for (const event of events) {
      const lines = character.midRound[event];
      if (lines && lines.length > 0) {
        const line = lines[Math.floor(Math.random() * lines.length)];
        setMidRoundDialogue(line);
        lastDialogueRound.current = round;
        return;
      }
    }
  }

  function skipIntro() {
    if (introAudioRef.current) { introAudioRef.current.onended = null; introAudioRef.current.pause(); introAudioRef.current.src = ''; }
    setShowIntro(false);
  }

  const buttonsDisabled = !!roundResult || showIntro || isAnalysis || awaitingResult;

  const introText = isRL
    ? CHARACTERS.machine.intro.text
    : currentOpponent?.intro?.text ?? currentOpponent?.chungusIntro ?? '';
  const introAudio = isRL
    ? CHARACTERS.machine.intro.audio
    : currentOpponent?.intro?.audio;

  const roomClass = [
    'room',
    isRL && phase2Active ? 'room--phase2' : '',
    isAnalysis && analysisData?.won ? 'room--win' : '',
    isAnalysis && analysisData && !analysisData.won ? 'room--lose' : '',
    phase2Flicker ? 'animate-phase-shift' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const phaseLabel = isRL
    ? round <= 10
      ? "Phase 1: It's studying you."
      : 'Phase 2: It has adapted.'
    : null;

  const silhouettePose = isRL
    ? CHARACTERS.machine.silhouetteStyle
    : currentOpponent?.silhouetteStyle ?? 'rigid';

  return (
    <div className={roomClass}>
      {/* ── Wall Labels ──────────────────────────────────────────────────── */}
      <div className="wall-labels">
        <div className="flex flex-col gap-0.5">
          <span
            className="font-display font-medium uppercase text-text-secondary"
            style={{ fontSize: '11px', letterSpacing: '0.08em' }}
          >
            {isRL ? 'THE MACHINE' : currentOpponent?.levelName ?? ''}
          </span>
          {phaseLabel && (
            <span
              className="font-mono"
              style={{ fontSize: '11px', color: phase2Active ? 'var(--color-defect)' : 'var(--color-text-secondary)' }}
            >
              {phaseLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>YOU</span>
              <span className="font-mono font-medium text-text-primary" style={{ fontSize: '16px' }}>{playerScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>THEM</span>
              <span className="font-mono font-medium text-text-secondary" style={{ fontSize: '16px' }}>{opponentScore}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono font-medium text-text-primary" style={{ fontSize: '18px' }}>{round}</span>
            <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>/ {maxRounds}</span>
          </div>
        </div>
      </div>

      {/* ── Mirror ───────────────────────────────────────────────────────── */}
      <div className={`mirror ${isRL ? 'mirror--rl' : ''} ${isRL && phase2Active ? 'mirror--phase2' : ''}`}>
        <AnimatePresence mode="wait">
          {isAnalysis ? (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ height: '100%' }}
            >
              <PostLevel
                analysisData={analysisData}
                onRetry={onRetry}
                onNextLevel={onNextLevel}
              />
            </motion.div>
          ) : showIntro ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="mirror-intro"
              onClick={skipIntro}
              style={{ cursor: 'pointer' }}
            >
              <CharacterSilhouette pose={silhouettePose} />
              <Narrator text={introText} />
              <div className="font-mono text-text-ghost" style={{ fontSize: '10px', marginTop: '16px', textAlign: 'center', letterSpacing: '0.06em' }}>
                click anywhere to continue
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="mirror-gameplay"
            >
              <PayoffMatrix />
              {/* Anticipation overlay */}
              {awaitingResult && (
                <div className="anticipation-overlay">
                  <div className="anticipation-dots">
                    <span /><span /><span />
                  </div>
                  <div className="anticipation-label">They're choosing...</div>
                </div>
              )}
              {/* Round result overlay — dialogue shown inside */}
              {roundResult && <RoundResultDisplay result={roundResult} dialogue={midRoundDialogue} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Desk + History ────────────────────────────────────────────────── */}
      <div className="desk">
        <RoundHistory history={roundHistory} totalRounds={maxRounds} />
      </div>

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <div className="buttons-row">
        <ActionButton action="cooperate" onPress={() => handleMove('C')} disabled={buttonsDisabled} />
        <ActionButton action="defect"    onPress={() => handleMove('D')} disabled={buttonsDisabled} />
      </div>
    </div>
  );
}

// ── Round Result Overlay ───────────────────────────────────────────────────
function RoundResultDisplay({ result, dialogue }) {
  const { playerMove, opponentMove, playerReward, opponentReward } = result;
  const moveColor = (m) => (m === 'C' ? 'var(--color-cooperate)' : 'var(--color-defect)');
  const moveName  = (m) => (m === 'C' ? 'COOPERATE' : 'DEFECT');

  return (
    <div className="round-result">
      <div className="result-row result-stagger-0">
        <span className="font-mono text-text-ghost" style={{ fontSize: '11px', width: '40px', textAlign: 'right' }}>YOU</span>
        <span className="font-display font-medium uppercase" style={{ fontSize: '14px', letterSpacing: '0.06em', color: moveColor(playerMove) }}>
          {moveName(playerMove)}
        </span>
        <span className="font-mono font-medium" style={{ fontSize: '18px', color: 'var(--color-text-primary)' }}>+{playerReward}</span>
      </div>

      <div className="result-row result-stagger-1">
        <span className="font-mono text-text-ghost" style={{ fontSize: '11px', width: '40px', textAlign: 'right' }}>THEM</span>
        <span className="font-display font-medium uppercase" style={{ fontSize: '14px', letterSpacing: '0.06em', color: moveColor(opponentMove) }}>
          {moveName(opponentMove)}
        </span>
        <span className="font-mono font-medium text-text-secondary" style={{ fontSize: '18px' }}>+{opponentReward}</span>
      </div>

      {dialogue && (
        <div
          className="font-mono italic"
          style={{
            fontSize: '12px',
            color: 'var(--color-chungus)',
            marginTop: '12px',
            lineHeight: 1.5,
            opacity: 0.9,
            animation: 'fadeIn 0.4s ease-out',
          }}
        >
          &ldquo;{dialogue}&rdquo;
        </div>
      )}
    </div>
  );
}
