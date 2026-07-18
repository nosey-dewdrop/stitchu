// Shared oov-term canonicalization (extracted from mine-vocab.mjs, K1
// 2026-07-19, so the miner and the benchmark's frequency-weighted coverage
// metric normalize with ONE implementation — a drifting copy is a double truth).
// Two layers:
//   1. explicit override map dataset/vocab-canonical.json { "surface": "canonical" }
//      (hand-curated, local-only/gitignored; missing file = empty map)
//   2. rule-based normalization (whitespace, hyphens, plural, stem synonyms) —
//      deterministic, applied when no override hits.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const CANON_FILE = join(here, '../../dataset/vocab-canonical.json');
const CANON_MAP = existsSync(CANON_FILE) ? JSON.parse(readFileSync(CANON_FILE, 'utf8')) : {};

export function ruleNormalize(term) {
  let t = term.trim().toLowerCase();
  t = t.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  // stem synonyms (verb/adjective forms of the same construction)
  t = t.replace(/\bbuttoned\b/g, 'button');
  t = t.replace(/\bgathered\b/g, 'gather').replace(/\bshirred\b/g, 'shirr').replace(/\bpleated\b/g, 'pleat');
  t = t.replace(/\bruffled\b/g, 'ruffle').replace(/\bflared\b/g, 'flare');
  t = t.replace(/\belasticated\b/g, 'elastic').replace(/\bpocketed\b/g, 'pocket');
  // depluralize each word (simple, safe endings only)
  t = t.split(' ').map((w) => {
    if (w.length <= 3) return w;
    if (/(ss|us|is)$/.test(w)) return w;           // dress, bias
    if (/ies$/.test(w)) return w.slice(0, -3) + 'y'; // bodies -> body
    if (/es$/.test(w) && /(ch|sh|x|z)es$/.test(w)) return w.slice(0, -2); // patches -> patch
    if (/s$/.test(w)) return w.slice(0, -1);         // cuffs -> cuff
    return w;
  }).join(' ');
  return t.replace(/\s+/g, ' ').trim();
}

export function canonicalize(term) {
  const raw = term.trim().toLowerCase();
  if (CANON_MAP[raw]) return CANON_MAP[raw];
  const norm = ruleNormalize(raw);
  if (CANON_MAP[norm]) return CANON_MAP[norm];
  return norm;
}
