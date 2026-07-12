export const routes = {
  home: '/',
  research: '/research',
  projects: '/projects',
  garden: '/garden',
  researchDetail: (slug: string) => `/research/${slug}`,
  projectDetail: (slug: string) => `/projects/${slug}`,
  gardenDetail: (slug: string) => `/garden/${slug}`,
};
