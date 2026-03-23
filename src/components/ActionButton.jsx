import { motion } from 'framer-motion';

// Cooperate / Defect physical button.
// action: 'cooperate' | 'defect'
export default function ActionButton({ action, onPress, disabled }) {
  const label = action === 'cooperate' ? 'COOPERATE' : 'DEFECT';
  return (
    <motion.button
      className={`action-btn action-btn--${action}`}
      onClick={onPress}
      disabled={disabled}
      aria-label={label}
      animate={disabled ? { opacity: 0.25, y: 2 } : { opacity: 1, y: 0 }}
      whileTap={disabled ? {} : { scale: 0.93 }}
      transition={{
        opacity: { duration: 0.2 },
        y: { duration: 0.2 },
        scale: { type: 'spring', stiffness: 400, damping: 15 },
      }}
    >
      {label}
    </motion.button>
  );
}
