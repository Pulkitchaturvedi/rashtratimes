'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toaster';
import { RoleSchema } from '@rt/types';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      email: formData.get('email')?.toString() ?? '',
      password: formData.get('password')?.toString() ?? ''
    };

    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      showToast({ title: 'Invalid credentials', description: parsed.error.message });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/internal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      if (!response.ok) {
        throw new Error('Invalid login');
      }
      const payload = await response.json();
      const role = RoleSchema.parse(payload.role);
      sessionStorage.setItem('rt.token', payload.access_token);
      sessionStorage.setItem('rt.role', role);
      router.replace('/dashboard');
    } catch (error) {
      showToast({ title: 'Login failed', description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access the RashtraTimes newsroom tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email
              <Input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Password
              <Input name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
            </label>
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
