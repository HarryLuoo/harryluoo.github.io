import React, { useState, useEffect } from 'react';
import { BLOG_POSTS } from '../constants';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { ChevronLeft, Calendar, FileText, Loader2 } from 'lucide-react';
import { BlogPost } from '../types';

const Garden: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [postContent, setPostContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Effect to load content when a post is selected
  useEffect(() => {
    if (selectedPost) {
      // Check if content is a path to a markdown file
      if (selectedPost.content.trim().startsWith('/') || selectedPost.content.trim().endsWith('.md')) {
        setIsLoading(true);
        fetch(selectedPost.content)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to load post");
            return res.text();
          })
          .then((text) => {
            setPostContent(text);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setPostContent("Error loading post content. Please check if the markdown file exists.");
            setIsLoading(false);
          });
      } else {
        // Fallback for inline content
        setPostContent(selectedPost.content);
      }
    } else {
      setPostContent('');
    }
  }, [selectedPost]);

  if (selectedPost) {
    return (
      <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-4xl mx-auto bg-white shadow-sm my-8 md:my-16 border border-stone-100">
        <button 
          onClick={() => setSelectedPost(null)}
          className="flex items-center text-sm font-mono uppercase text-stone-500 hover:text-academic-orange mb-8 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Garden
        </button>
        
        <article>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-academic-black">
            {selectedPost.title}
          </h1>
          <div className="flex items-center text-stone-400 font-mono text-sm mb-8 pb-8 border-b border-stone-200">
            <Calendar size={14} className="mr-2" />
            {selectedPost.date}
            <span className="mx-4">|</span>
            {selectedPost.tags.join(", ")}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
               <Loader2 className="animate-spin text-academic-orange" size={32} />
            </div>
          ) : (
             <MarkdownRenderer content={postContent} />
          )}

          {selectedPost.pdfAttachment && selectedPost.pdfAttachment !== "#" && (
             <div className="mt-12 p-6 bg-stone-50 border border-stone-200 rounded flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="text-academic-orange mr-4" size={32} />
                  <div>
                    <h4 className="font-bold font-serif">Attachment</h4>
                    <p className="text-xs text-stone-500 font-mono">PDF Document</p>
                  </div>
                </div>
                <a 
                  href={selectedPost.pdfAttachment} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-white border border-stone-300 hover:border-academic-orange hover:text-academic-orange transition-colors text-sm font-bold uppercase tracking-wider"
                >
                  View PDF
                </a>
             </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-5xl mx-auto">
      <header className="mb-16">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-academic-black">Garden</h1>
        <div className="w-20 h-1 bg-academic-orange"></div>
        <p className="font-sans text-stone-600 mt-6 max-w-2xl text-lg">
          A collection of notes, derivations, and thoughts. Not quite a blog, but a growing repository of knowledge.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {BLOG_POSTS.map((post) => (
          <div 
            key={post.id} 
            onClick={() => setSelectedPost(post)}
            className="group cursor-pointer"
          >
            <div className="h-1 w-full bg-stone-200 group-hover:bg-academic-orange transition-colors mb-6"></div>
            <span className="font-mono text-stone-400 text-xs mb-2 block">{post.date}</span>
            <h2 className="font-serif text-3xl font-bold mb-4 group-hover:text-academic-orange transition-colors">
              {post.title}
            </h2>
            <p className="font-sans text-stone-600 leading-relaxed mb-4">
              {post.excerpt}
            </p>
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="text-[10px] font-mono uppercase bg-stone-100 px-2 py-1 text-stone-500">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Garden;