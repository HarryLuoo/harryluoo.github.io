import { useEffect, useMemo, useState } from 'react';
import { ApiError, studioApi } from '../api';
import type { PublishStatus } from '../types';

const formatSize = (bytes: number | null) => bytes === null ? 'deleted' : bytes < 1024 ? `${bytes} B` : `${Math.ceil(bytes / 1024)} KiB`;
const shortSha = (value: string | null) => value ? value.slice(0, 12) : 'Unavailable';

export const PublishEditor = () => {
  const [data, setData] = useState<PublishStatus | null>(null);
  const [message, setMessage] = useState('Update portfolio content');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('Loading repository status...');

  const refresh = async () => {
    const next = await studioApi.publishStatus();
    setData(next);
    setConfirmed(false);
    return next;
  };

  useEffect(() => {
    refresh().then(() => setResult('Repository status loaded')).catch((error) => setResult(error instanceof Error ? error.message : 'Status failed'));
  }, []);

  const run = async (operation: () => Promise<{ status: string }>) => {
    setBusy(true);
    try {
      const response = await operation();
      setResult(response.status);
      await refresh();
    } catch (error) {
      const detail = error instanceof ApiError && Array.isArray((error.details as any)?.blockers)
        ? ` ${((error.details as any).blockers as string[]).join(' ')}`
        : '';
      setResult(`${error instanceof Error ? error.message : 'Operation failed'}${detail}`);
    } finally {
      setBusy(false);
    }
  };

  const publishEnabled = useMemo(() => Boolean(data
    && data.verification.state === 'fresh'
    && data.blockers.length === 0
    && data.allowedChanges.length > 0
    && !data.diff.truncated
    && !data.pendingPush
    && confirmed
    && message.trim()), [confirmed, data, message]);

  const publishDisabledReasons = useMemo(() => {
    if (!data) return [];

    const reasons: string[] = [];
    if (busy) reasons.push('Wait for the current operation to finish.');
    if (data.pendingPush) reasons.push('Use Retry Push for the pending commit.');
    if (data.verification.state !== 'fresh') reasons.push('Run Verify successfully.');
    if (data.blockers.length > 0) reasons.push(`Resolve ${data.blockers.length} blocking worktree ${data.blockers.length === 1 ? 'change' : 'changes'} listed under Publish readiness.`);
    if (data.allowedChanges.length === 0) reasons.push('Save at least one CMS change.');
    if (data.diff.truncated) reasons.push('Reduce the CMS diff so the complete diff can be reviewed.');
    if (!confirmed) reasons.push('Check “I reviewed the complete displayed CMS diff.”');
    if (!message.trim()) reasons.push('Enter a commit message.');
    return [...new Set(reasons)];
  }, [busy, confirmed, data, message]);

  if (!data) return <div className="editor-stack"><p aria-live="polite">{result}</p></div>;

  return <div className="editor-stack publish-editor">
    <section>
      <div className="section-heading"><h2>Verification</h2><button type="button" disabled={busy} onClick={() => void refresh().then(() => setResult('Repository status refreshed')).catch((error) => setResult(error instanceof Error ? error.message : 'Status failed'))}>Refresh</button></div>
      <dl className="publish-facts">
        <div><dt>State</dt><dd>{data.verification.state === 'fresh' ? 'Verified' : data.verification.state === 'stale' ? 'Verification stale' : 'Not verified'}</dd></div>
        <div><dt>Verified at</dt><dd>{data.verification.verifiedAt ? new Date(data.verification.verifiedAt).toLocaleString() : 'Not yet'}</dd></div>
        <div><dt>Branch</dt><dd>{data.branch || 'Unavailable'}</dd></div>
        <div><dt>HEAD</dt><dd><code>{shortSha(data.head)}</code></dd></div>
        <div><dt>Upstream</dt><dd>{data.upstream || 'Unavailable'}</dd></div>
      </dl>
      <div className="save-row publish-commands">
        <button type="button" className="primary" disabled={busy} onClick={() => void run(() => studioApi.verify())}>Verify</button>
        {data.pendingPush && <button type="button" className="primary" disabled={busy} onClick={() => void run(() => studioApi.retryPush(data.pendingPush!.commitSha))}>Retry Push</button>}
        <span aria-live="polite">{busy ? 'Working...' : result}</span>
      </div>
    </section>

    <section>
      <h2>Publish readiness</h2>
      {data.pendingPush && <p className="warning">Commit <code>{shortSha(data.pendingPush.commitSha)}</code> is waiting for Retry Push. A second Publish is blocked.</p>}
      {data.blockers.length > 0 ? <ul className="publish-blockers">{data.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul> : <p className="publish-ready">No blocking worktree changes.</p>}
      <h3>CMS changes</h3>
      {data.allowedChanges.length ? <ul className="publish-paths">{data.allowedChanges.map((change) => <li key={`${change.status}:${change.path}`}><code>{change.status}</code> {change.path}</li>)}</ul> : <p className="muted">No CMS changes.</p>}
      {data.uploads.length > 0 && <><h3>Upload summary</h3><ul className="publish-paths">{data.uploads.map((upload) => <li key={upload.path}><code>{upload.status}</code> {upload.path} ({formatSize(upload.size)})</li>)}</ul></>}
    </section>

    <section>
      <div className="section-heading"><h2>Text diff</h2><span className={data.diff.truncated ? 'warning' : 'muted'}>{data.diff.lines} lines, {formatSize(data.diff.bytes)}</span></div>
      <pre className="publish-diff" tabIndex={0}>{data.diff.text || 'No structured or article text changes.'}</pre>
      {data.diff.truncated && <p className="warning">Diff is truncated. Confirmation and Publish are blocked.</p>}
    </section>

    <section>
      <h2>Commit and push</h2>
      <label className="studio-field">Commit message<input value={message} maxLength={120} onChange={(event) => setMessage(event.target.value)} /></label>
      <label className="studio-check publish-confirm"><input type="checkbox" checked={confirmed} disabled={data.diff.truncated || data.allowedChanges.length === 0 || Boolean(data.pendingPush)} onChange={(event) => setConfirmed(event.target.checked)} />I reviewed the complete displayed CMS diff.</label>
      <span className="publish-button-help">
        <button type="button" className="primary" aria-disabled={busy || !publishEnabled} aria-describedby={busy || !publishEnabled ? 'publish-disabled-help' : undefined} onClick={() => {
          if (busy || !publishEnabled) return;
          void run(() => studioApi.publish(message.trim(), data.fingerprint));
        }}>Publish</button>
        {(busy || !publishEnabled) && <span id="publish-disabled-help" className="publish-tooltip" role="tooltip"><strong>Before publishing:</strong>{publishDisabledReasons.map((reason) => <span key={reason}>{reason}</span>)}</span>}
      </span>
    </section>
  </div>;
};
