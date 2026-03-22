// Reusable Framer Motion transition presets

// Heavy, physical feel — door, clipboard, large elements
export const heavySpring = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 1,
};

// Snappy — round results, score updates
export const snappySpring = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

// Soft — narrator text, silhouette
export const softTween = {
  type: 'tween',
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1],
};

// Exit — fast, everything leaves the same way
export const exitFast = {
  type: 'tween',
  duration: 0.15,
  ease: [0.4, 0, 1, 1],
};

// Standard stagger child animation
export const staggerChild = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.12 },
  },
};
