// @ts-nocheck -- Vite bundles this Node-side config before executing it.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { discoveryFiles, runValidationProbes, validateProjectContent } from './src/content/validate.server';

export default defineConfig(({ mode }) => {
  const studioMode = mode === 'studio';
  const projectRoot = process.cwd();
  const site = validateProjectContent(projectRoot);
  if (mode === 'validation-probes') runValidationProbes(projectRoot);
  const discovery = discoveryFiles(site);
  const siteUrl = `${site.seo.siteUrl.replace(/\/$/, '')}/`;
  const robots = `${site.seo.robots.index ? 'index' : 'noindex'}, ${site.seo.robots.follow ? 'follow' : 'nofollow'}`;
  const defaultHeadTags = [
    { tag: 'title', children: site.seo.defaultTitle, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'description', content: site.seo.defaultDescription }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'robots', content: robots }, injectTo: 'head' },
    { tag: 'link', attrs: { rel: 'canonical', href: siteUrl }, injectTo: 'head' },
    { tag: 'meta', attrs: { property: 'og:type', content: site.seo.openGraph.type }, injectTo: 'head' },
    { tag: 'meta', attrs: { property: 'og:site_name', content: site.seo.openGraph.siteName }, injectTo: 'head' },
    { tag: 'meta', attrs: { property: 'og:title', content: site.seo.defaultTitle }, injectTo: 'head' },
    { tag: 'meta', attrs: { property: 'og:description', content: site.seo.defaultDescription }, injectTo: 'head' },
    { tag: 'meta', attrs: { property: 'og:url', content: siteUrl }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'twitter:card', content: site.seo.twitter.card }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'twitter:title', content: site.seo.defaultTitle }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'twitter:description', content: site.seo.defaultDescription }, injectTo: 'head' },
    ...(site.seo.faviconUpload ? [{ tag: 'link', attrs: { rel: 'icon', href: site.seo.faviconUpload }, injectTo: 'head' }] : []),
    ...(site.seo.socialImageUpload ? [
      { tag: 'meta', attrs: { property: 'og:image', content: `${site.seo.siteUrl.replace(/\/$/, '')}${site.seo.socialImageUpload}` }, injectTo: 'head' },
      { tag: 'meta', attrs: { name: 'twitter:image', content: `${site.seo.siteUrl.replace(/\/$/, '')}${site.seo.socialImageUpload}` }, injectTo: 'head' },
    ] : []),
  ];

  return {
    base: '/',
    server: studioMode ? {
      host: '127.0.0.1',
      port: 8080,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: false,
        },
      },
    } : undefined,
    plugins: [
      react(),
      {
        name: 'validated-discovery-files',
        configureServer(server) {
          if (studioMode) return;
          server.middlewares.use((request, response, next) => {
            if (request.url?.split('?')[0] === '/studio.html') {
              response.statusCode = 404;
              response.end('Not found');
              return;
            }
            next();
          });
        },
        transformIndexHtml() {
          return defaultHeadTags;
        },
        generateBundle() {
          this.emitFile({ type: 'asset', fileName: 'robots.txt', source: discovery.robots });
          this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: discovery.sitemap });
        },
      },
    ],
  };
});
