import { motion } from 'framer-motion';

export default function Progress({ steps, current, maxVisited, onJump }) {
  const pct = (current / (steps.length - 1)) * 100;
  return (
    <div className="progress" role="navigation" aria-label="Steps">
      <div className="progress-track">
        <motion.div className="progress-fill" animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 80, damping: 20 }} />
      </div>
      <div className="progress-dots">
        {steps.map((s, i) =>
          i === 0 ? null : (
            <button
              key={s.key}
              type="button"
              className={`dot ${i === current ? 'is-current' : ''} ${i <= maxVisited ? 'is-visited' : ''}`}
              disabled={i > maxVisited}
              onClick={() => onJump(i)}
              aria-label={`Go to ${s.label}`}
              aria-current={i === current ? 'step' : undefined}
              title={s.label}
            />
          )
        )}
      </div>
    </div>
  );
}
