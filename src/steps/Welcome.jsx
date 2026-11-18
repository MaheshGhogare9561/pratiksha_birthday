import { useState } from 'react';
import { motion } from 'framer-motion';
import { config } from '../config';
import { audio } from '../lib/audio';

// Step 0 — a wrapped gift. Tapping it starts the music (browsers need a tap
// before sound can play) and pops the lid off.
export default function Welcome({ onNext }) {
  const [opened, setOpened] = useState(false);

  function open() {
    if (opened) return;
    setOpened(true);
    audio.start();
    setTimeout(() => audio.sparkle(), 250);
    setTimeout(onNext, 1900);
  }

  return (
    <section className="step welcome">
      <motion.p
        className="welcome-hey"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        Hey {config.name}
      </motion.p>
      <motion.p
        className="welcome-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Someone who loves you a lot made this, just for you.
      </motion.p>

      <motion.button
        type="button"
        className={`gift ${opened ? 'is-open' : ''}`}
        onClick={open}
        aria-label="Open your gift"
        initial={{ opacity: 0, scale: 0.6, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.4, type: 'spring', stiffness: 120, damping: 12 }}
        whileHover={opened ? undefined : { scale: 1.05 }}
        whileTap={opened ? undefined : { scale: 0.95 }}
      >
        <span className="gift-glow" />
        <span className="gift-rays" />
        <span className="gift-wobble">
          <span className="gift-lid">
            <span className="gift-bow">
              <i className="loop left" />
              <i className="loop right" />
              <i className="knot" />
            </span>
          </span>
          <span className="gift-box" />
        </span>
      </motion.button>

      <motion.div
        className="welcome-cta"
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? 0 : 1 }}
        transition={{ delay: opened ? 0 : 2.2, duration: 0.8 }}
      >
        <p className="tap-hint">Tap the gift to open ✨</p>
        <p className="sound-hint">🔊 turn your sound on for the full experience</p>
      </motion.div>
    </section>
  );
}
