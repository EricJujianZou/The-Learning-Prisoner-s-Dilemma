import { useEffect, useRef, useState } from 'react';
import { extractPolicy } from '../game/qlearner.js';

const STATES_DISPLAY = ['CC', 'CD', 'DC', 'DD'];

function useCountUp(targetValue, duration = 300, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        setValue(targetValue * progress);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setValue(targetValue);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, duration, delay]);

  return value;
}

function QCell({ value, delay }) {
  const animated = useCountUp(value, 300, delay);
  return <span className="tabular-nums">{animated.toFixed(2)}</span>;
}

export default function QTableReveal({ qTable, visitedStates }) {
  const policy = extractPolicy(qTable, visitedStates);

  return (
    <div className="qtable mt-2">
      <div className="qtable-header">
        <span>State</span>
        <span className="text-center">Q(C)</span>
        <span className="text-center">Q(D)</span>
        <span className="text-center">Policy</span>
      </div>
      {STATES_DISPLAY.map((state, rowIndex) => {
        const { visited, preferred, C, D } = policy[state];
        const delay = rowIndex * 50;
        return (
          <div
            key={state}
            className={`qtable-row ${!visited ? 'qtable-row--unvisited' : ''}`}
          >
            <span
              className="font-medium"
              style={{ color: visited ? 'var(--color-text-primary)' : 'var(--color-text-ghost)' }}
            >
              {state}
            </span>
            <span
              className="text-center"
              style={{ color: C > D ? 'var(--color-cooperate)' : 'var(--color-text-secondary)' }}
            >
              {visited ? <QCell value={C} delay={delay} /> : '—'}
            </span>
            <span
              className="text-center"
              style={{ color: D > C ? 'var(--color-defect)' : 'var(--color-text-secondary)' }}
            >
              {visited ? <QCell value={D} delay={delay + 25} /> : '—'}
            </span>
            <span
              className="text-center font-medium"
              style={{
                color:
                  preferred === 'C'
                    ? 'var(--color-cooperate)'
                    : preferred === 'D'
                    ? 'var(--color-defect)'
                    : 'var(--color-text-ghost)',
              }}
            >
              {visited ? preferred : 'unvisited'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
