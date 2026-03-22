// The Chungus narrator text — fades in slowly, deliberate.
export default function Narrator({ text, className = '' }) {
  if (!text) return null;
  return (
    <p
      className={`narrator-text animate-fade-in-slow ${className}`}
      key={text} // re-trigger animation when text changes
    >
      &ldquo;{text}&rdquo;
    </p>
  );
}
