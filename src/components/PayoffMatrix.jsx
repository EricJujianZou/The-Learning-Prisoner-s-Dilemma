// 2x2 payoff matrix — always visible during gameplay, static, never animates.
export default function PayoffMatrix() {
  return (
    <div>
      <div className="text-2xs font-mono text-text-ghost uppercase tracking-widest mb-3">
        Payoff Matrix — You / Them
      </div>
      <div className="payoff-matrix">
        {/* Top-left corner spacer */}
        <div />
        {/* Column headers */}
        <div className="text-center text-2xs font-mono text-text-secondary uppercase tracking-widest flex items-end justify-center pb-1">
          They C
        </div>
        <div className="text-center text-2xs font-mono text-text-secondary uppercase tracking-widest flex items-end justify-center pb-1">
          They D
        </div>

        {/* Row: You Cooperate */}
        <div className="text-2xs font-mono text-text-secondary uppercase tracking-widest flex items-center justify-end pr-2">
          You C
        </div>
        <div
          className="matrix-cell"
          style={{ background: 'rgba(45, 181, 99, 0.08)', border: '1px solid rgba(45, 181, 99, 0.2)' }}
        >
          <span className="text-cooperate">3 / 3</span>
        </div>
        <div
          className="matrix-cell"
          style={{ background: 'rgba(217, 69, 69, 0.06)', border: '1px solid rgba(217, 69, 69, 0.15)' }}
        >
          <span className="text-text-secondary">0 / 5</span>
        </div>

        {/* Row: You Defect */}
        <div className="text-2xs font-mono text-text-secondary uppercase tracking-widest flex items-center justify-end pr-2">
          You D
        </div>
        <div
          className="matrix-cell"
          style={{ background: 'rgba(217, 69, 69, 0.06)', border: '1px solid rgba(217, 69, 69, 0.15)' }}
        >
          <span className="text-text-secondary">5 / 0</span>
        </div>
        <div
          className="matrix-cell"
          style={{ background: 'rgba(17, 17, 25, 0.8)', border: '1px solid rgba(34, 34, 54, 0.8)' }}
        >
          <span className="text-text-ghost">1 / 1</span>
        </div>
      </div>
    </div>
  );
}
