import { AnimatePresence, motion } from 'framer-motion';

// Back / Next row at the bottom of each step. While `ready` is false the
// Next button waits (with a hint) but a small "skip" link is always there.
export default function StepNav({ onBack, onNext, ready = true, nextLabel = 'Next', hint, showBack = true }) {
  return (
    <div className="step-nav">
      {showBack && onBack ? (
        <button type="button" className="btn btn-ghost" onClick={onBack} aria-label="Previous step">
          ← Back
        </button>
      ) : (
        <span />
      )}
      <AnimatePresence mode="wait">
        {ready ? (
          <motion.button
            key="next"
            type="button"
            className="btn btn-primary"
            onClick={onNext}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {nextLabel} <span aria-hidden="true">→</span>
          </motion.button>
        ) : (
          <motion.div key="hint" className="nav-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span>{hint}</span>
            <button type="button" className="skip" onClick={onNext}>
              skip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
