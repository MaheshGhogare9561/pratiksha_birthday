import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { config } from '../config';
import { audio } from '../lib/audio';
import StepHeader from '../components/StepHeader';
import StepNav from '../components/StepNav';

const CARD_THEMES = [
  'linear-gradient(150deg,#fff1f5 0%,#ffd6e3 100%)',
  'linear-gradient(150deg,#f6f0ff 0%,#e0d4ff 100%)',
  'linear-gradient(150deg,#fff6ea 0%,#ffe0c2 100%)',
  'linear-gradient(150deg,#eefbf6 0%,#cdeee2 100%)',
  'linear-gradient(150deg,#fffbe8 0%,#fbe9b0 100%)',
  'linear-gradient(150deg,#eef5ff 0%,#d4e4ff 100%)',
];

// Step 4 — a swipeable deck of friendship quotes.
export default function Quotes({ onNext, onBack }) {
  const quotes = config.quotes;
  const n = quotes.length;
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState(1);
  const [seen, setSeen] = useState(1);

  function advance(dir = 1) {
    setExitDir(dir);
    setIndex((i) => i + 1);
    setSeen((s) => Math.min(n, s + 1));
    audio.chime([88], 0);
  }

  // top three cards, top card last so it renders above the rest
  const stack = [2, 1, 0].map((k) => ({ k, abs: index + k, q: quotes[(index + k) % n] }));

  return (
    <section className="step quotes-step">
      <StepHeader eyebrow="On friendship" title="Words that remind me of us" subtitle="Swipe the cards, or tap the arrow." />

      <div className="deck" aria-live="polite">
        <AnimatePresence custom={exitDir}>
          {stack.map(({ k, abs, q }) => {
            const isTop = k === 0;
            return (
              <motion.figure
                key={abs}
                className={`quote-card ${isTop ? 'is-top' : ''}`}
                style={{ background: CARD_THEMES[abs % CARD_THEMES.length], zIndex: 10 - k }}
                custom={exitDir}
                variants={{
                  enter: { opacity: 0, scale: 0.85, y: 40 },
                  stack: {
                    opacity: k === 2 ? 0.6 : 1,
                    scale: 1 - k * 0.05,
                    y: k * 16,
                    rotate: k === 0 ? 0 : k % 2 ? 3 : -3,
                  },
                  fling: (dir) => ({
                    x: dir * 420,
                    rotate: dir * 22,
                    opacity: 0,
                    transition: { duration: 0.45, ease: 'easeIn' },
                  }),
                }}
                initial="enter"
                animate="stack"
                exit="fling"
                transition={{ type: 'spring', stiffness: 160, damping: 20 }}
                drag={isTop ? 'x' : false}
                dragSnapToOrigin
                dragElastic={0.7}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) {
                    advance(info.offset.x > 0 ? 1 : -1);
                  }
                }}
                whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
              >
                <span className="quote-mark" aria-hidden="true">
                  “
                </span>
                <blockquote>{q.text}</blockquote>
                <figcaption>— {q.author}</figcaption>
                <span className="quote-count">
                  {(abs % n) + 1} / {n}
                </span>
              </motion.figure>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="deck-controls">
        <motion.button
          type="button"
          className="round-btn"
          onClick={() => advance(1)}
          whileTap={{ scale: 0.9 }}
          aria-label="Next quote"
        >
          →
        </motion.button>
      </div>

      <StepNav onBack={onBack} onNext={onNext} ready={seen >= Math.min(4, n)} hint="Read a few more 💌" />
    </section>
  );
}
