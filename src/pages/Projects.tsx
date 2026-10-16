import { ArrowUpRight, Github } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import MarkdownRenderer from '../components/content/MarkdownRenderer';
import RecoveryState from '../components/content/RecoveryState';
import TagList from '../components/content/TagList';
import { articleFor } from '../content/loader';
import { findProject, projects } from '../content/selectors';
import type { Project } from '../content/schema';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const ProjectCard = ({ project }: { project: Project }) => (
  <article className="bg-white group hover:shadow-xl transition-all border border-stone-100 flex flex-col h-full min-w-0">
    {project.imageUpload ? (
      <div className="h-48 overflow-hidden bg-stone-200"><img src={project.imageUpload} alt={project.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" /></div>
    ) : <div className="h-2 w-full bg-stone-200 group-hover:bg-academic-orange transition-colors" />}
    <div className="p-6 flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-start gap-3 mb-4 min-w-0">
        <h2 className="font-serif text-xl xl:text-2xl font-bold min-w-0 break-words"><Link to={`/projects/${project.slug}`} className="group-hover:text-academic-orange transition-colors">{project.title}</Link></h2>
        <div className="flex gap-2 text-stone-400 flex-shrink-0">
          {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer" aria-label={`View code for ${project.title}`} className="hover:text-academic-black"><Github aria-hidden="true" size={18} /></a>}
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" aria-label={`View live demo for ${project.title}`} className="hover:text-academic-black"><ArrowUpRight aria-hidden="true" size={18} /></a>}
        </div>
      </div>
      <p className="font-sans text-stone-600 text-sm mb-6 flex-1 leading-relaxed">{project.description}</p>
      {project.articleSlug && <Link to={`/projects/${project.slug}`} className="text-xs text-academic-orange font-bold uppercase mb-4 block">Click for details →</Link>}
      <div className="mt-auto"><TagList tags={project.tags} /></div>
    </div>
  </article>
);

const ProjectGrid = ({ items }: { items: Project[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
    {items.map((project) => <ProjectCard key={project.slug} project={project} />)}
  </div>
);

export const ProjectsList = () => {
  useDocumentMeta('Projects', 'Selected computational and scientific projects.', '/projects');
  const current = projects.filter((project) => !project.undergrad);
  const undergrad = projects.filter((project) => project.undergrad);
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-7xl mx-auto min-w-0">
      <header className="mb-16"><h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 break-words">Projects</h1><div className="w-20 h-1 bg-academic-orange" /></header>
      {current.length > 0 && <ProjectGrid items={current} />}
      {undergrad.length > 0 && (
        <section className={current.length > 0 ? 'mt-16' : undefined}>
          <h2 className="font-serif text-3xl font-bold mb-8">Undergrad</h2>
          <ProjectGrid items={undergrad} />
        </section>
      )}
    </div>
  );
};

export const ProjectDetail = () => {
  const { slug } = useParams();
  const project = findProject(slug);
  useDocumentMeta(project?.title ?? 'Project not found', project?.description ?? 'This project is unavailable or may have moved.', `/projects/${slug ?? ''}`);
  if (!project) return <RecoveryState title="Project not found" description="This project is unavailable or may have moved." returnTo="/projects" returnLabel="Back to Projects" />;
  const article = articleFor(project.articleSlug);
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-4xl mx-auto bg-white shadow-sm my-8 md:my-16 border border-stone-100 min-w-0">
      <Link to="/projects" className="inline-flex text-sm font-mono uppercase text-stone-500 hover:text-academic-orange mb-8">← Back to Projects</Link>
      <article>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 break-words [overflow-wrap:anywhere]">{project.title}</h1>
        {project.imageUpload && <div className="w-full h-64 md:h-80 bg-stone-200 mb-8 overflow-hidden rounded-sm"><img src={project.imageUpload} alt={project.title} className="w-full h-full object-cover" /></div>}
        {article ? <MarkdownRenderer content={article} /> : <p className="font-sans text-stone-800 leading-relaxed text-base">{project.description}</p>}
        <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-stone-100">
          {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-sm font-mono rounded"><Github aria-hidden="true" size={16} className="mr-2" /> View Code</a>}
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-sm font-mono rounded"><ArrowUpRight aria-hidden="true" size={16} className="mr-2" /> Live Demo</a>}
        </div>
      </article>
    </div>
  );
};
