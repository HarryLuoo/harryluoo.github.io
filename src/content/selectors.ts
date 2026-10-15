import { site } from './loader';
import type { EntityType, Paper, Post, Project } from './schema';

export const visibleSorted = <T extends { visible: boolean; order: number }>(items: T[]) =>
  items.filter((item) => item.visible).sort((a, b) => a.order - b.order);

export const papers = visibleSorted(site.research.papers);
export const projects = visibleSorted(site.projects.items);
export const posts = visibleSorted(site.notes.posts);

export const findPaper = (slug?: string): Paper | undefined =>
  papers.find((paper) => paper.slug === slug);

export const findProject = (slug?: string): Project | undefined =>
  projects.find((project) => project.slug === slug);

export const findPost = (slug?: string): Post | undefined =>
  posts.find((post) => post.slug === slug);

export const findEntity = (type: EntityType, slug: string) => {
  if (type === 'paper') return findPaper(slug);
  if (type === 'project') return findProject(slug);
  return findPost(slug);
};

export const entityRoute = (type: EntityType, slug: string) => {
  const section = type === 'paper' ? 'research' : type === 'post' ? 'notes' : 'projects';
  return `/${section}/${slug}`;
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatMonth = (value: string) => {
  const [year, month] = value.split('-');
  return `${monthNames[Number(month) - 1]} ${year}`;
};

const byNewest = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => b.date.localeCompare(a.date));

export const news = byNewest(site.about.news.filter((entry) => entry.visible));

export const recentEntities = byNewest([
  ...news.map((entry) => ({ kind: 'News', key: `news-${entry.date}-${entry.title}`, title: entry.title, date: entry.date, route: entry.link ?? '/about/news' })),
  ...papers.flatMap((item) => item.updated ? [{ kind: 'Paper', key: `paper-${item.slug}`, route: entityRoute('paper', item.slug), title: item.title, date: item.updated }] : []),
  ...projects.flatMap((item) => item.updated ? [{ kind: 'Project', key: `project-${item.slug}`, route: entityRoute('project', item.slug), title: item.title, date: item.updated }] : []),
  ...posts.flatMap((item) => item.updated ? [{ kind: 'Note', key: `post-${item.slug}`, route: entityRoute('post', item.slug), title: item.title, date: item.updated }] : []),
]).slice(0, site.home.recent.limit);
