'use client';

import { Role } from '@rt/types';
import { useEffect, useState } from 'react';

export function useRole() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('rt.role') as Role | null;
    setRole(stored);
  }, []);

  return role;
}
