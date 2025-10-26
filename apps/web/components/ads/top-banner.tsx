'use client';

import { useEffect, useRef } from 'react';

export interface AdProps {
  unitId?: string;
  enabled?: boolean;
}

export function TopBanner({ unitId, enabled = true }: AdProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !unitId) return;
    ref.current?.setAttribute('data-ad-unit', unitId);
  }, [unitId, enabled]);

  return (
    <div
      ref={ref}
      className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted text-xs uppercase text-muted-foreground"
      aria-hidden
    >
      {enabled ? 'Top banner ad slot reserved' : 'Ad disabled'}
    </div>
  );
}
