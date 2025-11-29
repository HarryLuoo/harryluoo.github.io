
import React, { useState, useEffect } from 'react';
import { RESEARCH_PAPERS, RESEARCH_PAGE_CONFIG } from '../constants';
import { FileText, Code, ExternalLink, Check, ChevronLeft, Loader2 } from 'lucide-react';
import { Paper } from '../types';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Research: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [paperContent, setPaperContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load content when paper selected
  useEffect(() => {
    if (selectedPaper && selectedPaper.content) {
      if (selectedPaper.content.trim().startsWith('/') || selectedPaper.content.trim().endsWith('.md')) {
        setIsLoading(true);
        fetch(selectedPaper.content)
          .then(res => {
            if (!res.ok) throw new Error("Failed to load");
            return res.text();
          })
          .then(text => {
            setPaperContent(text);
            setIsLoading(false);
          })
          .catch(err => {
            console.error(err);
            setPaperContent("Error loading content.");
            setIsLoading(false);
          })
      } else {
        setPaperContent(selectedPaper.content);
      }
    }
  }, [selectedPaper]);

  const handleCopyBibtex = (paper: Paper) => {
    const bibtex = paper.bibtex || `@article{${paper.id},
  title={${paper.title}},
  author={${paper.authors.join(' and ')}},
  year={${paper.year}},
  journal={${paper.venue}}
}`;
    
    navigator.clipboard.writeText(bibtex).then(() => {
      setCopiedId(paper.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // DETAIL VIEW
  if (selectedPaper) {
    return (
      <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-4xl mx-auto bg-white shadow-sm my-8 md:my-16 border border-stone-100">
        <button 
          onClick={() => setSelectedPaper(null)}
          className="flex items-center text-sm font-mono uppercase text-stone-500 hover:text-academic-orange mb-8 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Research
        </button>
        
        <article>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-academic-black">
            {selectedPaper.title}
          </h1>
          <div className="font-sans text-stone-600 mb-6 italic border-b border-stone-200 pb-6">
              {selectedPaper.authors.join(", ")} <br/>
              <span className="text-sm not-italic text-stone-400 font-mono">{selectedPaper.venue} | {selectedPaper.year}</span>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
               <Loader2 className="animate-spin text-academic-orange" size={32} />
            </div>
          ) : (
             <MarkdownRenderer content={paperContent} />
          )}

          {/* Action Buttons in Detail View */}
          <div className="flex gap-4 mt-12 pt-8 border-t border-stone-100">
              {selectedPaper.pdfLink && selectedPaper.pdfLink.trim() !== '#' && (
                <a href={selectedPaper.pdfLink} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 border border-stone-300 hover:border-academic-orange hover:text-academic-orange transition-colors text-xs font-bold uppercase tracking-wider">
                  <FileText size={14} className="mr-2" /> View PDF
                </a>
              )}
               {selectedPaper.codeLink && selectedPaper.codeLink.trim() !== '#' && (
                <a href={selectedPaper.codeLink} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 border border-stone-300 hover:border-academic-black hover:text-academic-black transition-colors text-xs font-bold uppercase tracking-wider">
                  <Code size={14} className="mr-2" /> View Code
                </a>
              )}
          </div>
        </article>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-5xl mx-auto">
      <header className="mb-16">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-academic-black">Research</h1>
        <div className="w-20 h-1 bg-academic-orange"></div>
        <p className="font-sans text-stone-600 mt-6 max-w-2xl text-lg">
          {RESEARCH_PAGE_CONFIG.description}
        </p>
      </header>

      <div className="space-y-12">
        {RESEARCH_PAPERS.map((paper) => (
          <div key={paper.id} className="group relative pl-8 border-l-2 border-stone-200 hover:border-academic-orange transition-colors duration-300">
            {/* Timeline dot */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200 group-hover:bg-academic-orange transition-colors duration-300 border-4 border-academic-cream"></div>
            
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
              {/* If content exists, clickable title to detail view. Else check for PDF link. Else text. */}
              {paper.content && paper.content.trim() !== "" ? (
                 <button 
                  onClick={() => setSelectedPaper(paper)}
                  className="text-left font-serif text-2xl font-bold text-academic-black group-hover:text-academic-orange transition-colors hover:underline decoration-2 underline-offset-4"
                >
                  {paper.title}
                </button>
              ) : paper.pdfLink && paper.pdfLink.trim() !== '#' && paper.pdfLink.trim() !== '' ? (
                <a 
                  href={paper.pdfLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-serif text-2xl font-bold text-academic-black group-hover:text-academic-orange transition-colors hover:underline decoration-2 underline-offset-4"
                >
                  {paper.title}
                </a>
              ) : (
                <h2 className="font-serif text-2xl font-bold text-academic-black group-hover:text-academic-orange transition-colors">
                  {paper.title}
                </h2>
              )}
              
              <span className="font-mono text-stone-400 text-sm mt-1 md:mt-0 flex-shrink-0 ml-4">
                {paper.venue} {paper.year}
              </span>
            </div>

            <div className="font-sans text-stone-600 mb-3 italic">
              {paper.authors.join(", ")}
            </div>

            <p className="font-sans text-stone-800 leading-relaxed max-w-3xl mb-4">
              {paper.description}
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              {paper.content && paper.content.trim() !== "" && (
                 <button onClick={() => setSelectedPaper(paper)} className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-academic-orange hover:text-academic-black transition-colors">
                   Read More →
                 </button>
              )}

              {paper.pdfLink && paper.pdfLink.trim() !== '#' && paper.pdfLink.trim() !== '' && (
                <a href={paper.pdfLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-academic-black transition-colors">
                  <FileText size={14} className="mr-1" /> PDF
                </a>
              )}
              {paper.codeLink && paper.codeLink.trim() !== '#' && paper.codeLink.trim() !== '' && (
                <a href={paper.codeLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-academic-black transition-colors">
                  <Code size={14} className="mr-1" /> Code
                </a>
              )}
              
              {paper.includeBibtex && (
                <button 
                  onClick={() => handleCopyBibtex(paper)}
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-academic-black transition-colors"
                >
                  {copiedId === paper.id ? (
                    <><Check size={14} className="mr-1 text-green-600" /> Copied</>
                  ) : (
                    <><ExternalLink size={14} className="mr-1" /> BibTeX</>
                  )}
                </button>
              )}
            </div>

            <div className="mt-4 flex gap-2">
               {paper.tags.map(tag => (
                 <span key={tag} className="px-2 py-1 bg-stone-100 text-stone-500 text-[10px] font-mono uppercase rounded-sm">
                   {tag}
                 </span>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Research;
