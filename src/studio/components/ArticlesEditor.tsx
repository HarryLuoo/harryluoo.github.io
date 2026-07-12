import { useEffect, useMemo, useState } from 'react';
import { ApiError, studioApi } from '../api';
import type { ArticleSnapshot } from '../types';
import { Field, TextArea, TextInput, UsageList } from './Controls';

interface Props {
  articles: ArticleSnapshot[];
  onRefresh: (reloadPreview?: boolean) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  discardSignal: number;
}

export const ArticlesEditor = ({ articles, onRefresh, onDirtyChange, discardSignal }: Props) => {
  const [selected, setSelected] = useState(articles[0]?.slug || '');
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const current = useMemo(() => articles.find((article) => article.slug === selected), [articles, selected]);
  const [body, setBody] = useState(current?.body || '');
  const [status, setStatus] = useState('');
  const dirty = creating ? Boolean(newSlug || body) : Boolean(current && body !== current.body);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => { if (!creating) setBody(current?.body || ''); }, [current?.revision, creating]);
  useEffect(() => { setCreating(false); setNewSlug(''); setSelected(articles[0]?.slug || ''); setBody(articles[0]?.body || ''); setStatus(''); }, [discardSignal]);

  const choose = (slug: string) => {
    if (dirty && !window.confirm('Discard unsaved article edits?')) return;
    setCreating(false);
    setSelected(slug);
    setBody(articles.find((article) => article.slug === slug)?.body || '');
    setStatus('');
  };

  const beginCreate = () => {
    if (dirty && !window.confirm('Discard unsaved article edits?')) return;
    setCreating(true);
    setNewSlug('');
    setBody('');
    setStatus('New article');
  };

  const save = async () => {
    try {
      setStatus('Saving…');
      if (creating) await studioApi.createArticle(newSlug, body);
      else if (current) await studioApi.updateArticle(current.slug, body, current.revision);
      await onRefresh(true);
      setCreating(false);
      setSelected(creating ? newSlug : selected);
      setStatus('Saved');
    } catch (error) {
      setStatus(error instanceof ApiError && error.status === 409 ? `Conflict: ${error.message}` : error instanceof Error ? error.message : 'Save failed');
    }
  };

  const deleteCurrent = async () => {
    if (!current || !window.confirm(`Delete article “${current.slug}”?`)) return;
    try {
      await studioApi.deleteArticle(current.slug, current.revision);
      await onRefresh(true);
      setSelected('');
      setStatus('Deleted');
    } catch (error) {
      const apiError = error as ApiError;
      setStatus(apiError.message || 'Delete failed');
    }
  };

  return <div className="editor-stack">
    <section><div className="section-heading"><h2>Articles</h2><button type="button" onClick={beginCreate}>New article</button></div>
      <div className="entity-picker">{articles.map((article) => <button key={article.slug} type="button" className={!creating && selected === article.slug ? 'active' : ''} onClick={() => choose(article.slug)}>{article.slug}</button>)}</div>
    </section>
    <section>
      <div className="field-grid"><Field label="Slug" hint={creating ? 'Immutable after creation' : 'Immutable'}><TextInput value={creating ? newSlug : current?.slug || ''} disabled={!creating} onChange={setNewSlug} /></Field><Field label="Markdown body" wide><TextArea rows={20} value={body} onChange={setBody} /></Field></div>
      <div className="save-row"><button type="button" className="primary" disabled={!dirty || (creating && !newSlug)} onClick={save}>Save article</button>{!creating && current && <button type="button" className="danger" disabled={current.usage.length > 0} onClick={deleteCurrent}>Delete</button>}<span aria-live="polite">{status}</span></div>
    </section>
    {!creating && current && <section><h2>Usage</h2><UsageList usage={current.usage} /></section>}
  </div>;
};
