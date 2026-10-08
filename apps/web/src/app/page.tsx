import { getHealth } from '@/lib/api/health';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const health = await getHealth();
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <p>
        API: {health.ok ? `${health.health.status} (${health.health.dataSource})` : 'unreachable'}
      </p>
    </main>
  );
}
