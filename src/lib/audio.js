// Background music + little sound effects for the whole site.
//
// If there is an audio file in /music (mp3, m4a, ogg, wav, aac), it plays on loop.
// If the folder is empty, a soft music-box "Happy Birthday" is synthesised instead,
// so the site always has music.

const songFiles = import.meta.glob('/music/*.{mp3,MP3,m4a,M4A,ogg,OGG,wav,WAV,aac,AAC}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const songKey = Object.keys(songFiles).sort()[0];
const SONG_URL = songKey ? songFiles[songKey] : null;

const FILE_VOLUME = 0.7;
const SYNTH_VOLUME = 0.55;

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

let sharedCtx = null;
function getCtx() {
  if (!sharedCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    sharedCtx = new AC();
  }
  return sharedCtx;
}

function makeImpulse(ctx, seconds, decay) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buf;
}

// ── Music-box arrangement of "Happy Birthday to You" (public domain) ──
// beats are quarter notes in 3/4. Melody is written one octave up for sparkle.
const MELODY = [
  [67, 0.75], [67, 0.25],
  [69, 1], [67, 1], [72, 1],
  [71, 2], [67, 0.75], [67, 0.25],
  [69, 1], [67, 1], [74, 1],
  [72, 2], [67, 0.75], [67, 0.25],
  [79, 1], [76, 1], [72, 1],
  [71, 1], [69, 1], [77, 0.75], [77, 0.25],
  [76, 1], [72, 1], [74, 1],
  [72, 3],
];
const CHORDS = {
  C: [48, 55, 64],
  G: [43, 50, 59, 65],
  F: [41, 48, 57],
  Am: [45, 52, 60],
};
// [beat, chord, lengthInBeats]
const MELODY_CHORDS = [
  [1, 'C', 3], [4, 'G', 3], [7, 'G', 3], [10, 'C', 3],
  [13, 'C', 3], [16, 'F', 3], [19, 'C', 2], [21, 'G', 1], [22, 'C', 3],
];
const ARPS = [
  ['C', [60, 64, 67, 72, 67, 64]],
  ['Am', [57, 60, 64, 69, 64, 60]],
  ['F', [53, 57, 60, 65, 60, 57]],
  ['G', [55, 59, 62, 67, 62, 59]],
];

function buildLoop(variation) {
  const events = [];
  let beat = 0;
  for (const [m, len] of MELODY) {
    events.push({ beat, kind: 'bell', midi: m + 12, vel: 0.3, len: 2.4 });
    if (variation % 2 === 1) events.push({ beat, kind: 'bell', midi: m, vel: 0.12, len: 2 });
    beat += len;
  }
  for (const [b, chord, len] of MELODY_CHORDS) {
    events.push({ beat: b, kind: 'pad', notes: CHORDS[chord], len });
  }
  // gentle interlude so the loop doesn't feel repetitive
  const start = beat + 0.5;
  ARPS.forEach(([chord, notes], i) => {
    const mStart = start + i * 3;
    events.push({ beat: mStart, kind: 'pad', notes: CHORDS[chord], len: 3 });
    notes.forEach((n, j) => {
      events.push({ beat: mStart + j * 0.5, kind: 'bell', midi: n + 12, vel: 0.12, len: 1.8 });
    });
  });
  return { events, beats: start + 12 + 1 };
}

class MusicBox {
  constructor(ctx) {
    this.ctx = ctx;
    this.beat = 0.6;
    this.loopIndex = 0;
    this.nextLoopTime = 0;
    this.timer = null;

    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.bus = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    const rev = ctx.createConvolver();
    rev.buffer = makeImpulse(ctx, 3, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    this.bus.connect(comp);
    this.bus.connect(rev);
    rev.connect(wet);
    wet.connect(comp);
    comp.connect(this.out);
    this.out.connect(ctx.destination);
  }

  bell(t, midi, vel, len) {
    const { ctx } = this;
    const f = mtof(midi);
    const partials = [[1, 1], [2, 0.32], [3.01, 0.1], [4.17, 0.05]];
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    g.connect(this.bus);
    partials.forEach(([mult, amp]) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * mult;
      const pg = ctx.createGain();
      pg.gain.setValueAtTime(amp, t);
      pg.gain.exponentialRampToValueAtTime(amp * 0.001 + 0.00001, t + len / mult);
      o.connect(pg).connect(g);
      o.start(t);
      o.stop(t + len + 0.05);
    });
  }

  pad(t, notes, len) {
    const { ctx } = this;
    const dur = len * this.beat;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.35);
    g.gain.setValueAtTime(0.045, t + Math.max(0.4, dur - 0.1));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.9);
    filter.connect(g).connect(this.bus);
    notes.forEach((n) => {
      [-4, 4].forEach((detune) => {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = mtof(n);
        o.detune.value = detune;
        o.connect(filter);
        o.start(t);
        o.stop(t + dur + 1);
      });
    });
  }

  scheduleLoop() {
    const { ctx } = this;
    if (this.nextLoopTime < ctx.currentTime + 0.05) this.nextLoopTime = ctx.currentTime + 0.1;
    const t0 = this.nextLoopTime;
    const { events, beats } = buildLoop(this.loopIndex++);
    for (const e of events) {
      const t = t0 + e.beat * this.beat;
      if (e.kind === 'bell') this.bell(t, e.midi, e.vel, e.len);
      else this.pad(t, e.notes, e.len);
    }
    this.nextLoopTime = t0 + beats * this.beat;
  }

  start(volume) {
    this.scheduleLoop();
    this.timer = setInterval(() => {
      if (this.ctx.state !== 'running') return;
      if (this.ctx.currentTime > this.nextLoopTime - 2.5) this.scheduleLoop();
    }, 400);
    this.setVolume(volume, 2.5);
  }

  setVolume(v, seconds = 0.4) {
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(v, now + seconds);
  }
}

