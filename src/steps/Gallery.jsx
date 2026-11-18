import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { photos, hasRealPhotos } from '../lib/photos';
import { isLoaded, loadImage, preloadPhotos } from '../lib/preload';
import Portal from '../components/Portal';
import StepHeader from '../components/StepHeader';
import StepNav from '../components/StepNav';

function PhotoFace({ photo, large = false, className = '' }) {
  if (photo.placeholder) {
    return (
      <div className={`photo-placeholder ${className}`} style={{ background: photo.bg }}>
        <span>📷</span>
        <small>add photos to /photos</small>
      </div>
    );
  }
  return large ? (
    <ProgressiveImg photo={photo} className={className} />
  ) : (
    <FadeImg src={photo.thumb} alt={photo.caption} className={className} />
  );
}

// Loads straight away (no lazy-loading) and fades in once ready. Photos that
// were already preloaded in the background appear instantly with no fade.
function FadeImg({ src, alt, className = '' }) {
  const [ready, setReady] = useState(() => isLoaded(src));
  return (
    <img
      ref={(el) => {
        if (el && !ready && el.complete && el.naturalWidth > 0) setReady(true);
      }}
      className={`fade-img ${ready ? 'is-loaded' : ''} ${className}`}
      src={src}
      alt={alt}
      decoding="async"
      draggable={false}
      onLoad={() => setReady(true)}
    />
  );
}

// Full-screen viewer: shows the (already loaded) gallery-size copy at once,
// then swaps in the sharp full-size version as soon as it's downloaded.
function ProgressiveImg({ photo, className = '' }) {
  const [src, setSrc] = useState(() => (isLoaded(photo.src) ? photo.src : photo.thumb));
  useEffect(() => {
    if (src === photo.src) return undefined;
    let alive = true;
    loadImage(photo.src).then(() => alive && setSrc(photo.src));
    return () => {
      alive = false;
    };
  }, [photo.src, src]);
  return <img className={className} src={src} alt={photo.caption} decoding="async" draggable={false} />;
}

const slide = {
  enter: (d) => ({ opacity: 0, x: d * 120, rotate: d * 4 }),
  center: { opacity: 1, x: 0, rotate: 0 },
  exit: (d) => ({ opacity: 0, x: d * -120, rotate: d * -4 }),
};

// deterministic "random" tilt per photo so the wall looks hand-pinned
const tilt = (i) => ((i * 37) % 11) - 5;

function FilmStrip() {
  const reel = [...photos, ...photos];
  const duration = Math.max(20, photos.length * 4);
  return (
    <div className="filmstrip" aria-hidden="true">
      <div className="filmstrip-track" style={{ animationDuration: `${duration}s` }}>
        {reel.map((p, i) => (
          <div className="frame" key={`${p.id}-${i}`}>
            <PhotoFace photo={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Lightbox({ index, onClose, onPrev, onNext }) {
  const photo = photos[index];
  const [playing, setPlaying] = useState(false);
  const [dir, setDir] = useState(1);

  const prev = useCallback(() => {
    setDir(-1);
    onPrev();
  }, [onPrev]);
  const next = useCallback(() => {
    setDir(1);
    onNext();
  }, [onNext]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next]);

  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(next, 3800);
    return () => clearTimeout(t);
  }, [playing, index, next]);

  // get the photos either side ready, so swiping is instant
  useEffect(() => {
    const n = photos.length;
    loadImage(photos[(index + 1) % n].src);
    loadImage(photos[(index - 1 + n) % n].src);
  }, [index]);

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.figure
            key={photo.id}
            className="lightbox-figure"
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            drag="x"
            dragSnapToOrigin
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) next();
              else if (info.offset.x > 70) prev();
            }}
          >
            <div className="lightbox-photo">
              <motion.div
                className="kenburns"
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 7, ease: 'linear' }}
              >
                <PhotoFace photo={photo} large />
              </motion.div>
            </div>
            <figcaption>{photo.caption}</figcaption>
          </motion.figure>
        </AnimatePresence>

        <div className="lightbox-bar">
          <button type="button" className="round-btn" onClick={prev} aria-label="Previous photo">
            ←
          </button>
          <button type="button" className="btn btn-soft small" onClick={() => setPlaying((p) => !p)}>
            {playing ? '❚❚ Pause' : '▶ Slideshow'}
          </button>
          <span className="lightbox-count">
            {index + 1} / {photos.length}
          </span>
          <button type="button" className="round-btn" onClick={next} aria-label="Next photo">
            →
          </button>
        </div>
      </div>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </motion.div>
  );
}

// Step 5 — film strip + polaroid wall + full-screen viewer.
export default function Gallery({ onNext, onBack }) {
  const [open, setOpen] = useState(null);
  const n = photos.length;
  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(() => setOpen((i) => (i - 1 + n) % n), [n]);
  const next = useCallback(() => setOpen((i) => (i + 1) % n), [n]);

  // normally already running since the first screen — this is just a safety net
  useEffect(() => preloadPhotos(), []);

  return (
    <section className="step gallery-step">
      <StepHeader
        eyebrow="Our little moments"
        title="Memories with you 📸"
        subtitle="Every picture is a moment I’d happily live a thousand times again. Tap one to open it."
      />

      <FilmStrip />

      {!hasRealPhotos && (
        <p className="dev-note">These are placeholders — drop your photos into the <code>/photos</code> folder and they appear here automatically.</p>
      )}

      <div className="polaroid-wall">
        {photos.map((p, i) => (
          <motion.button
            type="button"
            key={p.id}
            className="polaroid"
            style={{ '--tilt': `${tilt(i)}deg` }}
            onClick={() => setOpen(i)}
            aria-label={`Open photo: ${p.caption}`}
            initial={{ opacity: 0, y: 80, rotate: tilt(i) * 3, scale: 0.7 }}
            whileInView={{ opacity: 1, y: 0, rotate: tilt(i), scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: (i % 3) * 0.12, type: 'spring', stiffness: 90, damping: 13 }}
            whileHover={{ rotate: 0, scale: 1.06, zIndex: 5, y: -6 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="tape" aria-hidden="true" />
            <span className="polaroid-photo">
              <PhotoFace photo={p} />
            </span>
            <span className="polaroid-caption">{p.caption}</span>
          </motion.button>
        ))}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="One more surprise" />

      <Portal>
        <AnimatePresence>{open !== null && <Lightbox index={open} onClose={close} onPrev={prev} onNext={next} />}</AnimatePresence>
      </Portal>
    </section>
  );
}
