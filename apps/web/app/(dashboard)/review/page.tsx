'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

const columns = [
  { status: 'IN_REVIEW', title: 'In review' },
  { status: 'CHANGES_REQUESTED', title: 'Needs edits' },
  { status: 'APPROVED', title: 'Approved' }
] as const;

export default function ReviewBoardPage() {
  const { data } = useQuery({
    queryKey: ['articles', 'review'],
    queryFn: () => apiClient.listArticles({ pageSize: 50 })
  });

  const grouped = columns.map((column) => ({
    column,
    items: data?.data.filter((article) => article.status === column.status) ?? []
  }));

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Review queue</h1>
        <p className="text-sm text-muted-foreground">
          Drag cards as you review drafts, request changes, or approve stories for publishing.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        {grouped.map(({ column, items }) => (
          <div key={column.status} className="flex h-full flex-col rounded-xl border bg-white">
            <div className="border-b p-4">
              <h2 className="font-semibold">{column.title}</h2>
            </div>
            <div className="flex-1 space-y-3 p-4">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">No articles in this state.</p>
              )}
              {items.map((article) => (
                <article key={article.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium leading-tight">{article.title}</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(article.updatedAt)}</p>
                    </div>
                    <Badge variant="outline">{article.section}</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Author: {article.authorId}</span>
                    <span>Editor: {article.editorId ?? '—'}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      Request changes
                    </Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
