#!/usr/bin/env node
// Stand-in photography (docs/02-content.md → Photos): free-licensed stock photos, cropped to
// the final sizes in public/placeholder (B4 ratios), so layouts are judged on real images until
// the client's own photos and usage rights arrive (docs/09-roadmap.md #3).
//
// Every source is CC0 (Unsplash imports on Wikimedia Commons) or the Pexels license: free to
// use and modify, no attribution required. CREDITS.md is still written next to the files.
// Chosen for a warm palette (wood, daylight, plants, ochre accents) that sits with paper,
// lake and marigold; the A5 photo tone does the rest.
//
//   node scripts/fetch-photos.mjs           # fetch, crop and write every photo (from apps/web)
//   node scripts/fetch-photos.mjs hero-wide # only the named ones
// It prints each photo's mean color: the gallery seed uses it as the blur fill.
// TODO(client): replace with real photos (docs/09-roadmap.md #3), then delete this script.
import { Buffer } from 'node:buffer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath, URL } from 'node:url';

import sharp from 'sharp';

const OUT_DIR = fileURLToPath(new URL('../public/placeholder/', import.meta.url));
const USER_AGENT = 'campus-photo-fetch/1.0 (development stand-in imagery)';

/**
 * @typedef {{ id: string; size: readonly [number, number]; title: string; source: string;
 *   url: string; page: string; license: string; position?: string }} Photo
 */

/**
 * A Wikimedia Commons file, fetched as its 3840px rendition (a standard Commons thumbnail step),
 * or the original when that's narrower.
 * @param {string} hashPath the file's hash directory, e.g. `0/0b`
 * @param {string} file the Commons file name
 * @param {number} width the original's width
 */
function fromCommons(hashPath, file, width) {
  const name = encodeURIComponent(file.replaceAll(' ', '_'));
  const base = `https://upload.wikimedia.org/wikipedia/commons`;
  return {
    source: 'Unsplash via Wikimedia Commons',
    url:
      width > 3840
        ? `${base}/thumb/${hashPath}/${name}/3840px-${name}`
        : `${base}/${hashPath}/${name}`,
    page: `https://commons.wikimedia.org/wiki/File:${name}`,
    license: 'CC0 1.0',
  };
}

/** @param {number} id the Pexels photo id */
function fromPexels(id) {
  return {
    source: 'Pexels',
    url: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2560`,
    page: `https://www.pexels.com/photo/${id}/`,
    license: 'Pexels License',
  };
}

const TALL = /** @type {const} */ ([1200, 1500]); // 4:5
const WIDE = /** @type {const} */ ([1920, 1080]); // 16:9
const LANDSCAPE = /** @type {const} */ ([1600, 1067]); // 3:2
const PLAN = /** @type {const} */ ([960, 1200]); // 4:5

