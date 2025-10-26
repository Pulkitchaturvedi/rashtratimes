import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { InlineArticleAd } from '@/components/ads/inline-article';
import { StickyBottomAd } from '@/components/ads/sticky-bottom';

interface ArticlePageProps {
  params: { slug: string };
}

async function fetchArticle(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'}/articles/slug/${slug}`, {
    next: { revalidate: 60 }
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Unable to load article');
  }
  return res.json();
}

export async function generateMetadata(
  { params }: ArticlePageProps,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const article = await fetchArticle(params.slug);
  if (!article) {
    return { title: 'Article not found — RashtraTimes' };
  }
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rashtratimes.example.com'}/news/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      images: article.heroImageUrl ? [{ url: article.heroImageUrl }] : undefined,
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await fetchArticle(params.slug);
  if (!article) {
    notFound();
  }

  const bodyHtml = (() => {
    if (typeof article.body === 'string') return article.body;
    if (Array.isArray(article.body?.blocks)) {
      return article.body.blocks
        .map((block: any) => {
          if (block.type === 'paragraph') {
            return `<p>${block.content}</p>`;
          }
          if (block.type === 'heading') {
            return `<h2>${block.content}</h2>`;
          }
          return '';
        })
        .join('');
    }
    return String(article.body ?? '');
  })();

  return (
    <article className="mx-auto max-w-3xl space-y-6 py-12">
      <header className="space-y-3">
        <p className="text-sm uppercase text-muted-foreground">{article.section}</p>
        <h1 className="text-4xl font-bold leading-tight">{article.title}</h1>
        <p className="text-muted-foreground">Updated {new Date(article.updatedAt).toLocaleString()}</p>
      </header>
      {article.heroImageUrl && (
        <img src={article.heroImageUrl} alt={article.title} className="w-full rounded-xl border object-cover" />
      )}
      <InlineArticleAd unitId={process.env.NEXT_PUBLIC_AD_INLINE} enabled />
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.rendered ?? bodyHtml }} />
      <StickyBottomAd unitId={process.env.NEXT_PUBLIC_AD_STICKY} enabled={false} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            image: article.heroImageUrl ? [article.heroImageUrl] : undefined,
            author: {
              '@type': 'Person',
              name: article.author?.name ?? 'RashtraTimes Reporter'
            },
            publisher: {
              '@type': 'Organization',
              name: 'RashtraTimes',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rashtratimes.example.com'}/logo.png`
              }
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rashtratimes.example.com'}/news/${article.slug}`
            }
          })
        }}
      />
    </article>
  );
}
