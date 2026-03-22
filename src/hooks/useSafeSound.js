import useSound from 'use-sound';

// Wraps use-sound so missing audio files are silently ignored.
// Pass null/undefined url to get a no-op play function.
const SILENT = '/sounds/__none__.mp3';

export function useSafeSound(url, options = {}) {
  const [play, controls] = useSound(url ?? SILENT, {
    volume: 0.5,
    ...options,
    onloaderror: () => {},
  });

  const safePlay = (...args) => {
    if (!url) return;
    try { play(...args); } catch {}
  };

  return [safePlay, controls];
}
