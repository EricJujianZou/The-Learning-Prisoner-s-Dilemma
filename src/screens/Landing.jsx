import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchLeaderboard } from '../storage/leaderboard.js';
import { useSafeSound } from '../hooks/useSafeSound.js';
import { SFX } from '../config/characters.js';
import { softTween } from '../config/animations.js';

export default function Landing({ onStart }) {
  const [entries, setEntries] = useState([]);
  const [doorAnimating, setDoorAnimating] = useState(false);
  const [playDoorOpen] = useSafeSound(SFX.doorOpen);

  useEffect(() => {
    fetchLeaderboard().then((data) => setEntries(data.slice(0, 10)));
  }, []);

  function handleStart() {
    if (doorAnimating) return;
    playDoorOpen();
    setDoorAnimating(true);
    setTimeout(() => onStart(), 900);
  }

  return (
    <div
      className="corridor h-full w-full flex flex-col items-center justify-start overflow-y-auto"
      style={{ perspective: '1000px', perspectiveOrigin: '50% 35%' }}
    >
      <div className="corridor-depth" />

      {/* Camera shake wrapper */}
      <motion.div
        className="relative z-10 w-full flex flex-col items-center"
        style={{ maxWidth: '480px', padding: '0 16px', paddingTop: '6vh', paddingBottom: '40px' }}
        animate={doorAnimating ? { x: [0, -3, 4, -2, 1, 0] } : {}}
        transition={{ delay: 0.55, duration: 0.2, ease: 'easeOut' }}
      >
        {/* ── Door ─────────────────────────────────────────────────────── */}
        <motion.div
          className="w-full"
          style={{
            position: 'relative',
            transformOrigin: doorAnimating ? '0% 50%' : '50% 50%',
            background: 'linear-gradient(170deg, #1C1C28 0%, #151521 40%, #0F0F1C 100%)',
            border: '2px solid #252538',
            borderRadius: '3px',
            boxShadow: `
              inset 1px 1px 0 rgba(255,255,255,0.04),
              inset -1px -1px 0 rgba(0,0,0,0.5),
              0 0 0 5px #09090F,
              0 0 0 7px #1C1C2A,
              0 24px 80px rgba(0,0,0,0.9)
            `,
          }}
          animate={
            doorAnimating
              ? { rotateY: 85, opacity: 0 }
              : { rotateY: [15, 16, 15, 14.5, 15] }
          }
          transition={
            doorAnimating
              ? {
                  rotateY: { type: 'tween', duration: 0.6, ease: [0.22, 0.68, 0.36, 1] },
                  opacity: { type: 'tween', delay: 0.5, duration: 0.15 },
                }
              : { type: 'tween', duration: 8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* ── Door header bar ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: '1px solid #1A1A2C',
            background: 'rgba(0,0,0,0.25)',
          }}>
            <div style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '9px',
              color: '#3A3A55',
              letterSpacing: '0.14em',
              padding: '3px 7px',
              border: '1px solid #202035',
              borderRadius: '2px',
              background: 'rgba(0,0,0,0.4)',
            }}>
              ROOM B-14
            </div>

            <div style={{
              width: '88px',
              height: '38px',
              background: 'rgba(2,3,10,0.97)',
              border: '2px solid #181828',
              borderRadius: '2px',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,1), inset 0 0 1px rgba(255,255,255,0.03)',
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: `
                repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 11px),
                repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 11px)
              `,
            }}>
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '48px',
                height: '10px',
                background: 'rgba(91,95,230,0.07)',
                filter: 'blur(8px)',
                borderRadius: '50%',
              }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#D94545',
                boxShadow: '0 0 5px rgba(217,69,69,0.5)',
              }} />
              <span style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '9px',
                color: '#3A3A55',
                letterSpacing: '0.1em',
              }}>OCCUPIED</span>
            </div>
          </div>

          {/* ── Top panel recess line ── */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #1E1E32 15%, #1E1E32 85%, transparent 100%)', margin: '0 10px' }} />

          {/* ── Lever handle ── */}
          <div style={{ position: 'absolute', right: '-2px', top: '65%', transform: 'translateY(-50%)', zIndex: 10 }}>
            <div style={{
              width: '15px',
              height: '68px',
              background: 'linear-gradient(180deg, #22223A 0%, #191928 100%)',
              border: '1px solid #2C2C44',
              borderRight: 'none',
              borderRadius: '3px 0 0 3px',
              position: 'relative',
              boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.03)',
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', border: '1px solid #2E2E48', position: 'absolute', top: '13px', left: '50%', transform: 'translateX(-50%)' }} />
              <div style={{ width: '3px', height: '7px', background: '#0A0A16', position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', borderRadius: '0 0 2px 2px' }} />
            </div>
            <div style={{
              width: '26px',
              height: '7px',
              background: 'linear-gradient(180deg, #242440 0%, #1A1A2E 100%)',
              border: '1px solid #2C2C44',
              borderRadius: '0 3px 3px 0',
              position: 'absolute',
              top: '22px',
              left: '15px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.6)',
            }} />
          </div>

          {/* ── Main content — stagger entrance ── */}
          <motion.div
            style={{ padding: '24px 32px 28px' }}
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
            }}
          >
            {/* Title */}
            <motion.div
              className="text-center mb-6"
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
              }}
            >
              <h1
                className="font-display font-bold text-text-primary uppercase"
                style={{ fontSize: '28px', letterSpacing: '-0.02em', lineHeight: 1.1 }}
              >
                The Learning Prisoner's Dilemma
              </h1>
              <p className="font-mono text-text-secondary mt-2" style={{ fontSize: '13px', letterSpacing: '0.01em' }}>
                Play Against 5 different personas and 1 self-learning Agent
              </p>
            </motion.div>

            {/* Payoff matrix */}
            <motion.div
              className="mb-6 p-4 rounded-mirror"
              style={{ background: 'rgba(7, 7, 11, 0.6)', border: '1px solid var(--color-border)' }}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { ...softTween } },
              }}
            >
              <div className="text-2xs font-mono text-text-ghost uppercase tracking-widest mb-3 text-center">
                Payoff Matrix — You / Them
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: '72px 1fr 1fr', gridTemplateRows: '20px 1fr 1fr', fontSize: '11px' }}>
                <div />
                <div className="text-center text-2xs font-mono flex items-end justify-center pb-1" style={{ color: 'rgba(255,255,255,0.85)' }}>They Cooperate</div>
                <div className="text-center text-2xs font-mono flex items-end justify-center pb-1" style={{ color: 'rgba(255,255,255,0.85)' }}>They Defect</div>
                <div className="text-2xs font-mono flex items-center justify-end pr-1" style={{ color: 'rgba(255,255,255,0.85)' }}>You Cooperate</div>
                <div className="flex items-center justify-center p-2 rounded-sm font-mono" style={{ background: 'rgba(80,140,200,0.12)', border: '1px solid rgba(80,140,200,0.3)', color: 'rgba(255,255,255,0.85)' }}>3 / 3</div>
                <div className="flex items-center justify-center p-2 rounded-sm font-mono" style={{ background: 'rgba(80,140,200,0.12)', border: '1px solid rgba(80,140,200,0.3)', color: 'rgba(255,255,255,0.85)' }}>0 / 5</div>
                <div className="text-2xs font-mono flex items-center justify-end pr-1" style={{ color: 'rgba(255,255,255,0.85)' }}>You Defect</div>
                <div className="flex items-center justify-center p-2 rounded-sm font-mono" style={{ background: 'rgba(80,140,200,0.12)', border: '1px solid rgba(80,140,200,0.3)', color: 'rgba(255,255,255,0.85)' }}>5 / 0</div>
                <div className="flex items-center justify-center p-2 rounded-sm font-mono" style={{ background: 'rgba(80,140,200,0.12)', border: '1px solid rgba(80,140,200,0.3)', color: 'rgba(255,255,255,0.85)' }}>1 / 1</div>
              </div>
            </motion.div>

            {/* Instructions */}
            <motion.p
              className="font-mono text-text-secondary text-center mb-4"
              style={{ fontSize: '12px', lineHeight: 1.5 }}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { ...softTween } },
              }}
            >
              You pick. They pick. You both score. Beat all 6 to make the leaderboard.
            </motion.p>

            {/* Chungus intro */}
            <motion.div
              className="text-center mb-6 py-3 px-4 rounded-sm"
              style={{ background: 'var(--color-chungus-dim)' }}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { ...softTween } },
              }}
            >
              <p className="font-mono italic text-chungus" style={{ fontWeight: 300, fontSize: '14px', lineHeight: 1.6 }}>
                &ldquo;Figure it out. That&rsquo;s the game.&rdquo;
              </p>
            </motion.div>

            {/* Enter button */}
            <motion.div
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { ...softTween } },
              }}
            >
              <motion.button
                onClick={handleStart}
                disabled={doorAnimating}
                className="w-full font-display font-medium text-accent-bright uppercase"
                style={{
                  background: 'rgba(91, 95, 230, 0.08)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: '6px',
                  padding: '16px',
                  fontSize: '15px',
                  letterSpacing: '0.12em',
                  cursor: doorAnimating ? 'not-allowed' : 'pointer',
                  touchAction: 'manipulation',
                }}
                animate={{
                  boxShadow: doorAnimating
                    ? '0 0 0px 0px rgba(91,95,230,0)'
                    : [
                        '0 0 20px 2px rgba(91, 95, 230, 0.15)',
                        '0 0 30px 6px rgba(91, 95, 230, 0.35)',
                        '0 0 20px 2px rgba(91, 95, 230, 0.15)',
                      ],
                }}
                transition={
                  doorAnimating
                    ? { type: 'tween', duration: 0.1 }
                    : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }
                whileTap={doorAnimating ? {} : { scale: 0.96 }}
                onHoverStart={(e) => { if (!doorAnimating) e.target.style.background = 'rgba(91, 95, 230, 0.16)'; }}
                onHoverEnd={(e) => { e.target.style.background = 'rgba(91, 95, 230, 0.08)'; }}
              >
                ENTER
              </motion.button>
            </motion.div>
          </motion.div>

          {/* ── Bottom panel recess line ── */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #1E1E32 15%, #1E1E32 85%, transparent 100%)', margin: '0 10px' }} />

          {/* ── Kick plate ── */}
          <div style={{
            height: '13px',
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid #181828',
            borderRadius: '0 0 2px 2px',
          }} />
        </motion.div>

        {/* ── Leaderboard preview ──────────────────────────────────────── */}
        {entries.length > 0 && (
          <motion.div
            className="w-full mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div
              className="rounded-clipboard overflow-hidden"
              style={{ background: '#1A1A24', border: '1px solid var(--color-border)' }}
            >
              <div
                className="h-4 relative flex items-center justify-center"
                style={{ background: '#1E1E2E', borderBottom: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-8 h-2.5 rounded-sm"
                  style={{ background: 'linear-gradient(180deg, #3A3A52 0%, #2A2A3E 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>
              <div className="p-4">
                <div className="text-2xs font-mono text-text-ghost uppercase tracking-widest mb-3">
                  Leaderboard
                </div>
                {entries.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 font-mono py-1.5"
                    style={{ borderBottom: '1px solid var(--color-border)', fontSize: '12px' }}
                  >
                    <span className="text-text-ghost w-4 text-right flex-shrink-0">{i + 1}</span>
                    <span className="text-text-secondary flex-1 truncate">{entry.name}</span>
                    <span className="text-text-primary font-medium">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
