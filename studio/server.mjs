import { createHash, randomBytes } from 'node:crypto';
import { createServer as createHttpServer } from 'node:http';
import { open, readFile, readdir, rename, stat, unlink } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import {
  PublishError,
  createVerificationToken,
  publicStatus,
  publishVerified,
  readPublishStatus,
  retryPendingPush,
  validateCommitMessage,
} from '../scripts/publish.mjs';
import { verifyProject } from '../scripts/verify.mjs';

const HOST = '127.0.0.1';
const PORT = 8787;
const STUDIO_ORIGIN = 'http://127.0.0.1:8080';
const JSON_LIMIT = 1024 * 1024;
const UPLOAD_REQUEST_LIMIT = 28 * 1024 * 1024;
const UPLOAD_DECODED_LIMIT = 20 * 1024 * 1024;
const REVISION_PATTERN = /^[a-f0-9]{64}$/;
const ARTICLE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UPLOAD_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._ ()-]*\.(?:pdf|png|jpe?g|webp)$/i;
const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = resolve(process.env.STUDIO_PROJECT_ROOT || sourceRoot);
const sitePath = join(projectRoot, 'content', 'site.json');
const articlesDir = join(projectRoot, 'content', 'articles');
const uploadsDir = join(projectRoot, 'public', 'uploads');

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const moduleLoader = await createViteServer({
  root: sourceRoot,
  configFile: false,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const validator = await moduleLoader.ssrLoadModule('/src/content/validate.server.ts');

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const revisionOf = async (path) => sha256(await readFile(path));
const exists = async (path) => {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
};

const send = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  res.end(body);
};

const exactKeys = (value, allowed, required = allowed) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Expected a JSON object');
  }
  const keys = Object.keys(value);
  const extras = keys.filter((key) => !allowed.includes(key));
  const missing = required.filter((key) => !keys.includes(key));
  if (extras.length || missing.length) {
    throw new HttpError(400, 'Unexpected request shape', { extras, missing });
  }
  return value;
};

const readJson = async (req, limit) => {
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'Content-Type must be application/json');
  }
  const declared = Number(req.headers['content-length'] || 0);
  if (declared > limit) throw new HttpError(413, 'Request body is too large');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'Request body is too large');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Malformed JSON');
  }
};

const requireOrigin = (req) => {
  if (req.headers.origin !== STUDIO_ORIGIN) {
    throw new HttpError(403, 'Mutations require the Studio origin');
  }
};

const requireRevision = (value, { allowNull = false } = {}) => {
  if (allowNull && value === null) return null;
  if (typeof value !== 'string' || !REVISION_PATTERN.test(value)) {
    throw new HttpError(400, 'Expected a lowercase SHA-256 revision');
  }
  return value;
};

const safeArticleSlug = (raw) => {
  let slug;
  try { slug = decodeURIComponent(raw); } catch { throw new HttpError(400, 'Invalid article slug encoding'); }
  if (!ARTICLE_SLUG_PATTERN.test(slug) || slug.includes('%')) throw new HttpError(400, 'Unsafe article slug');
  return slug;
};

const safeUploadName = (raw) => {
  let name;
  try { name = decodeURIComponent(raw); } catch { throw new HttpError(400, 'Invalid upload name encoding'); }
  if (!UPLOAD_NAME_PATTERN.test(name) || name.includes('%') || name.includes('/') || name.includes('\\') || basename(name) !== name) {
    throw new HttpError(400, 'Unsafe upload name');
  }
  const extension = extname(name).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) throw new HttpError(400, 'Unsupported upload extension');
  return name;
};

const atomicWrite = async (target, bytes) => {
  const temp = join(dirname(target), `.${basename(target)}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`);
  let handle;
  try {
    handle = await open(temp, 'wx', 0o600);
    await handle.writeFile(bytes);
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temp, target);
  } catch (error) {
    try { await handle?.close(); } catch {}
    try { await unlink(temp); } catch {}
    throw error;
  }
};

const assertExpectedRevision = async (target, expectedRevision, operation) => {
  const present = await exists(target);
  if (expectedRevision === null) {
    if (present) throw new HttpError(409, `${operation} collides with an existing file`, { currentRevision: await revisionOf(target) });
    return;
  }
  if (!present) throw new HttpError(409, `${operation} target no longer exists`, { currentRevision: null });
  const currentRevision = await revisionOf(target);
  if (currentRevision !== expectedRevision) {
    throw new HttpError(409, `${operation} revision conflict`, { currentRevision });
  }
};

