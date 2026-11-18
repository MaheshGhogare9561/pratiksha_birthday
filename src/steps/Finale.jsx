import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { config } from '../config';
import { audio } from '../lib/audio';
import { burst, hearts, sideCannons } from '../lib/confetti';
import Fireworks from '../components/Fireworks';
import Portal from '../components/Portal';

function useFriendship(since) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!since) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [since]);
  if (!since) return null;
  const start = new Date(`${since}T00:00:00`).getTime();
  if (Number.isNaN(start)) return null;
  let s = Math.max(0, Math.floor((now - start) / 1000));
  const days = Math.floor(s / 86400);
  s -= days * 86400;
  const hours = Math.floor(s / 3600);
  s -= hours * 3600;
  const minutes = Math.floor(s / 60);
  const seconds = s - minutes * 60;
  return { days, hours, minutes, seconds };
}

// Step 8 — fireworks finale. Tap anywhere on the sky to launch one.
export default function Finale({ onRestart }) {
  const fw = useRef(null);
  const [secret, setSecret] = useState(false);
  const friends = useFriendship(config.friendsSince);

  useEffect(() => {
    sideCannons(3000);
    audio.sparkle();
  }, []);

  function skyTap(e) {
    if (e.target.closest('button, .secret-card')) return;
    fw.current?.launch(e.clientX, e.clientY);
  }

  return (
    <section className="step finale" onPointerDown={skyTap}>
      <Portal>
        <Fireworks ref={fw} rate={0.8} />
      </Portal>

      <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        to the most special girl
      </motion.p>
      <motion.h1
        className="finale-title"
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(12px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ delay: 0.4, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        Happy Birthday,
        <span>{config.name}</span>
      </motion.h1>

      <motion.p
        className="finale-line"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        May this year give you all the happiness you so effortlessly give to everyone else.
        Here’s to more memories, more laughter and more <em>us</em>. 🥂
      </motion.p>

      {friends && (
        <motion.div className="friends-counter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
          <p>We’ve been friends for</p>
          <div className="counter-grid">
            {[
              ['days', friends.days],
              ['hours', friends.hours],
              ['minutes', friends.minutes],
              ['seconds', friends.seconds],
            ].map(([label, v]) => (
              <div key={label}>
                <strong>{v.toLocaleString()}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="counter-foot">…and counting, forever.</p>
        </motion.div>
      )}

      <motion.div className="finale-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}>
        <motion.button
          type="button"
          className="btn btn-primary"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSecret(true);
            audio.chime([84, 88, 91, 96, 100]);
            hearts({ x: 0.5, y: 0.5 });
          }}
        >
          💌 psst… one more thing
        </motion.button>
        <button type="button" className="btn btn-ghost" onClick={onRestart}>
          ↺ Relive it again
        </button>
      </motion.div>

      <motion.p className="tap-sky" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 3.4 }}>
        tap anywhere on the sky for more fireworks ✨
      </motion.p>

      <p className="made-with">made with 🤍 by {config.fromName}</p>

      <Portal>
        <AnimatePresence>
          {secret && (
            <motion.div
              className="secret-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSecret(false)}
            >
              <motion.div
                className="secret-card"
                role="dialog"
                aria-modal="true"
                initial={{ scale: 0.6, rotate: -8, y: 40 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  burst({ x: 0.5, y: 0.5 }, 0.6);
                }}
              >
                <span className="secret-ps">P.S.</span>
                <p>{config.secretMessage}</p>
                <button type="button" className="btn btn-soft small" onClick={() => setSecret(false)}>
                  close 🤍
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </section>
  );
}
