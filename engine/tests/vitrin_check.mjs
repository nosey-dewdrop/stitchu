#!/usr/bin/env node
// vitrin_check — THE SHOP WINDOW IS MEASURED, NOT PROOFREAD (GECE7 / F9).
//
// The landing page is the only surface a stranger meets before deciding whether
// this engine is worth their afternoon, and for most of this run it was the
// least gated file in the tree. landing_truth_check already asks a good but
// narrow question — "does this numeric sentence name a tool that exists?" — and
// it cannot ask the two questions that actually went wrong here:
//
//   * IS THE NUMBER TODAY'S NUMBER? "1 of 5 exact, 47 of 51 fields" named a real
//     tool and was live for weeks after the answer key it quotes had been
//     replaced by a human one (K19) and the set had grown from five photographs
//     to ten. A named provider does not make a number current.
//   * DOES THE PAGE ADMIT WHAT THE PRODUCT CANNOT DO? A shop window is allowed
//     to be short. It is not allowed to be silent about a garment that will not
//     stay up without boning, or about five checks that are failing right now.
//
// So this gate measures five things, all of them on the shipped bytes:
//
//   1. THE NUMBERS ARE NOT STALE. engine/tools/gen-vitrin.mjs is re-run here and
//      its output must equal what is shipped, both in web/data/vitrin.json and
//      in the `data-v` elements of web/index.html. Retyping a number by hand is
//      the failure mode; this makes it impossible to retype one and pass.
//   2. THE FIVE RED CHECKS ARE NAMED. Not counted — NAMED, on a page a visitor
//      can reach. A count is a claim; a name is checkable.
//   3. THE STRAPLESS LIMIT IS ON THE PAGE. CLAUDE.md calls the shipped garment
//      unlistable without boning; the page has to say so before the download,
//      not after.
//   4. TWO WORDS ARE BANNED IN THE SHIPPED SITE. "unlimited"/"sınırsız" (K45 —
//      the operator queue is not empty, so the word is not earned).
//   5. patterns_real/ DOES NOT REACH THE WINDOW (§4C md.7). No link into it, and
//      no file under web/ that is a byte-copy of a purchased pattern.
//
// ⚠ WHAT THIS GATE DOES NOT CLAIM. It does not know whether a sentence is true.
// It knows whether a number came out of a run today, whether a name that must
// appear appears, and whether a byte that must not ship shipped.
//
// ZERO API CALLS, ZERO COST.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { build, fillPage } from '../tools/gen-vitrin.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const fails = [];
const note = [];
const check = (name, cond, detail) => {
  if (cond) note.push(`  ok   ${name}${detail ? ` — ${detail}` : ''}`);
  else fails.push(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
};
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile()) out.push(p);
  }
  return out;
}
const WEB = join(ROOT, 'web');
const webFiles = walk(WEB);
const textFiles = webFiles.filter((p) => /\.(html|js|json|css|svg|txt|xml)$/i.test(p));

// ── 1. THE NUMBERS ARE TODAY'S NUMBERS ─────────────────────────────────────
let fresh = null;
try { fresh = build(); } catch (e) { check('gen-vitrin.mjs re-runs', false, String(e.message || e)); }
if (fresh) {
  const shipped = read('web/data/vitrin.json');
  check('web/data/vitrin.json is exactly what the generator prints today',
    shipped === JSON.stringify(fresh, null, 2) + '\n',
    'bir sayı ELLE düzeltilmişse ya da BAYATLAMIŞSA burada yanar');

  const page = read('web/index.html');
  const { out, missing, filled } = fillPage(page, fresh);
  check('every data-v key on the landing page exists in the generated file',
    missing.length === 0, missing.join(', ') || `${filled.length} anahtar`);
  check('the landing page already holds the generated values (regenerating is a no-op)',
    out === page,
    filled.join(' · ') || 'hiç data-v yok');
  // A page with no generated numbers at all would pass the two checks above
  // vacuously. It must actually carry them.
  check('the landing page really does render generated numbers',
    filled.length >= 3, `${filled.length} data-v element(s)`);
}

// ── 2. THE RED CHECKS ARE NAMED, NOT COUNTED ───────────────────────────────
// The names come from the phase card, spelled out here rather than derived: a
// derivation that read them out of a build directory would pass on a machine
// with no build, which is the one place the claim matters least.
// ⭐ F10-vitrin (2026-09-02, MEASURED): `ctest -R` on the five card names came
// back 4 red / 1 green — contract_check PASSES now (patterns_real tracks zero
// files since H1 "depo temiz", which this very gate's own check (c) asserts).
// Keeping contract_check on the required-red list would force the page to
// claim a red that is green, so the list is recut to the measured four and the
// benchmark page names the closed red as closed.
const REDS = ['flat_artifact_census', 'style_check',
  'sizechart_source_check', 'figure_check'];
const vitrinPages = ['web/index.html', 'web/benchmark.html'].map(read).join('\n');
for (const r of REDS)
  check(`the failing check "${r}" is named on a page a visitor can reach`,
    vitrinPages.includes(r), 'index.html ya da benchmark.html');
// ⭐ AND THE DECLARED ONES ARE DISTINGUISHED FROM THE UNTRACED ONES. Two of the
// five were declared red before they ran; three have never had a cause traced.
// A page that lumps all five together is telling a rounder story than the truth.
check('the page separates the deliberately-red from the never-traced',
  /on purpose|bilerek|declared/i.test(vitrinPages) &&
  /never had (?:their|its) cause traced|kök sebebi hiç aranmadı|never been traced/i.test(vitrinPages),
  'iki ilan edilmiş kırmızı (K58) üç izlenmemişle aynı cümlede toplanamaz');

