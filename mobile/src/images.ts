import { categoryColor, categoryEmoji } from './theme';

/**
 * Generates a consistent, elegant illustrated image for each plant as an SVG
 * data URI. This keeps the catalog beautiful and 100% offline/free with no
 * broken links or licensing issues.
 *
 * To use a REAL photo later: add an `imageUrl` field to the plant and prefer
 * it here — this becomes the graceful fallback.
 */
export function plantImage(category: string, name: string, imageUrl?: string): string {
  // Prefer a real photo when one is provided (e.g. generated via the Gemini
  // script, or from a free image source).
  if (imageUrl && imageUrl.length > 0) return imageUrl;

  const color = categoryColor[category] ?? '#5a9e6f';
  const emoji = categoryEmoji[category] ?? '🌱';
  const light = shade(color, 0.85);
  const dark = shade(color, -0.25);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${light}"/>
        <stop offset="1" stop-color="${color}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <circle cx="320" cy="60" r="90" fill="${shade(color, 0.3)}" opacity="0.35"/>
    <circle cx="70" cy="250" r="70" fill="${dark}" opacity="0.25"/>
    <text x="200" y="175" font-size="110" text-anchor="middle">${emoji}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/** Elegant hero splash for the home screen. */
export const heroImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#bfe0c8"/>
          <stop offset="1" stop-color="#e8f1ea"/>
        </linearGradient>
        <linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5a9e6f"/>
          <stop offset="1" stop-color="#2e6b43"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" fill="url(#sky)"/>
      <circle cx="660" cy="110" r="70" fill="#f3e6b8" opacity="0.8"/>
      <path d="M0 360 Q200 300 400 350 T800 340 V520 H0 Z" fill="url(#lawn)"/>
      <path d="M0 410 Q250 360 500 400 T800 390 V520 H0 Z" fill="#245a37" opacity="0.6"/>
      <g fill="#2e6b43">
        <circle cx="120" cy="330" r="34"/><rect x="114" y="330" width="12" height="40"/>
        <circle cx="690" cy="320" r="40"/><rect x="684" y="320" width="12" height="46"/>
      </g>
      <g fill="#d98bb0"><circle cx="300" cy="430" r="9"/><circle cx="330" cy="440" r="9"/><circle cx="360" cy="432" r="9"/></g>
      <g fill="#c7a44a"><circle cx="470" cy="445" r="8"/><circle cx="500" cy="438" r="8"/></g>
    </svg>`,
  );

/** Lighten (amount>0) or darken (amount<0) a hex color. */
function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  r = Math.round((t - r) * p) + r;
  g = Math.round((t - g) * p) + g;
  b = Math.round((t - b) * p) + b;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
