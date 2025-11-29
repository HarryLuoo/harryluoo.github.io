import React, { useEffect } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  HOMEPAGE_CONFIG,
  HOMEPAGE_CONTENT,
  getHomepageContentCard,
  HERO_INFO,
  HomepageContentCard
} from '../constants';

const buildFontFamily = (english?: string, chinese?: string) => {
  const fonts: string[] = [];
  if (english?.trim()) {
    fonts.push(english.trim());
  }
  if (chinese?.trim() && !fonts.includes(chinese.trim())) {
    fonts.push(chinese.trim());
  }
  fonts.push('serif');
  return fonts.join(', ');
};

const Home: React.FC = () => {
  const {
    recentMode,
    recentManualEntries,
    recentAutoLimit,
    featuredEntry,
    tabTitle
  } = HOMEPAGE_CONFIG;

  useEffect(() => {
    if (tabTitle) {
      document.title = tabTitle;
    }
  }, [tabTitle]);

  const autoEntries = [...HOMEPAGE_CONTENT]
    .sort((a, b) => b.sortValue - a.sortValue)
    .slice(0, Math.max(recentAutoLimit || 3, 1));

  const manualEntries: HomepageContentCard[] = recentManualEntries.map((entry, index) => ({
    type: 'manual' as any,
    id: `manual-${index}`,
    title: entry.title,
    description: entry.description,
    dateLabel: entry.dateLabel,
    sortValue: 0,
    link: entry.link || '',
    ctaLabel: entry.ctaLabel || '',
    imageUrl: entry.imageUrl || undefined
  }));

  const recentEntries = manualEntries.length > 0 ? manualEntries : autoEntries;

  const featuredCard =
    getHomepageContentCard(featuredEntry.type, featuredEntry.id) ||
    recentEntries[0] ||
    autoEntries[0] ||
    null;

  const featuredImage =
    featuredEntry.imageOverride?.trim() || featuredCard?.imageUrl || '';

  const renderRecentEntry = (entry: HomepageContentCard) => (
    <div key={`${entry.type}-${entry.id}`} className="group">
      {entry.dateLabel && (
        <span className="font-mono text-xs text-stone-500 block mb-1">{entry.dateLabel}</span>
      )}
      <p className="font-sans text-lg leading-snug">
        <strong className="font-serif font-bold">{entry.title}</strong> — <span style={{ fontFamily: '"Palatino Linotype", serif' }}>{entry.description}</span>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="w-full bg-academic-orange p-8 md:p-16 lg:p-24 text-academic-black relative overflow-hidden">
        <div className="max-w-4xl relative z-10">
          <h1
            className={`${HERO_INFO.headlineSize || 'text-5xl md:text-7xl lg:text-8xl'} font-bold mb-6 tracking-tight leading-[0.9] whitespace-pre-line`}
            style={{ fontFamily: buildFontFamily(HERO_INFO.headlineFontEng, HERO_INFO.headlineFontCn) }}
          >
            {HERO_INFO.headline}
          </h1>
          <div className="w-24 h-1 bg-academic-black mb-8"></div>
          <p
            className={`${HERO_INFO.subheadlineSize || 'text-xl md:text-2xl lg:text-3xl'} italic text-white max-w-2xl leading-relaxed whitespace-pre-line`}
            style={{ fontFamily: buildFontFamily(HERO_INFO.subheadlineFontEng, HERO_INFO.subheadlineFontCn) }}
          >
            {HERO_INFO.subheadline}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      </div>

      {/* Grid Content */}
      <div className="p-8 md:p-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Recent Updates */}
          <div className="col-span-1 lg:col-span-4 space-y-8">
            <h2 className="font-serif text-2xl tracking-widest border-b-2 border-academic-orange inline-block pb-1 mb-4">
              RECENT
            </h2>
            <div className="space-y-8">
              {recentEntries.length > 0 ? (
                recentEntries.map(renderRecentEntry)
              ) : (
                <p className="font-serif text-lg text-stone-600">
                  Configure “Recent” entries in the CMS to highlight the most relevant updates.
                </p>
              )}
            </div>
            <a
              href="/cv.pdf"
              className="inline-flex items-center mt-8 px-6 py-3 border border-academic-black hover:bg-academic-black hover:text-white transition-colors font-mono text-sm uppercase tracking-wider"
            >
              <Download size={16} className="mr-2" />
              Download CV
            </a>
          </div>

          {/* Featured Entry */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
            <h2 className="font-serif text-2xl tracking-widest border-b-2 border-academic-orange inline-block pb-1 mb-4">
              FEATURED
            </h2>
            {featuredCard ? (
              <div className="bg-white border border-stone-200 p-0 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row min-h-[22rem] h-auto">
                {featuredImage ? (
                  <div className="w-full lg:w-1/2 min-h-[16rem] lg:min-h-full bg-stone-200 relative overflow-hidden">
                    <img
                      src={featuredImage}
                      alt={featuredCard.title}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                ) : null}
                <div
                  className={`w-full ${
                    featuredImage ? 'lg:w-1/2' : 'lg:w-full'
                  } p-8 flex flex-col justify-between`}
                >
                  <div>
                    <span className="font-mono text-academic-orange text-xs font-bold tracking-widest uppercase mb-2 block">
                      Featured Spotlight
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 leading-tight">
                      {featuredCard.title}
                    </h3>
                    <p className="font-sans text-stone-600 text-sm leading-relaxed mb-6">
                      {featuredCard.description}
                    </p>
                  </div>
                  <Link
                    to={featuredCard.link}
                    className="self-start inline-flex items-center font-bold text-sm hover:text-academic-orange transition-colors mt-4"
                  >
                    {featuredCard.ctaLabel} <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="font-serif text-lg text-stone-600">
                Assign a featured entry through the CMS to highlight a research, project, or garden entry here.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-stone-100 p-6 border-t-4 border-stone-300 hover:border-academic-orange transition-colors cursor-pointer">
                <h4 className="font-serif font-bold text-lg mb-2">Projects</h4>
                <p className="font-sans text-sm text-stone-600 mb-4">
                  {HOMEPAGE_CONFIG.projectsDescription || "Fun projects that I do"}
                </p>
                <Link to="/projects" className="text-xs font-mono uppercase border-b border-black pb-0.5">
                  View All Projects
                </Link>
              </div>
              <div className="bg-stone-100 p-6 border-t-4 border-stone-300 hover:border-academic-orange transition-colors cursor-pointer">
                <h4 className="font-serif font-bold text-lg mb-2">Garden</h4>
                <p className="font-sans text-sm text-stone-600 mb-4">
                  Notes, thoughts, and derivations. A digital garden.
                </p>
                <Link to="/garden" className="text-xs font-mono uppercase border-b border-black pb-0.5">
                  Read Notes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
