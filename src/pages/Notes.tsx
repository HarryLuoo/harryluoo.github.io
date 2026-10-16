import { FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import MarkdownRenderer from '../components/content/MarkdownRenderer';
import RecoveryState from '../components/content/RecoveryState';
import TagList from '../components/content/TagList';
import { articleFor, site } from '../content/loader';
import { findPost, posts } from '../content/selectors';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export const NotesList = () => {
  useDocumentMeta('Notes', site.notes.description, '/notes');
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-7xl mx-auto min-w-0">
      <header className="mb-16"><h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 break-words">Notes</h1><div className="w-20 h-1 bg-academic-orange" /></header>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.slug} className="bg-white group hover:shadow-xl transition-all border border-stone-100 flex flex-col h-full min-w-0">
            <div className="h-2 w-full bg-stone-200 group-hover:bg-academic-orange transition-colors" />
            <div className="p-6 flex-1 flex flex-col min-w-0">
              <div className="flex justify-between items-center gap-3 mb-2">
                <span className="font-mono text-stone-500 text-xs">{post.date}</span>
                {post.pdfUpload && <a href={post.pdfUpload} target="_blank" rel="noreferrer" aria-label={`Open PDF for ${post.title}`} className="text-stone-400 hover:text-academic-black"><FileText aria-hidden="true" size={18} /></a>}
              </div>
              <h2 className="font-serif text-xl xl:text-2xl font-bold mb-4 min-w-0 break-words"><Link to={`/notes/${post.slug}`} className="group-hover:text-academic-orange transition-colors">{post.title}</Link></h2>
              <p className="font-sans text-stone-600 text-sm mb-6 flex-1 leading-relaxed">{post.excerpt}</p>
              <div className="mt-auto"><TagList tags={post.tags} /></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export const NoteDetail = () => {
  const { slug } = useParams();
  const post = findPost(slug);
  useDocumentMeta(post?.title ?? 'Note not found', post?.excerpt ?? 'This note is unavailable or may have moved.', `/notes/${slug ?? ''}`);
  if (!post) return <RecoveryState title="Note not found" description="This note is unavailable or may have moved." returnTo="/notes" returnLabel="Back to Notes" />;
  const article = articleFor(post.articleSlug);
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-4xl mx-auto bg-white shadow-sm my-8 md:my-16 border border-stone-100 min-w-0">
      <Link to="/notes" className="inline-flex text-sm font-mono uppercase text-stone-500 hover:text-academic-orange mb-8">← Back to Notes</Link>
      <article>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 break-words [overflow-wrap:anywhere]">{post.title}</h1>
        <span className="font-mono text-stone-500 text-xs mb-8 block">{post.date}</span>
        {article ? <MarkdownRenderer content={article} /> : <p className="font-sans text-stone-800 leading-relaxed text-base">{post.excerpt}</p>}
        <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-stone-100">
          {post.pdfUpload && <a href={post.pdfUpload} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-sm font-mono rounded"><FileText aria-hidden="true" size={16} className="mr-2" /> View PDF</a>}
        </div>
      </article>
    </div>
  );
};
