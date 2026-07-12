import { ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { site } from '../content/loader';
import { entityRoute, findEntity, visibleSorted } from '../content/selectors';
import type { EntityType } from '../content/schema';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const entitySummary = (type: EntityType, slug: string) => {
  const entity = findEntity(type, slug);
  if (!entity) return undefined;
  if (type === 'paper') {
    const paper = entity as typeof site.research.papers[number];
    return { title: paper.title, description: paper.description, dateLabel: String(paper.year), image: undefined };
  }
  if (type === 'project') {
    const project = entity as typeof site.projects.items[number];
    return { title: project.title, description: project.description, dateLabel: 'Project', image: project.imageUpload };
  }
  const post = entity as typeof site.garden.posts[number];
  return { title: post.title, description: post.excerpt, dateLabel: post.date, image: undefined };
};

const Home = () => {
  useDocumentMeta(site.seo.defaultTitle, site.seo.defaultDescription, '/');
  const manualRecent = visibleSorted(site.home.recent.manualEntries);
  const autoRecent = site.home.recent.automaticEntries
    .map((placement) => ({ ...placement, summary: entitySummary(placement.entityType, placement.slug) }))
    .filter((entry) => entry.summary)
    .slice(0, site.home.recent.autoLimit);
  const featured = site.home.featured.visible
    ? entitySummary(site.home.featured.entityType, site.home.featured.slug)
    : undefined;
  const featuredImage = site.home.featured.imageOverrideUpload || featured?.image;

  return (
    <div className="min-h-screen">
      <section className="w-full bg-academic-orange p-8 md:p-16 lg:p-24 text-academic-black relative overflow-hidden">
        <div className="max-w-4xl relative z-10">
          <h1 className="font-serif-cn text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-normal leading-[0.9] whitespace-pre-line break-words">
            {site.home.hero.headline}
          </h1>
          <div className="w-24 h-1 bg-academic-black mb-8" />
          <p className="font-sans text-xl md:text-2xl lg:text-3xl italic text-white max-w-2xl leading-relaxed whitespace-pre-line">
            {site.home.hero.subheadline}
          </p>
        </div>
      </section>

      <div className="p-8 md:p-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          <section className="col-span-1 lg:col-span-4 space-y-8 min-w-0">
            <h2 className="font-serif text-2xl tracking-widest border-b-2 border-academic-orange inline-block pb-1 mb-4">RECENT</h2>
            <div className="space-y-8">
              {site.home.recent.mode === 'manual'
                ? manualRecent.map((entry) => (
                  <div key={`${entry.order}-${entry.title}`} className="group min-w-0">
                    {entry.imageUpload && <img src={entry.imageUpload} alt={entry.title} className="w-full h-40 object-cover mb-4 grayscale group-hover:grayscale-0 transition-all" />}
                    {entry.dateLabel && <span className="font-mono text-xs text-stone-500 block mb-1">{entry.dateLabel}</span>}
                    <p className="font-sans text-lg leading-snug break-words">
                      <strong className="font-serif font-bold">{entry.title}</strong> — {entry.description}
                    </p>
                    {entry.link && entry.ctaLabel && (
                      entry.link.startsWith('http')
                        ? <a href={entry.link} className="inline-block mt-3 text-xs font-mono uppercase border-b border-black" target="_blank" rel="noreferrer">{entry.ctaLabel}</a>
                        : <Link to={entry.link} className="inline-block mt-3 text-xs font-mono uppercase border-b border-black">{entry.ctaLabel}</Link>
                    )}
                  </div>
                ))
                : autoRecent.map((entry) => (
                  <div key={`${entry.entityType}-${entry.slug}`} className="min-w-0">
                    {entry.summary?.dateLabel && <span className="font-mono text-xs text-stone-500 block mb-1">{entry.summary.dateLabel}</span>}
                    <p className="font-sans text-lg leading-snug break-words"><strong className="font-serif font-bold">{entry.summary?.title}</strong> — {entry.summary?.description}</p>
                    <Link to={entityRoute(entry.entityType, entry.slug)} className="inline-block mt-3 text-xs font-mono uppercase border-b border-black">View detail</Link>
                  </div>
                ))}
            </div>
            <a href={site.shell.cvUpload} target="_blank" rel="noreferrer" className="inline-flex items-center mt-8 px-6 py-3 border border-academic-black hover:bg-academic-black hover:text-white transition-colors font-mono text-sm uppercase tracking-wider">
              <Download aria-hidden="true" size={16} className="mr-2" /> Download CV
            </a>
          </section>

          <section className="col-span-1 lg:col-span-8 space-y-6 min-w-0">
            <h2 className="font-serif text-2xl tracking-widest border-b-2 border-academic-orange inline-block pb-1 mb-4">FEATURED</h2>
            {featured && (
              <div className="bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row min-h-[22rem] h-auto min-w-0">
                {featuredImage && <div className="w-full lg:w-1/2 min-h-[16rem] lg:min-h-full bg-stone-200 overflow-hidden"><img src={featuredImage} alt={featured.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" /></div>}
                <div className={`w-full ${featuredImage ? 'lg:w-1/2' : 'lg:w-full'} p-8 flex flex-col justify-between min-w-0`}>
                  <div>
                    <span className="font-mono text-academic-orange text-xs font-bold tracking-widest uppercase mb-2 block">Featured Spotlight</span>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 leading-tight break-words">{featured.title}</h3>
                    <p className="font-sans text-stone-600 text-sm leading-relaxed mb-6">{featured.description}</p>
                  </div>
                  <Link to={entityRoute(site.home.featured.entityType, site.home.featured.slug)} className="self-start inline-flex items-center font-bold text-sm hover:text-academic-orange transition-colors mt-4">
                    Read {site.home.featured.entityType === 'paper' ? 'Paper' : site.home.featured.entityType === 'project' ? 'Project' : 'Note'} <ArrowRight aria-hidden="true" size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-stone-100 p-6 border-t-4 border-stone-300 hover:border-academic-orange transition-colors min-w-0">
                <h4 className="font-serif font-bold text-lg mb-2">Projects</h4>
                <p className="font-sans text-sm text-stone-600 mb-4">{site.home.projectsDescription}</p>
                <Link to="/projects" className="text-xs font-mono uppercase border-b border-black pb-0.5">View All Projects</Link>
              </div>
              <div className="bg-stone-100 p-6 border-t-4 border-stone-300 hover:border-academic-orange transition-colors min-w-0">
                <h4 className="font-serif font-bold text-lg mb-2">Garden</h4>
                <p className="font-sans text-sm text-stone-600 mb-4">{site.home.gardenDescription}</p>
                <Link to="/garden" className="text-xs font-mono uppercase border-b border-black pb-0.5">Read Notes</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
