'use client';

import { useEffect, useRef } from 'react';
import type { AdProps } from './top-banner';

export function InlineArticleAd({ unitId, enabled = true }: AdProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !unitId) return;
    ref.current?.setAttribute('data-ad-unit', unitId);
  }, [unitId, enabled]);

  return (
    <div
      ref={ref}
      className="my-6 flex min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted text-xs uppercase text-muted-foreground"
      aria-hidden
    >
      {enabled ? 'Inline article ad slot' : 'Ad disabled'}
    </div>
  );
}
