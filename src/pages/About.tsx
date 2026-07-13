import { FileText, Mail } from 'lucide-react';
import { site } from '../content/loader';
import type { AboutSection as AboutSectionContent } from '../content/schema';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const AboutSection = ({ label, section }: { label: string; section: AboutSectionContent }) => {
  const hasFigures = section.figures.length > 0;
  return (
    <section className={`py-10 md:py-12 border-b border-stone-200 ${hasFigures ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12' : ''}`}>
      <div className="min-w-0 max-w-2xl">
        <h2 className="font-mono text-xs font-bold uppercase text-stone-500 mb-4">{label}</h2>
        <p className="font-sans text-lg text-stone-800 leading-relaxed whitespace-pre-line">{section.text}</p>
      </div>
      {hasFigures && (
        <div className="mt-8 lg:mt-0 space-y-7 min-w-0">
          {section.figures.map((figure, index) => (
            <figure key={`${figure.upload}-${index}`} className="min-w-0">
              <img src={figure.upload} alt={figure.alt} className="block w-full h-auto max-h-72 object-contain border border-stone-200" />
              {figure.caption && <figcaption className="mt-2 font-sans text-xs leading-relaxed text-stone-500">{figure.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
};

const About = () => {
  useDocumentMeta('About', site.about.background.text, '/about');
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-5xl mx-auto min-w-0">
      <header className="mb-4">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 break-words">About</h1>
        <div className="w-20 h-1 bg-academic-orange" />
      </header>

      <AboutSection label="Background" section={site.about.background} />
      <AboutSection label="Current Work" section={site.about.currentWork} />

      <div className="flex flex-wrap gap-x-6 gap-y-3 pt-8">
        <a href={site.shell.cvUpload} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-academic-black">
          <FileText aria-hidden="true" size={14} className="mr-1.5" /> CV
        </a>
        <a href={`mailto:${site.shell.profile.email}`} className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-academic-black">
          <Mail aria-hidden="true" size={14} className="mr-1.5" /> Email
        </a>
      </div>
    </div>
  );
};

export default About;
