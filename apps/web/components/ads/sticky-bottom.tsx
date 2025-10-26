'use client';

import { useEffect, useRef } from 'react';
import type { AdProps } from './top-banner';

export function StickyBottomAd({ unitId, enabled = true }: AdProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !unitId) return;
    ref.current?.setAttribute('data-ad-unit', unitId);
  }, [unitId, enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 bottom-0 z-40 flex h-20 items-center justify-center bg-background/95 shadow-lg backdrop-blur"
      aria-label="Sponsored message"
      role="presentation"
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">Sticky ad reserved space</span>
    </div>
  );
}
