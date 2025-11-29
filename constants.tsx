import React from 'react';
import {
  Profile,
  Paper,
  Project,
  BlogPost,
  Hero,
  HomepageConfig,
  HomepageContentType,
  ResearchPageConfig
} from './types';
import { Github, Twitter, Linkedin, GraduationCap, Mail } from 'lucide-react';
import data from './data';

// ==========================================
// DATA IS LOADED FROM data.ts (generated from data.json)
// Use 'python cms.py' to edit content.
// ==========================================

export const MY_PROFILE: Profile = data.profile;

export const HERO_INFO: Hero = (data as any).hero || {
  headline: "THE LOGIC\nOF MOVEMENT",
  subheadline: "\"Exploring the intersection of Applied Mathematics, Physics, and Engineering.\"",
  headlineFontEng: "Cinzel",
  headlineFontCn: "\"Noto Serif SC\"",
  headlineSize: "text-5xl md:text-7xl lg:text-8xl",
  subheadlineFontEng: "Cinzel",
  subheadlineFontCn: "\"Noto Serif SC\"",
  subheadlineSize: "text-xl md:text-2xl lg:text-3xl"
};

const defaultFeaturedEntry = {
  type: 'project' as HomepageContentType,
  id: data.projects?.[0]?.id || '',
  imageOverride: ''
};

const defaultHomepageConfig: HomepageConfig = {
  tabTitle: "Harry Luo | Researcher",
  recentMode: 'auto',
  recentAutoLimit: 3,
  recentManualEntries: [],
  featuredEntry: defaultFeaturedEntry
};

const homepageRaw = (data as any).homepage || {};

export const HOMEPAGE_CONFIG: HomepageConfig = {
  ...defaultHomepageConfig,
  ...homepageRaw,
  featuredEntry: {
    ...defaultFeaturedEntry,
    ...(homepageRaw.featuredEntry || {})
  }
};

export const RESEARCH_PAGE_CONFIG: ResearchPageConfig = (data as any).researchPage || {
  description: "My research focuses on the intersection of control theory and machine learning, specifically for manipulation tasks in unstructured environments."
};

export interface HomepageContentCard {
  type: HomepageContentType;
  id: string;
  title: string;
  description: string;
  dateLabel?: string;
  sortValue: number;
  imageUrl?: string;
  link: string;
  ctaLabel: string;
}

const parseDateValue = (value?: string): number => {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const createHomepageContentCards = (): HomepageContentCard[] => {
  const cards: HomepageContentCard[] = [];

  data.research_papers?.forEach((paper) => {
    cards.push({
      type: 'paper',
      id: paper.id,
      title: paper.title,
      description: paper.description,
      dateLabel: paper.year ? String(paper.year) : undefined,
      sortValue: (paper.year || 0) * 1000,
      link: '/research',
      imageUrl: undefined,
      ctaLabel: 'Read Paper'
    });
  });

  data.projects?.forEach((project, index) => {
    cards.push({
      type: 'project',
      id: project.id,
      title: project.title,
      description: project.description,
      dateLabel: 'Project',
      sortValue: -index,
      link: '/projects',
      imageUrl: project.imageUrl,
      ctaLabel: 'View Project'
    });
  });

  data.blog_posts?.forEach((post) => {
    cards.push({
      type: 'blog',
      id: post.id,
      title: post.title,
      description: post.excerpt,
      dateLabel: post.date,
      sortValue: parseDateValue(post.date),
      link: '/garden',
      imageUrl: undefined,
      ctaLabel: 'Read Note'
    });
  });

  return cards;
};

export const HOMEPAGE_CONTENT: HomepageContentCard[] = createHomepageContentCards();

export const getHomepageContentCard = (
  type?: HomepageContentType,
  id?: string
): HomepageContentCard | undefined => {
  if (!type || !id) {
    return undefined;
  }

  return HOMEPAGE_CONTENT.find((item) => item.type === type && item.id === id);
};

export const NAVIGATION_LINKS = data.navigation;

export const RESEARCH_PAPERS: Paper[] = data.research_papers;

export const PROJECTS: Project[] = data.projects;

export const BLOG_POSTS: BlogPost[] = data.blog_posts;

// Helper to get icons - This logic remains in Typescript as it involves React Components
export const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  github: <Github size={18} />,
  twitter: <Twitter size={18} />,
  scholar: <GraduationCap size={18} />,
  linkedin: <Linkedin size={18} />,
  email: <Mail size={18} />
};
