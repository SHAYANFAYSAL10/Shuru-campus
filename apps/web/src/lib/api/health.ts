import 'server-only';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';

export type HealthResult = { ok: true; status: string } | { ok: false };

/** Temporary scaffold fetcher; replaced by the typed client in T4.1. */
export async function getHealth(): Promise<HealthResult> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { ok: false };
    const body = (await res.json()) as { status?: unknown };
    return typeof body.status === 'string' ? { ok: true, status: body.status } : { ok: false };
  } catch {
    return { ok: false };
  }
}
