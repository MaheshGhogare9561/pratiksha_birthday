import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { config } from '../config';
import { audio } from '../lib/audio';
import { burst, hearts } from '../lib/confetti';
import StepHeader from '../components/StepHeader';
import StepNav from '../components/StepNav';

const CANDLES = 5;
const SPRINKLE_COLORS = ['#ff8fb1', '#f6d58e', '#c9b6ff', '#7fd8be', '#ffffff', '#ffb38a'];

function useSprinkles(count, seed) {
  return useMemo(() => {
    let s = seed;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, () => ({
      left: `${6 + rnd() * 88}%`,
      top: `${30 + rnd() * 60}%`,
      rotate: `${Math.round(rnd() * 180)}deg`,
      background: SPRINKLE_COLORS[Math.floor(rnd() * SPRINKLE_COLORS.length)],
    }));
  }, [count, seed]);
}

// Step 2 — a cake with candles. Tap each flame, or blow into the mic.
export default function Cake({ onNext, onBack }) {
  const [lit, setLit] = useState(() => Array(CANDLES).fill(true));
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState('');
  const micRef = useRef(null);
  const cakeRef = useRef(null);
  const allOut = lit.every((l) => !l);
  const sprinklesBottom = useSprinkles(22, 7);
  const sprinklesTop = useSprinkles(14, 42);

  function blowOut(i) {
    setLit((prev) => {
      if (!prev[i]) return prev;
      const next = [...prev];
      next[i] = false;
      return next;
    });
    audio.puff();
  }

  function blowNext() {
    setLit((prev) => {
      const i = prev.findIndex(Boolean);
      if (i === -1) return prev;
      const next = [...prev];
      next[i] = false;
      return next;
    });
    audio.puff();
  }

  // Celebrate when the last candle goes out
  useEffect(() => {
    if (!allOut) return;
    stopMic();
    const t = setTimeout(() => {
      audio.sparkle();
      burst({ x: 0.5, y: 0.45 }, 1.2);
      hearts({ x: 0.5, y: 0.4 });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOut]);

  useEffect(() => () => stopMic(), []);

  async function startMic() {
    setMicError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('Your browser can’t use the mic here — just tap the flames instead 💨');
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      const data = new Float32Array(analyser.fftSize);
      let loud = 0;
      let raf = 0;
      const tick = () => {
        analyser.getFloatTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
        const rms = Math.sqrt(sum / data.length);
        if (rms > 0.12) {
          loud += 1;
          if (loud % 7 === 0) blowNext();
        } else {
          loud = Math.max(0, loud - 1);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      micRef.current = { ctx, stream, stopRaf: () => cancelAnimationFrame(raf) };
      audio.duck(true);
      setListening(true);
    } catch {
      ctx.close();
      setMicError('No mic access — that’s okay, just tap the flames 💨');
    }
  }

  function stopMic() {
    const m = micRef.current;
    if (!m) return;
    m.stopRaf();
    m.stream.getTracks().forEach((t) => t.stop());
    m.ctx.close();
    micRef.current = null;
    audio.duck(false);
    setListening(false);
  }

  return (
    <section className="step cake-step">
      <StepHeader
        eyebrow="Your birthday cake"
        title="Make a wish 🎂"
        subtitle="Close your eyes, make a wish, then blow out the candles — tap each flame, or use your mic and really blow!"
      />

      <motion.div
        ref={cakeRef}
        className={`cake ${allOut ? 'is-out' : ''}`}
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 90, damping: 14 }}
      >
        <div className="cake-candles">
          {lit.map((on, i) => (
            <button
              key={i}
              type="button"
              className={`candle c${i % 3}`}
              onClick={() => blowOut(i)}
              aria-label={on ? `Blow out candle ${i + 1}` : `Candle ${i + 1} is out`}
              disabled={!on}
            >
              <AnimatePresence>
                {on ? (
                  <motion.span
                    key="flame"
                    className="flame"
                    exit={{ scaleY: 0, scaleX: 0.2, opacity: 0, transition: { duration: 0.25 } }}
                  >
                    <span className="flame-glow" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="smoke"
                    className="smoke"
                    initial={{ opacity: 0.8, y: 0, scale: 0.6 }}
                    animate={{ opacity: 0, y: -50, scale: 1.6 }}
                    transition={{ duration: 1.6, ease: 'easeOut' }}
                  />
                )}
              </AnimatePresence>
              <span className="wick" />
            </button>
          ))}
        </div>

        <div className="tier tier-top">
          <span className="drip" />
          {sprinklesTop.map((s, i) => (
            <i key={i} className="sprinkle" style={s} />
          ))}
          <span className="cake-name">{config.name}</span>
        </div>
        <div className="tier tier-bottom">
          <span className="drip" />
          {sprinklesBottom.map((s, i) => (
            <i key={i} className="sprinkle" style={s} />
          ))}
          <span className="cake-text">Happy Birthday</span>
        </div>
        <div className="plate" />
      </motion.div>

      <div className="cake-actions">
        <AnimatePresence mode="wait">
          {allOut ? (
            <motion.p
              key="done"
              className="wish-made"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 12 }}
            >
              Your wish is on its way to the stars 💫
            </motion.p>
          ) : listening ? (
            <motion.div key="listening" className="mic-on" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="mic-pulse" /> Listening… blow into your mic!
              <button type="button" className="link-btn" onClick={stopMic}>
                stop
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="mic"
              type="button"
              className="btn btn-soft"
              onClick={startMic}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              🎤 Blow with my mic
            </motion.button>
          )}
        </AnimatePresence>
        {micError && !allOut && <p className="mic-error">{micError}</p>}
      </div>

      <StepNav onBack={onBack} onNext={onNext} ready={allOut} hint="Blow out all the candles 🕯️" nextLabel="Next surprise" />
    </section>
  );
}
