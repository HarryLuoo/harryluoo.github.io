import type { SiteContent } from '../content/schema';
import type { PublishStatus, StudioSnapshot } from './types';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: init?.body ? { 'content-type': 'application/json', ...init.headers } : init?.headers,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, payload.error || `Request failed (${response.status})`, payload.details);
  return payload as T;
};

export const studioApi = {
  snapshot: () => request<StudioSnapshot>('/api/snapshot'),
  saveSite: (content: SiteContent, expectedRevision: string) => request<{ revision: string }>('/api/site', {
    method: 'PUT',
    body: JSON.stringify({ content, expectedRevision }),
  }),
  createArticle: (slug: string, body: string) => request<{ revision: string }>('/api/articles', {
    method: 'POST',
    body: JSON.stringify({ slug, body, expectedRevision: null }),
  }),
  updateArticle: (slug: string, body: string, expectedRevision: string) => request<{ revision: string }>(`/api/articles/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify({ body, expectedRevision }),
  }),
  deleteArticle: (slug: string, expectedRevision: string) => request<{ revision: null; exists: false }>(`/api/articles/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    body: JSON.stringify({ expectedRevision }),
  }),
  createUpload: (name: string, base64: string) => request<{ revision: string }>('/api/uploads', {
    method: 'POST',
    body: JSON.stringify({ name, base64, expectedRevision: null }),
  }),
  replaceUpload: (name: string, base64: string, expectedRevision: string) => request<{ revision: string }>(`/api/uploads/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: JSON.stringify({ base64, expectedRevision }),
  }),
  deleteUpload: (name: string, expectedRevision: string) => request<{ revision: null; exists: false }>(`/api/uploads/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    body: JSON.stringify({ expectedRevision }),
  }),
  publishStatus: () => request<PublishStatus>('/api/publish/status'),
  verify: () => request<{ status: 'Verified'; verifiedAt: string; fingerprint: string; logs: string[] }>('/api/verify', {
    method: 'POST',
    body: JSON.stringify({}),
  }),
  publish: (commitMessage: string, confirmedFingerprint: string) => request<{ status: 'Pushed' | 'Committed; push failed'; commitSha: string }>('/api/publish', {
    method: 'POST',
    body: JSON.stringify({ commitMessage, confirmedFingerprint, confirmed: true }),
  }),
  retryPush: (pendingCommitSha: string) => request<{ status: 'Pushed'; commitSha: string }>('/api/publish/retry', {
    method: 'POST',
    body: JSON.stringify({ pendingCommitSha }),
  }),
};
