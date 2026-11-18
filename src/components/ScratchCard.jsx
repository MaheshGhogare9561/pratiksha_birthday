import { useEffect, useRef, useState } from 'react';

// A scratch-off foil layer. Children are revealed underneath.
export default function ScratchCard({ children, onReveal, label = 'Scratch me ✨', threshold = 0.45 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const state = useRef({ drawing: false, last: null, moves: 0, done: false });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function paint() {
      if (state.current.done) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, '#f6d58e');
      g.addColorStop(0.35, '#ffe9c4');
      g.addColorStop(0.55, '#e8b86a');
      g.addColorStop(0.8, '#ffd9a8');
      g.addColorStop(1, '#d9a24f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // glitter
      for (let i = 0; i < (width * height) / 60; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
        ctx.fillRect(Math.random() * width, Math.random() * height, 1.4, 1.4);
      }
      // little hearts pattern
      ctx.fillStyle = 'rgba(231,84,128,0.18)';
      ctx.font = '14px serif';
      for (let y = 18; y < height; y += 34) {
        for (let x = (y / 34) % 2 ? 10 : 27; x < width; x += 34) ctx.fillText('♥', x, y);
      }
      ctx.fillStyle = 'rgba(90,45,20,0.75)';
      ctx.font = '600 15px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, width / 2, height / 2);
    }

    paint();
    const ro = new ResizeObserver(() => paint());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [label]);

  function point(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function scratch(from, to) {
    const ctx = canvasRef.current.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(to.x, to.y, 17, 0, Math.PI * 2);
    ctx.fill();
  }

  function clearedRatio() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let clear = 0;
    let total = 0;
    const stride = 4 * 24;
    for (let i = 3; i < data.length; i += stride) {
      total++;
      if (data[i] < 40) clear++;
    }
    return total ? clear / total : 0;
  }

  function finish() {
    if (state.current.done) return;
    state.current.done = true;
    setRevealed(true);
    onReveal?.(wrapRef.current);
  }

  const handlers = {
    onPointerDown(e) {
      if (state.current.done) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      state.current.drawing = true;
      const p = point(e);
      state.current.last = p;
      scratch(p, p);
    },
    onPointerMove(e) {
      const s = state.current;
      if (!s.drawing || s.done) return;
      const p = point(e);
      scratch(s.last, p);
      s.last = p;
      if (++s.moves % 12 === 0 && clearedRatio() > threshold) finish();
    },
    onPointerUp() {
      const s = state.current;
      s.drawing = false;
      if (!s.done && clearedRatio() > threshold) finish();
    },
  };
  handlers.onPointerCancel = handlers.onPointerUp;

  return (
    <div ref={wrapRef} className={`scratch ${revealed ? 'is-revealed' : ''}`}>
      <div className="scratch-content">{children}</div>
      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        {...handlers}
        role="button"
        tabIndex={revealed ? -1 : 0}
        aria-label={`${label} — or press Enter to reveal`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            finish();
          }
        }}
      />
    </div>
  );
}
