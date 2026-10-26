// Prepare Vercel output directory from Nitro build output
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const vercelOut = path.join(root, '.vercel', 'output');
const staticDir = path.join(vercelOut, 'static');
const funcDir = path.join(vercelOut, 'functions', '__server.func');

// Recreate output dir
fs.rmSync(vercelOut, { recursive: true, force: true });
fs.mkdirSync(staticDir, { recursive: true });
fs.mkdirSync(funcDir, { recursive: true });

// Copy public assets
fs.cpSync(path.join(root, '.output', 'public'), staticDir, { recursive: true });
// Copy server bundle
fs.cpSync(path.join(root, '.output', 'server'), funcDir, { recursive: true });

// Write Vercel config
fs.writeFileSync(
  path.join(vercelOut, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [{ handle: 'filesystem' }, { src: '/(.*)', dest: '/__server' }],
    },
    null,
    2
  )
);

// Write function config
fs.writeFileSync(
  path.join(funcDir, '.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'nodejs24.x',
      handler: 'index.mjs',
      launcherType: 'Nodejs',
      shouldAddHelpers: true,
    },
    null,
    2
  )
);

console.log('Vercel output prepared at', vercelOut);
