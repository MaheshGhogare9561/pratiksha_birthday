import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { audio } from '../lib/audio';

const subscribe = (fn) => audio.subscribe(fn);
const snapshot = () => `${audio.started}|${audio.muted}`;

export default function MusicToggle() {
  const state = useSyncExternalStore(subscribe, snapshot);
  const playing = state === 'true|false';

  return (
    <motion.button
      type="button"
      className={`music-toggle ${playing ? 'is-playing' : ''}`}
      onClick={() => audio.toggleMute()}
      aria-label={playing ? 'Mute music' : 'Play music'}
      title={playing ? 'Mute music' : 'Play music'}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.9 }}
    >
      {playing ? (
        <span className="eq" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      ) : (
        <span aria-hidden="true">🔇</span>
      )}
    </motion.button>
  );
}
