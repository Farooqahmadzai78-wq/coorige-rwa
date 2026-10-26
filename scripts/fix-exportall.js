// Polyfill __exportAll for rolldown/vite 8 SSR build
// Fixes: TypeError: __exportAll is not a function
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dir = path.join(__dirname, '..', '.output', 'server');
const polyfill = "globalThis.__exportAll = globalThis.__exportAll || function (m, exports) { for (var k in exports) if (!Object.prototype.hasOwnProperty.call(m, k)) m[k] = exports[k]; return m; };\n";

function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (f.endsWith('.mjs')) {
      let content = fs.readFileSync(full, 'utf8');
      if (!content.includes('__exportAll =')) {
        content = polyfill + content;
        fs.writeFileSync(full, content, 'utf8');
        console.log('Injected __exportAll polyfill into', full);
      }
    }
  }
}

walk(dir);
console.log('Done');
