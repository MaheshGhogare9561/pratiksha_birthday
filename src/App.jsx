import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Background from './components/Background';
import MusicToggle from './components/MusicToggle';
import Progress from './components/Progress';
import Welcome from './steps/Welcome';
import Reveal from './steps/Reveal';
import Cake from './steps/Cake';
import Balloons from './steps/Balloons';
import Quotes from './steps/Quotes';
import Gallery from './steps/Gallery';
import Coupons from './steps/Coupons';
import Letter from './steps/Letter';
import Finale from './steps/Finale';

const STEPS = [
  { key: 'welcome', label: 'Welcome', Component: Welcome },
  { key: 'reveal', label: 'Surprise', Component: Reveal },
  { key: 'cake', label: 'Cake', Component: Cake },
  { key: 'reasons', label: 'Reasons', Component: Balloons },
  { key: 'quotes', label: 'Friendship', Component: Quotes },
  { key: 'gallery', label: 'Memories', Component: Gallery },
  { key: 'gifts', label: 'Gifts', Component: Coupons },
  { key: 'letter', label: 'Letter', Component: Letter },
  { key: 'finale', label: 'Forever', Component: Finale },
];

const variants = {
  enter: (dir) => ({ opacity: 0, y: dir > 0 ? 40 : -40, scale: 0.98, filter: 'blur(8px)' }),
  center: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } },
  exit: (dir) => ({ opacity: 0, y: dir > 0 ? -40 : 40, scale: 0.98, filter: 'blur(8px)' }),
};

// While editing locally you can open http://localhost:5173/?step=5 to jump
// straight to a step. (Only works in dev — the live site always starts at the gift.)
function initialStep() {
  if (!import.meta.env.DEV) return 0;
  const n = Number(new URLSearchParams(window.location.search).get('step'));
  return Number.isInteger(n) && n > 0 && n < STEPS.length ? n : 0;
}

export default function App() {
  const [step, setStep] = useState(initialStep);
  const [dir, setDir] = useState(1);
  const [maxVisited, setMaxVisited] = useState(step);

  const go = useCallback(
    (n) => {
      const target = Math.max(0, Math.min(STEPS.length - 1, n));
      setDir(target >= step ? 1 : -1);
      setStep(target);
      setMaxVisited((m) => Math.max(m, target));
    },
    [step]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  const { Component, key } = STEPS[step];

  return (
    <MotionConfig reducedMotion="user">
      <Background />
      {step > 0 && <Progress steps={STEPS} current={step} maxVisited={maxVisited} onJump={go} />}
      {step > 0 && <MusicToggle />}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.main
          key={key}
          className={`stage stage-${key}`}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Component onNext={() => go(step + 1)} onBack={() => go(step - 1)} onRestart={() => go(1)} />
        </motion.main>
      </AnimatePresence>
    </MotionConfig>
  );
}
