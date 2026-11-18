import { useEffect, useImperativeHandle, useRef } from 'react';

const HUES = [340, 350, 45, 280, 20, 320, 200];

// Full-screen fireworks. `rate` = average launches per second when auto is on.
// Parent can call ref.current.launch(x, y) to burst one at a point (e.g. on tap).
export default function Fireworks({ auto = true, rate = 0.9, ref }) {
  const canvasRef = useRef(null);
  const api = useRef({ launch: () => {} });

  useImperativeHandle(ref, () => ({ launch: (x, y) => api.current.launch(x, y) }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const rockets = [];
    const sparks = [];
    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function explode(x, y) {
      const hue = HUES[Math.floor(Math.random() * HUES.length)];
      const count = w < 600 ? 55 : 85;
      const heartShape = Math.random() < 0.3;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        let vx;
        let vy;
        if (heartShape) {
          // parametric heart
          const hx = 16 * Math.pow(Math.sin(a), 3);
          const hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
          vx = hx * 0.28;
          vy = hy * 0.28;
        } else {
          const sp = rand(1.5, 5.5);
          vx = Math.cos(a) * sp;
          vy = Math.sin(a) * sp;
        }
        sparks.push({ x, y, vx, vy, life: 1, decay: rand(0.010, 0.018), hue: hue + rand(-15, 15), size: rand(1.2, 2.4) });
      }
    }

    function launch(tx, ty) {
      if (reduce) {
        explode(tx ?? rand(w * 0.2, w * 0.8), ty ?? rand(h * 0.15, h * 0.45));
        return;
      }
      const x = tx ?? rand(w * 0.15, w * 0.85);
      const targetY = ty ?? rand(h * 0.12, h * 0.42);
      rockets.push({ x, y: h + 10, tx: x, ty: targetY, vy: -rand(9, 12) * (h / 800 + 0.4) });
    }
    api.current.launch = launch;

    function frame(now) {
      const dt = Math.min(64, now - last);
      last = now;
      if (auto) {
        acc += (dt / 1000) * rate;
        if (acc >= 1) {
          launch();
          acc = -Math.random() * 0.6; // a little randomness between launches
        }
      }

      // fade previous frame (keeps canvas transparent so the sky shows through)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = 'rgba(255,230,200,0.9)';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.ty || r.vy > -1.5) {
          explode(r.x, r.y);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= 0.975;
        s.vy = s.vy * 0.975 + 0.045;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `hsla(${s.hue},100%,${60 + 20 * s.life}%,${s.life})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (0.6 + 0.4 * s.life), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [auto, rate]);

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />;
}
