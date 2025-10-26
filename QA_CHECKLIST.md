# QA Checklist

- [ ] Reporter login, create draft, upload hero media via presigned flow, submit for review.
- [ ] Editor login, request changes, approve article.
- [ ] Publisher login, publish approved story and verify homepage slot updates.
- [ ] Homepage API returns 8 slots with pinned and trending fallbacks.
- [ ] Public article page renders schema.org NewsArticle markup and OG/Twitter tags.
- [ ] Citizen submission form rate-limits repeated submissions, triage board can promote to draft.
- [ ] Media upload rejects invalid mime types and >10MB files.
- [ ] News sitemap at `/api/sitemaps/news.xml` validates.
- [ ] Ads placements (TopBanner, InlineArticle, StickyBottom) reserve space without layout shift.
- [ ] Swipe reader mode allows keyboard access and 60fps drag interactions.
