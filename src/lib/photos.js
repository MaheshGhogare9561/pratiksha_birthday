import { config } from '../config';

// Every image dropped into /photos shows up in the gallery automatically,
// sorted by file name (name them 01.jpg, 02.jpg… to control the order).
// They're resized + converted to WebP at build time so they load fast.

const large = import.meta.glob('/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  query: { w: '1600', format: 'webp', quality: '82' },
  import: 'default',
});
const small = import.meta.glob('/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  query: { w: '720', format: 'webp', quality: '78' },
  import: 'default',
});


const fileName = (path) => path.split('/').pop();

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg,#ffb6c9,#c9b6ff)',
  'linear-gradient(135deg,#ffd3a5,#fd6585)',
  'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
  'linear-gradient(135deg,#fbc2eb,#a6c1ee)',
  'linear-gradient(135deg,#f6d58e,#ff8fb1)',
  'linear-gradient(135deg,#d4fc79,#96e6a1)',
];

function build() {
  const paths = Object.keys(large).sort((a, b) =>
    fileName(a).localeCompare(fileName(b), undefined, { numeric: true, sensitivity: 'base' })
  );
  if (paths.length === 0) {
    // No photos yet — show pretty placeholders so the layout can be previewed.
    return PLACEHOLDER_GRADIENTS.map((bg, i) => ({
      id: `placeholder-${i}`,
      placeholder: true,
      bg,
      caption: config.defaultCaptions[i % config.defaultCaptions.length],
    }));
  }
  return paths.map((p, i) => {
    const name = fileName(p);
    return {
      id: name,
      src: large[p],
      thumb: small[p] || large[p],
      caption: config.photoCaptions[name] ?? config.defaultCaptions[i % config.defaultCaptions.length],
    };
  });
}

export const photos = build();
export const hasRealPhotos = !photos[0]?.placeholder;