/** @type {Photo[]} */
export const PHOTOS = [
  // Home hero, art-directed: the same sunlit lounge family on both sizes.
  {
    id: 'hero-wide',
    size: WIDE,
    title: 'Communal coworking interior',
    ...fromCommons('6/6a', 'Communal Coworking interior (Unsplash).jpg', 5501),
  },
  {
    id: 'hero-tall',
    size: TALL,
    title: 'Casual meeting room',
    position: 'right',
    ...fromCommons('0/0b', 'Casual Meeting Room (Unsplash).jpg', 6000),
  },
  // About story, 3:2.
  {
    id: 'about-story',
    size: [1800, 1200],
    title: 'People working together at a shared table',
    ...fromPexels(3184303),
  },
  // Gallery, at the seed's ratios (packages/contracts/src/seed/gallery.ts).
  {
    id: 'workspace-1',
    size: LANDSCAPE,
    title: 'Desks and cubicles',
    ...fromCommons('5/50', 'Desks and cubicles (Unsplash).jpg', 4000),
  },
  {
    id: 'workspace-2',
    size: TALL,
    title: 'Winter workspace',
    position: 'centre',
    ...fromCommons('9/92', 'Winter Workspace 2 (Unsplash).jpg', 6000),
  },
  {
    id: 'workspace-3',
    size: WIDE,
    title: 'Chairs in a meeting room',
    ...fromCommons('d/da', 'Chairs in a meeting room (Unsplash).jpg', 6594),
  },
  {
    id: 'meeting-1',
    size: LANDSCAPE,
    title: 'Meeting room with a brick wall',
    ...fromCommons('2/23', '1731 Berkeley Avenue, Los Angeles, California (Unsplash).jpg', 3542),
  },
  {
    id: 'meeting-2',
    size: TALL,
    title: 'White conference room',
    ...fromCommons('2/2b', 'White conference room (Unsplash).jpg', 5616),
  },
  {
    id: 'meeting-3',
    size: WIDE,
    title: 'Large meeting room',
    ...fromCommons('2/22', 'Large meeting room (Unsplash).jpg', 4920),
  },
  {
    id: 'cafe-1',
    size: TALL,
    title: 'Barista at the counter',
    position: 'right',
    ...fromCommons('a/a5', 'Confused. (Unsplash).jpg', 3766),
  },
  {
    id: 'cafe-2',
    size: LANDSCAPE,
    title: 'Café lounge',
    ...fromCommons('2/27', 'Latte Couple (Unsplash).jpg', 4928),
  },
  { id: 'events-1', size: WIDE, title: 'A community meetup in a loft', ...fromPexels(18935245) },
  {
    id: 'events-2',
    size: LANDSCAPE,
    title: 'A training session at a long table',
    ...fromPexels(1181406),
  },
  // Plan cards, 4:5 (apps/web/src/lib/plan-media.ts).
  {
    id: 'plan-hot-desk',
    size: PLAN,
    title: 'Man at a laptop in an office',
    position: 'right',
    ...fromCommons('5/5f', 'Man at a laptop in an office (Unsplash).jpg', 3500),
  },
  {
    id: 'plan-business-seating',
    size: PLAN,
    title: 'A team at shared desks',
    ...fromPexels(7550538),
  },
  {
    id: 'plan-executive-seating',
    size: PLAN,
    title: 'A working space with a bookcase',
    position: 'right',
    ...fromCommons('8/8c', 'My working space (Unsplash).jpg', 5472),
  },
  {
    id: 'plan-private-office',
    size: PLAN,
    title: 'A private studio office',
    ...fromCommons('d/d4', 'A visit to Sun Studios (Unsplash).jpg', 6000),
  },
  {
    id: 'plan-meeting-room',
    size: PLAN,
    title: 'Neat conference room',
    ...fromCommons('9/9d', 'Neat conference room (Unsplash).jpg', 5616),
  },
  {
    id: 'plan-seminar-room',
    size: PLAN,
    title: 'Conference room table',
    ...fromCommons('2/26', 'Conference room table (Unsplash).jpg', 5616),
  },
];

/** Fetches politely: Commons rate-limits bursts (429), so back off and honor Retry-After. */
async function download(url) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await globalThis.fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (attempt === 6) throw new Error(`${res.status} for ${url}`);
    const retryAfter = Number(res.headers.get('retry-after'));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 5000 * attempt);
  }
  throw new Error('unreachable');
}

/** Crops to the exact size and returns the photo's mean color (the gallery's blur fill). */
async function render(photo) {
  const [width, height] = photo.size;
  const input = await download(photo.url);
  const image = sharp(input)
    .rotate()
    .resize(width, height, { fit: 'cover', position: photo.position ?? sharp.strategy.attention });
  const file = join(OUT_DIR, `${photo.id}.jpg`);
  await image.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(file);
  const mean = await sharp(file).resize(1, 1, { fit: 'fill' }).raw().toBuffer();
  const hex = `#${[...mean.subarray(0, 3)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  return { file, hex };
}

function credits() {
  const rows = PHOTOS.map(
    (p) => `| \`${p.id}.jpg\` | ${p.title} | [${p.source}](${p.page}) | ${p.license} |`,
  );
  return [
    '# Stand-in photo credits',
    '',
    'Generated by `scripts/fetch-photos.mjs`. Stock stand-ins until the client supplies real photos',
    '(docs/09-roadmap.md #3). All are free to use and modify without attribution; credited anyway.',
    '',
    '| File | Subject | Source | License |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}

async function main() {
  const only = new Set(process.argv.slice(2));
  mkdirSync(OUT_DIR, { recursive: true });
  for (const photo of PHOTOS.filter((p) => only.size === 0 || only.has(p.id))) {
    const { hex } = await render(photo);
    process.stdout.write(`${photo.id.padEnd(24)} ${photo.size.join('×').padEnd(10)} ${hex}\n`);
    await sleep(1500);
  }
  writeFileSync(join(OUT_DIR, 'CREDITS.md'), credits());
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
