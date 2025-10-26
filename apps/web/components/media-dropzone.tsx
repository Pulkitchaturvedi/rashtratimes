'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePresignedUpload } from '@/hooks/use-presigned-upload';
import { Button } from '@/components/ui/button';

export interface MediaDropzoneProps {
  onUploaded: (result: { cdnUrl: string; assetId: string }) => void;
}

export function MediaDropzone({ onUploaded }: MediaDropzoneProps) {
  const { upload, isPending } = usePresignedUpload();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (files: File[]) => {
      const [file] = files;
      if (!file) return;
      try {
        setError(null);
        const result = await upload(file);
        onUploaded(result);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [upload, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': [],
      'video/mp4': []
    }
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? 'Drop the file here …' : 'Drag and drop or click to upload hero media'}
        </p>
        <Button type="button" variant="outline" className="mt-4" disabled={isPending}>
          {isPending ? 'Uploading…' : 'Select file'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
