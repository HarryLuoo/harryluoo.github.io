import { Link } from 'react-router-dom';
import { site } from '../content/loader';
import { entityRoute, findEntity, formatMonth, recentEntities } from '../content/selectors';
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
  const post = entity as typeof site.notes.posts[number];
  return { title: post.title, description: post.excerpt, dateLabel: post.date, image: undefined };
};

const Home = () => {
  useDocumentMeta(site.seo.defaultTitle, site.seo.defaultDescription, '/');
  const featured = site.home.featured.visible
    ? entitySummary(site.home.featured.entityType, site.home.featured.slug)
    : undefined;
  const featuredImage = site.home.featured.imageOverrideUpload || featured?.image;

  return (
    <div className="min-h-screen">
      <section className="w-full bg-academic-orange px-8 py-8 md:px-16 md:py-10 lg:px-24 text-academic-black relative overflow-hidden">
        <div className="max-w-4xl relative z-10">
          <h1 className="font-serif-cn text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-normal leading-none whitespace-pre-line break-words">
            {site.home.hero.headline}
          </h1>
          <div className="w-16 h-1 bg-academic-black mb-5" />
          <p className="font-sans text-lg md:text-xl italic text-white max-w-2xl leading-relaxed whitespace-pre-line">
            {site.home.hero.subheadline}
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-wider">
            {site.home.hero.note && <><span>{site.home.hero.note}</span><span aria-hidden="true">·</span></>}
            <a href={site.shell.cvUpload} target="_blank" rel="noreferrer" className="border-b border-academic-black hover:text-white hover:border-white transition-colors">CV</a>
            <span aria-hidden="true">·</span>
            <a href={`mailto:${site.shell.profile.email}`} className="border-b border-academic-black hover:text-white hover:border-white transition-colors">Email</a>
          </p>
        </div>
      </section>

      <div className="px-8 pt-8 pb-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          <section className="col-span-1 lg:col-span-4 flex flex-col gap-6 min-w-0">
            <h2 className="self-start font-serif text-2xl tracking-widest border-b-2 border-academic-orange inline-block pb-1">RECENT</h2>
            <div className="space-y-5">
              {recentEntities.map((entry) => (
                <div key={entry.key} className="min-w-0">
                  <span className="font-mono text-xs text-stone-500 block mb-1">{entry.kind} · {formatMonth(entry.date)}</span>
                  {entry.route.startsWith('http')
                    ? <a href={entry.route} target="_blank" rel="noreferrer" className="font-serif text-base font-bold leading-snug break-words hover:text-academic-orange transition-colors">{entry.title}</a>
                    : <Link to={entry.route} className="font-serif text-base font-bold leading-snug break-words hover:text-academic-orange transition-colors">{entry.title}</Link>}
                </div>
              ))}
            </div>
            <Link to="/about/news" className="self-start lg:mt-auto text-xs font-mono uppercase border-b border-black pb-0.5">News &amp; honors</Link>
          </section>

          <section className="col-span-1 lg:col-span-8 flex flex-col gap-6 min-w-0">
            <h2 className="self-start font-serif text-2xl tracking-widest border-b-2 border-academic-orange inline-block pb-1">FEATURED</h2>
            {featured && (
              <div className="bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row min-w-0">
                {featuredImage && <div className="w-full lg:w-1/2 min-h-[12rem] lg:min-h-full bg-stone-200 overflow-hidden"><img src={featuredImage} alt={featured.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" /></div>}
                <div className={`w-full ${featuredImage ? 'lg:w-1/2' : 'lg:w-full'} p-6 min-w-0`}>
                  <h3 className="font-serif text-2xl font-bold mb-3 leading-tight break-words">
                    <Link to={entityRoute(site.home.featured.entityType, site.home.featured.slug)} className="hover:text-academic-orange transition-colors">{featured.title}</Link>
                  </h3>
                  <p className="font-sans text-stone-600 text-sm leading-relaxed">{featured.description}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:mt-auto">
              <div className="bg-stone-100 px-6 py-4 border-t-4 border-stone-300 hover:border-academic-orange transition-colors min-w-0">
                <h4 className="font-serif font-bold text-lg mb-3">Projects</h4>
                <Link to="/projects" className="text-xs font-mono uppercase border-b border-black pb-0.5">View Selected Projects</Link>
              </div>
              <div className="bg-stone-100 px-6 py-4 border-t-4 border-stone-300 hover:border-academic-orange transition-colors min-w-0">
                <h4 className="font-serif font-bold text-lg mb-3">Notes</h4>
                <Link to="/notes" className="text-xs font-mono uppercase border-b border-black pb-0.5">Read Notes</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
