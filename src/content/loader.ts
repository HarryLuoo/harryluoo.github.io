import rawSite from '../../content/site.json';
import { siteSchema } from './schema';

export const site = siteSchema.parse(rawSite);

const rawArticles = import.meta.glob('../../content/articles/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

export const articles = Object.fromEntries(
  Object.entries(rawArticles).map(([path, content]) => {
    const filename = path.split('/').pop();
    if (!filename?.endsWith('.md')) throw new Error(`Invalid article module path: ${path}`);
    return [filename.slice(0, -3), content];
  }),
) as Readonly<Record<string, string>>;

export const articleFor = (slug?: string) => slug ? articles[slug] : undefined;
