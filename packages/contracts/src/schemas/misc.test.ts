import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { AdminConfig, FeaturesUpdate, PreviewSaveResult } from './admin';
import { Amenity } from './amenity';
import { ApiError, toErrorDetails } from './api-error';
import { AuthSession, LoginRequest } from './auth';
import { collectionOf } from './collection';
import { GalleryImage, GalleryQuery } from './gallery';

const image = {
  id: 'workspace-1',
  src: '/placeholder/workspace-1.jpg',
  width: 1600,
  height: 1067,
  alt: 'Rows of desks by a window',
  category: 'workspace',
  blurDataUrl: 'data:image/jpeg;base64,AAAA',
};

describe('Amenity', () => {
  it('accepts a lucide icon name and rejects anything else', () => {
    const amenity = { id: 'wifi', name: 'Wi-Fi', description: 'Up to 40 Mbps', icon: 'wifi' };
    expect(Amenity.safeParse(amenity).success).toBe(true);
    expect(Amenity.safeParse({ ...amenity, icon: '<svg>' }).success).toBe(false);
  });
});

describe('GalleryImage', () => {
  it('accepts a placeholder image', () => {
    expect(GalleryImage.safeParse(image).success).toBe(true);
  });

  it('requires alt text and a data-URL blur preview', () => {
    expect(GalleryImage.safeParse({ ...image, alt: '' }).success).toBe(false);
    expect(GalleryImage.safeParse({ ...image, blurDataUrl: '/blur.jpg' }).success).toBe(false);
  });

  it('validates the category filter', () => {
    expect(GalleryQuery.safeParse({ category: 'cafe' }).success).toBe(true);
    expect(GalleryQuery.safeParse({}).success).toBe(true);
    expect(GalleryQuery.safeParse({ category: 'rooftop' }).success).toBe(false);
  });
});

describe('auth', () => {
  it('validates the login request', () => {
    expect(LoginRequest.safeParse({ email: 'a@example.com', password: 'x' }).success).toBe(true);
    expect(LoginRequest.safeParse({ email: 'a@example.com', password: '' }).success).toBe(false);
    expect(LoginRequest.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });

  it('only knows the admin role', () => {
    expect(AuthSession.safeParse({ user: { email: 'a@example.com', role: 'admin' } }).success).toBe(
      true,
    );
    expect(AuthSession.safeParse({ user: { email: 'a@example.com', role: 'owner' } }).success).toBe(
      false,
    );
  });
});

describe('admin', () => {
  it('marks Phase 1 config as memory-backed and read-only', () => {
    const meta = AdminConfig.shape.meta;
    expect(
      meta.safeParse({ dataSource: 'memory', editable: false, updatedAt: '2026-10-08T00:00:00Z' })
        .success,
    ).toBe(true);
    expect(
      meta.safeParse({ dataSource: 'memory', editable: true, updatedAt: '2026-10-08T00:00:00Z' })
        .success,
    ).toBe(false);
  });

  it('validates features updates including the announcement', () => {
    const flags = { inquiryForm: true, gallery: false, maintenanceMode: false };
    expect(
      FeaturesUpdate.safeParse({ ...flags, announcement: { enabled: false, text: '' } }).success,
    ).toBe(true);
    expect(
      FeaturesUpdate.safeParse({ ...flags, announcement: { enabled: true, text: '' } }).success,
    ).toBe(false);
  });

  it('describes a preview save', () => {
    expect(
      PreviewSaveResult.safeParse({ persisted: false, validated: true, message: 'ok' }).success,
    ).toBe(true);
  });
});

describe('ApiError', () => {
  it('accepts the documented envelope', () => {
    expect(
      ApiError.safeParse({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Some fields are invalid.',
          details: [{ path: 'email', message: 'Enter a valid email address.' }],
          requestId: 'req-1',
        },
      }).success,
    ).toBe(true);
    expect(
      ApiError.safeParse({ error: { code: 'TEAPOT', message: 'x', requestId: 'r' } }).success,
    ).toBe(false);
  });

  it('flattens zod issues into dot paths', () => {
    const result = z.object({ a: z.object({ b: z.array(z.string()) }) }).safeParse({
      a: { b: [1] },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toErrorDetails(result.error)).toEqual([
        { path: 'a.b.0', message: expect.any(String) as string },
      ]);
    }
  });
});

describe('collectionOf', () => {
  it('wraps items', () => {
    const schema = collectionOf(GalleryImage);
    expect(schema.safeParse({ items: [image] }).success).toBe(true);
    expect(schema.safeParse([image]).success).toBe(false);
  });
});
