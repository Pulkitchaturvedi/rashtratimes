import Link from 'next/link';
import { TopBanner } from '@/components/ads/top-banner';
import { SponsoredArticle } from '@/components/sponsored-article';

async function fetchHomepage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'}/homepage`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) {
    throw new Error('Unable to load homepage');
  }
  return res.json();
}

export default async function HomePage() {
  const data = await fetchHomepage();
  return (
    <div className="mx-auto max-w-6xl space-y-10 py-12">
      <TopBanner unitId={process.env.NEXT_PUBLIC_AD_TOP} enabled />
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <article className="space-y-4 rounded-2xl border bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Top story</p>
          <h1 className="text-4xl font-bold leading-tight">{data.slots[0]?.article?.title ?? 'Coming soon'}</h1>
          <p className="text-lg text-muted-foreground">
            {data.slots[0]?.article?.excerpt ?? 'Pin a story from the CMS to feature it here.'}
          </p>
          {data.slots[0]?.article && (
            <Link href={`/news/${data.slots[0].article.slug}`} className="text-primary hover:underline">
              Continue reading
            </Link>
          )}
        </article>
        <aside className="space-y-4">
          <h2 className="text-xl font-semibold">Delhi bureau</h2>
          <ul className="space-y-3">
            {data.slots.slice(1, 5).map((slot: any) => (
              <li key={slot.slot} className="rounded-lg border bg-white p-4">
                <Link href={`/news/${slot.article?.slug ?? '#'}`} className="font-medium hover:underline">
                  {slot.article?.title ?? 'Awaiting approval'}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Trending</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {data.slots.slice(5, 8).map((slot: any) => (
            <article key={slot.slot} className="rounded-xl border bg-white p-6">
              <p className="text-sm uppercase text-muted-foreground">Slot {slot.slot}</p>
              <h3 className="mt-2 text-lg font-semibold">{slot.article?.title ?? 'Keep readers engaged'}</h3>
              {slot.article && (
                <Link href={`/news/${slot.article.slug}`} className="text-sm text-primary hover:underline">
                  Read story
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
      <SponsoredArticle title="Partner insight: Smart mobility" sponsor="MetroCorp" href="https://example.com" excerpt="Discover how Delhi commuters are reclaiming time with new express lanes." />
    </div>
  );
}
