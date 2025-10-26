import { z } from 'zod';

export const RoleSchema = z.enum(['REPORTER', 'EDITOR', 'PUBLISHER', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

export const StatusSchema = z.enum([
  'DRAFT',
  'IN_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED'
]);
export type Status = z.infer<typeof StatusSchema>;

export const SubmissionStatusSchema = z.enum([
  'NEW',
  'TRIAGED',
  'PROMOTED',
  'REJECTED'
]);
export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

export const LanguageSchema = z.enum(['en', 'hi']);
export type Language = z.infer<typeof LanguageSchema>;

export const ArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  body: z.any(),
  excerpt: z.string().optional(),
  status: StatusSchema,
  section: z.string(),
  lang: LanguageSchema,
  tags: z.array(z.string()),
  location: z.string().optional(),
  authorId: z.string(),
  author: z
    .object({ id: z.string(), name: z.string().optional() })
    .optional(),
  editorId: z.string().nullable(),
  heroImageId: z.string().nullable(),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
  publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true })
});
export type Article = z.infer<typeof ArticleSchema>;

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20)
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const ArticleListQuerySchema = PaginationSchema.extend({
  status: StatusSchema.optional(),
  section: z.string().optional(),
  authorId: z.string().optional(),
  q: z.string().optional()
});
export type ArticleListQuery = z.infer<typeof ArticleListQuerySchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: RoleSchema
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const HomepageSlotSchema = z.object({
  slot: z.number().int().min(1).max(8),
  article: Article.nullable(),
  override: z.boolean().default(false)
});
export type HomepageSlot = z.infer<typeof HomepageSlotSchema>;

export const CitizenSubmissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.any(),
  location: z.string().optional(),
  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional()
  }),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  media: z.array(z.string()).default([]),
  status: SubmissionStatusSchema,
  rejectionReason: z.string().optional(),
  verification: z.string().optional(),
  createdAt: z.string().datetime({ offset: true })
});
export type CitizenSubmission = z.infer<typeof CitizenSubmissionSchema>;

export interface ApiClientOptions {
  baseUrl?: string;
  getToken?: () => Promise<string | undefined>;
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions = {}) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    const token = await this.options.getToken?.();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(`${this.options.baseUrl ?? ''}${path}`, {
      ...init,
      headers
    });
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }
    return (await response.json()) as T;
  }

  listArticles(query: Partial<ArticleListQuery> = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      params.set(key, String(value));
    });
    const qs = params.toString();
    return this.request<{ data: Article[]; total: number }>(
      `/articles${qs ? `?${qs}` : ''}`
    );
  }

  getArticle(id: string) {
    return this.request<Article>(`/articles/${id}`);
  }

  submitCitizenStory(payload: {
    title: string;
    body: string;
    location?: string;
    contact: { email?: string; phone?: string };
    media?: string[];
  }) {
    return this.request<CitizenSubmission>('/citizen/submit', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        location: payload.location,
        email: payload.contact.email,
        phone: payload.contact.phone,
        media: payload.media
      })
    });
  }

  listSubmissions() {
    return this.request<{ data: CitizenSubmission[] }>('/citizen/submissions');
  }

  triageSubmission(id: string) {
    return this.request<CitizenSubmission>(`/citizen/${id}/triage`, { method: 'POST' });
  }

  rejectSubmission(id: string, reason: string) {
    return this.request<CitizenSubmission>(`/citizen/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  promoteSubmission(id: string) {
    return this.request<Article>(`/citizen/${id}/promote`, { method: 'POST' });
  }
}

export type PresignRequest = {
  mime: string;
  size: number;
  ext: string;
};

export type PresignResponse = {
  uploadUrl: string;
  cdnUrl: string;
  assetId: string;
  headers: Record<string, string>;
};

export interface PresignedUploadResult {
  cdnUrl: string;
  assetId: string;
}
