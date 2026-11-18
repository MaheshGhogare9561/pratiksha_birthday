import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { config } from '../config';
import { audio } from '../lib/audio';
import { burst, elementOrigin } from '../lib/confetti';
import StepHeader from '../components/StepHeader';
import StepNav from '../components/StepNav';

const COLORS = [
  ['#ff8fb1', '#e75480'],
  ['#f6d58e', '#e0a93b'],
  ['#c9b6ff', '#8b6fe0'],
  ['#ffc4a3', '#f08a5d'],
  ['#9be7d8', '#3fb8a3'],
  ['#ffb3d9', '#d6589b'],
  ['#a8c8ff', '#5b8def'],
  ['#ffe08a', '#f2b632'],
];

function Balloon({ color, delay }) {
  const [light, dark] = color;
  const id = `bg-${light.slice(1)}`;
  return (
    <svg className="balloon-svg" viewBox="0 0 100 160" aria-hidden="true" style={{ animationDelay: `${delay}s` }}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="18%" stopColor={light} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
      </defs>
      <path d="M50 108 C 48 120, 56 128, 50 140 C 44 150, 54 154, 50 160" stroke="rgba(255,255,255,.55)" strokeWidth="1.2" fill="none" />
      <ellipse cx="50" cy="52" rx="38" ry="46" fill={`url(#${id})`} />
      <path d="M45 97 L55 97 L50 106 Z" fill={dark} />
      <ellipse cx="36" cy="32" rx="7" ry="12" fill="#fff" opacity="0.35" transform="rotate(-20 36 32)" />
    </svg>
  );
}

// Step 3 — pop balloons to reveal why she's the best.
export default function Balloons({ onNext, onBack }) {
  const reasons = config.reasons;
  const [popped, setPopped] = useState(() => reasons.map(() => false));
  const count = popped.filter(Boolean).length;
  const done = count === reasons.length;

  function pop(i, e) {
    if (popped[i]) return;
    audio.pop();
    burst(elementOrigin(e.currentTarget), 0.25);
    setPopped((p) => p.map((v, j) => (j === i ? true : v)));
    if (count + 1 === reasons.length) setTimeout(() => audio.sparkle(), 300);
  }

  return (
    <section className="step balloons-step">
      <StepHeader
        eyebrow={`${reasons.length} little reasons`}
        title="Why you’re my favourite human 🎈"
        subtitle="Pop each balloon to find out."
      />

      <div className="balloon-grid">
        {reasons.map((reason, i) => (
          <div className="balloon-cell" key={i}>
            <AnimatePresence mode="wait">
              {!popped[i] ? (
                <motion.button
                  key="balloon"
                  type="button"
                  className="balloon-btn"
                  onClick={(e) => pop(i, e)}
                  aria-label={`Pop balloon ${i + 1}`}
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 70, damping: 11 }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Balloon color={COLORS[i % COLORS.length]} delay={(i % 4) * 0.6} />
                </motion.button>
              ) : (
                <motion.div
                  key="note"
                  className="reason-note"
                  initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: (i % 2 ? 1 : -1) * (1.5 + (i % 3)) }}
                  transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                >
                  <span className="note-num">#{i + 1}</span>
                  <p>{reason}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <p className="counter" aria-live="polite">
        {done ? 'And honestly, a million more 💗' : `${count} / ${reasons.length} popped`}
      </p>

      <StepNav onBack={onBack} onNext={onNext} ready={done} hint="Pop all the balloons 🎈" />
    </section>
  );
}
