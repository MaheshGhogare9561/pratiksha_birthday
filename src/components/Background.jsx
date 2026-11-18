import { useEffect, useRef } from 'react';

// Night sky that lives behind every step: twinkling stars, drifting
// glowing orbs, tiny rising hearts and the occasional shooting star.
export default function Background() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let stars = [];
    let orbs = [];
    let hearts = [];
    let shooting = null;
    let nextShoot = performance.now() + 4000;

    const rand = (a, b) => a + Math.random() * (b - a);
    const ORB_COLORS = ['255,143,177', '246,213,142', '201,182,255', '255,196,163'];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 6500);
      stars = Array.from({ length: count }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.3, 1.4),
        a: rand(0.2, 0.9),
        s: rand(0.4, 1.6),
        p: rand(0, Math.PI * 2),
      }));
      orbs = Array.from({ length: Math.max(8, Math.round(w / 90)) }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(30, 110),
        vx: rand(-0.08, 0.08),
        vy: rand(-0.18, -0.04),
        c: ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)],
        a: rand(0.05, 0.14),
      }));
      hearts = Array.from({ length: Math.max(6, Math.round(w / 140)) }, () => newHeart(true));
    }

    function newHeart(anywhere) {
      return {
        x: rand(0, w),
        y: anywhere ? rand(0, h) : h + 20,
        s: rand(5, 11),
        vy: rand(0.2, 0.5),
        sway: rand(0.4, 1.2),
        p: rand(0, Math.PI * 2),
        a: rand(0.15, 0.4),
      };
    }

    function drawHeart(x, y, s, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s / 16, s / 16);
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(0, 2, -5, -4, -10, -2);
      ctx.bezierCurveTo(-16, 1, -12, 10, 0, 16);
      ctx.bezierCurveTo(12, 10, 16, 1, 10, -2);
      ctx.bezierCurveTo(5, -4, 0, 2, 0, 5);
      ctx.fillStyle = `rgba(255,143,177,${alpha})`;
      ctx.fill();
      ctx.restore();
    }

    function frame(now) {
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;

      for (const o of orbs) {
        if (!reduce) {
          o.x += o.vx;
          o.y += o.vy;
          if (o.y < -o.r) {
            o.y = h + o.r;
            o.x = rand(0, w);
          }
          if (o.x < -o.r) o.x = w + o.r;
          if (o.x > w + o.r) o.x = -o.r;
        }
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.c},${o.a})`);
        g.addColorStop(1, `rgba(${o.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const s of stars) {
        const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * s.s + s.p);
        ctx.fillStyle = `rgba(255,248,240,${s.a * tw})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduce) {
        for (let i = 0; i < hearts.length; i++) {
          const hh = hearts[i];
          hh.y -= hh.vy;
          const x = hh.x + Math.sin(t * hh.sway + hh.p) * 14;
          const fade = Math.min(1, hh.y / (h * 0.5));
          drawHeart(x, hh.y, hh.s, hh.a * Math.max(0, fade));
          if (hh.y < -20) hearts[i] = newHeart(false);
        }

        if (!shooting && now > nextShoot) {
          shooting = { x: rand(w * 0.2, w), y: rand(0, h * 0.35), vx: -rand(7, 10), vy: rand(2.5, 4), life: 1 };
        }
        if (shooting) {
          const s = shooting;
          const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
          grad.addColorStop(0, `rgba(255,255,255,${0.9 * s.life})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12);
          ctx.stroke();
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.012;
          if (s.life <= 0 || s.x < -100 || s.y > h + 100) {
            shooting = null;
            nextShoot = now + rand(5000, 11000);
          }
        }
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <div className="bg-gradient" aria-hidden="true" />
      <canvas ref={ref} className="bg-canvas" aria-hidden="true" />
    </>
  );
}
