import { useEffect } from 'react';
import { site } from '../../content/loader';

const SiteMetadata = () => {
  useEffect(() => {
    const scriptId = 'person-structured-data';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: site.shell.profile.name,
      url: site.seo.siteUrl,
      email: `mailto:${site.shell.profile.email}`,
      affiliation: {
        '@type': 'Organization',
        name: site.shell.profile.affiliation,
      },
      sameAs: visibleSocialUrls(),
    });
  }, []);
  return null;
};

const visibleSocialUrls = () => site.shell.socials
  .filter((social) => social.visible)
  .sort((a, b) => a.order - b.order)
  .map((social) => social.url);

export default SiteMetadata;
