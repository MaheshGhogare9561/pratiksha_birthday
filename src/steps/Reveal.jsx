import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { config } from '../config';
import { audio } from '../lib/audio';
import { burst, sideCannons } from '../lib/confetti';
import Fireworks from '../components/Fireworks';
import Portal from '../components/Portal';
import StepNav from '../components/StepNav';

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const letters = (text) => Array.from(text);

// Step 1 — 3, 2, 1… then the big reveal with fireworks and confetti.
export default function Reveal({ onNext, onBack }) {
  const [count, setCount] = useState(3);
  const revealed = count === 0;

  useEffect(() => {
    if (count === 0) {
      audio.sparkle();
      burst({ x: 0.5, y: 0.55 }, 1.4);
      sideCannons(2600);
      return undefined;
    }
    audio.chime([84 + (3 - count) * 2], 0);
    const t = setTimeout(() => setCount((c) => c - 1), 950);
    return () => clearTimeout(t);
  }, [count]);

  const heading = config.age ? `Happy ${ordinal(config.age)} Birthday` : 'Happy Birthday';

  return (
    <section className="step reveal">
      {revealed && (
        <Portal>
          <Fireworks rate={1.1} />
        </Portal>
      )}

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key={count}
            className="countdown"
            initial={{ opacity: 0, scale: 2.4, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.4, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {count}
          </motion.div>
        ) : (
          <motion.div key="hb" className="reveal-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="hb-title" aria-label={heading}>
              {letters(heading).map((ch, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 40, rotate: -12 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.05 * i, type: 'spring', stiffness: 200, damping: 14 }}
                >
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="hb-name"
              initial={{ opacity: 0, scale: 0.6, letterSpacing: '0.4em' }}
              animate={{ opacity: 1, scale: 1, letterSpacing: '0.02em' }}
              transition={{ delay: 0.9, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {config.name}
            </motion.p>
            <motion.p
              className="hb-line"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1 }}
            >
              The world got a little brighter the day you were born — and my life got a whole lot better the day I met you. ✨
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
              <StepNav onBack={onBack} onNext={onNext} nextLabel="I have more for you" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
