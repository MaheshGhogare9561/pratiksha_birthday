import { motion } from 'framer-motion';

export default function StepHeader({ eyebrow, title, subtitle }) {
  return (
    <header className="step-header">
      {eyebrow && (
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {eyebrow}
        </motion.p>
      )}
      <motion.h2 className="step-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p className="step-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.8 }}>
          {subtitle}
        </motion.p>
      )}
    </header>
  );
}
