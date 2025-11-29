
export interface Paper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  description: string;
  pdfLink?: string;
  codeLink?: string;
  includeBibtex?: boolean; // Toggle for bibtex
  bibtex?: string;
  tags: string[];
  content?: string; // Path to markdown file
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  techStack: string[];
  link?: string;
  github?: string;
  content?: string; // Path to markdown file
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string; // Markdown content or file path
  tags: string[];
  pdfAttachment?: string;
}

export interface Profile {
  name: string;
  role: string;
  affiliation: string;
  bio: string;
  showBio?: boolean; // Toggle visibility of bio in sidebar
  email: string;
  socials: {
    github?: string;
    twitter?: string;
    scholar?: string;
    linkedin?: string;
  };
}

export interface Hero {
  headline: string;
  subheadline: string;
  // Configuration for fonts
  headlineFontEng?: string;   // e.g. 'Cinzel'
  headlineFontCn?: string;    // e.g. '"Noto Serif SC"'
  headlineSize?: string;      // valid tailwind text size classes
  subheadlineFontEng?: string;
  subheadlineFontCn?: string;
  subheadlineSize?: string;
}

export type HomepageContentType = 'paper' | 'project' | 'blog';

export interface HomepageManualEntry {
  title: string;
  description: string;
  dateLabel?: string;
  link: string;
  ctaLabel: string;
  imageUrl?: string;
}

export interface HomepageFeaturedEntry {
  type: HomepageContentType;
  id: string;
  imageOverride?: string;
}

export interface HomepageConfig {
  tabTitle: string;
  projectsDescription?: string; // New field
  recentMode: 'auto' | 'manual';
  recentAutoLimit: number;
  recentManualEntries: HomepageManualEntry[];
  featuredEntry: HomepageFeaturedEntry;
}

export interface ResearchPageConfig {
  description: string;
}
