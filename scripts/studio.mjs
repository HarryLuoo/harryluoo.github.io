import { spawn } from 'node:child_process';

const children = new Map();
let shuttingDown = false;
let finalCode = 0;

const labelStream = (stream, label, destination) => {
  let pending = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    pending += chunk;
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() || '';
    lines.forEach((line) => destination.write(`[${label}] ${line}\n`));
  });
  stream.on('end', () => { if (pending) destination.write(`[${label}] ${pending}\n`); });
};

const launch = (label, args) => {
  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.set(label, child);
  labelStream(child.stdout, label, process.stdout);
  labelStream(child.stderr, label, process.stderr);
  child.on('exit', (code, signal) => {
    children.delete(label);
    if (!shuttingDown) {
      shuttingDown = true;
      finalCode = code && code !== 0 ? code : 1;
      process.stderr.write(`[studio] ${label} exited unexpectedly (${signal || (code ?? 0)}); stopping sibling\n`);
      children.forEach((sibling) => sibling.kill('SIGTERM'));
    }
    if (children.size === 0) process.exit(finalCode);
  });
  return child;
};

launch('site', ['node_modules/vite/bin/vite.js', '--mode', 'studio', '--host', '127.0.0.1', '--port', '8080', '--strictPort']);
launch('api', ['studio/server.mjs']);

const stop = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  finalCode = 0;
  children.forEach((child) => child.kill(signal));
  if (children.size === 0) process.exit(0);
};
process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
