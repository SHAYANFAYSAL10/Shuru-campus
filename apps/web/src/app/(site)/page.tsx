import { getHealth } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const health = await getHealth();
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <p>API: {health.ok ? `${health.data.status} (${health.data.dataSource})` : 'unreachable'}</p>
    </main>
  );
}
