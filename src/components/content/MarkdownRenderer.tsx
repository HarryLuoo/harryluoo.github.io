import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => (
  <div className="markdown-content max-w-none font-serif">
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: (props) => <h1 className="font-serif text-3xl font-bold mt-8 mb-4 text-academic-black break-words" {...props} />,
        h2: (props) => <h2 className="font-serif text-2xl font-bold mt-6 mb-3 text-academic-black border-b border-stone-300 pb-2 break-words" {...props} />,
        h3: (props) => <h3 className="font-serif text-xl font-bold mt-4 mb-2 text-academic-black break-words" {...props} />,
        p: (props) => <p className="font-sans text-stone-800 leading-relaxed mb-4 text-base" {...props} />,
        code: ({ className, ...props }) => (
          <code className={`bg-stone-200 px-1 py-0.5 rounded text-sm font-mono text-red-700 ${className ?? ''}`} {...props} />
        ),
        pre: (props) => (
          <pre className="bg-stone-100 p-4 rounded-md my-4 border-l-4 border-academic-orange overflow-x-auto font-mono text-sm" {...props} />
        ),
        blockquote: (props) => <blockquote className="border-l-4 border-academic-black pl-4 italic text-stone-600 my-4 bg-white p-4" {...props} />,
        a: (props) => <a className="text-academic-orange hover:underline font-bold" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
