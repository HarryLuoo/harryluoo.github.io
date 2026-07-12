import { useEffect, useMemo, useState } from 'react';
import { ApiError, studioApi } from '../api';
import type { UploadSnapshot } from '../types';
import { UsageList } from './Controls';

interface Props {
  uploads: UploadSnapshot[];
  onRefresh: (reloadPreview?: boolean) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  discardSignal: number;
}

const fileBase64 = async (file: File) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  return btoa(binary);
};

export const UploadsEditor = ({ uploads, onRefresh, onDirtyChange, discardSignal }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const collision = useMemo(() => uploads.find((upload) => upload.name === file?.name), [file, uploads]);
  useEffect(() => onDirtyChange(Boolean(file)), [file, onDirtyChange]);
  useEffect(() => { setFile(null); setStatus(''); }, [discardSignal]);

  const upload = async (replace: boolean) => {
    if (!file) return;
    try {
      setStatus(replace ? 'Replacing…' : 'Uploading…');
      const base64 = await fileBase64(file);
      if (replace && collision) await studioApi.replaceUpload(file.name, base64, collision.revision);
      else await studioApi.createUpload(file.name, base64);
      setFile(null);
      await onRefresh(false);
      setStatus(replace ? 'Replaced' : 'Uploaded');
    } catch (error) {
      setStatus(error instanceof ApiError && error.status === 409 ? `Collision/conflict: ${error.message}` : error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const deleteUpload = async (upload: UploadSnapshot) => {
    if (!window.confirm(`Delete upload “${upload.name}”?`)) return;
    try {
      await studioApi.deleteUpload(upload.name, upload.revision);
      await onRefresh(false);
      setStatus('Deleted');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  return <div className="editor-stack">
    <section><h2>Create or replace upload</h2><input aria-label="Choose upload" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(event) => setFile(event.target.files?.[0] || null)} />
      {file && <div className="upload-intent"><strong>{file.name}</strong><span>{Math.round(file.size / 1024)} KiB</span>{collision ? <><span className="warning">An upload with this name exists.</span><button type="button" className="danger" onClick={() => upload(true)}>Replace existing</button></> : <button type="button" className="primary" onClick={() => upload(false)}>Create upload</button>}</div>}
      <p aria-live="polite">{status}</p>
    </section>
    <section><h2>Uploads</h2><div className="upload-list">{uploads.map((upload) => <article key={upload.name} className="upload-row">
      <div className="upload-preview">{upload.name.toLowerCase().endsWith('.pdf') ? <a href={upload.path} target="_blank" rel="noreferrer">PDF</a> : <img src={upload.path} alt={upload.name} />}</div>
      <div><h3>{upload.name}</h3><p className="muted">{Math.round(upload.size / 1024)} KiB</p><UsageList usage={upload.usage} /></div>
      <button type="button" className="danger" disabled={upload.usage.length > 0} onClick={() => deleteUpload(upload)}>Delete</button>
    </article>)}</div></section>
  </div>;
};
