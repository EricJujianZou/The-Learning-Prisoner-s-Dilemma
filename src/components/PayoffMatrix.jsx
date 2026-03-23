import { motion } from 'framer-motion';

// Enter: cells fly in with spring stagger.
// Exit: data cells shatter outward in four directions; labels fade quickly.
const cellIn = {
  initial: { opacity: 0, y: 6, scale: 0.94 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
};

// The 4 data cells fly in separate directions on exit.
const SHATTER = [
  { x: -15, y: -10 }, // CC — top-left
  { x:  15, y: -10 }, // CD — top-right
  { x: -15, y:  10 }, // DC — bottom-left
  { x:  15, y:  10 }, // DD — bottom-right
];

// 2x2 payoff matrix — cells fly in on gameplay mount, shatter on exit.
export default function PayoffMatrix() {
  return (
    <div style={{ width: '100%' }}>
      <motion.div
        className="text-2xs font-mono uppercase tracking-widest mb-3"
        style={{ color: 'rgb(254, 254, 254)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.08 } }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        Payoff Matrix — Your Score / Their Score
      </motion.div>
      <motion.div
        className="payoff-matrix"
        variants={{ animate: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } } }}
        initial="initial"
        animate="animate"
      >
        {/* Corner spacer */}
        <div />

        {/* Column headers */}
        <motion.div
          variants={cellIn}
          className="text-center text-2xs font-mono uppercase tracking-widest flex items-end justify-center pb-1"
          style={{ color: 'rgba(255,255,255,1)' }}
        >
          They Cooperate
        </motion.div>
        <motion.div
          variants={cellIn}
          className="text-center text-2xs font-mono uppercase tracking-widest flex items-end justify-center pb-1"
          style={{ color: 'rgba(255,255,255,1)' }}
        >
          They Defect
        </motion.div>

        {/* Row: You Cooperate */}
        <motion.div
          variants={cellIn}
          className="text-2xs font-mono uppercase tracking-widest flex items-center justify-start pl-1"
          style={{ color: 'rgba(255,255,255,1)' }}
        >
          You Cooperate
        </motion.div>
        <motion.div
          variants={cellIn}
          exit={{ opacity: 0, scale: 0.8, x: SHATTER[0].x, y: SHATTER[0].y, transition: { duration: 0.15 } }}
          className="matrix-cell"
          style={{ background: 'rgba(80, 140, 200, 0.12)', border: '1px solid rgba(80, 140, 200, 0.3)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>3 pts / 3 pts</span>
        </motion.div>
        <motion.div
          variants={cellIn}
          exit={{ opacity: 0, scale: 0.8, x: SHATTER[1].x, y: SHATTER[1].y, transition: { duration: 0.15, delay: 0.04 } }}
          className="matrix-cell"
          style={{ background: 'rgba(80, 140, 200, 0.12)', border: '1px solid rgba(80, 140, 200, 0.3)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>0 pts / 5 pts</span>
        </motion.div>

        {/* Row: You Defect */}
        <motion.div
          variants={cellIn}
          className="text-2xs font-mono uppercase tracking-widest flex items-center justify-start pl-1"
          style={{ color: 'rgba(255,255,255,1)' }}
        >
          You Defect
        </motion.div>
        <motion.div
          variants={cellIn}
          exit={{ opacity: 0, scale: 0.8, x: SHATTER[2].x, y: SHATTER[2].y, transition: { duration: 0.15, delay: 0.08 } }}
          className="matrix-cell"
          style={{ background: 'rgba(80, 140, 200, 0.12)', border: '1px solid rgba(80, 140, 200, 0.3)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>5 pts/ 0 pts</span>
        </motion.div>
        <motion.div
          variants={cellIn}
          exit={{ opacity: 0, scale: 0.8, x: SHATTER[3].x, y: SHATTER[3].y, transition: { duration: 0.15, delay: 0.12 } }}
          className="matrix-cell"
          style={{ background: 'rgba(80, 140, 200, 0.12)', border: '1px solid rgba(80, 140, 200, 0.3)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>1 pts/ 1 pts</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
