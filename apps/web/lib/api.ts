import { ApiClient } from '@rt/types';

export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
  getToken: async () =>
    typeof window !== 'undefined' ? sessionStorage.getItem('rt.token') ?? undefined : undefined
});
