'use client';

import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { PresignRequest, PresignedUploadResult } from '@rt/types';
import { useToast } from '@/components/ui/toaster';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

async function requestPresign(payload: PresignRequest) {
  const response = await fetch(`${API_URL}/media/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to create upload URL');
  }
  return (await response.json()) as {
    uploadUrl: string;
    cdnUrl: string;
    assetId: string;
    headers: Record<string, string>;
  };
}

async function uploadFile(url: string, file: File, headers: Record<string, string>) {
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: file
  });
  if (!response.ok) {
    throw new Error('Upload failed');
  }
}

export function usePresignedUpload() {
  const { showToast } = useToast();

  const mutation = useMutation<PresignedUploadResult, Error, File>({
    mutationFn: async (file: File) => {
      const payload: PresignRequest = {
        mime: file.type,
        size: file.size,
        ext: file.name.split('.').pop() ?? ''
      };
      const { uploadUrl, headers, cdnUrl, assetId } = await requestPresign(payload);
      await uploadFile(uploadUrl, file, headers);
      return { cdnUrl, assetId };
    },
    onError: (error) => {
      showToast({ title: 'Upload failed', description: error.message });
    },
    onSuccess: () => {
      showToast({ title: 'Upload complete' });
    }
  });

  const handleUpload = useCallback(
    async (file: File) => {
      return mutation.mutateAsync(file);
    },
    [mutation]
  );

  return {
    upload: handleUpload,
    ...mutation
  };
}
