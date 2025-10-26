'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export function DashboardOverview() {
  const { data } = useQuery({
    queryKey: ['dashboard', 'articles'],
    queryFn: () => apiClient.listArticles({ pageSize: 5 })
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Latest activity</CardTitle>
          <CardDescription>Recent drafts and publishes across the newsroom.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data?.data.map((article) => (
            <div key={article.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{article.title}</p>
                <span className="text-xs uppercase text-muted-foreground">{article.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Updated {formatDate(article.updatedAt)} · {article.section}
              </p>
            </div>
          )) || <p className="text-sm text-muted-foreground">No articles yet.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Citizen reports</CardTitle>
          <CardDescription>Latest community submissions awaiting triage.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Head to the triage board to review fresh leads and promote them into drafts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
