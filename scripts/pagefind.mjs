// Builds the full-text search index (Pagefind) after the site is generated.
// If Pagefind cannot be installed or run, the site still deploys and search falls back to the title index.
import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', ['--yes', 'pagefind', '--site', 'dist', '--quiet'], { stdio: 'inherit' });
if (r.status !== 0) console.warn('Pagefind did not run; search will use the title index.');
