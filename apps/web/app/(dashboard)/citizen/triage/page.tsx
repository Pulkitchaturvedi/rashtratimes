'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/toaster';

const risks = ['low', 'medium', 'high'] as const;

function getRiskBadge(index: number) {
  const value = risks[index % risks.length];
  return value === 'high' ? 'destructive' : value === 'medium' ? 'secondary' : 'outline';
}

export default function CitizenTriagePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const triageMutation = useMutation({
    mutationFn: (id: string) => apiClient.triageSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen', 'submissions'] });
      showToast({ title: 'Submission triaged' });
    }
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => apiClient.rejectSubmission(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen', 'submissions'] });
      showToast({ title: 'Submission rejected' });
    }
  });
  const promoteMutation = useMutation({
    mutationFn: (id: string) => apiClient.promoteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen', 'submissions'] });
      showToast({ title: 'Promoted to draft' });
    }
  });
  const { data } = useQuery({
    queryKey: ['citizen', 'submissions'],
    queryFn: () => apiClient.listSubmissions()
  });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Citizen desk triage</h1>
        <p className="text-sm text-muted-foreground">
          Review incoming tips from the community, assign risk, and promote promising stories.
        </p>
      </header>
      <div className="space-y-4">
        {(data?.data ?? []).map((submission, index) => (
          <article key={submission.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{submission.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{submission.body}</p>
                {submission.rejectionReason && (
                  <p className="mt-2 text-xs text-destructive">Rejected: {submission.rejectionReason}</p>
                )}
                <div className="mt-3 text-xs uppercase text-muted-foreground">
                  <span>Location: {submission.location ?? 'Unknown'}</span>
                  <span className="ml-3">Contact: {submission.contactEmail ?? submission.contactPhone}</span>
                </div>
              </div>
              <Badge variant={getRiskBadge(index)}>Risk: {risks[index % risks.length]}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => triageMutation.mutate(submission.id)}
              >
                Mark triaged
              </Button>
              <Button size="sm" onClick={() => promoteMutation.mutate(submission.id)}>Promote to draft</Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => rejectMutation.mutate({ id: submission.id, reason: 'Not suitable' })}
              >
                Reject
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
