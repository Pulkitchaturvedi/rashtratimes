'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdsManagementPage() {
  const [enabled, setEnabled] = useState({ top: true, inline: true, sticky: false });
  const [tags, setTags] = useState({ top: '', inline: '', sticky: '' });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Ad placements</h1>
        <p className="text-sm text-muted-foreground">
          Configure Google Ad Manager unit IDs and toggle individual slots without code deploys.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {(
          [
            { key: 'top', label: 'Top banner' },
            { key: 'inline', label: 'Inline article' },
            { key: 'sticky', label: 'Sticky footer' }
          ] as const
        ).map((placement) => (
          <Card key={placement.key}>
            <CardHeader>
              <CardTitle>{placement.label}</CardTitle>
              <CardDescription>Reserve space to prevent layout shifts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={enabled[placement.key]}
                  onChange={(event) =>
                    setEnabled((state) => ({ ...state, [placement.key]: event.target.checked }))
                  }
                />
                Enable placement
              </label>
              <Input
                placeholder="GAM unit ID"
                value={tags[placement.key]}
                onChange={(event) => setTags((state) => ({ ...state, [placement.key]: event.target.value }))}
              />
              <Button variant="outline" size="sm">
                Save configuration
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
