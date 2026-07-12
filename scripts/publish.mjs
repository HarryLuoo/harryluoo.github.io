import { isUtf8 } from 'node:buffer';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { commandFailureDetail, runFixed } from './process.mjs';

export const CMS_PATHS = ['content/site.json', 'content/articles', 'public/uploads'];
const ARTICLE_EXTENSION = '.md';
const UPLOAD_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);
const OUTPUT_LIMIT = 256 * 1024;
const LINE_LIMIT = 2_000;
const GIT = '/usr/bin/git';

export class PublishError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'PublishError';
    this.details = details;
  }
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const gitBlobOid = (bytes, algorithm) => createHash(algorithm).update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const posixPath = (path) => path.split(sep).join('/');
const isAllowedPath = (path) => path === 'content/site.json'
  || path.startsWith('content/articles/')
  || path.startsWith('public/uploads/');
const isTextPath = (path) => path === 'content/site.json' || path.startsWith('content/articles/');

const sanitizedGitEnvironment = () => {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_') && key !== 'SSH_ASKPASS'));
  return {
    ...env,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_TERMINAL_PROMPT: '0',
    GIT_ASKPASS: '/usr/bin/false',
    SSH_ASKPASS: '/usr/bin/false',
    GCM_INTERACTIVE: 'Never',
  };
};

const git = (root, args, options = {}) => runFixed(GIT, [
  '-c', 'core.hooksPath=/dev/null',
  '-c', 'commit.gpgSign=false',
  '-c', 'tag.gpgSign=false',
  ...args,
], {
  cwd: root,
  env: sanitizedGitEnvironment(),
  timeoutMs: options.timeoutMs || 30_000,
  maxOutputBytes: options.maxOutputBytes || OUTPUT_LIMIT,
  allowedExitCodes: options.allowedExitCodes || [0],
});

const decodePath = (bytes) => {
  if (!isUtf8(bytes)) throw new PublishError('Git reported a non-UTF-8 path');
  return bytes.toString('utf8');
};

const splitNul = (bytes) => {
  const values = [];
  let start = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 0) {
      values.push(bytes.subarray(start, index));
      start = index + 1;
    }
  }
  if (start !== bytes.length) throw new PublishError('Git NUL-delimited output was incomplete');
  return values;
};

const parsePorcelainV2 = (bytes) => {
  const records = splitNul(bytes);
  const entries = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (record.length === 0) continue;
    const text = decodePath(record);
    const type = text[0];
    if (type === '?' || type === '!') {
      entries.push({ type, xy: type === '?' ? '??' : '!!', paths: [text.slice(2)] });
      continue;
    }
    if (type === '1') {
      const match = /^1 ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) (.*)$/.exec(text);
      if (!match) throw new PublishError('Could not parse ordinary porcelain-v2 record');
      entries.push({ type, xy: match[1], submodule: match[2], paths: [match[8]] });
      continue;
    }
    if (type === '2') {
      const match = /^2 ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) (.*)$/.exec(text);
      if (!match || index + 1 >= records.length) throw new PublishError('Could not parse rename porcelain-v2 record');
      const source = decodePath(records[index + 1]);
      index += 1;
      entries.push({ type, xy: match[1], submodule: match[2], score: match[8], paths: [match[9], source] });
      continue;
    }
    if (type === 'u') {
      const match = /^u ([^ ]+) ([^ ]+) .* (.*)$/.exec(text);
      entries.push({ type, xy: match?.[1] || 'UU', submodule: match?.[2], paths: [match?.[3] || text] });
      continue;
    }
    throw new PublishError(`Unsupported porcelain-v2 record: ${type}`);
  }
  return entries;
};

const gitText = async (root, args, options) => (await git(root, args, options)).stdout.toString('utf8').trim();

