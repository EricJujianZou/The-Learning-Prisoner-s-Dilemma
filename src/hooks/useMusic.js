// useMusic — manages looping background music with crossfade between tracks.
// Silently ignores missing files. Respects MUSIC_CONFIG.enabled as a kill switch.

import { useEffect, useRef } from 'react';
import { MUSIC_CONFIG } from '../config/music.js';

// Ramp audio.volume from current value to targetVol over durationMs.
// Returns the interval ID so the caller can cancel if needed.
function fadeVolume(audio, targetVol, durationMs, onDone) {
  const STEPS = 25;
  const stepMs = durationMs / STEPS;
  const startVol = audio.volume;
  const delta = (targetVol - startVol) / STEPS;
  let step = 0;

  const id = setInterval(() => {
    step++;
    audio.volume = Math.min(1, Math.max(0, startVol + delta * step));
    if (step >= STEPS) {
      clearInterval(id);
      onDone?.();
    }
  }, stepMs);

  return id;
}

export function useMusic(trackKey, muted = false) {
  // { audio: HTMLAudioElement, key: string } | null
  const currentRef = useRef(null);
  // Only the fade-in needs cancellation (switching tracks before fade-in completes).
  // Fade-outs run independently per-audio via closure so rapid switches don't orphan audio.
  const fadeInId = useRef(null);

  // Track switches
  useEffect(() => {
    const { enabled, volume, fadeMs, tracks } = MUSIC_CONFIG;

    if (!enabled || muted) {
      if (currentRef.current) {
        currentRef.current.audio.pause();
        currentRef.current.audio.src = '';
        currentRef.current = null;
      }
      return;
    }

    if (currentRef.current?.key === trackKey) return;

    const src = trackKey ? tracks[trackKey] : null;

    // Fade out outgoing — captured in closure so rapid switches don't interrupt it.
    const outgoing = currentRef.current;
    if (outgoing) {
      const outAudio = outgoing.audio;
      fadeVolume(outAudio, 0, fadeMs, () => {
        outAudio.pause();
        outAudio.src = '';
      });
    }

    if (!src) {
      currentRef.current = null;
      return;
    }

    // Start incoming
    const audio = new Audio(src);
    audio.loop   = true;
    audio.volume = 0;
    currentRef.current = { audio, key: trackKey };

    const tryPlay = () => {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    };

    // Try immediately — will succeed if a prior user gesture has already occurred.
    // If blocked (autoplay policy), retry on the next user interaction.
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — wait for any user interaction then retry once.
        const events = ['pointerdown', 'keydown'];
        const onInteraction = () => {
          tryPlay();
          events.forEach((e) => window.removeEventListener(e, onInteraction));
        };
        events.forEach((e) => window.addEventListener(e, onInteraction, { once: true }));
      });
    }

    clearInterval(fadeInId.current);
    fadeInId.current = fadeVolume(audio, volume, fadeMs);
  }, [trackKey, muted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop cleanly on unmount
  useEffect(() => {
    return () => {
      clearInterval(fadeInId.current);
      if (currentRef.current) {
        currentRef.current.audio.pause();
        currentRef.current.audio.src = '';
      }
    };
  }, []);
}
