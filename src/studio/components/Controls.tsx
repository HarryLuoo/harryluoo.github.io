import type { ReactNode } from 'react';
import type { ArticleSnapshot, UploadSnapshot, Usage } from '../types';

export const Field = ({ label, hint, children, wide = false }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) => (
  <label className={`studio-field ${wide ? 'studio-field-wide' : ''}`}>
    <span>{label}</span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
);

export const TextInput = ({ value, onChange, type = 'text', disabled = false }: { value: string | number; onChange: (value: string) => void; type?: string; disabled?: boolean }) => (
  <input type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
);

export const TextArea = ({ value, onChange, rows = 4 }: { value: string; onChange: (value: string) => void; rows?: number }) => (
  <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} />
);

export const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => (
  <label className="studio-check"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>
);

export const Select = ({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: ReactNode }) => (
  <select value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>
);

export const AssetSelect = ({ value, uploads, onChange, allowPdf = true, label = 'Asset' }: { value?: string; uploads: UploadSnapshot[]; onChange: (value?: string) => void; allowPdf?: boolean; label?: string }) => (
  <Field label={label}>
    <select value={value || ''} onChange={(event) => onChange(event.target.value || undefined)}>
      <option value="">None</option>
      {uploads.filter((upload) => allowPdf || !upload.name.toLowerCase().endsWith('.pdf')).map((upload) => <option key={upload.path} value={upload.path}>{upload.name}</option>)}
    </select>
  </Field>
);

export const ArticleSelect = ({ value, articles, onChange }: { value?: string; articles: ArticleSnapshot[]; onChange: (value?: string) => void }) => (
  <Field label="Article">
    <select value={value || ''} onChange={(event) => onChange(event.target.value || undefined)}>
      <option value="">Metadata only</option>
      {articles.map((article) => <option key={article.slug} value={article.slug}>{article.slug}</option>)}
    </select>
  </Field>
);

export const TagPicker = ({ value, tags, onChange }: { value: string[]; tags: string[]; onChange: (value: string[]) => void }) => (
  <Field label="Tags" wide hint="Command-click to select multiple">
    <select multiple value={value} size={Math.min(Math.max(tags.length, 4), 8)} onChange={(event) => onChange(Array.from(event.target.selectedOptions, (option) => option.value))}>
      {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
    </select>
  </Field>
);

export const UsageList = ({ usage }: { usage: Usage[] }) => usage.length ? (
  <ul className="usage-list">{usage.map((item) => <li key={`${item.area}-${item.slug}-${item.field}`}>{item.area}: {item.label} <code>{item.field}</code></li>)}</ul>
) : <p className="muted">Not referenced.</p>;

export const OrderButtons = ({ index, length, onMove, onRemove }: { index: number; length: number; onMove: (delta: number) => void; onRemove: () => void }) => (
  <div className="row-actions">
    <button type="button" title="Move up" disabled={index === 0} onClick={() => onMove(-1)}>↑</button>
    <button type="button" title="Move down" disabled={index === length - 1} onClick={() => onMove(1)}>↓</button>
    <button type="button" className="danger" onClick={onRemove}>Remove</button>
  </div>
);
