// style-lint.mjs — the house-style guard, sibling to header-diff.mjs.
// Scans every page under web/ (7 main pages, styles/, patterns/) plus the CSS
// files they load, and fails with a non-zero exit code on any of Damla's
// standing bans:
//   (a) em dash '—' in any VISIBLE text (HTML text nodes, attribute copy,
//       CSS `content:` strings) — banned everywhere; code comments are exempt.
//   (b) a single-side accent bar: border-left / border-right with a real width
//       (>= 2px, not 0/none) used as a decorative rule.
//   (c) a pill capsule: border-radius >= 999px, or >= 100px, or 50% used to
//       round a badge/chip/tag/pill class. Legit exceptions live in the
//       allowlist file (style-lint.allow.json → "pill").
//   (d) sentence-case heading with no terminal punctuation: an <h1>–<h3> whose
//       visible text has > 3 words and ends in a letter with no . ? : — real
//       labels (Patch Notes, Closet, …) live in the allowlist ("heading").
//   (e) brand copy that says "we"/"our": first-person-plural brand voice is
//       banned; direct address to the user ("you", "your") is fine. Phrases
//       that legitimately need it live in the allowlist ("weOur").
//
//   run: node engine/tools/style-lint.mjs
//   Run this before every site deploy.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
const WEB = join(ROOT, 'web');

// ---- allowlist -------------------------------------------------------------
const ALLOW_PATH = join(here, 'style-lint.allow.json');
const allow = existsSync(ALLOW_PATH)
  ? JSON.parse(readFileSync(ALLOW_PATH, 'utf8'))
  : { pill: [], heading: [], weOur: [] };
const headingAllow = new Set((allow.heading || []).map((s) => s.toLowerCase()));
const pillAllow = new Set(allow.pill || []);            // CSS selectors/class tokens exempt from the pill ban
const weOurAllow = (allow.weOur || []).map((s) => s.toLowerCase());

// ---- file list -------------------------------------------------------------
const htmlFiles = [];
// patches.html and collection-60s70s.html (and the styles/ + collections/ page
// classes below) were deleted by H1 "depo temiz"; the existsSync guard already
// skipped them silently, so the stale names are dropped here rather than left
// to read as pages this lint still covers.
const mainPages = ['index.html', 'create.html', 'closet.html', 'benchmark.html',
  'showcase.html', 'signature.html', 'api.html', 'privacy.html', 'studio.html'];
for (const f of mainPages) if (existsSync(join(WEB, f))) htmlFiles.push(f);
for (const sub of ['patterns', 'guide', 'blog']) {
  const dir = join(WEB, sub);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) if (f.endsWith('.html')) htmlFiles.push(`${sub}/${f}`);
}
const cssFiles = [];
const cssDir = join(WEB, 'css');
if (existsSync(cssDir)) for (const f of readdirSync(cssDir)) if (f.endsWith('.css')) cssFiles.push(`css/${f}`);

const violations = [];
const add = (rel, rule, msg) => violations.push({ rel, rule, msg });

// ---- helpers ---------------------------------------------------------------
// Strip HTML/CSS/JS comments so bans only fire on shipped, visible content.
function stripComments(s) {
  return s
    .replace(/<!--[\s\S]*?-->/g, ' ')   // HTML comments
    .replace(/\/\*[\s\S]*?\*\//g, ' ');  // CSS/JS block comments
}

// Everything a visitor can read on an HTML page: text nodes + the human-copy
// attributes (data-en, data-tr, alt, title, placeholder, aria-label, content
// on og/twitter meta). We deliberately skip href/src/class/id/style values.
function visibleTextFromHtml(html) {
  const noComments = stripComments(html);
  const parts = [];
  // human-copy attributes
  const attrRe = /\b(?:data-en|data-tr|alt|title|placeholder|aria-label)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = attrRe.exec(noComments))) parts.push(m[1]);
  // og:/twitter: description & title meta content
  const metaRe = /<meta[^>]*\b(?:property|name)\s*=\s*"(?:og:[^"]*|twitter:[^"]*|description)"[^>]*\bcontent\s*=\s*"([^"]*)"/gi;
  while ((m = metaRe.exec(noComments))) parts.push(m[1]);
  // <title>
  const titleRe = /<title>([\s\S]*?)<\/title>/gi;
  while ((m = titleRe.exec(noComments))) parts.push(m[1]);
  // text nodes: drop every tag AND the whole content of <style>/<script>
  const body = noComments
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  parts.push(body);
  return parts.join('\n');
}

// CSS `content:"…"` strings are visible; the rest of CSS is not prose.
function visibleTextFromCss(css) {
  const noComments = stripComments(css);
  const parts = [];
  const contentRe = /content\s*:\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = contentRe.exec(noComments))) parts.push(m[1] ?? m[2] ?? '');
  return parts.join('\n');
}

