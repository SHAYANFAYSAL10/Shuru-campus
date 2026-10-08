#!/usr/bin/env node
// Generates the clearly marked placeholder photos in public/placeholder (docs/02-content.md →
// Media) at their final sizes, so layouts are final before the client's photos arrive.
//   node scripts/placeholders.mjs
// TODO(client): replace with real photos (docs/09-roadmap.md #3), then delete this script.
import { Buffer } from 'node:buffer';
import { mkdir } from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

import sharp from 'sharp';

const OUT = fileURLToPath(new URL('../public/placeholder/', import.meta.url));

/** name → [width, height, label]. Sizes match the B4 ratios. */
const IMAGES = {
  'hero-wide': [1920, 1080, '16:9'],
  'hero-tall': [1200, 1500, '4:5'],
};

// Warm, low-contrast stand-ins for a sunlit room: wall, windows, a desk line. Colors are fixed
// image pixels, not UI, so they don't come from the token palette.
function svg(width, height, label) {
  const unit = Math.min(width, height) / 12;
  const windows = [0.12, 0.38, 0.64]
    .map(
      (x) =>
        `<rect x="${x * width}" y="${height * 0.12}" width="${width * 0.2}" height="${height * 0.46}" rx="${unit * 0.2}" fill="#e9e1d3"/>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#d6cbb8"/>
  ${windows}
  <rect y="${height * 0.68}" width="100%" height="${height * 0.32}" fill="#c9bca6"/>
  <rect x="${width * 0.08}" y="${height * 0.64}" width="${width * 0.84}" height="${unit * 0.35}" rx="${unit * 0.1}" fill="#a8977c"/>
  <text x="50%" y="${height * 0.86}" text-anchor="middle" font-family="Consolas, Menlo, monospace"
    font-size="${unit * 0.42}" letter-spacing="${unit * 0.05}" fill="#6b5f4c">PLACEHOLDER PHOTO · ${label}</text>
</svg>`;
}

await mkdir(OUT, { recursive: true });
for (const [name, [width, height, label]] of Object.entries(IMAGES)) {
  await sharp(Buffer.from(svg(width, height, label)))
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(`${OUT}${name}.jpg`);
  process.stdout.write(`✔ public/placeholder/${name}.jpg (${width}×${height})\n`);
}
