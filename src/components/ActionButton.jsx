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
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      {label}
    </motion.button>
  );
}
