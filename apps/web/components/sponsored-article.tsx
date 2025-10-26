import Link from 'next/link';

interface SponsoredArticleProps {
  title: string;
  sponsor: string;
  href: string;
  excerpt?: string;
}

export function SponsoredArticle({ title, sponsor, href, excerpt }: SponsoredArticleProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-amber-50 to-orange-100 p-6">
      <div className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
        Sponsored
      </div>
      <div className="mt-10 space-y-3">
        <p className="text-xs uppercase text-muted-foreground">Presented by {sponsor}</p>
        <h3 className="text-2xl font-semibold">{title}</h3>
        {excerpt && <p className="text-sm text-muted-foreground">{excerpt}</p>}
        <Link href={href} className="text-sm font-medium text-primary hover:underline">
          Learn more
        </Link>
      </div>
    </article>
  );
}
