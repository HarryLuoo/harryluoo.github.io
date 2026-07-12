import { Check, Code, ExternalLink, FileText } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MarkdownRenderer from '../components/content/MarkdownRenderer';
import RecoveryState from '../components/content/RecoveryState';
import TagList from '../components/content/TagList';
import { articleFor, site } from '../content/loader';
import { findPaper, papers } from '../content/selectors';
import type { Paper } from '../content/schema';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const PaperActions = ({ paper }: { paper: Paper }) => {
  const [copied, setCopied] = useState(false);
  const copyBibtex = async () => {
    const bibtex = paper.bibtex || `@article{${paper.slug},\n  title={${paper.title}},\n  author={${paper.authors.join(' and ')}},\n  year={${paper.year}},\n  journal={${paper.venue}}\n}`;
    await navigator.clipboard.writeText(bibtex);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex flex-wrap gap-4">
      {paper.pdfUpload && <a href={paper.pdfUpload} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-academic-black"><FileText aria-hidden="true" size={14} className="mr-1" /> PDF</a>}
      {paper.permalinkUrl && <a href={paper.permalinkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-academic-black"><ExternalLink aria-hidden="true" size={14} className="mr-1" /> Permalink</a>}
      {paper.codeUrl && <a href={paper.codeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-academic-black"><Code aria-hidden="true" size={14} className="mr-1" /> Code</a>}
      {paper.bibtexVisible && <button type="button" onClick={copyBibtex} className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-academic-black"><span aria-live="polite" className="inline-flex items-center">{copied ? <><Check aria-hidden="true" size={14} className="mr-1 text-green-600" /> Copied</> : <><ExternalLink aria-hidden="true" size={14} className="mr-1" /> BibTeX</>}</span></button>}
    </div>
  );
};

export const ResearchList = () => {
  useDocumentMeta('Research', site.research.description, '/research');
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-5xl mx-auto min-w-0">
      <header className="mb-16"><h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 break-words">Research</h1><div className="w-20 h-1 bg-academic-orange" /><p className="font-sans text-stone-600 mt-6 max-w-2xl text-lg">{site.research.description}</p></header>
      <div className="space-y-12">
        {papers.map((paper) => (
          <article key={paper.slug} className="group relative pl-8 border-l-2 border-stone-200 hover:border-academic-orange transition-colors min-w-0">
            <div aria-hidden="true" className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200 group-hover:bg-academic-orange transition-colors border-4 border-academic-cream" />
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2 min-w-0">
              <h2 className="font-serif text-2xl font-bold min-w-0 break-words [overflow-wrap:anywhere]"><Link to={`/research/${paper.slug}`} className="group-hover:text-academic-orange hover:underline decoration-2 underline-offset-4">{paper.title}</Link></h2>
              <span className="font-mono text-stone-400 text-sm flex-shrink-0">{paper.venue} {paper.year}</span>
            </div>
            <p className="font-sans text-stone-600 mb-3 italic">{paper.authors.join(', ')}</p>
            <p className="font-sans text-stone-800 leading-relaxed max-w-3xl mb-4">{paper.description}</p>
            <div className="flex flex-wrap gap-4 mt-4"><Link to={`/research/${paper.slug}`} className="text-xs font-bold uppercase tracking-wider text-academic-orange hover:text-academic-black">View details →</Link><PaperActions paper={paper} /></div>
            <div className="mt-4"><TagList tags={paper.tags} /></div>
          </article>
        ))}
      </div>
    </div>
  );
};

export const ResearchDetail = () => {
  const { slug } = useParams();
  const paper = findPaper(slug);
  useDocumentMeta(paper?.title ?? 'Research item not found', paper?.description ?? 'This research item is unavailable or may have moved.', `/research/${slug ?? ''}`);
  if (!paper) return <RecoveryState title="Research item not found" description="This research item is unavailable or may have moved." returnTo="/research" returnLabel="Back to Research" />;
  const article = articleFor(paper.articleSlug);
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-4xl mx-auto bg-white shadow-sm my-8 md:my-16 border border-stone-100 min-w-0">
      <Link to="/research" className="inline-flex text-sm font-mono uppercase text-stone-500 hover:text-academic-orange mb-8">← Back to Research</Link>
      <article>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 break-words [overflow-wrap:anywhere]">{paper.title}</h1>
        <div className="font-sans text-stone-600 mb-6 italic border-b border-stone-200 pb-6">{paper.authors.join(', ')}<br /><span className="text-sm not-italic text-stone-400 font-mono">{paper.venue} | {paper.year}</span></div>
        {article ? <MarkdownRenderer content={article} /> : <p className="font-sans text-stone-800 leading-relaxed text-base">{paper.description}</p>}
        <div className="mt-12 pt-8 border-t border-stone-100"><PaperActions paper={paper} /></div>
      </article>
    </div>
  );
};
