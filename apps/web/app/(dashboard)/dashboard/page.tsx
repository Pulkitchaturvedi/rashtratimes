import { Suspense } from 'react';
import { DashboardOverview } from '@/components/dashboard-overview';

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold">Newsroom pulse</h1>
      <Suspense fallback={<p>Loading dashboard…</p>}>
        <DashboardOverview />
      </Suspense>
    </section>
  );
}
