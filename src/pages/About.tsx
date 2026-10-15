import type { ReactNode } from 'react';
import { FileText, Mail } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { site } from '../content/loader';
import type { AboutSection as AboutSectionContent } from '../content/schema';
import { formatMonth, news } from '../content/selectors';
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

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `pb-2 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${isActive ? 'border-academic-orange text-academic-black' : 'border-transparent text-stone-500 hover:text-academic-black'}`;

const AboutLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen p-8 md:p-16 lg:p-24 max-w-5xl mx-auto min-w-0">
    <header className="mb-4">
      <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 break-words">About</h1>
      <div className="w-20 h-1 bg-academic-orange" />
      <nav aria-label="About sections" className="flex gap-6 mt-8 border-b border-stone-200">
        <NavLink to="/about" end className={tabClass}>Profile</NavLink>
        <NavLink to="/about/news" className={tabClass}>News &amp; Honors</NavLink>
      </nav>
    </header>

    {children}

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

const About = () => {
  useDocumentMeta('About', site.about.background.text, '/about');
  return (
    <AboutLayout>
      <AboutSection label="Background" section={site.about.background} />
      <AboutSection label="Research Interests" section={site.about.interests} />
    </AboutLayout>
  );
};

export const AboutNews = () => {
  useDocumentMeta('News & Honors', 'Milestones, awards, and talks.', '/about/news');
  return (
    <AboutLayout>
      <ol className="py-6 md:py-8 border-b border-stone-200">
        {news.map((entry) => (
          <li key={`${entry.date}-${entry.title}`} className="grid grid-cols-1 sm:grid-cols-[7rem_minmax(0,1fr)] gap-1 sm:gap-6 py-5 border-b border-stone-100 last:border-b-0 min-w-0">
            <span className="font-mono text-xs text-stone-500 pt-1">{formatMonth(entry.date)}</span>
            <div className="min-w-0 max-w-2xl">
              <h2 className="font-serif text-lg font-bold leading-snug break-words">
                {entry.link
                  ? entry.link.startsWith('http')
                    ? <a href={entry.link} target="_blank" rel="noreferrer" className="hover:text-academic-orange transition-colors">{entry.title}</a>
                    : <Link to={entry.link} className="hover:text-academic-orange transition-colors">{entry.title}</Link>
                  : entry.title}
              </h2>
              <p className="font-sans text-stone-700 leading-relaxed mt-1">{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </AboutLayout>
  );
};

export default About;
