import { z } from 'zod';

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a URL-safe semantic slug');

const order = z.number().int().nonnegative();
const externalUrl = z.string().url().refine((value) => /^https?:\/\//.test(value), {
  message: 'Use an http(s) URL',
});
const uploadPath = z.string().refine(
  (value) => {
    if (!value.startsWith('/uploads/') || value.includes('\\') || value.includes('//') || value.includes('%') || value.includes('?') || value.includes('#')) {
      return false;
    }
    const segments = value.split('/').filter(Boolean);
    return segments.length >= 2 && segments.every((segment) => segment !== '.' && segment !== '..');
  },
  { message: 'Use a safe root-relative /uploads/... path' },
);
const imageUploadPath = uploadPath.refine(
  (value) => /\.(?:png|jpe?g|webp)$/i.test(value),
  { message: 'Use a PNG, JPEG, or WebP upload' },
);

const tagList = z.array(z.string().min(1));
const entityType = z.enum(['paper', 'project', 'post']);
const entityPlacement = z.strictObject({
  entityType,
  slug,
});

const visibility = {
  visible: z.boolean(),
  order,
};

const seoSchema = z.strictObject({
  siteUrl: externalUrl,
  defaultTitle: z.string().min(1),
  titleSuffix: z.string().min(1),
  defaultDescription: z.string().min(1),
  openGraph: z.strictObject({
    siteName: z.string().min(1),
    type: z.enum(['website', 'profile']),
  }),
  twitter: z.strictObject({
    card: z.enum(['summary', 'summary_large_image']),
  }),
  faviconUpload: uploadPath.optional(),
  socialImageUpload: uploadPath.optional(),
  robots: z.strictObject({
    index: z.boolean(),
    follow: z.boolean(),
  }),
});

const navigationSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    id: slug,
    label: z.string().min(1),
    kind: z.literal('internal'),
    route: z.enum(['/', '/about', '/research', '/projects', '/garden']),
    ...visibility,
  }),
  z.strictObject({
    id: slug,
    label: z.string().min(1),
    kind: z.literal('external'),
    href: externalUrl,
    ...visibility,
  }),
  z.strictObject({
    id: slug,
    label: z.string().min(1),
    kind: z.literal('cv'),
    ...visibility,
  }),
]);

const shellSchema = z.strictObject({
  profile: z.strictObject({
    name: z.string().min(1),
    role: z.string().min(1),
    affiliation: z.string().min(1),
    bio: z.string(),
    showBio: z.boolean(),
    email: z.string().email(),
  }),
  socials: z.array(z.strictObject({
    platform: z.enum(['github', 'linkedin', 'scholar', 'twitter']),
    url: externalUrl,
    ...visibility,
  })),
  cvUpload: uploadPath,
  navigation: z.array(navigationSchema),
});

const optionalContentLink = z.union([
  externalUrl,
  z.string().regex(/^\/(?:research|projects|garden)(?:\/[a-z0-9-]+)?$/),
]);

const homeSchema = z.strictObject({
  hero: z.strictObject({
    headline: z.string().min(1),
    subheadline: z.string().min(1),
  }),
  recent: z.strictObject({
    mode: z.enum(['manual', 'auto']),
    autoLimit: z.number().int().positive(),
    automaticEntries: z.array(entityPlacement),
    manualEntries: z.array(z.strictObject({
      title: z.string().min(1),
      dateLabel: z.string().optional(),
      description: z.string().min(1),
      link: optionalContentLink.optional(),
      ctaLabel: z.string().min(1).optional(),
      imageUpload: uploadPath.optional(),
      ...visibility,
    })),
  }),
  featured: z.strictObject({
    ...entityPlacement.shape,
    imageOverrideUpload: uploadPath.optional(),
    visible: z.boolean(),
  }),
  projectsDescription: z.string().min(1),
  gardenDescription: z.string().min(1),
});

const aboutFigureSchema = z.strictObject({
  upload: imageUploadPath,
  alt: z.string().trim().min(1),
  caption: z.string().trim().min(1).optional(),
});

const aboutSectionSchema = z.strictObject({
  text: z.string().min(1),
  figures: z.array(aboutFigureSchema).max(2),
});

const paperSchema = z.strictObject({
  slug,
  title: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  venue: z.string().min(1),
  year: z.number().int().min(1900).max(2200),
  description: z.string().min(1),
  tags: tagList,
  pdfUpload: uploadPath.optional(),
  permalinkUrl: externalUrl.optional(),
  codeUrl: externalUrl.optional(),
  bibtexVisible: z.boolean(),
  bibtex: z.string().min(1).optional(),
  articleSlug: slug.optional(),
  ...visibility,
});

const projectSchema = z.strictObject({
  slug,
  title: z.string().min(1),
  description: z.string().min(1),
  tags: tagList,
  imageUpload: uploadPath.optional(),
  repositoryUrl: externalUrl.optional(),
  liveUrl: externalUrl.optional(),
  articleSlug: slug.optional(),
  ...visibility,
});

const postSchema = z.strictObject({
  slug,
  title: z.string().min(1),
  date: z.string().min(1),
  excerpt: z.string().min(1),
  tags: tagList,
  articleSlug: slug.optional(),
  pdfUpload: uploadPath.optional(),
  ...visibility,
});

export const siteSchema = z.strictObject({
  seo: seoSchema,
  shell: shellSchema,
  home: homeSchema,
  about: z.strictObject({
    background: aboutSectionSchema,
    currentWork: aboutSectionSchema,
  }),
  research: z.strictObject({
    description: z.string().min(1),
    papers: z.array(paperSchema),
  }),
  projects: z.strictObject({
    items: z.array(projectSchema),
  }),
  garden: z.strictObject({
    description: z.string().min(1),
    posts: z.array(postSchema),
  }),
  tags: z.array(z.string().min(1)),
});

export type SiteContent = z.infer<typeof siteSchema>;
export type Paper = SiteContent['research']['papers'][number];
export type Project = SiteContent['projects']['items'][number];
export type Post = SiteContent['garden']['posts'][number];
export type AboutSection = SiteContent['about']['background'];
export type EntityType = z.infer<typeof entityType>;
