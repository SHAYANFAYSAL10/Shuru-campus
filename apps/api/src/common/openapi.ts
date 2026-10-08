import { applyDecorators, type INestApplication } from '@nestjs/common';
import {
  ApiBody,
  ApiResponse,
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { z } from 'zod';

import {
  AdminConfig,
  Amenity,
  ApiError,
  AuthSession,
  FeaturesUpdate,
  GalleryImage,
  HealthResponse,
  InquiryAccepted,
  InquiryCreate,
  LoginRequest,
  Plan,
  PreviewSaveResult,
  SiteSettings,
} from '@campus/contracts';

import { type AppConfig } from '#src/config/app-config.js';
import { SESSION_COOKIE } from '#src/modules/auth/session-cookie.js';

export const OPENAPI_PATH = 'api/docs';

/**
 * Every documented shape comes from its contracts Zod schema (CLAUDE.md §2: one
 * definition). Request bodies are documented as clients send them (`input`), responses as
 * the API returns them (`output`).
 */
const REQUEST_SCHEMAS = { InquiryCreate, LoginRequest, SiteSettings, Plan, FeaturesUpdate };
const RESPONSE_SCHEMAS = {
  HealthResponse,
  SiteSettings,
  Plan,
  Amenity,
  GalleryImage,
  InquiryAccepted,
  AuthSession,
  AdminConfig,
  PreviewSaveResult,
  ApiError,
};

type SchemaObject = NonNullable<NonNullable<OpenAPIObject['components']>['schemas']>[string];
type RequestName = keyof typeof REQUEST_SCHEMAS;
type ResponseName = keyof typeof RESPONSE_SCHEMAS;

function toOpenApi(schema: z.ZodType, io: 'input' | 'output'): SchemaObject {
  return z.toJSONSchema(schema, {
    target: 'openapi-3.0',
    io,
    unrepresentable: 'any',
  }) as SchemaObject;
}

export function zodComponents(): Record<string, SchemaObject> {
  return {
    ...Object.fromEntries(
      Object.entries(RESPONSE_SCHEMAS).map(([name, s]) => [name, toOpenApi(s, 'output')]),
    ),
    ...Object.fromEntries(
      Object.entries(REQUEST_SCHEMAS).map(([name, s]) => [`${name}Input`, toOpenApi(s, 'input')]),
    ),
  };
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

/** Documents a JSON success response: one resource, or `{ items }` with `collection`. */
export function ApiJson(
  status: number,
  name: ResponseName,
  { collection = false, description = '' } = {},
): MethodDecorator & ClassDecorator {
  const schema = collection
    ? {
        type: 'object',
        required: ['items'],
        properties: { items: { type: 'array', items: ref(name) } },
      }
    : ref(name);
  return ApiResponse({ status, description, schema });
}

/** Documents a JSON request body from its contracts schema. */
export const ApiJsonBody = (name: RequestName): MethodDecorator =>
  ApiBody({ schema: ref(`${name}Input`) });

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN (Origin not allowed)',
  404: 'NOT_FOUND',
  429: 'RATE_LIMITED (see Retry-After)',
};

/** Documents the `ApiError` responses a route can return (docs/06-api.md). */
export function ApiErrors(...statuses: (keyof typeof ERROR_DESCRIPTIONS)[]) {
  return applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({ status, description: ERROR_DESCRIPTIONS[status], schema: ref('ApiError') }),
    ),
  );
}

export function buildOpenApiDocument(app: INestApplication, config: AppConfig): OpenAPIObject {
  const options = new DocumentBuilder()
    .setTitle(`${config.brand.name} API`)
    .setDescription('Generated from the @campus/contracts Zod schemas. See docs/06-api.md.')
    .setVersion(config.version)
    .addCookieAuth(SESSION_COOKIE)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  document.components = {
    ...document.components,
    schemas: { ...document.components?.schemas, ...zodComponents() },
  };
  return document;
}

/** Swagger UI at `/api/docs` (JSON at `/api/docs-json`). Never mounted in production. */
export function setupOpenApi(app: INestApplication, config: AppConfig): void {
  SwaggerModule.setup(OPENAPI_PATH, app, buildOpenApiDocument(app, config));
}
