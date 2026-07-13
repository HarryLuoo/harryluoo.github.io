import type { SiteContent } from '../../content/schema';
import type { ArticleSnapshot, UploadSnapshot } from '../types';
import { ArticleSelect, AssetSelect, Checkbox, Field, OrderButtons, Select, TagPicker, TextArea, TextInput } from './Controls';

interface EditorProps {
  value: SiteContent;
  baseline: SiteContent;
  articles: ArticleSnapshot[];
  uploads: UploadSnapshot[];
  update: (recipe: (draft: any) => void) => void;
}

const move = (items: any[], index: number, delta: number) => {
  const target = index + delta;
  if (target < 0 || target >= items.length) return;
  [items[index], items[target]] = [items[target], items[index]];
  items.forEach((item, order) => { item.order = order; });
};

const remove = (items: any[], index: number) => {
  items.splice(index, 1);
  items.forEach((item, order) => { item.order = order; });
};

const movePlain = (items: any[], index: number, delta: number) => {
  const target = index + delta;
  if (target < 0 || target >= items.length) return;
  [items[index], items[target]] = [items[target], items[index]];
};

const optional = (object: any, key: string, value?: string) => {
  if (value) object[key] = value;
  else delete object[key];
};

const entityOptions = (site: SiteContent, type: string) => {
  if (type === 'paper') return site.research.papers;
  if (type === 'project') return site.projects.items;
  return site.garden.posts;
};

