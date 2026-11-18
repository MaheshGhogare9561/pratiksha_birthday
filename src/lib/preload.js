import { photos } from './photos';

// Downloads the gallery photos in the background while she's still on the
// first steps, so the gallery shows them instantly instead of loading late.

const loaded = new Set();
const keep = []; // hold references so the browser keeps the decoded images in memory

export function isLoaded(url) {
  return loaded.has(url);
}

export function loadImage(url) {
  if (!url || loaded.has(url)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = img.onerror = () => {
      loaded.add(url);
      resolve();
    };
    img.src = url;
    keep.push(img);
  });
}

let started = false;

export function preloadPhotos() {
  if (started) return;
  started = true;
  const real = photos.filter((p) => !p.placeholder);
  if (!real.length) return;

  // 1) the gallery-sized versions, all together (they're small)
  Promise.all(real.map((p) => loadImage(p.thumb))).then(() => {
    // 2) then the full-screen versions, two at a time so the song keeps streaming smoothly
    let i = 0;
    const next = () => {
      if (i >= real.length) return undefined;
      return loadImage(real[i++].src).then(next);
    };
    next();
    next();
  });
}
