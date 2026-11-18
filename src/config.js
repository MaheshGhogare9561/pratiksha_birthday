// ─────────────────────────────────────────────────────────────
//  ✏️  EDIT THIS FILE to make the website yours.
//  Everything personal (names, letter, reasons, coupons, quotes)
//  lives here. Photos go in /photos, the song goes in /music.
// ─────────────────────────────────────────────────────────────

export const config = {
  // The birthday girl 🎂
  name: 'Pratiksha',

  // Your name — shown at the end of the letter and in the footer
  fromName: 'Darshana',

  // Optional: her new age, e.g. 23 → "Happy 23rd Birthday". Leave null to hide.
  age: null,

  // Optional: the day you two became friends, as 'YYYY-MM-DD'.
  // Shows a live "friends for X days, Y hours…" counter at the end. Leave null to hide.
  friendsSince: null,

  // Step 4 — each balloon hides one of these
  reasons: [
    'You laugh at my worst jokes — even the ones that aren’t funny.',
    'You know what I’m thinking with just one look.',
    'You’ve seen me at my worst and stayed for my best.',
    'Every random plan with you turns into a core memory.',
    'You’re my 2 a.m. call, my safe place, my person.',
    'You make ordinary days feel like little celebrations.',
    'Your heart is the kindest one I know.',
    'Because life is simply better with you in it.',
  ],

  // Step 5 — friendship quotes (swipe through them)
  quotes: [
    { text: 'A friend is someone who knows all about you and still loves you.', author: 'Elbert Hubbard' },
    { text: 'Walking with a friend in the dark is better than walking alone in the light.', author: 'Helen Keller' },
    { text: 'What is a friend? A single soul dwelling in two bodies.', author: 'Aristotle' },
    { text: 'A single rose can be my garden… a single friend, my world.', author: 'Leo Buscaglia' },
    {
      text: 'Friendship is born at that moment when one person says to another, “What! You too? I thought I was the only one.”',
      author: 'C.S. Lewis',
    },
    { text: 'There is nothing on this earth more to be prized than true friendship.', author: 'Thomas Aquinas' },
    { text: 'A real friend is one who walks in when the rest of the world walks out.', author: 'Walter Winchell' },
    {
      text: 'Of all the beautiful things in my life, our friendship is the one I’d choose again and again.',
      author: 'Me, obviously 🤍',
    },
  ],

  // Step 6 — photo captions. Key = the exact file name inside /photos.
  // Photos without a caption here get one of the `defaultCaptions` below.
  photoCaptions: {
    '01.jpg': 'dressed up & mirror-ready 🪞',
    '02.webp': 'trek days, sunny smiles ⛰️',
    '03.webp': 'one coconut, two straws 🥥',
    '04.webp': 'train rides & daydreams 🚆',
    '05.webp': 'the wink, the pout, the chaos 😜',
    '06.webp': 'certified weirdos 🤪',
    '07.webp': 'your smile, my sass 😏',
    '08.webp': 'laughing till it hurts 💛',
    '09.webp': 'neon nights & cosy hugs ✨',
    '10.webp': 'golden hour, golden company 🌳',
    '11.webp': 'colour me happy — Holi hai! 🎨',
  },
  defaultCaptions: [
    'us, being us 💛',
    'core memory unlocked',
    'my favourite view',
    'the best kind of chaos',
    'partners in crime',
    'never letting go',
    'pure happiness',
    'forever & always',
  ],

  // Step 7 — scratch-card coupons
  coupons: [
    { emoji: '🍕', title: 'Treat on me', text: 'Your favourite food, my wallet. No questions asked.' },
    { emoji: '📞', title: 'Unlimited rant session', text: 'I’ll listen to every detail — with full drama reactions.' },
    { emoji: '🎬', title: 'Movie night', text: 'You pick the movie. I bring the snacks (and tissues).' },
    { emoji: '🤗', title: 'One giant hug', text: 'Redeemable anytime, anywhere. Never expires.' },
  ],

  // Step 8 — the letter. Each string is one paragraph.
  letter: [
    'Happy birthday to the girl who turned “a friend” into “my person.” I tried to fit everything I feel into this little website, but honestly, no amount of pages could hold it all.',
    'Thank you for every late-night talk, every inside joke nobody else understands, and every time you picked up the phone without asking why. Thank you for being my loudest cheerleader and my calmest shoulder — sometimes in the same five minutes.',
    'I hope this year treats you as gently as you treat everyone around you. I hope you chase the dreams that scare you a little, laugh until your stomach hurts, and never once forget how loved you are.',
    'Whatever comes next — new cities, new chapters, new adventures — you will always have me. That’s a promise.',
    'Happy birthday, my favourite human. Here’s to us, always.',
  ],
  letterSignOff: 'Forever your best friend,',

  // Finale — hidden behind the "psst… one more thing" button
  secretMessage:
    'If you ever forget how special you are, come back to this page. It’ll remind you. And so will I. 🤍',
};
