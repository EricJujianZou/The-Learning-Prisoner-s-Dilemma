import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSafeSound } from '../hooks/useSafeSound.js';

export default function Narrator({ text, audio, className = '' }) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [done, setDone] = useState(false);
  const [playAudio] = useSafeSound(audio);

  useEffect(() => {
    if (text) playAudio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    if (!text) return;
    setDisplayedChars(0);
    setDone(false);
    const timer = setInterval(() => {
      setDisplayedChars((prev) => {
        if (prev >= text.length) {
          clearInterval(timer);
          setDone(true);
          return prev;
        }
        return prev + 1;
      });
    }, 35);
    return () => clearInterval(timer);
  }, [text]);

  if (!text) return null;

  return (
    <p className={`narrator-text ${className}`} key={text}>
      &ldquo;{text.slice(0, displayedChars)}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-block', width: '0.5em' }}
        >
          _
        </motion.span>
      )}
      {done && <>&rdquo;</>}
    </p>
  );
}
