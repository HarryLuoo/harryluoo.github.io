import { Calendar, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import MarkdownRenderer from '../components/content/MarkdownRenderer';
import RecoveryState from '../components/content/RecoveryState';
import TagList from '../components/content/TagList';
import { articleFor, site } from '../content/loader';
import { findPost, posts } from '../content/selectors';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export const GardenList = () => {
  useDocumentMeta('Garden', site.garden.description, '/garden');
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-5xl mx-auto min-w-0">
      <header className="mb-16"><h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 break-words">Garden</h1><div className="w-20 h-1 bg-academic-orange" /><p className="font-sans text-stone-600 mt-6 max-w-2xl text-lg">{site.garden.description}</p></header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {posts.map((post) => (
          <article key={post.slug} className="group min-w-0">
            <div className="h-1 w-full bg-stone-200 group-hover:bg-academic-orange transition-colors mb-6" />
            <span className="font-mono text-stone-400 text-xs mb-2 block">{post.date}</span>
            <h2 className="font-serif text-3xl font-bold mb-4 min-w-0 break-words [overflow-wrap:anywhere]"><Link to={`/garden/${post.slug}`} className="group-hover:text-academic-orange transition-colors">{post.title}</Link></h2>
            <p className="font-sans text-stone-600 leading-relaxed mb-4">{post.excerpt}</p>
            <TagList tags={post.tags} hash />
          </article>
        ))}
      </div>
    </div>
  );
};

export const GardenDetail = () => {
  const { slug } = useParams();
  const post = findPost(slug);
  useDocumentMeta(post?.title ?? 'Garden post not found', post?.excerpt ?? 'This Garden post is unavailable or may have moved.', `/garden/${slug ?? ''}`);
  if (!post) return <RecoveryState title="Garden post not found" description="This Garden post is unavailable or may have moved." returnTo="/garden" returnLabel="Back to Garden" />;
  const article = articleFor(post.articleSlug);
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-4xl mx-auto bg-white shadow-sm my-8 md:my-16 border border-stone-100 min-w-0">
      <Link to="/garden" className="inline-flex text-sm font-mono uppercase text-stone-500 hover:text-academic-orange mb-8">← Back to Garden</Link>
      <article>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 break-words [overflow-wrap:anywhere]">{post.title}</h1>
        <div className="flex flex-wrap items-center text-stone-400 font-mono text-sm mb-8 pb-8 border-b border-stone-200"><Calendar aria-hidden="true" size={14} className="mr-2" />{post.date}<span aria-hidden="true" className="mx-4">|</span>{post.tags.join(', ')}</div>
        {article ? <MarkdownRenderer content={article} /> : <p className="font-sans text-stone-800 leading-relaxed text-base">{post.excerpt}</p>}
        {post.pdfUpload && <div className="mt-12 p-6 bg-stone-50 border border-stone-200 rounded flex flex-wrap gap-4 items-center justify-between"><div className="flex items-center"><FileText aria-hidden="true" className="text-academic-orange mr-4" size={32} /><div><h2 className="font-bold font-serif">Attachment</h2><p className="text-xs text-stone-500 font-mono">PDF Document</p></div></div><a href={post.pdfUpload} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white border border-stone-300 hover:border-academic-orange hover:text-academic-orange transition-colors text-sm font-bold uppercase tracking-wider">View PDF</a></div>}
      </article>
    </div>
  );
};
