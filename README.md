# Happy Birthday Pratiksha 🎂

A 9-step birthday surprise built with React + Vite.

## Make it yours
- **Text** (your name, letter, reasons, coupons, quotes, secret message): edit `src/config.js`
- **Photos**: drop `.jpg / .png / .webp` files into `photos/` — they appear in the gallery automatically, sorted by file name (`01.jpg`, `02.jpg`…). iPhone HEIC photos must be converted to JPG first.
- **Song**: drop one `.mp3` (or `.m4a`) into `music/`. If the folder is empty, a soft music-box "Happy Birthday" plays instead.

## Run locally
```
npm install
npm run dev
```
Open http://localhost:5173 — add `?step=5` to jump straight to a step while editing.

## Deploy on Hostinger
1. Build the site:
   ```
   npm run build
   ```
   This creates a `dist` folder containing the finished website.
2. In Hostinger hPanel, open **File Manager** and go to `public_html`. To put it on a sub-folder instead, create e.g. `public_html/birthday`.
3. Upload the **contents** of `dist` (`index.html` + the `assets` folder) there — or upload a zip of them and use **Extract**.
4. In hPanel, turn on **Security → SSL → Force HTTPS**. Browsers only allow the "blow with my mic" feature on HTTPS.

The site uses relative paths, so it works in `public_html` or any sub-folder.
