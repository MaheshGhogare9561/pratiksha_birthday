import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { config } from '../config';
import { audio } from '../lib/audio';
import { hearts } from '../lib/confetti';
import StepNav from '../components/StepNav';

const WORD_GAP = 0.045;
const PARA_GAP = 0.5;

// Step 7 — an envelope with a wax seal that opens into a handwritten letter.
export default function Letter({ onNext, onBack }) {
  const [phase, setPhase] = useState('closed'); // closed → opening → reading
  const [showAll, setShowAll] = useState(false);
  const [finished, setFinished] = useState(false);

  // Precompute when each word should appear
  const { paragraphs, totalTime } = useMemo(() => {
    let t = 0.8;
    const paras = config.letter.map((p) => {
      const words = p.split(/\s+/).map((w) => {
        const item = { w, delay: t };
        t += WORD_GAP;
        return item;
      });
      t += PARA_GAP;
      return words;
    });
    return { paragraphs: paras, totalTime: t + 0.6 };
  }, []);

  function open() {
    if (phase !== 'closed') return;
    setPhase('opening');
    audio.chime([79, 84, 88]);
    setTimeout(() => setPhase('reading'), 1500);
  }

  useEffect(() => {
    if (phase !== 'reading') return undefined;
    if (showAll) {
      setFinished(true);
      return undefined;
    }
    const t = setTimeout(() => setFinished(true), totalTime * 1000);
    return () => clearTimeout(t);
  }, [phase, showAll, totalTime]);

  useEffect(() => {
    if (finished) hearts({ x: 0.5, y: 0.8 });
  }, [finished]);

  return (
    <section className="step letter-step">
      <AnimatePresence mode="wait">
        {phase !== 'reading' ? (
          <motion.div
            key="envelope"
            className="envelope-wrap"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40, scale: 0.9, transition: { duration: 0.4 } }}
          >
            <p className="envelope-title">A letter for you 💌</p>
            <button
              type="button"
              className={`envelope ${phase === 'opening' ? 'is-opening' : ''}`}
              onClick={open}
              aria-label="Open the letter"
            >
              <span className="env-back" />
              <span className="env-paper">
                <span className="env-paper-lines" />
              </span>
              <span className="env-front" />
              <span className="env-flap" />
              <span className="env-seal">♥</span>
            </button>
            <p className="tap-hint">{phase === 'closed' ? 'Tap to break the seal' : 'opening…'}</p>
          </motion.div>
        ) : (
          <motion.article
            key="letter"
            className="letter-paper"
            initial={{ opacity: 0, rotateX: -70, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setShowAll(true)}
          >
            <h2 className="letter-greeting">Dear {config.name},</h2>
            {paragraphs.map((words, pi) => (
              <p key={pi}>
                {words.map(({ w, delay }, wi) => (
                  <motion.span
                    key={wi}
                    className="lw"
                    initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: showAll ? 0 : delay, duration: showAll ? 0.2 : 0.5 }}
                  >
                    {w}{' '}
                  </motion.span>
                ))}
              </p>
            ))}
            <motion.div
              className="letter-sign"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: showAll ? 0.2 : totalTime - 0.4, duration: 1 }}
            >
              <span>{config.letterSignOff}</span>
              <strong>{config.fromName} 🤍</strong>
            </motion.div>
            {!finished && <span className="letter-skip">tap to show everything</span>}
          </motion.article>
        )}
      </AnimatePresence>

      <StepNav
        onBack={onBack}
        onNext={onNext}
        ready={finished}
        hint={phase === 'reading' ? 'Take your time reading 🤍' : 'Open the envelope'}
        nextLabel="One last thing"
      />
    </section>
  );
}