// ---- (a) em dash in visible text ------------------------------------------
function checkEmDash(rel, visible) {
  const lines = visible.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('—')) {
      add(rel, 'a', `em dash '—' in visible text: "${line.trim().slice(0, 80)}"`);
    }
  });
}

// ---- (b) single-side accent bar + (c) pill, in CSS-ish blocks -------------
// Works on both <style> blocks in HTML and standalone .css files.
function checkCssRules(rel, css) {
  const noComments = stripComments(css);

  // (b) border-left / border-right with a real (>= 2px) width, not 0/none.
  const sideRe = /border-(left|right)\s*:\s*([^;}\n]+)/gi;
  let m;
  while ((m = sideRe.exec(noComments))) {
    const decl = m[2].trim();
    if (/^(0|none)\b/i.test(decl)) continue;               // reset, fine
    const px = decl.match(/(\d+(?:\.\d+)?)px/);
    const width = px ? parseFloat(px[1]) : (/thin|medium|thick/i.test(decl) ? 3 : 0);
    if (width >= 2) {
      add(rel, 'b', `single-side accent bar border-${m[1]}: ${decl}`);
    }
  }

  // (c) pill capsule: border-radius >= 100px or 999px or 50%.
  // Report the selector so it can be allowlisted if legitimate.
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let r;
  while ((r = ruleRe.exec(noComments))) {
    const selector = r[1].trim();
    const bodyRules = r[2];
    const brs = bodyRules.match(/border-radius\s*:\s*([^;}\n]+)/gi) || [];
    for (const br of brs) {
      const val = br.split(':')[1].trim();
      const pxs = [...val.matchAll(/(\d+(?:\.\d+)?)px/g)].map((x) => parseFloat(x[1]));
      const isPill = pxs.some((v) => v >= 100) || /(^|\s)50%/.test(val);
      if (isPill) {
        // allowlist by any class token present in the selector
        const tokens = selector.split(/[\s,>+~.:#]+/).filter(Boolean);
        if (tokens.some((t) => pillAllow.has(t))) continue;
        add(rel, 'c', `pill capsule (border-radius ${val}) on selector "${selector.slice(0, 60)}"`);
      }
    }
  }
  // inline style="...border-radius:999px..." pills
  const inlineRe = /style\s*=\s*"[^"]*border-radius\s*:\s*([^";]+)/gi;
  while ((m = inlineRe.exec(noComments))) {
    const val = m[1].trim();
    const pxs = [...val.matchAll(/(\d+(?:\.\d+)?)px/g)].map((x) => parseFloat(x[1]));
    if (pxs.some((v) => v >= 100) || /(^|\s)50%/.test(val)) {
      add(rel, 'c', `inline pill capsule (border-radius ${val})`);
    }
  }
}

// ---- (d) sentence-case heading with no terminal punctuation ---------------
function checkHeadings(rel, html) {
  const noComments = stripComments(html);
  const hRe = /<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = hRe.exec(noComments))) {
    // prefer data-en copy if the heading carries it (that is the EN source text)
    const open = m[0].match(/<h[1-3]\b[^>]*>/i)[0];
    // patch-note titles (h2.ptitle on patches.html) are editorial free text in
    // Damla's voice, not site-template headings; the terminal-punctuation rule
    // does not apply to them (most already end in a full stop, short ones need not).
    if (/\bclass\s*=\s*"[^"]*\bptitle\b/i.test(open)) continue;
    const attr = open.match(/\bdata-en\s*=\s*"([^"]*)"/i);
    let text = attr ? attr[1] : m[2];
    text = text.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    if (headingAllow.has(text.toLowerCase())) continue;
    const words = text.split(/\s+/).length;
    if (words <= 3) continue;                              // short labels stay bare
    const last = text[text.length - 1];
    if (/[.?:!]/.test(last)) continue;                     // has terminal punctuation
    if (!/[A-Za-zÀ-ÿçğıöşüÇĞİÖŞÜ]/.test(last)) continue;    // ends in a digit/symbol, not prose
    add(rel, 'd', `heading with no terminal punctuation (>3 words): "${text.slice(0, 70)}"`);
  }
}