const strictBase64 = (value) => {
  if (typeof value !== 'string' || value.length === 0 || value.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new HttpError(400, 'Malformed base64 upload');
  }
  const bytes = Buffer.from(value, 'base64');
  if (bytes.length > UPLOAD_DECODED_LIMIT) throw new HttpError(413, 'Decoded upload is too large');
  if (bytes.toString('base64') !== value) throw new HttpError(400, 'Malformed base64 upload');
  return bytes;
};

const hasMatchingSignature = (name, bytes) => {
  const extension = extname(name).toLowerCase();
  if (extension === '.pdf') return bytes.subarray(0, 5).toString() === '%PDF-';
  if (extension === '.png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (extension === '.jpg' || extension === '.jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extension === '.webp') return bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  return false;
};

const articleUsage = (site, slug) => {
  const usage = [];
  site.research.papers.forEach((item) => { if (item.articleSlug === slug) usage.push({ area: 'Research', slug: item.slug, field: 'articleSlug', label: item.title }); });
  site.projects.items.forEach((item) => { if (item.articleSlug === slug) usage.push({ area: 'Projects', slug: item.slug, field: 'articleSlug', label: item.title }); });
  site.garden.posts.forEach((item) => { if (item.articleSlug === slug) usage.push({ area: 'Garden', slug: item.slug, field: 'articleSlug', label: item.title }); });
  return usage;
};

const uploadUsage = (site, path) => {
  const usage = [];
  const add = (matches, area, slug, field, label) => { if (matches === path) usage.push({ area, slug, field, label }); };
  add(site.shell.cvUpload, 'Shell', null, 'cvUpload', 'Shared CV');
  add(site.seo.faviconUpload, 'SEO', null, 'faviconUpload', 'Favicon');
  add(site.seo.socialImageUpload, 'SEO', null, 'socialImageUpload', 'Social image');
  add(site.home.featured.imageOverrideUpload, 'Home', null, 'featured.imageOverrideUpload', 'Featured image');
  site.home.recent.manualEntries.forEach((item, index) => add(item.imageUpload, 'Home', null, `recent.manualEntries.${index}.imageUpload`, item.title));
  site.about.background.figures.forEach((item, index) => add(item.upload, 'About', null, `background.figures.${index}.upload`, `Background figure ${index + 1}`));
  site.about.currentWork.figures.forEach((item, index) => add(item.upload, 'About', null, `currentWork.figures.${index}.upload`, `Current Work figure ${index + 1}`));
  site.research.papers.forEach((item) => add(item.pdfUpload, 'Research', item.slug, 'pdfUpload', item.title));
  site.projects.items.forEach((item) => add(item.imageUpload, 'Projects', item.slug, 'imageUpload', item.title));
  site.garden.posts.forEach((item) => add(item.pdfUpload, 'Garden', item.slug, 'pdfUpload', item.title));
  return usage;
};

const readSite = async () => {
  const bytes = await readFile(sitePath);
  let content;
  try { content = JSON.parse(bytes.toString('utf8')); } catch { throw new HttpError(500, 'site.json is not parseable'); }
  const parsed = validator.validateSiteCandidate(projectRoot, content);
  return { bytes, content: parsed, revision: sha256(bytes) };
};

const readSnapshot = async () => {
  const site = await readSite();
  const articleNames = (await readdir(articlesDir)).filter((name) => name.endsWith('.md')).sort();
  const articles = await Promise.all(articleNames.map(async (name) => {
    const bytes = await readFile(join(articlesDir, name));
    const slug = name.slice(0, -3);
    return { slug, body: bytes.toString('utf8'), revision: sha256(bytes), usage: articleUsage(site.content, slug) };
  }));
  const uploadNames = (await readdir(uploadsDir)).filter((name) => SUPPORTED_EXTENSIONS.has(extname(name).toLowerCase())).sort();
  const uploads = await Promise.all(uploadNames.map(async (name) => {
    const bytes = await readFile(join(uploadsDir, name));
    const path = `/uploads/${name}`;
    return { name, path, size: bytes.length, revision: sha256(bytes), usage: uploadUsage(site.content, path) };
  }));
  return { site: { content: site.content, revision: site.revision }, articles, uploads };
};

