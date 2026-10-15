// @ts-nocheck -- Vite executes this Node-only module while loading its config.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { siteSchema } from './schema';

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentValidationError';
  }
}

const fail = (message: string): never => {
  throw new ContentValidationError(message);
};

const ensureUnique = (values: string[], label: string) => {
  const seen = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value)) fail(`Duplicate ${label}: ${value}`);
    seen.add(value);
  });
};

const getEntity = (site: any, type: string, slug: string) => {
  const entities = type === 'paper'
    ? site.research.papers
    : type === 'project'
      ? site.projects.items
      : site.notes.posts;
  return entities.find((entity: any) => entity.slug === slug);
};

const collectUploadReferences = (site: any) => {
  const values = [
    site.shell.cvUpload,
    site.seo.faviconUpload,
    site.seo.socialImageUpload,
    site.home.featured.imageOverrideUpload,
    ...site.about.background.figures.map((figure: any) => figure.upload),
    ...site.about.interests.figures.map((figure: any) => figure.upload),
    ...site.research.papers.map((paper: any) => paper.pdfUpload),
    ...site.projects.items.map((project: any) => project.imageUpload),
    ...site.notes.posts.map((post: any) => post.pdfUpload),
  ];
  return values.filter(Boolean);
};

const collectArticleReferences = (site: any) => [
  ...site.research.papers.map((paper: any) => paper.articleSlug),
  ...site.projects.items.map((project: any) => project.articleSlug),
  ...site.notes.posts.map((post: any) => post.articleSlug),
].filter(Boolean);

const resolveInside = (root: string, relativePath: string, label: string) => {
  const candidate = resolve(root, relativePath);
  const prefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (!candidate.startsWith(prefix)) fail(`Unsafe ${label}: ${relativePath}`);
  return candidate;
};

export const validateSiteCandidate = (projectRoot: string, raw: unknown) => {
  const parsed = siteSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
      .join('\n');
    fail(`Content schema validation failed:\n${details}`);
  }

  const site = parsed.data;
  ensureUnique(site.tags, 'tag');
  ensureUnique(site.research.papers.map((entity) => entity.slug), 'paper slug');
  ensureUnique(site.projects.items.map((entity) => entity.slug), 'project slug');
  ensureUnique(site.notes.posts.map((entity) => entity.slug), 'post slug');
  ensureUnique(site.shell.navigation.map((item) => item.id), 'navigation id');
  ensureUnique(site.shell.socials.map((item) => item.platform), 'social platform');

  const allowedTags = new Set(site.tags);
  const taggedEntities = [
    ...site.research.papers,
    ...site.projects.items,
    ...site.notes.posts,
  ];
  taggedEntities.forEach((entity) => entity.tags.forEach((tag) => {
    if (!allowedTags.has(tag)) fail(`Unknown tag "${tag}" on ${entity.slug}`);
  }));

  if (site.home.featured.visible) {
    const placement = site.home.featured;
    const entity = getEntity(site, placement.entityType, placement.slug);
    if (!entity || !entity.visible) {
      fail(`Invalid ${placement.entityType} placement: ${placement.slug}`);
    }
  }

  site.about.news.forEach((entry) => {
    const match = entry.link?.match(/^\/(research|projects|notes)\/([a-z0-9-]+)$/);
    if (!match) return;
    const type = match[1] === 'research' ? 'paper' : match[1] === 'projects' ? 'project' : 'post';
    const entity = getEntity(site, type, match[2]);
    if (!entity || !entity.visible) fail(`News link points at a missing or hidden ${type}: ${entry.link}`);
  });

  const articlesRoot = join(projectRoot, 'content', 'articles');
  collectArticleReferences(site).forEach((articleSlug) => {
    const articlePath = resolveInside(articlesRoot, `${articleSlug}.md`, 'article reference');
    if (!existsSync(articlePath)) fail(`Missing article file for reference: ${articleSlug}`);
  });

  const publicRoot = join(projectRoot, 'public');
  collectUploadReferences(site).forEach((uploadPath) => {
    const assetPath = resolveInside(publicRoot, uploadPath.replace(/^\//, ''), 'upload reference');
    if (!existsSync(assetPath)) fail(`Missing referenced upload: ${uploadPath}`);
  });

  return site;
};

export const validateProjectContent = (projectRoot: string) => {
  const sitePath = join(projectRoot, 'content', 'site.json');
  if (!existsSync(sitePath)) fail(`Missing structured content: ${sitePath}`);

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(sitePath, 'utf8'));
  } catch (error) {
    fail(`Invalid JSON in ${sitePath}: ${String(error)}`);
  }
  return validateSiteCandidate(projectRoot, raw);
};

export const discoveryFiles = (site: ReturnType<typeof validateProjectContent>) => {
  const siteUrl = site.seo.siteUrl.replace(/\/$/, '');
  const robots = [
    'User-agent: *',
    site.seo.robots.index ? 'Allow: /' : 'Disallow: /',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${siteUrl}/</loc></url>`,
    '</urlset>',
    '',
  ].join('\n');
  return { robots, sitemap };
};
