import { spawn } from 'node:child_process';

export class CommandError extends Error {
  constructor(message, result = {}) {
    super(message);
    this.name = 'CommandError';
    Object.assign(this, result);
  }
}

export const runFixed = (command, args, {
  cwd,
  env = process.env,
  timeoutMs = 120_000,
  maxOutputBytes = 1024 * 1024,
  allowedExitCodes = [0],
} = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd,
    env,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const chunks = { stdout: [], stderr: [] };
  let outputBytes = 0;
  let outputExceeded = false;
  let timedOut = false;

  const collect = (stream, key) => stream.on('data', (chunk) => {
    outputBytes += chunk.length;
    if (outputBytes <= maxOutputBytes) chunks[key].push(chunk);
    else if (!outputExceeded) {
      outputExceeded = true;
      child.kill('SIGTERM');
    }
  });
  collect(child.stdout, 'stdout');
  collect(child.stderr, 'stderr');

  const timer = setTimeout(() => {
    timedOut = true;
    child.kill('SIGTERM');
  }, timeoutMs);
  timer.unref();

  child.on('error', (error) => {
    clearTimeout(timer);
    reject(new CommandError(`Could not start ${command}: ${error.message}`, { cause: error }));
  });
  child.on('close', (code, signal) => {
    clearTimeout(timer);
    const result = {
      code,
      signal,
      stdout: Buffer.concat(chunks.stdout),
      stderr: Buffer.concat(chunks.stderr),
      timedOut,
      outputExceeded,
    };
    if (timedOut) reject(new CommandError(`Command timed out after ${timeoutMs}ms`, result));
    else if (outputExceeded) reject(new CommandError(`Command output exceeded ${maxOutputBytes} bytes`, result));
    else if (!allowedExitCodes.includes(code)) reject(new CommandError(`Command exited with ${code ?? signal}`, result));
    else resolve(result);
  });
});

export const commandFailureDetail = (error, maxCharacters = 4_000) => {
  const stderr = error?.stderr?.toString('utf8').trim();
  const stdout = error?.stdout?.toString('utf8').trim();
  const detail = stderr || stdout || error?.message || String(error);
  return detail.length > maxCharacters ? `${detail.slice(0, maxCharacters)}\n[output truncated]` : detail;
};
