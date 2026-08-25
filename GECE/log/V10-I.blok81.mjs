#!/usr/bin/env node
// V10-I §2 — HEAD'de sayı+birim taşıyıp YALNIZ `golden_check` / `engine_check`
// jetonuyla sağlayıcılı sayılan blokları ADIYLA çıkarır (hakem: 81 blok).
// Ayrıştırıcı, landing_truth_check.mjs'in ayrıştırıcısının BİREBİR aynısıdır
// (kopya, çünkü kapı fonksiyon ihraç etmiyor); jeton kümesi de oradan okunur.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const WEB = path.join(ROOT, 'web');
const LAUNDER = ['golden_check', 'engine_check'];

const PRUNE = new Set(['.git', 'node_modules', '.vercel', '.wrangler']);
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (PRUNE.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile()) out.push(p);
  }
  return out;
}
const rel = (p) => path.relative(WEB, p).split(path.sep).join('/');
const all = walk(WEB).sort();
const htmlFiles = all.filter(p => /\.html$/i.test(p));
const jsFiles = all.filter(p => /\.js$/i.test(p) && rel(p).startsWith('js/'));

const toolPaths = execSync('git ls-files -z engine/tools', { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0').filter(Boolean);
const testNames = [...fs.readFileSync(path.join(ROOT, 'engine', 'CMakeLists.txt'), 'utf8')
  .matchAll(/add_test\(\s*NAME\s+([A-Za-z0-9_]+)/g)].map(m => m[1]);
const toolNames = toolPaths.map(p => path.posix.basename(p));
const toolStems = toolNames.map(n => n.replace(/\.[a-z0-9]+$/i, ''));
const PROVIDERS = new Set([...toolNames, ...toolStems.filter(n => n.length >= 6), ...testNames.filter(n => n.length >= 6)]);
const EVIDENCE = /(GECE|Logs|reports)\/[^\s"'<]+/;
const NUM_UNIT = /(?:^|[^\w.])\d[\d.,]*\s*(?:mm|cm|%|KB|MB|bytes?|bayt|sayfa|pages?|pieces?|drafts?|sizes?|beden|parça|tests?|checks?|seconds?|ms)\b/i;

const TEXT_ATTRS = /\b(data-en|data-tr|alt|title|content|aria-label|placeholder)\s*=\s*"([^"]*)"/gi;
const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;
const decode = (t) => t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&[a-z]+;/gi, ' ');
const mask = (s, re) => s.replace(re, m => m.replace(/[^\n]/g, ' '));
function htmlBlocks(src, file) {
  let s = src;
  s = mask(s, /<style[\s\S]*?<\/style>/gi); s = mask(s, /<script[\s\S]*?<\/script>/gi);
  s = mask(s, /<!--[\s\S]*?-->/g); s = mask(s, /\s(?:d|points|viewBox|transform)\s*=\s*"[^"]*"/gi);
  const out = [];
  for (const m of s.matchAll(TEXT_ATTRS)) out.push({ file, line: lineOf(s, m.index), scope: 'attr:' + m[1].toLowerCase(), text: decode(m[2]) });
  for (const m of s.matchAll(/>([^<>]+)</g)) { const t = decode(m[1]); if (t.trim()) out.push({ file, line: lineOf(s, m.index), scope: 'text', text: t }); }
  return out;
}
function jsBlocks(src, file) {
  const out = []; let i = 0, line = 1; const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === '/' && src[i + 1] === '/') { const j = src.indexOf('\n', i); i = j < 0 ? n : j; continue; }
    if (c === '/' && src[i + 1] === '*') { const j = src.indexOf('*/', i + 2); const seg = src.slice(i, j < 0 ? n : j + 2); line += (seg.match(/\n/g) || []).length; i = j < 0 ? n : j + 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const sl = line; let j = i + 1, buf = '';
      while (j < n) { if (src[j] === '\\') { buf += src[j + 1] ?? ''; j += 2; continue; } if (src[j] === c) break; if (src[j] === '\n') line++; buf += src[j]; j++; }
      if (buf.trim()) out.push({ file, line: sl, scope: 'string', text: buf });
      i = j + 1; continue;
    }
    i++;
  }
  return out;
}
const blocks = [];
for (const p of htmlFiles) blocks.push(...htmlBlocks(fs.readFileSync(p, 'utf8'), rel(p)));
for (const p of jsFiles) blocks.push(...jsBlocks(fs.readFileSync(p, 'utf8'), rel(p)));

const hits = [];
for (const b of blocks) {
  if (!NUM_UNIT.test(b.text)) continue;
  const provs = [];
  if (EVIDENCE.test(b.text)) provs.push('EVIDENCE-PATH');
  for (const p of PROVIDERS) if (b.text.includes(p)) provs.push(p);
  if (!provs.length) continue;                       // zaten L1 borcu
  const only = provs.every(p => LAUNDER.includes(p));
  if (!only) continue;
  hits.push({ ...b, provs: [...new Set(provs)] });
}
console.log('YALNIZ golden_check/engine_check ile aklanan sayısal blok:', hits.length);
const per = {};
for (const h of hits) per[h.file] = (per[h.file] || 0) + 1;
for (const [f, n] of Object.entries(per).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(4), f);
console.log();
for (const h of hits) {
  console.log(`── ${h.file}:${h.line} [${h.scope}] jeton=${h.provs.join(',')}`);
  console.log(`   SAYI: ${[...h.text.matchAll(/(?:^|[^\w.])(\d[\d.,]*\s*(?:mm|cm|%|KB|MB|bytes?|bayt|sayfa|pages?|pieces?|drafts?|sizes?|beden|parça|tests?|checks?|seconds?|ms))\b/gi)].map(m => m[1]).join(' | ')}`);
  console.log(`   METİN: ${h.text.trim().replace(/\s+/g, ' ').slice(0, 300)}`);
}
