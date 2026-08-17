// site-version.mjs — the ONE place the site's ?v cache-bust number comes from.
//
// Before TUR 13 there was no such place, so every generator carried its own
// frozen literal: gen-style-pages 84, gen-collection-pattern 85,
// gen-collections-page 90, gen-taste-collections 90 — against a live site
// standing at 136. Running gen-style-pages.mjs exited 0 and quietly rewound the
// styles pages 52 bumps, which is worse than the generators that crash: a crash
// is honest.
//
// The version is not stored in a file of its own on purpose. scripts/deploy.sh
// bumps it by rewriting every ?v= in web/, and pages.yml + site-health both
// require web/ to carry exactly ONE distinct value. So web/ IS the record, and
// the only correct read is "the single value web/ agrees on". Anything else is
// a second source, which is the bug this file exists to kill.
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '../../web');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === '.vercel' || name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(html|js|css)$/.test(name)) acc.push(full);
  }
  return acc;
}

/** The single ?v version carried by web/. Throws if web/ does not agree with itself. */
export function siteVersion() {
  const found = new Set();
  for (const f of walk(WEB)) {
    for (const m of readFileSync(f, 'utf8').matchAll(/\?v=(\d+)/g)) found.add(m[1]);
  }
  if (found.size === 0) throw new Error('site-version: no ?v= stamp found anywhere in web/');
  if (found.size > 1) {
    throw new Error(`site-version: web/ carries ${found.size} different ?v versions ` +
      `(${[...found].sort((a, b) => a - b).join(', ')}). Refusing to guess which one is ` +
      `current — run scripts/deploy.sh's bump, or fix the drift, then regenerate.`);
  }
  return [...found][0];
}