const readGitIdentity = async (root) => {
  const blockers = [];
  let head = null;
  let branch = null;
  let upstreamRef = null;
  let remoteName = null;
  let mergeRef = null;
  let fetchUrl = null;
  let pushUrl = null;
  try { head = await gitText(root, ['rev-parse', '--verify', 'HEAD']); } catch { blockers.push('Repository has no current HEAD'); }
  try { branch = await gitText(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']); } catch { blockers.push('Publish requires a branch, not detached HEAD'); }
  if (branch) {
    try { upstreamRef = await gitText(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']); } catch { blockers.push('Current branch has no configured upstream'); }
    try { remoteName = await gitText(root, ['config', '--get', `branch.${branch}.remote`]); } catch { blockers.push('Current branch has no configured remote'); }
    try { mergeRef = await gitText(root, ['config', '--get', `branch.${branch}.merge`]); } catch { blockers.push('Current branch has no configured merge ref'); }
    if (remoteName) {
      try { fetchUrl = await gitText(root, ['remote', 'get-url', remoteName]); } catch { blockers.push('Could not resolve upstream fetch URL'); }
      try { pushUrl = await gitText(root, ['remote', 'get-url', '--push', remoteName]); } catch { blockers.push('Could not resolve upstream push URL'); }
    }
  }
  return { head, branch, upstreamRef, remoteName, mergeRef, fetchUrl, pushUrl, blockers };
};

const listDiskCmsFiles = async (root) => {
  const blockers = [];
  const paths = [];
  const inspectFile = async (absolute, relativePath, expectedExtension) => {
    let info;
    try { info = await lstat(absolute); } catch (error) {
      if (error?.code === 'ENOENT') return;
      throw error;
    }
    if (!info.isFile() || info.isSymbolicLink()) {
      blockers.push(`CMS path is not a regular file: ${relativePath}`);
      return;
    }
    if (expectedExtension && !expectedExtension(relativePath)) {
      blockers.push(`Unexpected CMS file type: ${relativePath}`);
      return;
    }
    paths.push(relativePath);
  };

  await inspectFile(join(root, 'content', 'site.json'), 'content/site.json');
  for (const [directory, prefix, extensionCheck] of [
    [join(root, 'content', 'articles'), 'content/articles', (path) => path.endsWith(ARTICLE_EXTENSION)],
    [join(root, 'public', 'uploads'), 'public/uploads', (path) => UPLOAD_EXTENSIONS.has(path.slice(path.lastIndexOf('.')).toLowerCase())],
  ]) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) {
      if (error?.code === 'ENOENT') { blockers.push(`Missing CMS directory: ${prefix}`); continue; }
      throw error;
    }
    for (const entry of entries) {
      const relativePath = `${prefix}/${entry.name}`;
      if (!entry.isFile() || entry.isSymbolicLink()) {
        blockers.push(`Unexpected CMS-root nesting/type: ${relativePath}`);
        continue;
      }
      await inspectFile(join(directory, entry.name), relativePath, extensionCheck);
    }
  }
  return { paths: paths.sort(), blockers };
};

const readCmsManifest = async (root) => {
  const disk = await listDiskCmsFiles(root);
  let tracked = [];
  try {
    tracked = splitNul((await git(root, ['ls-files', '-z', '--', ...CMS_PATHS])).stdout).filter((item) => item.length).map(decodePath);
  } catch (error) {
    throw new PublishError(`Could not inventory tracked CMS files: ${commandFailureDetail(error)}`);
  }
  const all = [...new Set([...disk.paths, ...tracked])].sort();
  const manifest = [];
  for (const path of all) {
    let bytes;
    try { bytes = await readFile(join(root, path)); } catch (error) {
      if (error?.code === 'ENOENT') { manifest.push({ path, exists: false, sha256: null, size: 0 }); continue; }
      throw error;
    }
    manifest.push({ path, exists: true, sha256: sha256(bytes), size: bytes.length });
  }
  return { manifest, blockers: disk.blockers };
};

const readIgnoredCms = async (root) => {
  const result = await git(root, ['ls-files', '-z', '--others', '--ignored', '--exclude-standard', '--', ...CMS_PATHS]);
  return splitNul(result.stdout).filter((item) => item.length).map(decodePath).sort();
};

const summarizeEntries = (entries) => {
  const blockers = [];
  const allowed = new Map();
  for (const entry of entries) {
    if (entry.type === 'u') blockers.push(`Unmerged Git state: ${entry.paths.join(' -> ')}`);
    if (entry.submodule && entry.submodule !== 'N...') blockers.push(`Submodule status is unsupported: ${entry.paths[0]}`);
    const allowedSides = entry.paths.map(isAllowedPath);
    if (entry.type === '2' && allowedSides.some(Boolean) && !allowedSides.every(Boolean)) {
      blockers.push(`Rename/copy crosses the CMS allowlist: ${entry.paths.join(' -> ')}`);
    }
    if (entry.paths.some((path) => !isAllowedPath(path))) blockers.push(`Unrelated worktree change: ${entry.paths.find((path) => !isAllowedPath(path))}`);
    if (entry.type !== '?' && entry.xy[0] !== '.') blockers.push(`Pre-existing staged change: ${entry.paths[0]}`);
    entry.paths.filter(isAllowedPath).forEach((path) => allowed.set(path, entry.xy));
  }
  return { blockers, allowedChanges: [...allowed].sort(([a], [b]) => a.localeCompare(b)).map(([path, status]) => ({ path, status })) };
};

const createUntrackedTextDiff = async (root, paths) => {
  const sections = [];
  for (const path of paths.sort()) {
    const text = await readFile(join(root, path), 'utf8');
    const lines = text.split('\n');
    sections.push([
      `diff --git a/${path} b/${path}`,
      'new file mode 100644',
      '--- /dev/null',
      `+++ b/${path}`,
      `@@ -0,0 +1,${lines.length} @@`,
      ...lines.map((line) => `+${line}`),
    ].join('\n'));
  }
  return sections.join('\n');
};

const boundedDiff = (text, alreadyTruncated = false) => {
  const bytes = Buffer.byteLength(text);
  const lines = text.length ? text.split('\n').length : 0;
  if (!alreadyTruncated && bytes <= OUTPUT_LIMIT && lines <= LINE_LIMIT) return { text, truncated: false, bytes, lines };
  const marker = '\n[diff truncated; Publish blocked]';
  const visibleLines = text.split('\n').slice(0, LINE_LIMIT - 1);
  let visible = visibleLines.join('\n');
  while (Buffer.byteLength(visible) + Buffer.byteLength(marker) > OUTPUT_LIMIT) visible = visible.slice(0, Math.floor(visible.length * 0.9));
  return { text: `${visible}${marker}`, truncated: true, bytes, lines };
};

const buildReview = async (root, entries, allowedChanges, manifest) => {
  let trackedText = '';
  let commandTruncated = false;
  try {
    trackedText = await gitText(root, ['diff', 'HEAD', '--no-ext-diff', '--no-color', '--unified=3', '--', 'content/site.json', 'content/articles']);
  } catch (error) {
    if (!error?.outputExceeded) throw error;
    trackedText = error.stdout.toString('utf8');
    commandTruncated = true;
  }
  const untrackedTextPaths = entries
    .filter((entry) => entry.type === '?')
    .flatMap((entry) => entry.paths)
    .filter((path) => isAllowedPath(path) && isTextPath(path));
  const untrackedText = await createUntrackedTextDiff(root, untrackedTextPaths);
  const textDiff = boundedDiff([trackedText, untrackedText].filter(Boolean).join('\n'), commandTruncated);
  const manifestByPath = new Map(manifest.map((item) => [item.path, item]));
  const uploads = allowedChanges
    .filter((change) => change.path.startsWith('public/uploads/'))
    .map((change) => {
      const item = manifestByPath.get(change.path);
      return { path: change.path, status: change.status, size: item?.exists ? item.size : null };
    });
  return { textDiff, uploads };
};

const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export const readPublishStatus = async (projectRoot) => {
  const root = resolve(projectRoot);
  const blockers = [];
  let rawStatus;
  let entries;
  try {
    rawStatus = (await git(root, ['status', '--porcelain=v2', '-z', '--untracked-files=all'])).stdout;
    entries = parsePorcelainV2(rawStatus);
  } catch (error) {
    throw new PublishError(`Could not read complete Git status: ${commandFailureDetail(error)}`);
  }
  const summary = summarizeEntries(entries);
  blockers.push(...summary.blockers);
  const identity = await readGitIdentity(root);
  blockers.push(...identity.blockers);
  const cms = await readCmsManifest(root);
  blockers.push(...cms.blockers);
  const ignoredCms = await readIgnoredCms(root);
  ignoredCms.forEach((path) => blockers.push(`Ignored file inside CMS root: ${path}`));
  const review = await buildReview(root, entries, summary.allowedChanges, cms.manifest);
  if (review.textDiff.truncated) blockers.push('Text diff exceeds the review limit');

  const core = {
    head: identity.head,
    branch: identity.branch,
    upstreamRef: identity.upstreamRef,
    remoteName: identity.remoteName,
    mergeRef: identity.mergeRef,
    fetchUrl: identity.fetchUrl,
    pushUrl: identity.pushUrl,
    cmsManifest: cms.manifest,
    statusSha256: sha256(rawStatus),
    ignoredCms,
  };
  const fingerprint = sha256(Buffer.from(JSON.stringify(core)));
  return {
    root,
    fingerprint,
    fingerprintCore: core,
    rawStatus,
    entries,
    blockers: [...new Set(blockers)],
    allowedChanges: summary.allowedChanges,
    diff: review.textDiff,
    uploads: review.uploads,
    identity,
  };
};

export const publicStatus = (status, verificationToken, pendingPush) => ({
  fingerprint: status.fingerprint,
  verification: verificationToken ? {
    state: verificationToken.fingerprint === status.fingerprint ? 'fresh' : 'stale',
    verifiedAt: verificationToken.verifiedAt,
  } : { state: 'not-verified', verifiedAt: null },
  branch: status.identity.branch,
  head: status.identity.head,
  upstream: status.identity.upstreamRef,
  blockers: status.blockers,
  allowedChanges: status.allowedChanges,
  diff: status.diff,
  uploads: status.uploads,
  pendingPush: pendingPush ? { commitSha: pendingPush.commitSha } : null,
});

export const createVerificationToken = async (projectRoot, verifiedAt) => {
  const status = await readPublishStatus(projectRoot);
  return { fingerprint: status.fingerprint, fingerprintCore: status.fingerprintCore, verifiedAt };
};

const assertFreshAndPublishable = (status, token, confirmedFingerprint) => {
  if (!token || status.fingerprint !== token.fingerprint || !sameJson(status.fingerprintCore, token.fingerprintCore)) {
    throw new PublishError('Verification is stale; run Verify again');
  }
  if (confirmedFingerprint !== status.fingerprint) throw new PublishError('Displayed diff confirmation is stale');
  if (status.blockers.length) throw new PublishError('Publish is blocked', { blockers: status.blockers });
  if (!status.allowedChanges.length) throw new PublishError('There are no CMS changes to publish');
  if (status.diff.truncated) throw new PublishError('Truncated diff cannot be published');
};

const restoreStudioStage = async (root) => {
  await git(root, ['restore', '--staged', '--source=HEAD', '--', ...CMS_PATHS]);
};

const pushBoundUpstream = (root, identity) => {
  if (!identity.remoteName || !identity.mergeRef) throw new PublishError('Verified upstream identity is incomplete');
  return git(root, [
    'push',
    '--porcelain',
    '--end-of-options',
    identity.remoteName,
    `HEAD:${identity.mergeRef}`,
  ], { timeoutMs: 60_000 });
};

const assertIndexMatchesManifest = async (root, manifest) => {
  const objectFormat = await gitText(root, ['rev-parse', '--show-object-format']);
  if (!['sha1', 'sha256'].includes(objectFormat)) throw new PublishError(`Unsupported Git object format: ${objectFormat}`);
  for (const item of manifest) {
    const result = await git(root, ['rev-parse', '--verify', `:${item.path}`], { allowedExitCodes: [0, 128] });
    if (!item.exists) {
      if (result.code === 0) throw new PublishError(`Deleted CMS path remains staged: ${item.path}`);
    } else {
      const bytes = await readFile(join(root, item.path));
      const stagedOid = result.stdout.toString('utf8').trim();
      if (result.code !== 0 || sha256(bytes) !== item.sha256 || gitBlobOid(bytes, objectFormat) !== stagedOid) {
        throw new PublishError(`Staged blob differs from verified bytes: ${item.path}`);
      }
    }
  }
};

const assertPostStageState = async (root, token) => {
  const rawStatus = (await git(root, ['status', '--porcelain=v2', '-z', '--untracked-files=all'])).stdout;
  const entries = parsePorcelainV2(rawStatus);
  for (const entry of entries) {
    if (entry.paths.some((path) => !isAllowedPath(path))) throw new PublishError(`Unexpected staged/worktree path: ${entry.paths.join(' -> ')}`);
    if (entry.type === '?' || entry.xy[0] === '.' || entry.xy[1] !== '.') throw new PublishError(`Worktree changed during publish: ${entry.paths[0]}`);
  }
  const identity = await readGitIdentity(root);
  const cms = await readCmsManifest(root);
  const ignoredCms = await readIgnoredCms(root);
  const before = token.fingerprintCore;
  if (identity.head !== before.head || identity.branch !== before.branch || identity.upstreamRef !== before.upstreamRef
    || identity.remoteName !== before.remoteName || identity.mergeRef !== before.mergeRef
    || identity.fetchUrl !== before.fetchUrl || identity.pushUrl !== before.pushUrl
    || !sameJson(cms.manifest, before.cmsManifest) || !sameJson(ignoredCms, before.ignoredCms)) {
    throw new PublishError('Repository changed during publish');
  }
};

export const publishVerified = async (projectRoot, token, { commitMessage, confirmedFingerprint }) => {
  const root = resolve(projectRoot);
  const status = await readPublishStatus(root);
  assertFreshAndPublishable(status, token, confirmedFingerprint);
  let commitSha = null;
  try {
    await git(root, ['add', '-A', '--', ...CMS_PATHS]);
    const stagedRaw = (await git(root, ['status', '--porcelain=v2', '-z', '--untracked-files=all'])).stdout;
    const stagedEntries = parsePorcelainV2(stagedRaw);
    for (const entry of stagedEntries) {
      if (entry.paths.some((path) => !isAllowedPath(path))) throw new PublishError(`Staged path is outside the CMS allowlist: ${entry.paths.join(' -> ')}`);
    }
    await assertIndexMatchesManifest(root, token.fingerprintCore.cmsManifest);
    await assertPostStageState(root, token);
    await git(root, ['commit', '--no-verify', '-m', commitMessage]);
    commitSha = await gitText(root, ['rev-parse', '--verify', 'HEAD']);
  } catch (error) {
    if (!commitSha) {
      try { await restoreStudioStage(root); } catch (restoreError) {
        throw new PublishError(`${error.message}; additionally failed to restore Studio staging: ${commandFailureDetail(restoreError)}`);
      }
    }
    throw error;
  }

  try {
    await pushBoundUpstream(root, status.identity);
    return { status: 'Pushed', commitSha, pendingPush: null };
  } catch (error) {
    return {
      status: 'Committed; push failed',
      commitSha,
      pendingPush: {
        commitSha,
        branch: status.identity.branch,
        upstreamRef: status.identity.upstreamRef,
        remoteName: status.identity.remoteName,
        mergeRef: status.identity.mergeRef,
        fetchUrl: status.identity.fetchUrl,
        pushUrl: status.identity.pushUrl,
        error: commandFailureDetail(error),
      },
    };
  }
};

export const retryPendingPush = async (projectRoot, pending) => {
  if (!pending) throw new PublishError('There is no pending push to retry');
  const root = resolve(projectRoot);
  const status = await readPublishStatus(root);
  const identity = status.identity;
  if (identity.head !== pending.commitSha) throw new PublishError('HEAD changed after the pending commit');
  if (status.rawStatus.length !== 0 || status.fingerprintCore.ignoredCms.length !== 0) throw new PublishError('Worktree or staging changed after the pending commit');
  if (identity.branch !== pending.branch || identity.upstreamRef !== pending.upstreamRef || identity.remoteName !== pending.remoteName
    || identity.mergeRef !== pending.mergeRef || identity.fetchUrl !== pending.fetchUrl || identity.pushUrl !== pending.pushUrl) {
    throw new PublishError('Upstream changed after the pending commit');
  }
  try {
    await pushBoundUpstream(root, pending);
    return { status: 'Pushed', commitSha: pending.commitSha, pendingPush: null };
  } catch (error) {
    throw new PublishError(`Push retry failed: ${commandFailureDetail(error)}`);
  }
};

export const validateCommitMessage = (value) => {
  if (typeof value !== 'string') throw new PublishError('Commit message must be text');
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 120 || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw new PublishError('Commit message must be one line of 1-120 characters without control characters');
  }
  return trimmed;
};
