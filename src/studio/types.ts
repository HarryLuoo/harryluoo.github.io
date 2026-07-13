import type { SiteContent } from '../content/schema';

export interface Usage {
  area: string;
  slug: string | null;
  field: string;
  label: string;
}

export interface ArticleSnapshot {
  slug: string;
  body: string;
  revision: string;
  usage: Usage[];
}

export interface UploadSnapshot {
  name: string;
  path: string;
  size: number;
  revision: string;
  usage: Usage[];
}

export interface StudioSnapshot {
  site: { content: SiteContent; revision: string };
  articles: ArticleSnapshot[];
  uploads: UploadSnapshot[];
}

export interface PublishStatus {
  fingerprint: string;
  verification: { state: 'not-verified' | 'fresh' | 'stale'; verifiedAt: string | null };
  branch: string | null;
  head: string | null;
  upstream: string | null;
  blockers: string[];
  allowedChanges: Array<{ path: string; status: string }>;
  diff: { text: string; truncated: boolean; bytes: number; lines: number };
  uploads: Array<{ path: string; status: string; size: number | null }>;
  pendingPush: { commitSha: string } | null;
}

export type StudioArea = 'Shell' | 'Home' | 'About' | 'Research' | 'Projects' | 'Garden' | 'Articles' | 'Uploads' | 'SEO' | 'Verify/Publish';
