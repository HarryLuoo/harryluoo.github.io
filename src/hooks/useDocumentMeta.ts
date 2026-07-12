import { useEffect } from 'react';
import { site } from '../content/loader';

const setMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

export const useDocumentMeta = (title: string, description: string, path: string) => {
  useEffect(() => {
    const fullTitle = title === site.seo.defaultTitle
      ? title
      : `${title} | ${site.seo.titleSuffix}`;
    const base = site.seo.siteUrl.replace(/\/$/, '');
    const canonicalUrl = path === '/' ? `${base}/` : `${base}/#${path}`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[name="robots"]', 'name', 'robots', `${site.seo.robots.index ? 'index' : 'noindex'}, ${site.seo.robots.follow ? 'follow' : 'nofollow'}`);
    setMeta('meta[property="og:type"]', 'property', 'og:type', site.seo.openGraph.type);
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', site.seo.openGraph.siteName);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', site.seo.twitter.card);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    if (site.seo.faviconUpload) {
      let favicon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = site.seo.faviconUpload;
    }

    if (site.seo.socialImageUpload) {
      setMeta('meta[property="og:image"]', 'property', 'og:image', `${base}${site.seo.socialImageUpload}`);
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', `${base}${site.seo.socialImageUpload}`);
    }
  }, [description, path, title]);
};
