import { useState } from 'react';
import { motion } from 'framer-motion';
import { config } from '../config';
import { audio } from '../lib/audio';
import { burst, elementOrigin } from '../lib/confetti';
import ScratchCard from '../components/ScratchCard';
import StepHeader from '../components/StepHeader';
import StepNav from '../components/StepNav';

// Step 6 — scratch-off "friendship coupons".
export default function Coupons({ onNext, onBack }) {
  const coupons = config.coupons;
  const [revealed, setRevealed] = useState(() => coupons.map(() => false));
  const done = revealed.every(Boolean);

  function onReveal(i, el) {
    audio.chime();
    burst(elementOrigin(el), 0.35);
    setRevealed((r) => r.map((v, j) => (j === i ? true : v)));
  }

  return (
    <section className="step coupons-step">
      <StepHeader
        eyebrow="Gifts from me to you"
        title="Your birthday coupons 🎟️"
        subtitle="Scratch each card with your finger. All of them are valid forever — no expiry, no terms & conditions."
      />

      <div className="coupon-grid">
        {coupons.map((c, i) => (
          <motion.div
            key={i}
            className="coupon"
            initial={{ opacity: 0, y: 30, rotate: i % 2 ? 4 : -4 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 100, damping: 14 }}
          >
            <ScratchCard onReveal={(el) => onReveal(i, el)}>
              <div className="coupon-face">
                <span className="coupon-emoji">{c.emoji}</span>
                <strong>{c.title}</strong>
                <p>{c.text}</p>
                <span className="coupon-valid">valid: forever ∞</span>
              </div>
            </ScratchCard>
          </motion.div>
        ))}
      </div>

      <StepNav onBack={onBack} onNext={onNext} ready={done} hint="Scratch all the coupons ✨" nextLabel="Last thing, I promise" />
    </section>
  );
}
