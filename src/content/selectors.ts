import { site } from './loader';
import type { EntityType, Paper, Post, Project } from './schema';

export const visibleSorted = <T extends { visible: boolean; order: number }>(items: T[]) =>
  items.filter((item) => item.visible).sort((a, b) => a.order - b.order);

export const papers = visibleSorted(site.research.papers);
export const projects = visibleSorted(site.projects.items);
export const posts = visibleSorted(site.garden.posts);

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
  const section = type === 'paper' ? 'research' : type === 'post' ? 'garden' : 'projects';
  return `/${section}/${slug}`;
};
