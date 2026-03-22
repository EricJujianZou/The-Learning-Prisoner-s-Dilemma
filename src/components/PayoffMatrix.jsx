// 2x2 payoff matrix — always visible during gameplay, static, never animates.
export default function PayoffMatrix() {
  return (
    <div style={{ width: '100%' }}>
      <div className="text-2xs font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Payoff Matrix — You / Them
      </div>
      <div className="payoff-matrix">
        {/* Top-left corner spacer */}
        <div />
        {/* Column headers */}
        <div className="text-center text-2xs font-mono uppercase tracking-widest flex items-end justify-center pb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          They Cooperate
        </div>
        <div className="text-center text-2xs font-mono uppercase tracking-widest flex items-end justify-center pb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          They Defect
        </div>

        {/* Row: You Cooperate */}
        <div className="text-2xs font-mono uppercase tracking-widest flex items-center justify-end pr-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          You Cooperate
        </div>
        <div
          className="matrix-cell"
          style={{ background: 'rgba(80, 140, 200, 0.12)', border: '1px solid rgba(80, 140, 200, 0.3)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>3 / 3</span>
        </div>
        <div
          className="matrix-cell"
          style={{ background: 'rgba(80, 140, 200, 0.12)', border: '1px solid rgba(80, 140, 200, 0.3)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>0 / 5</span>
        </div>

        {/* Row: You Defect */}
        <div className="text-2xs font-mono uppercase tracking-widest flex items-center justify-end pr-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          You Defect
        </div>
        <div
          className="matrix-cell"
          style={{ background: 'rgba(80, 140, 200, 0.12)', border: '1px solid rgba(80, 140, 200, 0.3)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>5 / 0</span>
        </div>
        <div
          className="matrix-cell"
          style={{ background: 'rgba(20, 20, 35, 0.9)', border: '1px solid rgba(80, 140, 200, 0.15)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>1 / 1</span>
        </div>
      </div>
    </div>
  );
}