class AudioEngine {
  started = false;
  muted = false;
  ducked = false;
  mode = null; // 'file' | 'synth'
  hasCustomSong = Boolean(SONG_URL);
  listeners = new Set();

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit() {
    this.listeners.forEach((fn) => fn());
  }

  // Must be called from a click/tap handler (browsers block autoplay otherwise).
  start() {
    if (this.started) return;
    this.started = true;
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume();

    if (SONG_URL) {
      const el = new Audio(SONG_URL);
      el.loop = true;
      el.preload = 'auto';
      el.volume = 0;
      this.el = el;
      this.mode = 'file';
      el.play()
        .then(() => this.fadeElTo(this.targetVolume(), 2500))
        .catch(() => {
          this.el = null;
          this.startSynth();
        });
      el.addEventListener('error', () => {
        if (this.mode === 'file') {
          this.el = null;
          this.startSynth();
        }
      });
    } else {
      this.startSynth();
    }

    document.addEventListener('visibilitychange', this.onVisibility);
    this.emit();
  }

  startSynth() {
    const ctx = getCtx();
    if (!ctx) return;
    this.mode = 'synth';
    this.box = new MusicBox(ctx);
    this.box.start(this.muted ? 0 : this.targetVolume());
    this.emit();
  }

  targetVolume() {
    const base = this.mode === 'file' ? FILE_VOLUME : SYNTH_VOLUME;
    return this.ducked ? base * 0.15 : base;
  }

  fadeElTo(target, ms) {
    const el = this.el;
    if (!el) return;
    cancelAnimationFrame(this.fadeRaf);
    const from = el.volume;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      el.volume = Math.max(0, Math.min(1, from + (target - from) * p));
      if (p < 1) this.fadeRaf = requestAnimationFrame(step);
    };
    this.fadeRaf = requestAnimationFrame(step);
  }

  pauseAll() {
    if (this.el) this.el.pause();
    if (sharedCtx && sharedCtx.state === 'running') sharedCtx.suspend();
  }

  resumeAll() {
    if (sharedCtx && sharedCtx.state === 'suspended') sharedCtx.resume();
    if (this.el) {
      this.el.play().catch(() => {});
      this.fadeElTo(this.targetVolume(), 800);
    }
  }

  onVisibility = () => {
    if (this.muted) return;
    if (document.hidden) this.pauseAll();
    else this.resumeAll();
  };

  toggleMute() {
    if (!this.started) {
      this.start();
      return;
    }
    this.muted = !this.muted;
    if (this.muted) this.pauseAll();
    else this.resumeAll();
    this.emit();
  }

  // Quieten the music (used while the mic listens for her blowing out the candles)
  duck(on) {
    this.ducked = on;
    if (this.mode === 'file') this.fadeElTo(this.targetVolume(), 400);
    else if (this.box && !this.muted) this.box.setVolume(this.targetVolume());
  }

  // ── Sound effects ──
  sfxOut() {
    if (this.muted) return null;
    const ctx = getCtx();
    if (!ctx) return null;
    if (ctx.state === 'suspended') ctx.resume();
    if (!this.sfxBus) {
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.5;
      this.sfxBus.connect(ctx.destination);
    }
    return ctx;
  }

  noise(ctx, seconds) {
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  pop() {
    const ctx = this.sfxOut();
    if (!ctx) return;
    const t = ctx.currentTime;
    const n = this.noise(ctx, 0.12);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    n.connect(bp).connect(g).connect(this.sfxBus);
    n.start(t);
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.08);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.4, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    o.connect(og).connect(this.sfxBus);
    o.start(t);
    o.stop(t + 0.1);
  }

  puff() {
    const ctx = this.sfxOut();
    if (!ctx) return;
    const t = ctx.currentTime;
    const n = this.noise(ctx, 0.4);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1800, t);
    lp.frequency.exponentialRampToValueAtTime(300, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    n.connect(lp).connect(g).connect(this.sfxBus);
    n.start(t);
  }

  chime(notes = [84, 88, 91, 96], gap = 0.07) {
    const ctx = this.sfxOut();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    notes.forEach((m, i) => {
      const t = t0 + i * gap;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = mtof(m);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      o.connect(g).connect(this.sfxBus);
      o.start(t);
      o.stop(t + 1.3);
    });
  }

  sparkle() {
    const scale = [84, 86, 88, 91, 93, 96, 98, 100];
    const notes = Array.from({ length: 6 }, () => scale[Math.floor(Math.random() * scale.length)]);
    this.chime(notes, 0.06);
  }
}

export const audio = new AudioEngine();
