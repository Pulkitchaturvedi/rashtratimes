'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MediaDropzone } from '@/components/media-dropzone';

export default function EditorPage() {
  const params = useParams();
  const articleId = params?.id as string;
  const { data } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => apiClient.getArticle(articleId),
    enabled: Boolean(articleId)
  });
  const [hero, setHero] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Compose story</h1>
          <p className="text-sm text-muted-foreground">
            Collaborate in real-time and manage the workflow lifecycle.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Save draft</Button>
          <Button>Submit for review</Button>
        </div>
      </header>
      <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Input defaultValue={data?.title} placeholder="Headline" className="text-2xl font-semibold" />
          <Textarea
            defaultValue={typeof data?.body === 'string' ? data.body : JSON.stringify(data?.body ?? '', null, 2)}
            className="min-h-[400px]"
            placeholder="Start writing your story…"
          />
        </div>
        <aside className="space-y-6">
          <div className="space-y-4 rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Hero media</h2>
            <MediaDropzone
              onUploaded={(result) => {
                setHero(result.cdnUrl);
              }}
            />
            {hero && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Preview</p>
                <img src={hero} alt="Hero media" className="w-full rounded-lg border object-cover" />
              </div>
            )}
          </div>
          <div className="space-y-4 rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Metadata</h2>
            <Input placeholder="Section (e.g. Politics)" defaultValue={data?.section} />
            <Input placeholder="Tags" defaultValue={data?.tags.join(', ')} />
            <Input placeholder="Location" defaultValue={data?.location ?? ''} />
          </div>
        </aside>
      </section>
    </div>
  );
}