let mutationTail = Promise.resolve();
let verificationToken = null;
let pendingPush = null;
const enqueueMutation = (operation) => {
  const result = mutationTail.then(operation);
  mutationTail = result.catch(() => undefined);
  return result;
};

const replaceSite = async (payload) => {
  exactKeys(payload, ['content', 'expectedRevision']);
  const expected = requireRevision(payload.expectedRevision);
  await assertExpectedRevision(sitePath, expected, 'Site save');
  const candidate = validator.validateSiteCandidate(projectRoot, payload.content);
  const bytes = Buffer.from(`${JSON.stringify(candidate, null, 2)}\n`);
  if (bytes.length > JSON_LIMIT) throw new HttpError(413, 'Structured content is too large');
  await atomicWrite(sitePath, bytes);
  return { revision: sha256(bytes) };
};

const writeArticle = async (slug, payload, creating) => {
  exactKeys(payload, creating ? ['slug', 'body', 'expectedRevision'] : ['body', 'expectedRevision']);
  if (creating && payload.slug !== slug) throw new HttpError(400, 'Article slug mismatch');
  if (typeof payload.body !== 'string') throw new HttpError(400, 'Article body must be text');
  const bytes = Buffer.from(payload.body);
  if (bytes.length > JSON_LIMIT) throw new HttpError(413, 'Article body is too large');
  const expected = requireRevision(payload.expectedRevision, { allowNull: creating });
  if (creating && expected !== null) throw new HttpError(400, 'Article creation requires expectedRevision null');
  const target = join(articlesDir, `${slug}.md`);
  await assertExpectedRevision(target, expected, creating ? 'Article create' : 'Article update');
  await atomicWrite(target, bytes);
  return { revision: sha256(bytes) };
};

const deleteArticle = async (slug, payload) => {
  exactKeys(payload, ['expectedRevision']);
  const expected = requireRevision(payload.expectedRevision);
  const target = join(articlesDir, `${slug}.md`);
  await assertExpectedRevision(target, expected, 'Article delete');
  const site = (await readSite()).content;
  const usage = articleUsage(site, slug);
  if (usage.length) throw new HttpError(409, 'Referenced article cannot be deleted', { usage });
  await unlink(target);
  return { revision: null, exists: false };
};

const writeUpload = async (name, payload, creating) => {
  exactKeys(payload, creating ? ['name', 'base64', 'expectedRevision'] : ['base64', 'expectedRevision']);
  if (creating && payload.name !== name) throw new HttpError(400, 'Upload name mismatch');
  const bytes = strictBase64(payload.base64);
  if (!hasMatchingSignature(name, bytes)) throw new HttpError(400, 'Upload signature does not match its extension');
  const expected = requireRevision(payload.expectedRevision, { allowNull: creating });
  if (creating && expected !== null) throw new HttpError(400, 'Upload creation requires expectedRevision null');
  const target = join(uploadsDir, name);
  await assertExpectedRevision(target, expected, creating ? 'Upload create' : 'Upload replace');
  await atomicWrite(target, bytes);
  return { revision: sha256(bytes) };
};

const deleteUpload = async (name, payload) => {
  exactKeys(payload, ['expectedRevision']);
  const expected = requireRevision(payload.expectedRevision);
  const target = join(uploadsDir, name);
  await assertExpectedRevision(target, expected, 'Upload delete');
  const site = (await readSite()).content;
  const usage = uploadUsage(site, `/uploads/${name}`);
  if (usage.length) throw new HttpError(409, 'Referenced upload cannot be deleted', { usage });
  await unlink(target);
  return { revision: null, exists: false };
};

