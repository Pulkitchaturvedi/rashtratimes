'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Role } from '@rt/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/editor', label: 'Editor' },
  { href: '/review', label: 'Review' },
  { href: '/citizen/triage', label: 'Triage' },
  { href: '/ads', label: 'Ads' }
];

export function StaffShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedRole = sessionStorage.getItem('rt.role') as Role | null;
    if (!storedRole) {
      router.replace('/login');
      return;
    }
    setRole(storedRole);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('rt.role');
    sessionStorage.removeItem('rt.token');
    router.replace('/login');
  };

  if (!role) {
    return <div className="flex h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold">RashtraTimes</p>
            <p className="text-xs text-muted-foreground">Role: {role}</p>
          </div>
          <nav className="flex items-center gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium text-muted-foreground transition hover:text-primary',
                  pathname === item.href && 'text-primary'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
