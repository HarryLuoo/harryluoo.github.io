import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { smokeArtifacts } from './artifact-smoke.mjs';
import { commandFailureDetail, runFixed } from './process.mjs';

const here = fileURLToPath(import.meta.url);

const loadAuthority = async (projectRoot) => {
  const loader = await createViteServer({
    root: projectRoot,
    configFile: false,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  });
  try {
    const validator = await loader.ssrLoadModule('/src/content/validate.server.ts');
    const site = validator.validateProjectContent(projectRoot);
    return { site, discovery: validator.discoveryFiles(site) };
  } finally {
    await loader.close();
  }
};

export const verifyProject = async ({ projectRoot = process.cwd(), log = console.log } = {}) => {
  const root = resolve(projectRoot);
  const authority = await loadAuthority(root);
  log('[verify:content] PASS');

  await runFixed(process.execPath, [join(root, 'node_modules', 'typescript', 'bin', 'tsc')], { cwd: root });
  log('[verify:typecheck] PASS');

  await runFixed(process.execPath, [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], { cwd: root });
  log('[verify:build] PASS');

  await smokeArtifacts(root, authority.site, authority.discovery);
  log('[verify:artifacts] PASS');
  return { verifiedAt: new Date().toISOString() };
};

if (process.argv[1] && resolve(process.argv[1]) === resolve(here)) {
  verifyProject().catch((error) => {
    console.error(`[verify] FAIL\n${commandFailureDetail(error)}`);
    process.exitCode = 1;
  });
}