const handleRequest = async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
  if (req.method === 'GET' && url.pathname === '/api/snapshot') {
    send(res, 200, await readSnapshot());
    return;
  }
  if (req.method === 'GET' && url.pathname === '/api/publish/status') {
    const status = await readPublishStatus(projectRoot);
    send(res, 200, publicStatus(status, verificationToken, pendingPush));
    return;
  }
  if (req.method === 'GET' || !url.pathname.startsWith('/api/')) throw new HttpError(404, 'Not found');
  requireOrigin(req);
  const limit = url.pathname.startsWith('/api/uploads') ? UPLOAD_REQUEST_LIMIT : JSON_LIMIT;
  const payload = await readJson(req, limit);

  const result = await enqueueMutation(async () => {
    if (req.method === 'POST' && url.pathname === '/api/verify') {
      exactKeys(payload, [], []);
      const before = await readPublishStatus(projectRoot);
      const logs = [];
      const verified = await verifyProject({ projectRoot, log: (line) => logs.push(line) });
      const after = await readPublishStatus(projectRoot);
      if (before.fingerprint !== after.fingerprint) throw new PublishError('Repository changed during verification');
      verificationToken = await createVerificationToken(projectRoot, verified.verifiedAt);
      return { status: 'Verified', verifiedAt: verified.verifiedAt, fingerprint: verificationToken.fingerprint, logs };
    }
    if (req.method === 'POST' && url.pathname === '/api/publish') {
      if (pendingPush) throw new PublishError('A committed push is pending; Retry Push is the only allowed publish mutation');
      const body = exactKeys(payload, ['commitMessage', 'confirmedFingerprint', 'confirmed']);
      if (body.confirmed !== true) throw new PublishError('Diff confirmation is required');
      const commitMessage = validateCommitMessage(body.commitMessage);
      if (typeof body.confirmedFingerprint !== 'string' || !REVISION_PATTERN.test(body.confirmedFingerprint)) {
        throw new PublishError('Confirmed fingerprint must be a lowercase SHA-256 value');
      }
      const published = await publishVerified(projectRoot, verificationToken, { commitMessage, confirmedFingerprint: body.confirmedFingerprint });
      verificationToken = null;
      pendingPush = published.pendingPush;
      return { status: published.status, commitSha: published.commitSha };
    }
    if (req.method === 'POST' && url.pathname === '/api/publish/retry') {
      const body = exactKeys(payload, ['pendingCommitSha']);
      if (!pendingPush || body.pendingCommitSha !== pendingPush.commitSha) throw new PublishError('Pending push confirmation is stale');
      const retried = await retryPendingPush(projectRoot, pendingPush);
      pendingPush = null;
      return { status: retried.status, commitSha: retried.commitSha };
    }
    if (req.method === 'PUT' && url.pathname === '/api/site') {
      const saved = await replaceSite(payload);
      verificationToken = null;
      return saved;
    }
    if (req.method === 'POST' && url.pathname === '/api/articles') {
      const body = exactKeys(payload, ['slug', 'body', 'expectedRevision']);
      const slug = safeArticleSlug(body.slug);
      const saved = await writeArticle(slug, body, true);
      verificationToken = null;
      return saved;
    }
    if (url.pathname.startsWith('/api/articles/')) {
      const slug = safeArticleSlug(url.pathname.slice('/api/articles/'.length));
      if (req.method === 'PUT') {
        const saved = await writeArticle(slug, payload, false);
        verificationToken = null;
        return saved;
      }
      if (req.method === 'DELETE') {
        const deleted = await deleteArticle(slug, payload);
        verificationToken = null;
        return deleted;
      }
    }
    if (req.method === 'POST' && url.pathname === '/api/uploads') {
      const body = exactKeys(payload, ['name', 'base64', 'expectedRevision']);
      const name = safeUploadName(body.name);
      const saved = await writeUpload(name, body, true);
      verificationToken = null;
      return saved;
    }
    if (url.pathname.startsWith('/api/uploads/')) {
      const name = safeUploadName(url.pathname.slice('/api/uploads/'.length));
      if (req.method === 'PUT') {
        const saved = await writeUpload(name, payload, false);
        verificationToken = null;
        return saved;
      }
      if (req.method === 'DELETE') {
        const deleted = await deleteUpload(name, payload);
        verificationToken = null;
        return deleted;
      }
    }
    throw new HttpError(404, 'Not found');
  });
  send(res, 200, result);
};

const httpServer = createHttpServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    if (error?.name === 'ContentValidationError') {
      send(res, 400, { error: error.message });
      return;
    }
    if (error instanceof PublishError) {
      send(res, 409, { error: error.message, details: error.details });
      return;
    }
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error(error);
    send(res, status, { error: status === 500 ? 'Internal server error' : error.message, details: error.details });
  });
});

const close = async (code = 0) => {
  await new Promise((resolveClose) => httpServer.close(() => resolveClose()));
  await moduleLoader.close();
  process.exit(code);
};
process.on('SIGINT', () => void close(0));
process.on('SIGTERM', () => void close(0));

httpServer.on('error', async (error) => {
  console.error(`[api] ${error.message}`);
  await moduleLoader.close();
  process.exit(1);
});
httpServer.listen(PORT, HOST, () => console.log(`[api] listening on http://${HOST}:${PORT}`));
