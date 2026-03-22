// Cooperate / Defect physical button.
// action: 'cooperate' | 'defect'
export default function ActionButton({ action, onPress, disabled }) {
  const label = action === 'cooperate' ? 'COOPERATE' : 'DEFECT';
  return (
    <button
      className={`action-btn action-btn--${action}`}
      onClick={onPress}
      disabled={disabled}
      aria-label={label}
    >
      {label}
    </button>
  );
}
