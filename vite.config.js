import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  // Relative asset paths, so the built site works whether it's uploaded to
  // public_html (yourdomain.com) or a sub-folder (yourdomain.com/birthday).
  base: './',
  // imagetools resizes + converts the photos in /photos at build time,
  // so big phone pictures still load fast on her phone.
  plugins: [react(), imagetools()],
});
