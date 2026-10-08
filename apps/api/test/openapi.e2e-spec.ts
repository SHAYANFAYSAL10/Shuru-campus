import { type NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { defaultBrand } from '@campus/contracts';

import { createTestApp } from '#test/helpers/test-app.js';

interface Operation {
  responses: Record<string, { content?: Record<string, { schema?: unknown }> }>;
  requestBody?: { content: Record<string, { schema: unknown }> };
}
interface Document {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<string, Record<string, Operation>>;
  components: { schemas: Record<string, unknown> };
}

/** Every `$ref` string anywhere inside `value`. */
function refsIn(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(refsIn);
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, v]) =>
    key === '$ref' && typeof v === 'string' ? [v] : refsIn(v),
  );
}

describe('API docs (non-production)', () => {
  let app: NestExpressApplication;
  let doc: Document;

  beforeAll(async () => {
    ({ app } = await createTestApp());
    doc = (await request(app.getHttpServer()).get('/api/docs-json').expect(200)).body as Document;
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the Swagger UI', async () => {
    const res = await request(app.getHttpServer()).get('/api/docs').expect(200);
    expect(res.text).toContain('swagger-ui');
  });

  it('is titled from the configured brand, never a literal', () => {
    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.info.title).toBe(`${defaultBrand.name} API`);
  });

  it('documents every endpoint in docs/06-api.md', () => {
    const operations = Object.entries(doc.paths).flatMap(([path, methods]) =>
      Object.keys(methods).map((m) => `${m.toUpperCase()} ${path}`),
    );
    expect(operations.toSorted()).toEqual(
      [
        'GET /api/v1/health',
        'GET /api/v1/site',
        'GET /api/v1/plans',
        'GET /api/v1/plans/{slug}',
        'GET /api/v1/amenities',
        'GET /api/v1/gallery',
        'POST /api/v1/inquiries',
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/logout',
        'GET /api/v1/auth/me',
        'GET /api/v1/admin/config',
        'PUT /api/v1/admin/config/site',
        'PUT /api/v1/admin/config/plans/{slug}',
        'PUT /api/v1/admin/config/features',
      ].toSorted(),
    );
  });

  it('gives every operation a documented success response, and every body a schema', () => {
    for (const [path, methods] of Object.entries(doc.paths)) {
      for (const [method, op] of Object.entries(methods)) {
        const success = Object.keys(op.responses).filter((s) => s.startsWith('2'));
        expect(success, `${method} ${path}`).not.toEqual([]);
        if (method === 'post' || method === 'put') {
          if (path.endsWith('/logout')) continue;
          expect(
            op.requestBody?.content['application/json']?.schema,
            `${method} ${path}`,
          ).toBeDefined();
        }
      }
    }
  });

  it('resolves every schema reference to a Zod-generated component', () => {
    const refs = new Set(refsIn(doc.paths));
    expect(refs.size).toBeGreaterThan(5);
    for (const ref of refs) {
      const name = ref.replace('#/components/schemas/', '');
      expect(doc.components.schemas[name], ref).toBeDefined();
    }
    expect(doc.components.schemas.InquiryCreateInput).toMatchObject({
      type: 'object',
      required: expect.arrayContaining(['name', 'email', 'message']) as unknown,
    });
  });
});

describe('API docs (production)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp({ NODE_ENV: 'production', LOG_LEVEL: 'silent' }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('are not mounted', async () => {
    await request(app.getHttpServer()).get('/api/docs').expect(404);
    await request(app.getHttpServer()).get('/api/docs-json').expect(404);
  });
});
