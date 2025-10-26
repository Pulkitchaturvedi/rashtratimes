'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toaster';

export default function CitizenSubmitPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [media, setMedia] = useState<string>('');

  const mutation = useMutation({
    mutationFn: (values: any) => apiClient.submitCitizenStory(values),
    onSuccess: () => {
      showToast({ title: 'Submission received', description: 'Our editors will be in touch soon.' });
      router.push('/');
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get('title') as string,
      body: formData.get('body') as string,
      location: formData.get('location') as string,
      contact: {
        email: formData.get('email') as string,
        phone: formData.get('phone') as string
      },
      media: media ? [media] : []
    };
    mutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">Share your story</h1>
        <p className="text-muted-foreground">
          Submit news tips, eyewitness accounts, or leads. Our newsroom will triage and follow up.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input name="title" placeholder="Headline" required />
        <Textarea name="body" placeholder="Describe what happened" required className="min-h-[200px]" />
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="location" placeholder="City / Locality" />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="phone" placeholder="Phone" />
          <Input
            name="media"
            placeholder="Hosted media URL (optional)"
            value={media}
            onChange={(event) => setMedia(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting…' : 'Submit tip'}
        </Button>
      </form>
    </div>
  );
}
