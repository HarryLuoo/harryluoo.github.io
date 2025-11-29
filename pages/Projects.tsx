
import React, { useState, useEffect } from 'react';
import { PROJECTS } from '../constants';
import { Github, ArrowUpRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Project } from '../types';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectContent, setProjectContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load content
  useEffect(() => {
    if (selectedProject && selectedProject.content) {
      if (selectedProject.content.trim().startsWith('/') || selectedProject.content.trim().endsWith('.md')) {
        setIsLoading(true);
        fetch(selectedProject.content)
            .then(res => {
                if (!res.ok) throw new Error("Failed");
                return res.text();
            })
            .then(text => {
                setProjectContent(text);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setProjectContent("Error loading content.");
                setIsLoading(false);
            });
      } else {
        setProjectContent(selectedProject.content);
      }
    }
  }, [selectedProject]);

  // DETAIL VIEW
  if (selectedProject) {
      return (
        <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-4xl mx-auto bg-white shadow-sm my-8 md:my-16 border border-stone-100">
            <button 
            onClick={() => setSelectedProject(null)}
            className="flex items-center text-sm font-mono uppercase text-stone-500 hover:text-academic-orange mb-8 transition-colors"
            >
            <ChevronLeft size={16} className="mr-1" /> Back to Projects
            </button>
            
            <article>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-academic-black">
                {selectedProject.title}
            </h1>
            
            {/* Show Image in Detail if exists */}
            {selectedProject.imageUrl && selectedProject.imageUrl.trim() !== '' && (
                <div className="w-full h-64 md:h-80 bg-stone-200 mb-8 overflow-hidden rounded-sm">
                    <img src={selectedProject.imageUrl} alt={selectedProject.title} className="w-full h-full object-cover" />
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-academic-orange" size={32} />
                </div>
            ) : (
                <MarkdownRenderer content={projectContent} />
            )}

            <div className="flex gap-4 mt-8 pt-8 border-t border-stone-100">
                {selectedProject.github && selectedProject.github.trim() !== '#' && (
                    <a href={selectedProject.github} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-sm font-mono rounded">
                        <Github size={16} className="mr-2"/> View Code
                    </a>
                )}
                {selectedProject.link && selectedProject.link.trim() !== '#' && (
                    <a href={selectedProject.link} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-sm font-mono rounded">
                        <ArrowUpRight size={16} className="mr-2"/> Live Demo
                    </a>
                )}
            </div>
            </article>
        </div>
      );
  }

  // LIST VIEW
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-academic-black">Projects</h1>
        <div className="w-20 h-1 bg-academic-orange"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PROJECTS.map((project) => (
          <div key={project.id} className="bg-white group hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full cursor-pointer" onClick={() => project.content ? setSelectedProject(project) : null}>
            
            {/* Conditional Image Rendering */}
            {project.imageUrl && project.imageUrl.trim() !== '' ? (
                <div className="h-48 overflow-hidden relative bg-stone-200">
                    <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-academic-orange/0 group-hover:bg-academic-orange/10 transition-colors duration-300"></div>
                </div>
            ) : (
                // No image placeholder - just a colored strip
                <div className="h-2 w-full bg-stone-200 group-hover:bg-academic-orange transition-colors"></div>
            )}
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-serif text-2xl font-bold group-hover:text-academic-orange transition-colors">
                  {project.title}
                </h3>
                {/* External links visible in card */}
                <div className="flex gap-2 text-stone-400" onClick={(e) => e.stopPropagation()}>
                   {project.github && project.github.trim() !== '#' && project.github.trim() !== '' && (
                     <a href={project.github} target="_blank" rel="noreferrer" className="hover:text-academic-black" title="View Code">
                       <Github size={18}/>
                     </a>
                   )}
                   {project.link && project.link.trim() !== '#' && project.link.trim() !== '' && (
                     <a href={project.link} target="_blank" rel="noreferrer" className="hover:text-academic-black" title="View Live Demo">
                       <ArrowUpRight size={18}/>
                     </a>
                   )}
                </div>
              </div>

              <p className="font-sans text-stone-600 text-sm mb-6 flex-1 leading-relaxed">
                {project.description}
              </p>

              {project.content && (
                  <span className="text-xs text-academic-orange font-bold uppercase mb-4 block">Click for details →</span>
              )}

              <div className="flex flex-wrap gap-2 mt-auto">
                {project.techStack.map((tech) => (
                  <span key={tech} className="px-2 py-1 bg-stone-100 text-stone-600 text-[10px] font-mono uppercase tracking-wider border border-stone-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
