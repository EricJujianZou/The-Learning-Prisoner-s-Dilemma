import { motion } from 'framer-motion';

// Character image shown during the pre-level intro.
// Images are keyed by the pose/silhouetteStyle value set in config/characters.js.

const IMAGE_MAP = {
  slouched:  '/characters/slouched.png',
  rigid:     '/characters/rigid.png',
  mirrored:  '/characters/mirrored.png',
  still:     '/characters/still.png',
  fidgety:   '/characters/fidgety.png',
  computing: '/characters/computing.png',
};

// Per-pose breathing animations applied directly to the image.
// 'still' has no animation intentionally — the stillness is the effect.
// 'computing' uses a drop-shadow glow instead of movement.
const BREATHING = {
  slouched: {
    animate: { scaleY: [1, 1.008, 1], y: [0, 0.5, 0] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  rigid: {
    animate: { scaleY: [1, 1.003, 1] },
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
  mirrored: {
    animate: { scaleY: [1, 1.012, 1], rotateZ: [2, 2.5, 2] },
    transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
  },
  still: {},
  fidgety: {
    animate: { x: [0, -0.5, 0.8, -0.3, 0], y: [0, 0.3, -0.2, 0.5, 0], rotateZ: [0, -0.5, 0.3, -0.2, 0] },
    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
  },
  computing: {
    animate: {
      filter: [
        'drop-shadow(0 0 3px rgba(91, 95, 230, 0.05))',
        'drop-shadow(0 0 8px rgba(91, 95, 230, 0.18))',
        'drop-shadow(0 0 3px rgba(91, 95, 230, 0.05))',
      ],
    },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export default function CharacterSilhouette({ pose = 'rigid' }) {
  const src = IMAGE_MAP[pose] ?? IMAGE_MAP.rigid;
  const anim = BREATHING[pose] ?? BREATHING.rigid;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
      <motion.img
        src={src}
        alt=""
        style={{
          maxHeight: '260px',
          maxWidth: '100%',
          objectFit: 'contain',
          objectPosition: 'bottom',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        {...anim}
      />
    </div>
  );
}
