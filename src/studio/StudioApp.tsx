import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SiteContent } from '../content/schema';
import { ApiError, studioApi } from './api';
import { ArticlesEditor } from './components/ArticlesEditor';
import { GardenEditor, HomeEditor, ProjectsEditor, ResearchEditor, SeoEditor, ShellEditor } from './components/StructuredEditors';
import { UploadsEditor } from './components/UploadsEditor';
import { PublishEditor } from './components/PublishEditor';
import type { StudioArea, StudioSnapshot } from './types';

const areas: StudioArea[] = ['Shell', 'Home', 'Research', 'Projects', 'Garden', 'Articles', 'Uploads', 'SEO', 'Verify/Publish'];
const structuredAreas = new Set<StudioArea>(['Shell', 'Home', 'Research', 'Projects', 'Garden', 'SEO']);
const clone = <T,>(value: T): T => structuredClone(value);

const StudioApp = () => {
  const [snapshot, setSnapshot] = useState<StudioSnapshot | null>(null);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [area, setArea] = useState<StudioArea>('Shell');
  const [status, setStatus] = useState('Loading canonical content…');
  const [previewRevision, setPreviewRevision] = useState(0);
  const [articleDirty, setArticleDirty] = useState(false);
  const [uploadDirty, setUploadDirty] = useState(false);
  const [discardSignal, setDiscardSignal] = useState(0);

  const siteDirty = useMemo(() => Boolean(snapshot && draft && JSON.stringify(snapshot.site.content) !== JSON.stringify(draft)), [draft, snapshot]);
  const dirty = siteDirty || articleDirty || uploadDirty;

  const loadSnapshot = useCallback(async (reloadPreview = false) => {
    const next = await studioApi.snapshot();
    setSnapshot(next);
    setDraft(clone(next.site.content));
    if (reloadPreview) setPreviewRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    loadSnapshot().then(() => setStatus('Saved disk state')).catch((error) => setStatus(error instanceof Error ? error.message : 'Failed to load'));
  }, [loadSnapshot]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const discardAll = () => {
    if (snapshot) setDraft(clone(snapshot.site.content));
    setArticleDirty(false);
    setUploadDirty(false);
    setDiscardSignal((value) => value + 1);
    setStatus('Unsaved edits discarded');
  };

  const chooseArea = (next: StudioArea) => {
    if (next === area) return;
    if (dirty && !window.confirm('Discard unsaved edits before changing Studio areas?')) return;
    if (dirty) discardAll();
    setArea(next);
  };

  const update = (recipe: (next: any) => void) => {
    setDraft((current) => {
      if (!current) return current;
      const next = clone(current);
      recipe(next);
      return next;
    });
    setStatus('Unsaved changes');
  };

  const saveSite = async () => {
    if (!snapshot || !draft) return;
    try {
      setStatus('Saving…');
      await studioApi.saveSite(draft, snapshot.site.revision);
      await loadSnapshot(true);
      setStatus('Saved to disk');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) setStatus(`Conflict: ${error.message}. Reload or discard after reviewing the disk version.`);
      else setStatus(error instanceof Error ? `Validation failed: ${error.message}` : 'Save failed');
    }
  };

  if (!snapshot || !draft) return <main className="studio-loading"><h1>Portfolio Studio</h1><p>{status}</p></main>;

  const editorProps = { value: draft, baseline: snapshot.site.content, articles: snapshot.articles, uploads: snapshot.uploads, update };
  const editor = area === 'Shell' ? <ShellEditor {...editorProps} />
    : area === 'Home' ? <HomeEditor {...editorProps} />
      : area === 'Research' ? <ResearchEditor {...editorProps} />
        : area === 'Projects' ? <ProjectsEditor {...editorProps} />
          : area === 'Garden' ? <GardenEditor {...editorProps} />
            : area === 'SEO' ? <SeoEditor {...editorProps} />
              : area === 'Articles' ? <ArticlesEditor articles={snapshot.articles} onRefresh={loadSnapshot} onDirtyChange={setArticleDirty} discardSignal={discardSignal} />
                : area === 'Uploads' ? <UploadsEditor uploads={snapshot.uploads} onRefresh={loadSnapshot} onDirtyChange={setUploadDirty} discardSignal={discardSignal} />
                  : <PublishEditor />;

  return <div className="studio-shell">
    <header className="studio-header"><div><h1>Portfolio Studio</h1><p>Local saved-disk editor</p></div><div className={`save-state ${dirty ? 'dirty' : ''}`} aria-live="polite"><span>{dirty ? 'Unsaved' : 'Saved'}</span><small>{status}</small></div></header>
    <nav className="studio-tabs" aria-label="Studio areas">{areas.map((item) => <button key={item} type="button" className={area === item ? 'active' : ''} onClick={() => chooseArea(item)}>{item}</button>)}</nav>
    <div className="studio-workspace">
      <main className="studio-editor" aria-label={`${area} editor`}>
        <div className="editor-toolbar"><div><h2>{area}</h2><p>Edit canonical saved content.</p></div>{structuredAreas.has(area) && <div className="save-row"><button type="button" onClick={discardAll} disabled={!siteDirty}>Discard</button><button type="button" className="primary" onClick={saveSite} disabled={!siteDirty}>Save</button></div>}</div>
        {editor}
      </main>
      <aside className="studio-preview"><div className="preview-heading"><h2>Saved site</h2><button type="button" onClick={() => setPreviewRevision((value) => value + 1)}>Reload</button></div><iframe key={previewRevision} title="Saved public site preview" src={`/#/?studioPreview=${previewRevision}`} /></aside>
    </div>
  </div>;
};

export default StudioApp;
