import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { snappySpring } from '../config/animations.js';
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

  // ── Phase 2 flicker at round 6 ────────────────────────────────────────────
  const prevRound = useRef(round);
  useEffect(() => {
    if (isRL && prevRound.current === 5 && round === 6) {
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
    if (lastDialogueRound.current === round - 1) return;
    if (Math.random() > 0.45) return;

    const history = roundHistory;
    const events = [];

    if (result.playerMove === 'C') events.push('onPlayerCooperate');
    if (result.playerMove === 'D') events.push('onPlayerDefect');
    if (result.playerMove === 'D' && !history.some((r) => r.playerMove === 'D'))
      events.push('onFirstDefect');
    if (!history.some((r) => r.playerMove === 'D') && result.playerMove !== 'D')
      events.push('onNoDefect');
    if (isRL && result.wasExploring === true)  events.push('onAgentExplore');
    if (isRL && result.wasExploring === false) events.push('onAgentExploit');
    if (isRL && round === 6) events.push('onPhaseShift');

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

  // Key changes on each new opponent — re-triggers entrance animations
  const roomEntranceKey = isRL ? 'rl' : `level-${currentLevelIndex}`;

  return (
    <div className={roomClass}>
      {/* ── Atmosphere veil — fades from black on each new opponent ──────── */}
      <motion.div
        key={roomEntranceKey + '-veil'}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--color-void)',
          zIndex: 999,
          pointerEvents: 'none',
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* ── Wall Labels ──────────────────────────────────────────────────── */}
      <motion.div
        key={roomEntranceKey + '-labels'}
        className="wall-labels"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
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

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>YOU</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={playerScore}
                  className="font-mono font-medium text-text-primary"
                  style={{ fontSize: '16px', display: 'inline-block' }}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {playerScore}
                </motion.span>
              </AnimatePresence>
              <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>pts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>THEM</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={opponentScore}
                  className="font-mono font-medium text-text-primary"
                  style={{ fontSize: '16px', display: 'inline-block' }}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {opponentScore}
                </motion.span>
              </AnimatePresence>
              <span className="font-mono text-text-ghost" style={{ fontSize: '10px' }}>pts</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono font-medium text-text-primary" style={{ fontSize: '18px' }}>{round} / {maxRounds}</span>
            <span className="font-mono text-text-primary" style={{ fontSize: '10px' }}>turns</span>
          </div>
        </div>
      </motion.div>

      {/* ── Mirror — scales in from 0.98 ─────────────────────────────────── */}
      <motion.div
        key={roomEntranceKey + '-mirror'}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
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
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {/* Glass fog — clears to reveal silhouette */}
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(8, 12, 28, 0.88)',
                    zIndex: 1,
                    pointerEvents: 'none',
                    borderRadius: 'inherit',
                  }}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0.12 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                />

                {/* Silhouette — scales in as fog clears */}
                <motion.div
                  style={{ position: 'relative', zIndex: 2 }}
                  initial={{ scale: 0.97 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <CharacterSilhouette pose={silhouettePose} />
                </motion.div>

                {/* Narrator — appears 400ms after silhouette visible */}
                <motion.div
                  style={{ position: 'relative', zIndex: 2 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Narrator text={introText} />
                </motion.div>

                <div
                  className="font-mono text-text-ghost"
                  style={{ fontSize: '10px', marginTop: '16px', textAlign: 'center', letterSpacing: '0.06em', position: 'relative', zIndex: 2 }}
                >
                  click anywhere to continue
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="gameplay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.1 } }}
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
                {/* Round result overlay */}
                {roundResult && <RoundResultDisplay result={roundResult} dialogue={midRoundDialogue} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Desk + History ────────────────────────────────────────────────── */}
      <motion.div
        key={roomEntranceKey + '-desk'}
        className="desk"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <RoundHistory history={roundHistory} totalRounds={maxRounds} />
      </motion.div>

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <motion.div
        key={roomEntranceKey + '-buttons'}
        className="buttons-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <ActionButton action="cooperate" onPress={() => handleMove('C')} disabled={buttonsDisabled} />
        <ActionButton action="defect"    onPress={() => handleMove('D')} disabled={buttonsDisabled} />
      </motion.div>
    </div>
  );
}

// ── Round Result Overlay ───────────────────────────────────────────────────
function RoundResultDisplay({ result, dialogue }) {
  const { playerMove, opponentMove, playerReward, opponentReward } = result;
  const moveColor = (m) => (m === 'C' ? 'var(--color-cooperate)' : 'var(--color-defect)');
  const moveName  = (m) => (m === 'C' ? 'COOPERATE' : 'DEFECT');

  // Typewriter for mid-round dialogue at 25ms/char
  const [typedChars, setTypedChars] = useState(0);
  useEffect(() => {
    if (!dialogue) { setTypedChars(0); return; }
    setTypedChars(0);
    const id = setInterval(() => {
      setTypedChars((prev) => {
        if (prev >= dialogue.length) { clearInterval(id); return prev; }
        return prev + 1;
      });
    }, 25);
    return () => clearInterval(id);
  }, [dialogue]);

  return (
    <div className="round-result">
      {/* Your move — slides in from left */}
      <motion.div
        className="result-row"
        initial={{ opacity: 0, x: -20, scale: 0.85 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ ...snappySpring }}
      >
        <span className="font-mono text-text-ghost" style={{ fontSize: '11px', width: '40px', textAlign: 'right' }}>YOU</span>
        <span className="font-display font-medium uppercase" style={{ fontSize: '14px', letterSpacing: '0.06em', color: moveColor(playerMove) }}>
          {moveName(playerMove)}
        </span>
        <span className="font-mono font-medium" style={{ fontSize: '18px', color: 'var(--color-text-primary)' }}>+{playerReward}</span>
      </motion.div>

      {/* Their move — slides in from right, 180ms later */}
      <motion.div
        className="result-row"
        initial={{ opacity: 0, x: 20, scale: 0.85 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ ...snappySpring, delay: 0.18 }}
      >
        <span className="font-mono text-text-ghost" style={{ fontSize: '11px', width: '40px', textAlign: 'right' }}>THEM</span>
        <span className="font-display font-medium uppercase" style={{ fontSize: '14px', letterSpacing: '0.06em', color: moveColor(opponentMove) }}>
          {moveName(opponentMove)}
        </span>
        <span className="font-mono font-medium text-text-secondary" style={{ fontSize: '18px' }}>+{opponentReward}</span>
      </motion.div>

      {/* Mid-round dialogue — gold line extends, then typewriter text */}
      <AnimatePresence>
        {dialogue && (
          <motion.div
            key={dialogue}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginTop: '12px' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ height: '1px', background: 'var(--color-chungus)', margin: '0 auto 8px' }}
            />
            <div
              className="font-mono italic"
              style={{ fontSize: '12px', color: 'var(--color-chungus)', textAlign: 'center', lineHeight: 1.5 }}
            >
              &ldquo;{dialogue.slice(0, typedChars)}&rdquo;
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
