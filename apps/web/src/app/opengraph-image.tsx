import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import { getBrand } from '@/lib/api';
import { OG_PADDING, OG_SIZE, ogTitleSize } from '@/lib/og';
import { palette } from '@/lib/palette';

const CONTENT_TYPE = 'image/png';

/** Static font files (assets/fonts/README.md): Fraunces for the name, Geist for the rest. */
const font = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file));
const fraunces = font('fraunces-latin-400-normal.woff');
const geist = font('geist-latin-400-normal.woff');

export async function generateImageMetadata() {
  const brand = await getBrand();
  return [
    {
      id: 'default',
      alt: `${brand.name}: ${brand.tagline}`,
      size: OG_SIZE,
      contentType: CONTENT_TYPE,
    },
  ];
}

/**
 * The site's share card, inherited by every page that doesn't set its own: the brand name in
 * Fraunces with the begin line drawn under it, the pillars above and the tagline below, on paper.
 * Everything comes from the brand config, so a rename needs no change here.
 */
export default async function OpenGraphImage() {
  const brand = await getBrand();
  const titleSize = ogTitleSize(brand.name);

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: OG_PADDING,
        backgroundColor: palette.paper,
        color: palette.ink,
        fontFamily: 'Geist',
      }}
    >
      <div style={{ display: 'flex', fontSize: 26, letterSpacing: 4, color: palette.ink2 }}>
        {brand.pillars.join('  ·  ').toUpperCase()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-start' }}>
        <div
          style={{
            fontFamily: 'Fraunces',
            fontSize: titleSize,
            lineHeight: 1,
            letterSpacing: -titleSize * 0.02,
          }}
        >
          {brand.name}
        </div>
        {/* The begin line, scaled up from 1.5px for a card viewed small. */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'stretch',
            marginTop: titleSize * 0.22,
            height: 6,
            borderRadius: 3,
            backgroundColor: palette.marigold,
          }}
        />
      </div>
      <div style={{ display: 'flex', fontSize: 40, color: palette.ink2 }}>{brand.tagline}</div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Geist', data: await geist, style: 'normal', weight: 400 },
        { name: 'Fraunces', data: await fraunces, style: 'normal', weight: 400 },
      ],
    },
  );
}
