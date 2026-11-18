import confetti from 'canvas-confetti';

const COLORS = ['#ff8fb1', '#f6d58e', '#c9b6ff', '#ffffff', '#ffc4a3', '#e75480'];

export function burst(origin = { x: 0.5, y: 0.6 }, scale = 1) {
  confetti({
    particleCount: Math.round(120 * scale),
    spread: 80,
    startVelocity: 45,
    origin,
    colors: COLORS,
    scalar: 1,
    disableForReducedMotion: true,
    zIndex: 60,
  });
}

export function sideCannons(duration = 2200) {
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: COLORS, disableForReducedMotion: true, zIndex: 60 });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: COLORS, disableForReducedMotion: true, zIndex: 60 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function hearts(origin = { x: 0.5, y: 0.5 }) {
  const heart = confetti.shapeFromText ? confetti.shapeFromText({ text: '💖', scalar: 2 }) : null;
  confetti({
    particleCount: 26,
    spread: 100,
    startVelocity: 30,
    origin,
    shapes: heart ? [heart] : undefined,
    scalar: heart ? 2 : 1.2,
    colors: COLORS,
    disableForReducedMotion: true,
    zIndex: 60,
  });
}

export function elementOrigin(el) {
  if (!el) return { x: 0.5, y: 0.5 };
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
}
