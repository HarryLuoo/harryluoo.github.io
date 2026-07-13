import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fail = (message) => { throw new Error(message); };

const filesBelow = async (root) => {
  const files = [];
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(path);
      else fail(`Unsupported production artifact: ${relative(root, path)}`);
    }
  };
  await visit(root);
  return files.sort();
};

const assertFile = async (path, label) => {
  try {
    if (!(await stat(path)).isFile()) fail(`${label} is not a file`);
  } catch (error) {
    if (error?.code === 'ENOENT') fail(`Missing ${label}`);
    throw error;
  }
};

const collectUploadPaths = (value, output = new Set()) => {
  if (typeof value === 'string' && value.startsWith('/uploads/')) output.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectUploadPaths(item, output));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectUploadPaths(item, output));
  return output;
};

const htmlEscaped = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const distinctiveArticleLine = (body, name) => {
  const candidates = body.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('$$'))
    .sort((a, b) => b.length - a.length);
  if (!candidates[0]) fail(`Article ${name} has no stable distinctive text`);
  return candidates[0];
};

export const smokeArtifacts = async (projectRoot, site, discovery) => {
  const distRoot = join(projectRoot, 'dist');
  await assertFile(join(distRoot, 'index.html'), 'dist/index.html');
  await assertFile(join(distRoot, 'robots.txt'), 'dist/robots.txt');
  await assertFile(join(distRoot, 'sitemap.xml'), 'dist/sitemap.xml');

  const files = await filesBelow(distRoot);
  const relativeFiles = files.map((path) => relative(distRoot, path).split(sep).join('/'));
  const scripts = relativeFiles.filter((path) => extname(path) === '.js');
  const styles = relativeFiles.filter((path) => extname(path) === '.css');
  if (scripts.length !== 1) fail(`Expected one public JavaScript entry, found ${scripts.length}`);
  if (styles.length !== 1) fail(`Expected one public CSS entry, found ${styles.length}`);

  const forbiddenFiles = relativeFiles.filter((path) => path === 'studio.html' || path.endsWith('.md') || path === 'content/site.json');
  if (forbiddenFiles.length) fail(`Forbidden production files: ${forbiddenFiles.join(', ')}`);

  const bundleText = (await Promise.all(
    files
      .filter((path) => ['.html', '.js', '.css'].includes(extname(path)))
      .map((path) => readFile(path, 'utf8')),
  )).join('\n');
  for (const marker of ['Portfolio Studio', 'Local saved-disk editor', '/api/snapshot', '/api/publish', 'studio/server.mjs']) {
    if (bundleText.includes(marker)) fail(`Studio/API source leaked into production: ${marker}`);
  }

  for (const uploadPath of [...collectUploadPaths(site)].sort()) {
    const relativeUpload = uploadPath.replace(/^\//, '');
    const source = resolve(projectRoot, 'public', relativeUpload);
    const built = resolve(distRoot, relativeUpload);
    const sourcePrefix = `${resolve(projectRoot, 'public')}${sep}`;
    const builtPrefix = `${distRoot}${sep}`;
    if (!source.startsWith(sourcePrefix) || !built.startsWith(builtPrefix)) fail(`Unsafe upload expectation: ${uploadPath}`);
    await assertFile(source, `source ${uploadPath}`);
    await assertFile(built, `built ${uploadPath}`);
    if (sha256(await readFile(source)) !== sha256(await readFile(built))) fail(`Built upload differs from source: ${uploadPath}`);
  }

  const visibleEntities = [
    ...site.research.papers.filter((item) => item.visible).map((item) => ({ namespace: 'research', ...item })),
    ...site.projects.items.filter((item) => item.visible).map((item) => ({ namespace: 'projects', ...item })),
    ...site.garden.posts.filter((item) => item.visible).map((item) => ({ namespace: 'garden', ...item })),
  ];
  if (visibleEntities.length !== 7) fail(`Expected seven visible detail routes, found ${visibleEntities.length}`);
  for (const entity of visibleEntities) {
    if (!bundleText.includes(entity.slug) || !bundleText.includes(entity.title)) {
      fail(`Built bundle is missing ${entity.namespace}/${entity.slug}`);
    }
  }

  for (const marker of ['/about', site.about.background.text, site.about.currentWork.text]) {
    if (!bundleText.includes(marker)) fail(`Built bundle is missing About marker: ${marker}`);
  }

  const articleRoot = join(projectRoot, 'content', 'articles');
  const articleNames = (await readdir(articleRoot)).filter((name) => name.endsWith('.md')).sort();
  if (articleNames.length !== 2) fail(`Expected two canonical articles, found ${articleNames.length}`);
  for (const name of articleNames) {
    const body = await readFile(join(articleRoot, name), 'utf8');
    const marker = distinctiveArticleLine(body, name);
    if (!bundleText.includes(marker)) fail(`Built bundle is missing distinctive article text for ${name}`);
  }

  for (const marker of ['Page not found', 'Research item not found', 'Project not found', 'Garden post not found']) {
    if (!bundleText.includes(marker)) fail(`Built bundle is missing recovery state: ${marker}`);
  }

  const indexHtml = await readFile(join(distRoot, 'index.html'), 'utf8');
  const requiredHead = [
    `<title>${htmlEscaped(site.seo.defaultTitle)}</title>`,
    `name="description" content="${htmlEscaped(site.seo.defaultDescription)}"`,
    `name="robots" content="${site.seo.robots.index ? 'index' : 'noindex'}, ${site.seo.robots.follow ? 'follow' : 'nofollow'}"`,
    `rel="canonical" href="${htmlEscaped(`${site.seo.siteUrl.replace(/\/$/, '')}/`)}"`,
  ];
  requiredHead.forEach((marker) => { if (!indexHtml.includes(marker)) fail(`Built head is missing ${marker}`); });

  if (await readFile(join(distRoot, 'robots.txt'), 'utf8') !== discovery.robots) fail('robots.txt differs from validated authority');
  if (await readFile(join(distRoot, 'sitemap.xml'), 'utf8') !== discovery.sitemap) fail('sitemap.xml differs from validated authority');
};