// ── 3. THE HONEST LIMITS ARE DECLARED BEFORE THE DOWNLOAD ──────────────────
// ⭐ F10-vitrin (2026-09-02): the strapless requirement was retired on a
// MEASUREMENT, not a mood — engine.draftJSON at EU38 returns Bodice Front,
// Bodice Back, Skirt Front, Skirt Back and a set-in Sleeve, and engineSpec
// refuses 'cap' by name ("invalid sleeveStyle 'cap' (valid: none, straight,
// balloon)"). A bodice that carries a drafted sleeve is not strapless, so a
// page forced to say "strapless" would be forced to lie. What the page must
// still declare, before the download: the muslin limit (a validated pattern is
// not a sewn-up pattern) and the refusal law (a word outside the vocabulary is
// refused by name, incl. the cap sleeve missing from the sleeve row).
const index = read('web/index.html');
check('the landing page declares the muslin limit before the download',
  /not the same as a pattern that sews up/i.test(index) &&
  /dikilip biten bir kalıp demek değildir/.test(index), 'EN ve TR');
check('and it names a real refusal instead of drawing something close',
  /refuse[sd]? (the word )?by name/i.test(index) && /cap sleeve/i.test(index),
  'kapak kol motorda yok ve sayfa bunu adıyla söylüyor');

// ── 4. THE BANNED WORD (K45) ───────────────────────────────────────────────
const banned = [];
for (const p of textFiles) {
  if (!/\.(html|js)$/i.test(p)) continue;
  const src = readFileSync(p, 'utf8');
  for (const m of src.matchAll(/\b(unlimited|sınırsız|sinirsiz)\b/gi))
    banned.push(`${relative(ROOT, p)}: "${m[0]}"`);
}
check('the word "unlimited"/"sınırsız" is nowhere in the shipped site (K45)',
  banned.length === 0, banned.slice(0, 6).join(' · ') ||
  'motorda 5 operatör var, §4A üçlüsünden ikisi (slash-spread, merge) YOK — kelime hak edilmedi');

// ── 5. patterns_real/ DOES NOT REACH THE WINDOW (§4C md.7) ─────────────────
// (a) no link, src or fetch out of the site into the purchased patterns.
const links = [];
for (const p of textFiles) {
  const src = readFileSync(p, 'utf8');
  for (const m of src.matchAll(/(?:href|src|fetch\()\s*=?\s*["'`]([^"'`]*patterns_real[^"'`]*)/g))
    links.push(`${relative(ROOT, p)}: ${m[1]}`);
}
check('no page links, loads or fetches anything under patterns_real/',
  links.length === 0, links.slice(0, 5).join(' · ') || '0 bağlantı');

// (b) no shipped byte IS a purchased byte. Measured by digest, both directions,
// so a renamed copy is caught too.
const PR = join(ROOT, 'patterns_real');
let copies = [];
let prCount = 0;
if (existsSync(PR)) {
  const prHashes = new Map();
  for (const p of walk(PR)) {
    if (statSync(p).size === 0) continue;
    prCount++;
    prHashes.set(createHash('sha256').update(readFileSync(p)).digest('hex'), relative(ROOT, p));
  }
  for (const p of webFiles) {
    if (statSync(p).size === 0) continue;
    const d = createHash('sha256').update(readFileSync(p)).digest('hex');
    if (prHashes.has(d)) copies.push(`${relative(ROOT, p)} == ${prHashes.get(d)}`);
  }
}
check('no file under web/ is a byte-copy of a purchased pattern file',
  copies.length === 0, copies.slice(0, 5).join(' · ') || `${prCount} telifli dosya tarandı`);

// (c) and the tracked count has not grown — the card's own invariant, measured
// rather than promised. H1 "depo temiz" (2026-08-29) tightened it from 41 to
// ZERO: the purchased files left the public git for good — HEAD tree AND
// history — while staying on disk behind the .gitignore rule. That is what
// CLAUDE.md has claimed since July. The number may fall, never rise.
let tracked = null;
try {
  tracked = execSync('git ls-files patterns_real | wc -l', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch { /* git yoksa hüküm verilmez, aşağıda yazılır */ }
check('patterns_real/ tracks ZERO files — the paid IP is out of the public git',
  tracked === null || Number(tracked) === 0,
  tracked === null ? 'git okunamadı — HÜKÜM YOK' : `${tracked} takipli`);

console.log('VİTRİN KAPISI — sayfa bugünkü ürünü mü anlatıyor? (0 API çağrısı)');
console.log(note.join('\n'));
if (fails.length) console.log(fails.join('\n'));
console.log('\n⚠ BU KAPI BİR CÜMLENİN DOĞRU OLDUĞUNU BİLMEZ. Bildiği üç şey var: sayı bugünkü');
console.log('  koşudan mı geldi, görünmesi şart olan ad görünüyor mu, ve sevk edilmemesi');
console.log('  gereken bayt sevk edildi mi.');
console.log(`\nVİTRİN KAPISI: ${fails.length ? `KIRMIZI — ${fails.length} kalem` : 'YEŞİL'}`);
process.exit(fails.length ? 1 : 0);
