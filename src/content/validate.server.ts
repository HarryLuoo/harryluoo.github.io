// @ts-nocheck -- Vite executes this Node-only module while loading its config.
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
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
      : site.garden.posts;
  return entities.find((entity: any) => entity.slug === slug);
};

const collectUploadReferences = (site: any) => {
  const values = [
    site.shell.cvUpload,
    site.seo.faviconUpload,
    site.seo.socialImageUpload,
    site.home.featured.imageOverrideUpload,
    ...site.home.recent.manualEntries.map((entry: any) => entry.imageUpload),
    ...site.research.papers.map((paper: any) => paper.pdfUpload),
    ...site.projects.items.map((project: any) => project.imageUpload),
    ...site.garden.posts.map((post: any) => post.pdfUpload),
  ];
  return values.filter(Boolean);
};

const collectArticleReferences = (site: any) => [
  ...site.research.papers.map((paper: any) => paper.articleSlug),
  ...site.projects.items.map((project: any) => project.articleSlug),
  ...site.garden.posts.map((post: any) => post.articleSlug),
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
  ensureUnique(site.garden.posts.map((entity) => entity.slug), 'post slug');
  ensureUnique(site.shell.navigation.map((item) => item.id), 'navigation id');
  ensureUnique(site.shell.socials.map((item) => item.platform), 'social platform');

  const allowedTags = new Set(site.tags);
  const taggedEntities = [
    ...site.research.papers,
    ...site.projects.items,
    ...site.garden.posts,
  ];
  taggedEntities.forEach((entity) => entity.tags.forEach((tag) => {
    if (!allowedTags.has(tag)) fail(`Unknown tag "${tag}" on ${entity.slug}`);
  }));

  const placements = [
    ...(site.home.featured.visible ? [site.home.featured] : []),
    ...(site.home.recent.mode === 'auto' ? site.home.recent.automaticEntries : []),
  ];
  placements.forEach((placement) => {
    const entity = getEntity(site, placement.entityType, placement.slug);
    if (!entity || !entity.visible) {
      fail(`Invalid ${placement.entityType} placement: ${placement.slug}`);
    }
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

const cloneValue = (value: unknown) => JSON.parse(JSON.stringify(value));

export const runValidationProbes = (projectRoot: string) => {
  const source = validateProjectContent(projectRoot);
  const cases = [
    {
      name: 'schema-extra-key',
      mutate: (site: any) => { site.unexpected = true; },
    },
    {
      name: 'unsafe-path',
      mutate: (site: any) => { site.shell.cvUpload = '/uploads/../secret.pdf'; },
    },
    {
      name: 'duplicate-slug',
      mutate: (site: any) => { site.projects.items[1].slug = site.projects.items[0].slug; },
    },
    {
      name: 'unknown-tag',
      mutate: (site: any) => { site.projects.items[0].tags[0] = 'Unknown Tag'; },
    },
    {
      name: 'invalid-placement',
      mutate: (site: any) => { site.home.featured.slug = 'missing-paper'; },
    },
    {
      name: 'missing-article-reference',
      mutate: (site: any) => { site.garden.posts[0].articleSlug = 'missing-article'; },
    },
    {
      name: 'missing-upload',
      mutate: (site: any) => { site.shell.cvUpload = '/uploads/missing-cv.pdf'; },
    },
  ];

  for (const probe of cases) {
    const tempRoot = mkdtempSync(join(tmpdir(), 'harry-loop1-validation-'));
    try {
      cpSync(join(projectRoot, 'content'), join(tempRoot, 'content'), { recursive: true });
      cpSync(join(projectRoot, 'public'), join(tempRoot, 'public'), { recursive: true });
      const mutated = cloneValue(source);
      probe.mutate(mutated);
      writeFileSync(join(tempRoot, 'content', 'site.json'), `${JSON.stringify(mutated, null, 2)}\n`);
      let failed = false;
      try {
        validateProjectContent(tempRoot);
      } catch {
        failed = true;
      }
      if (!failed) fail(`Validation probe did not fail: ${probe.name}`);
      console.log(`[content probe] PASS ${probe.name}`);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  const missingFileRoot = mkdtempSync(join(tmpdir(), 'harry-loop1-validation-'));
  try {
    cpSync(join(projectRoot, 'content'), join(missingFileRoot, 'content'), { recursive: true });
    cpSync(join(projectRoot, 'public'), join(missingFileRoot, 'public'), { recursive: true });
    unlinkSync(join(missingFileRoot, 'content', 'articles', 'brachistochrone.md'));
    let failed = false;
    try {
      validateProjectContent(missingFileRoot);
    } catch {
      failed = true;
    }
    if (!failed) fail('Validation probe did not fail: missing-article-file');
    console.log('[content probe] PASS missing-article-file');
  } finally {
    rmSync(missingFileRoot, { recursive: true, force: true });
  }
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