export const ShellEditor = ({ value, baseline, uploads, update }: EditorProps) => {
  const existingNav = new Set(baseline.shell.navigation.map((item) => item.id));
  return <div className="editor-stack">
    <section><h2>Profile</h2><div className="field-grid">
      <Field label="Name"><TextInput value={value.shell.profile.name} onChange={(v) => update((d) => { d.shell.profile.name = v; })} /></Field>
      <Field label="Role"><TextInput value={value.shell.profile.role} onChange={(v) => update((d) => { d.shell.profile.role = v; })} /></Field>
      <Field label="Affiliation" wide><TextInput value={value.shell.profile.affiliation} onChange={(v) => update((d) => { d.shell.profile.affiliation = v; })} /></Field>
      <Field label="Email"><TextInput type="email" value={value.shell.profile.email} onChange={(v) => update((d) => { d.shell.profile.email = v; })} /></Field>
      <Field label="Bio" wide><TextArea value={value.shell.profile.bio} onChange={(v) => update((d) => { d.shell.profile.bio = v; })} /></Field>
      <Checkbox label="Show bio" checked={value.shell.profile.showBio} onChange={(v) => update((d) => { d.shell.profile.showBio = v; })} />
    </div></section>
    <section><h2>Shared CV</h2><AssetSelect value={value.shell.cvUpload} uploads={uploads.filter((u) => u.name.toLowerCase().endsWith('.pdf'))} onChange={(v) => update((d) => { if (v) d.shell.cvUpload = v; })} label="CV upload" /></section>
    <section><div className="section-heading"><h2>Social links</h2><button type="button" onClick={() => update((d) => { const choices = ['github', 'linkedin', 'scholar', 'twitter']; const platform = choices.find((p) => !d.shell.socials.some((s: any) => s.platform === p)) || 'twitter'; d.shell.socials.push({ platform, url: 'https://example.com', visible: true, order: d.shell.socials.length }); })}>Add social</button></div>
      {value.shell.socials.map((social, index) => <fieldset key={`${social.platform}-${index}`}><legend>{social.platform}</legend><div className="field-grid">
        <Field label="Platform"><Select value={social.platform} onChange={(v) => update((d) => { d.shell.socials[index].platform = v; })}>{['github', 'linkedin', 'scholar', 'twitter'].map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="URL"><TextInput value={social.url} onChange={(v) => update((d) => { d.shell.socials[index].url = v; })} /></Field>
        <Checkbox label="Visible" checked={social.visible} onChange={(v) => update((d) => { d.shell.socials[index].visible = v; })} />
      </div><OrderButtons index={index} length={value.shell.socials.length} onMove={(delta) => update((d) => move(d.shell.socials, index, delta))} onRemove={() => update((d) => remove(d.shell.socials, index))} /></fieldset>)}
    </section>
    <section><div className="section-heading"><h2>Navigation</h2><button type="button" onClick={() => update((d) => { d.shell.navigation.push({ id: `link-${Date.now()}`, label: 'LINK', kind: 'external', href: 'https://example.com', visible: true, order: d.shell.navigation.length }); })}>Add link</button></div>
      {value.shell.navigation.map((item, index) => <fieldset key={item.id}><legend>{item.label || item.id}</legend><div className="field-grid">
        <Field label="ID" hint={existingNav.has(item.id) ? 'Immutable' : undefined}><TextInput value={item.id} disabled={existingNav.has(item.id)} onChange={(v) => update((d) => { d.shell.navigation[index].id = v; })} /></Field>
        <Field label="Label"><TextInput value={item.label} onChange={(v) => update((d) => { d.shell.navigation[index].label = v; })} /></Field>
        <Field label="Kind"><Select value={item.kind} onChange={(kind) => update((d) => { const current = d.shell.navigation[index]; delete current.route; delete current.href; current.kind = kind; if (kind === 'internal') current.route = '/'; if (kind === 'external') current.href = 'https://example.com'; })}><option value="internal">Internal</option><option value="external">External</option><option value="cv">Shared CV</option></Select></Field>
        {item.kind === 'internal' && <Field label="Route"><Select value={item.route} onChange={(v) => update((d) => { d.shell.navigation[index].route = v; })}>{['/', '/about', '/research', '/projects', '/garden'].map((route) => <option key={route}>{route}</option>)}</Select></Field>}
        {item.kind === 'external' && <Field label="URL"><TextInput value={item.href} onChange={(v) => update((d) => { d.shell.navigation[index].href = v; })} /></Field>}
        <Checkbox label="Visible" checked={item.visible} onChange={(v) => update((d) => { d.shell.navigation[index].visible = v; })} />
      </div><OrderButtons index={index} length={value.shell.navigation.length} onMove={(delta) => update((d) => move(d.shell.navigation, index, delta))} onRemove={() => update((d) => remove(d.shell.navigation, index))} /></fieldset>)}
    </section>
  </div>;
};

export const HomeEditor = ({ value, uploads, update }: EditorProps) => <div className="editor-stack">
  <section><h2>Hero</h2><div className="field-grid"><Field label="Headline"><TextInput value={value.home.hero.headline} onChange={(v) => update((d) => { d.home.hero.headline = v; })} /></Field><Field label="Subheadline" wide><TextArea value={value.home.hero.subheadline} onChange={(v) => update((d) => { d.home.hero.subheadline = v; })} /></Field></div></section>
  <section><h2>Recent</h2><div className="field-grid"><Field label="Mode"><Select value={value.home.recent.mode} onChange={(v) => update((d) => { d.home.recent.mode = v; })}><option value="manual">Manual</option><option value="auto">Automatic</option></Select></Field><Field label="Automatic limit"><TextInput type="number" value={value.home.recent.autoLimit} onChange={(v) => update((d) => { d.home.recent.autoLimit = Number(v); })} /></Field></div>
    <div className="section-heading"><h3>Manual entries</h3><button type="button" onClick={() => update((d) => d.home.recent.manualEntries.push({ title: 'New entry', description: '', visible: true, order: d.home.recent.manualEntries.length }))}>Add entry</button></div>
    {value.home.recent.manualEntries.map((entry, index) => <fieldset key={`${entry.title}-${index}`}><legend>{entry.title || 'Entry'}</legend><div className="field-grid">
      <Field label="Title"><TextInput value={entry.title} onChange={(v) => update((d) => { d.home.recent.manualEntries[index].title = v; })} /></Field><Field label="Date label"><TextInput value={entry.dateLabel || ''} onChange={(v) => update((d) => optional(d.home.recent.manualEntries[index], 'dateLabel', v))} /></Field><Field label="Description" wide><TextArea value={entry.description} onChange={(v) => update((d) => { d.home.recent.manualEntries[index].description = v; })} /></Field><Field label="Optional link"><TextInput value={entry.link || ''} onChange={(v) => update((d) => optional(d.home.recent.manualEntries[index], 'link', v))} /></Field><Field label="CTA label"><TextInput value={entry.ctaLabel || ''} onChange={(v) => update((d) => optional(d.home.recent.manualEntries[index], 'ctaLabel', v))} /></Field><AssetSelect value={entry.imageUpload} uploads={uploads} allowPdf={false} label="Image" onChange={(v) => update((d) => optional(d.home.recent.manualEntries[index], 'imageUpload', v))} /><Checkbox label="Visible" checked={entry.visible} onChange={(v) => update((d) => { d.home.recent.manualEntries[index].visible = v; })} />
    </div><OrderButtons index={index} length={value.home.recent.manualEntries.length} onMove={(delta) => update((d) => move(d.home.recent.manualEntries, index, delta))} onRemove={() => update((d) => remove(d.home.recent.manualEntries, index))} /></fieldset>)}
    <div className="section-heading"><h3>Automatic placements</h3><button type="button" onClick={() => update((d) => d.home.recent.automaticEntries.push({ entityType: 'paper', slug: d.research.papers[0]?.slug || 'paper' }))}>Add placement</button></div>
    {value.home.recent.automaticEntries.map((placement, index) => <fieldset key={`${placement.entityType}-${index}`}><div className="field-grid"><Field label="Type"><Select value={placement.entityType} onChange={(v) => update((d) => { d.home.recent.automaticEntries[index].entityType = v; d.home.recent.automaticEntries[index].slug = entityOptions(d, v)[0]?.slug || ''; })}><option value="paper">Paper</option><option value="project">Project</option><option value="post">Post</option></Select></Field><Field label="Entity"><Select value={placement.slug} onChange={(v) => update((d) => { d.home.recent.automaticEntries[index].slug = v; })}>{entityOptions(value, placement.entityType).map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</Select></Field></div><OrderButtons index={index} length={value.home.recent.automaticEntries.length} onMove={(delta) => update((d) => movePlain(d.home.recent.automaticEntries, index, delta))} onRemove={() => update((d) => d.home.recent.automaticEntries.splice(index, 1))} /></fieldset>)}
  </section>
  <section><h2>Featured</h2><div className="field-grid"><Field label="Type"><Select value={value.home.featured.entityType} onChange={(v) => update((d) => { d.home.featured.entityType = v; d.home.featured.slug = entityOptions(d, v)[0]?.slug || ''; })}><option value="paper">Paper</option><option value="project">Project</option><option value="post">Post</option></Select></Field><Field label="Entity"><Select value={value.home.featured.slug} onChange={(v) => update((d) => { d.home.featured.slug = v; })}>{entityOptions(value, value.home.featured.entityType).map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</Select></Field><AssetSelect value={value.home.featured.imageOverrideUpload} uploads={uploads} allowPdf={false} label="Image override" onChange={(v) => update((d) => optional(d.home.featured, 'imageOverrideUpload', v))} /><Checkbox label="Visible" checked={value.home.featured.visible} onChange={(v) => update((d) => { d.home.featured.visible = v; })} /></div></section>
  <section><h2>Teasers</h2><div className="field-grid"><Field label="Projects description" wide><TextArea value={value.home.projectsDescription} onChange={(v) => update((d) => { d.home.projectsDescription = v; })} /></Field><Field label="Garden description" wide><TextArea value={value.home.gardenDescription} onChange={(v) => update((d) => { d.home.gardenDescription = v; })} /></Field></div></section>
</div>;

type AboutSectionKey = 'background' | 'currentWork';

const wordCount = (value: string) => value.trim() ? value.trim().split(/\s+/).length : 0;

const AboutSectionEditor = ({ sectionKey, label, value, uploads, update }: EditorProps & { sectionKey: AboutSectionKey; label: string }) => {
  const section = value.about[sectionKey];
  const imageUploads = uploads.filter((upload) => /\.(?:png|jpe?g|webp)$/i.test(upload.name));
  return <section>
    <h2>{label}</h2>
    <Field label="Text" wide><TextArea rows={7} value={section.text} onChange={(v) => update((d) => { d.about[sectionKey].text = v; })} /></Field>
    <div className="section-heading">
      <h3>Margin figures</h3>
      <button
        type="button"
        disabled={section.figures.length >= 2 || imageUploads.length === 0}
        title={imageUploads.length === 0 ? 'Upload a PNG, JPEG, or WebP image first' : undefined}
        onClick={() => update((d) => d.about[sectionKey].figures.push({ upload: imageUploads[0].path, alt: '' }))}
      >Add figure</button>
    </div>
    {imageUploads.length === 0 && <p className="muted">Upload a PNG, JPEG, or WebP image before adding a figure.</p>}
    {section.figures.map((figure, index) => <fieldset key={`${figure.upload}-${index}`}>
      <legend>Figure {index + 1}</legend>
      <div className="field-grid">
        <AssetSelect value={figure.upload} uploads={imageUploads} allowPdf={false} label="Image" onChange={(v) => update((d) => { if (v) d.about[sectionKey].figures[index].upload = v; })} />
        <Field label="Alternative text"><TextInput value={figure.alt} onChange={(v) => update((d) => { d.about[sectionKey].figures[index].alt = v; })} /></Field>
        <Field label="Caption" wide><TextInput value={figure.caption || ''} onChange={(v) => update((d) => optional(d.about[sectionKey].figures[index], 'caption', v))} /></Field>
      </div>
      <OrderButtons index={index} length={section.figures.length} onMove={(delta) => update((d) => movePlain(d.about[sectionKey].figures, index, delta))} onRemove={() => update((d) => d.about[sectionKey].figures.splice(index, 1))} />
    </fieldset>)}
  </section>;
};

export const AboutEditor = (props: EditorProps) => {
  const words = wordCount(props.value.about.background.text) + wordCount(props.value.about.currentWork.text);
  const outsideRange = words < 150 || words > 250;
  return <div className="editor-stack">
    <section>
      <h2>About page</h2>
      <p className={outsideRange ? 'warning' : 'muted'}>{words} words{outsideRange ? ' (recommended: 150-250)' : ''}</p>
    </section>
    <AboutSectionEditor {...props} sectionKey="background" label="Background" />
    <AboutSectionEditor {...props} sectionKey="currentWork" label="Current Work" />
  </div>;
};

const SlugField = ({ slug, existing, onChange }: { slug: string; existing: boolean; onChange: (value: string) => void }) => <Field label="Slug" hint={existing ? 'Immutable' : 'Set once'}><TextInput value={slug} disabled={existing} onChange={onChange} /></Field>;

export const ResearchEditor = ({ value, baseline, articles, uploads, update }: EditorProps) => <div className="editor-stack">
  <section><h2>Research page</h2><Field label="Description" wide><TextArea value={value.research.description} onChange={(v) => update((d) => { d.research.description = v; })} /></Field></section>
  <section><h2>Shared tag vocabulary</h2><Field label="One tag per line" wide><TextArea rows={8} value={value.tags.join('\n')} onChange={(v) => update((d) => { d.tags = v.split('\n').map((tag: string) => tag.trim()).filter(Boolean); })} /></Field></section>
  <section><div className="section-heading"><h2>Papers</h2><button type="button" onClick={() => update((d) => d.research.papers.push({ slug: 'new-paper', title: 'New paper', authors: ['Author'], venue: 'Venue', year: new Date().getFullYear(), description: '', tags: [], bibtexVisible: false, visible: true, order: d.research.papers.length }))}>Add paper</button></div>
    {value.research.papers.map((paper, index) => <fieldset key={`${paper.slug}-${index}`}><legend>{paper.title}</legend><div className="field-grid">
      <SlugField slug={paper.slug} existing={baseline.research.papers.some((item) => item.slug === paper.slug)} onChange={(v) => update((d) => { d.research.papers[index].slug = v; })} /><Field label="Title"><TextInput value={paper.title} onChange={(v) => update((d) => { d.research.papers[index].title = v; })} /></Field><Field label="Authors" hint="Comma-separated"><TextInput value={paper.authors.join(', ')} onChange={(v) => update((d) => { d.research.papers[index].authors = v.split(',').map((x: string) => x.trim()).filter(Boolean); })} /></Field><Field label="Venue/status"><TextInput value={paper.venue} onChange={(v) => update((d) => { d.research.papers[index].venue = v; })} /></Field><Field label="Year"><TextInput type="number" value={paper.year} onChange={(v) => update((d) => { d.research.papers[index].year = Number(v); })} /></Field><Field label="Description" wide><TextArea value={paper.description} onChange={(v) => update((d) => { d.research.papers[index].description = v; })} /></Field><TagPicker value={paper.tags} tags={value.tags} onChange={(v) => update((d) => { d.research.papers[index].tags = v; })} /><AssetSelect value={paper.pdfUpload} uploads={uploads.filter((u) => u.name.toLowerCase().endsWith('.pdf'))} label="PDF" onChange={(v) => update((d) => optional(d.research.papers[index], 'pdfUpload', v))} /><Field label="Permalink URL"><TextInput value={paper.permalinkUrl || ''} onChange={(v) => update((d) => optional(d.research.papers[index], 'permalinkUrl', v))} /></Field><Field label="Code URL"><TextInput value={paper.codeUrl || ''} onChange={(v) => update((d) => optional(d.research.papers[index], 'codeUrl', v))} /></Field><ArticleSelect value={paper.articleSlug} articles={articles} onChange={(v) => update((d) => optional(d.research.papers[index], 'articleSlug', v))} /><Checkbox label="Show BibTeX" checked={paper.bibtexVisible} onChange={(v) => update((d) => { d.research.papers[index].bibtexVisible = v; })} /><Field label="BibTeX override" wide><TextArea value={paper.bibtex || ''} onChange={(v) => update((d) => optional(d.research.papers[index], 'bibtex', v))} /></Field><Checkbox label="Visible" checked={paper.visible} onChange={(v) => update((d) => { d.research.papers[index].visible = v; })} />
    </div><OrderButtons index={index} length={value.research.papers.length} onMove={(delta) => update((d) => move(d.research.papers, index, delta))} onRemove={() => update((d) => remove(d.research.papers, index))} /></fieldset>)}
  </section>
</div>;

export const ProjectsEditor = ({ value, baseline, articles, uploads, update }: EditorProps) => <div className="editor-stack"><section><div className="section-heading"><h2>Projects</h2><button type="button" onClick={() => update((d) => d.projects.items.push({ slug: 'new-project', title: 'New project', description: '', tags: [], visible: true, order: d.projects.items.length }))}>Add project</button></div>
  {value.projects.items.map((project, index) => <fieldset key={`${project.slug}-${index}`}><legend>{project.title}</legend><div className="field-grid"><SlugField slug={project.slug} existing={baseline.projects.items.some((item) => item.slug === project.slug)} onChange={(v) => update((d) => { d.projects.items[index].slug = v; })} /><Field label="Title"><TextInput value={project.title} onChange={(v) => update((d) => { d.projects.items[index].title = v; })} /></Field><Field label="Description" wide><TextArea value={project.description} onChange={(v) => update((d) => { d.projects.items[index].description = v; })} /></Field><TagPicker value={project.tags} tags={value.tags} onChange={(v) => update((d) => { d.projects.items[index].tags = v; })} /><AssetSelect value={project.imageUpload} uploads={uploads} allowPdf={false} label="Image" onChange={(v) => update((d) => optional(d.projects.items[index], 'imageUpload', v))} /><Field label="Repository URL"><TextInput value={project.repositoryUrl || ''} onChange={(v) => update((d) => optional(d.projects.items[index], 'repositoryUrl', v))} /></Field><Field label="Live URL"><TextInput value={project.liveUrl || ''} onChange={(v) => update((d) => optional(d.projects.items[index], 'liveUrl', v))} /></Field><ArticleSelect value={project.articleSlug} articles={articles} onChange={(v) => update((d) => optional(d.projects.items[index], 'articleSlug', v))} /><Checkbox label="Visible" checked={project.visible} onChange={(v) => update((d) => { d.projects.items[index].visible = v; })} /></div><OrderButtons index={index} length={value.projects.items.length} onMove={(delta) => update((d) => move(d.projects.items, index, delta))} onRemove={() => update((d) => remove(d.projects.items, index))} /></fieldset>)}
</section></div>;

export const GardenEditor = ({ value, baseline, articles, uploads, update }: EditorProps) => <div className="editor-stack"><section><h2>Garden page</h2><Field label="Description" wide><TextArea value={value.garden.description} onChange={(v) => update((d) => { d.garden.description = v; })} /></Field></section><section><div className="section-heading"><h2>Posts</h2><button type="button" onClick={() => update((d) => d.garden.posts.push({ slug: 'new-post', title: 'New post', date: '', excerpt: '', tags: [], visible: true, order: d.garden.posts.length }))}>Add post</button></div>
  {value.garden.posts.map((post, index) => <fieldset key={`${post.slug}-${index}`}><legend>{post.title}</legend><div className="field-grid"><SlugField slug={post.slug} existing={baseline.garden.posts.some((item) => item.slug === post.slug)} onChange={(v) => update((d) => { d.garden.posts[index].slug = v; })} /><Field label="Title"><TextInput value={post.title} onChange={(v) => update((d) => { d.garden.posts[index].title = v; })} /></Field><Field label="Date label"><TextInput value={post.date} onChange={(v) => update((d) => { d.garden.posts[index].date = v; })} /></Field><Field label="Excerpt" wide><TextArea value={post.excerpt} onChange={(v) => update((d) => { d.garden.posts[index].excerpt = v; })} /></Field><TagPicker value={post.tags} tags={value.tags} onChange={(v) => update((d) => { d.garden.posts[index].tags = v; })} /><ArticleSelect value={post.articleSlug} articles={articles} onChange={(v) => update((d) => optional(d.garden.posts[index], 'articleSlug', v))} /><AssetSelect value={post.pdfUpload} uploads={uploads.filter((u) => u.name.toLowerCase().endsWith('.pdf'))} label="PDF attachment" onChange={(v) => update((d) => optional(d.garden.posts[index], 'pdfUpload', v))} /><Checkbox label="Visible" checked={post.visible} onChange={(v) => update((d) => { d.garden.posts[index].visible = v; })} /></div><OrderButtons index={index} length={value.garden.posts.length} onMove={(delta) => update((d) => move(d.garden.posts, index, delta))} onRemove={() => update((d) => remove(d.garden.posts, index))} /></fieldset>)}
</section></div>;

export const SeoEditor = ({ value, uploads, update }: EditorProps) => <div className="editor-stack"><section><h2>Search and sharing</h2><div className="field-grid"><Field label="Site URL"><TextInput value={value.seo.siteUrl} onChange={(v) => update((d) => { d.seo.siteUrl = v; })} /></Field><Field label="Default title"><TextInput value={value.seo.defaultTitle} onChange={(v) => update((d) => { d.seo.defaultTitle = v; })} /></Field><Field label="Title suffix"><TextInput value={value.seo.titleSuffix} onChange={(v) => update((d) => { d.seo.titleSuffix = v; })} /></Field><Field label="Default description" wide><TextArea value={value.seo.defaultDescription} onChange={(v) => update((d) => { d.seo.defaultDescription = v; })} /></Field><Field label="Open Graph site name"><TextInput value={value.seo.openGraph.siteName} onChange={(v) => update((d) => { d.seo.openGraph.siteName = v; })} /></Field><Field label="Open Graph type"><Select value={value.seo.openGraph.type} onChange={(v) => update((d) => { d.seo.openGraph.type = v; })}><option value="website">Website</option><option value="profile">Profile</option></Select></Field><Field label="Twitter card"><Select value={value.seo.twitter.card} onChange={(v) => update((d) => { d.seo.twitter.card = v; })}><option value="summary">Summary</option><option value="summary_large_image">Large image</option></Select></Field><AssetSelect value={value.seo.faviconUpload} uploads={uploads} allowPdf={false} label="Favicon" onChange={(v) => update((d) => optional(d.seo, 'faviconUpload', v))} /><AssetSelect value={value.seo.socialImageUpload} uploads={uploads} allowPdf={false} label="Social image" onChange={(v) => update((d) => optional(d.seo, 'socialImageUpload', v))} /><Checkbox label="Allow indexing" checked={value.seo.robots.index} onChange={(v) => update((d) => { d.seo.robots.index = v; })} /><Checkbox label="Allow following links" checked={value.seo.robots.follow} onChange={(v) => update((d) => { d.seo.robots.follow = v; })} /></div></section></div>;
