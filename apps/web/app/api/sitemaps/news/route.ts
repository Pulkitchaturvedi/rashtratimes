import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rashtratimes.example.com';

export async function GET() {
  const response = await fetch(`${API_URL}/articles?status=PUBLISHED&pageSize=50`);
  const payload = await response.json();
  const now = new Date();
  const items = (payload.data ?? []).filter((item: any) => {
    const publishedAt = item.publishedAt ? new Date(item.publishedAt) : null;
    return publishedAt ? now.getTime() - publishedAt.getTime() <= 1000 * 60 * 60 * 48 : false;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${items
    .map(
      (item: any) => `  <url>\n    <loc>${SITE_URL}/news/${item.slug}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>RashtraTimes</news:name>\n        <news:language>${item.lang ?? 'en'}</news:language>\n      </news:publication>\n      <news:publication_date>${item.publishedAt}</news:publication_date>\n      <news:title>${item.title}</news:title>\n    </news:news>\n  </url>`
    )
    .join('\n')}\n</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
