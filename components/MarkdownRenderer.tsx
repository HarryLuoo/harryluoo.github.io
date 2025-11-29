import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-stone prose-lg max-w-none font-serif">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Customize specific elements if needed
          h1: ({node, ...props}) => <h1 className="font-serif text-3xl font-bold mt-8 mb-4 text-academic-black" {...props} />,
          h2: ({node, ...props}) => <h2 className="font-serif text-2xl font-bold mt-6 mb-3 text-academic-black border-b border-stone-300 pb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="font-serif text-xl font-bold mt-4 mb-2 text-academic-black" {...props} />,
          p: ({node, ...props}) => <p className="font-sans text-stone-800 leading-relaxed mb-4 text-base" {...props} />,
          code: ({node, ...props}) => {
             // Extract inline property safely
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
             const { inline, className, children, ...rest } = props as any;
             const match = /language-(\w+)/.exec(className || '');
             return !inline ? (
               <div className="bg-stone-100 p-4 rounded-md my-4 border-l-4 border-academic-orange overflow-x-auto">
                 <code className={className} {...rest}>
                   {children}
                 </code>
               </div>
             ) : (
               <code className="bg-stone-200 px-1 py-0.5 rounded text-sm font-mono text-red-700" {...rest}>
                 {children}
               </code>
             );
          },
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-academic-black pl-4 italic text-stone-600 my-4 bg-white p-4" {...props} />,
          a: ({node, ...props}) => <a className="text-academic-orange hover:underline font-bold" {...props} />
        }}
      />
    </div>
  );
};

export default MarkdownRenderer;