// ---- (e) brand copy "we"/"our" --------------------------------------------
function checkWeOur(rel, visible) {
  const lines = visible.split('\n');
  lines.forEach((line) => {
    const low = line.toLowerCase();
    const m = low.match(/\b(we|our|ours|we're|we've|we'll)\b/);
    if (!m) return;
    // allowlist: skip if this exact phrase fragment is whitelisted
    if (weOurAllow.some((frag) => low.includes(frag))) return;
    add(rel, 'e', `brand copy uses "${m[1]}": "${line.trim().slice(0, 80)}"`);
  });
}

// ---- (f) pinned-flat mandal (master directive item 3, 2026-07-20) ----------
// No live page may ship a garment FLAT (fashion technical sketch) unless that
// flat is pinned in engine/STYLE-PIN/STYLE-PIN.md (md5-approved by Damla). The
// old hand-schematic flats (class="sketch" / aria-label "Technical flat
// sketch") read as amateur and were pulled; this keeps them from coming back.
// PATTERN pieces (grainline / "Skirt Front" / notch SVGs) are NOT flats and are
// not caught — they carry no flat-sketch marker. Detection is marker-based so a
// future pinned flat, embedded via the reference pen (directive item 8), is
// allowed only when its style key is listed in the pin ledger.
const PIN_LEDGER = join(dirname(fileURLToPath(import.meta.url)), '..', 'STYLE-PIN', 'STYLE-PIN.md');
const pinnedStyles = new Set();
if (existsSync(PIN_LEDGER)) {
  const led = readFileSync(PIN_LEDGER, 'utf8');
  // pull every "<style_key>.svg" that appears with an md5 / MIHENK approval
  for (const m of led.matchAll(/([a-z0-9_]+)\.svg/gi)) pinnedStyles.add(m[1].toLowerCase());
}
function checkPinnedFlats(rel, html) {
  // a flat-sketch marker: the removed composer used class="sketch" and an
  // aria-label starting "Technical flat sketch". The reference pen marks a
  // pinned flat with data-flat-style="<key>".
  const hasAmateurFlat = /class\s*=\s*"[^"]*\bsketch\b/i.test(html)
    || /aria-label\s*=\s*"Technical flat sketch/i.test(html);
  if (hasAmateurFlat) {
    add(rel, 'f', 'inline garment flat sketch with no STYLE-PIN (pull it or pin it via the reference pen)');
  }
  // a declared pinned flat must actually be pinned
  for (const m of html.matchAll(/data-flat-style\s*=\s*"([a-z0-9_]+)"/gi)) {
    const key = m[1].toLowerCase();
    if (!pinnedStyles.has(key)) add(rel, 'f', `flat "${key}" is embedded but not in STYLE-PIN ledger`);
  }
}

// ---- run -------------------------------------------------------------------
for (const rel of htmlFiles) {
  const html = readFileSync(join(WEB, rel), 'utf8');
  const visible = visibleTextFromHtml(html);
  checkEmDash(rel, visible);
  checkWeOur(rel, visible);
  checkHeadings(rel, html);
  checkPinnedFlats(rel, html);
  // CSS bans also apply to inline <style> blocks
  const styleBlocks = (html.match(/<style[\s\S]*?<\/style>/gi) || []).join('\n');
  checkCssRules(rel, styleBlocks + '\n' + html); // html included for inline style="" pills
}
for (const rel of cssFiles) {
  const css = readFileSync(join(WEB, rel), 'utf8');
  checkEmDash(rel, visibleTextFromCss(css));
  checkCssRules(rel, css);
}

// ---- flat render lint (K2, 2026-07-19) -------------------------------------
// Chained here so the existing deploy proof step ("style-lint temiz") also
// covers the flat engine: self-intersection, reversed winding, zero-area and
// sampleX monotonicity over every styles.json record (render-lint.mjs).
import { spawnSync } from 'node:child_process';
const renderLint = spawnSync(process.execPath,
  [join(dirname(fileURLToPath(import.meta.url)), 'render-lint.mjs')], { encoding: 'utf8' });
process.stdout.write(renderLint.stdout || '');
process.stderr.write(renderLint.stderr || '');
if (renderLint.status !== 0) {
  console.error('style-lint: chained flat render-lint FAILED');
  process.exit(1);
}

// ---- preview truth (K3, 2026-07-19) -----------------------------------------
// Chained the same way: the deploy proof step also verifies the flat<->pattern
// boundary (structural equality + pinned landmark envelopes, preview-truth.mjs).
const previewTruth = spawnSync(process.execPath,
  [join(dirname(fileURLToPath(import.meta.url)), 'preview-truth.mjs')], { encoding: 'utf8' });
process.stdout.write(previewTruth.stdout || '');
process.stderr.write(previewTruth.stderr || '');
if (previewTruth.status !== 0) {
  console.error('style-lint: chained preview-truth FAILED');
  process.exit(1);
}

// ---- report ----------------------------------------------------------------
if (violations.length === 0) {
  console.log(`OK  style-lint clean across ${htmlFiles.length} pages + ${cssFiles.length} css files (rules a-e, 0 violations) + flat render-lint green.`);
  process.exit(0);
}

const byRule = {};
for (const v of violations) (byRule[v.rule] ??= []).push(v);
console.error(`style-lint FAILED: ${violations.length} violation(s).`);
for (const rule of Object.keys(byRule).sort()) {
  const label = { a: 'em dash', b: 'single-side accent bar', c: 'pill capsule',
    d: 'unpunctuated heading', e: 'brand we/our', f: 'non-pinned garment flat' }[rule];
  console.error(`\n(${rule}) ${label} — ${byRule[rule].length}:`);
  for (const v of byRule[rule]) console.error(`  ${v.rel}: ${v.msg}`);
}
process.exit(1);
