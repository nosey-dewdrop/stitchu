#!/usr/bin/env node
// validate-contract.mjs — the K1 contract's regression guard (the MANDAL,
// 2026-07-19). Runs in ctest (contract_check) and before every deploy. It
// fails loudly on ANY of:
//   1. contract files unparsable / malformed
//   2. schema draft enums drifting from engine/vocab.json (single vocab source)
//   3. term registry defects: duplicate ids, one phrase mapping to two terms,
//      a drawable term without a capability, a capability naming an unknown
//      vocab field/value
//   4. generated consumer files (contract.gen.hpp/js) out of sync with
//      contract/tables.json
//   5. a 58-set manifest oov phrase that resolves to NO term id (leak scan;
//      skipped honestly when the local gitignored manifest is absent)
//   6. a flat style record (engine/flat-engine/styles.json) using a field the
//      contract's flat.* namespace does not declare, or out of bounds
//   7. the runtime vision validator failing its fixtures (a render knob
//      smuggled into a vision answer MUST be stripped)
//   8. a create.js picker option value unknown to the vocabulary
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');
let failures = 0;
const fail = (msg) => { console.error('FAIL:', msg); failures += 1; };
const ok = (msg) => console.log('ok:', msg);

// ---- 1. parse ----------------------------------------------------------------
let tables, schema, terms, vocab, styles;
try {
  tables = JSON.parse(read('contract/tables.json'));
  schema = JSON.parse(read('contract/garment-spec.schema.json'));
  terms = JSON.parse(read('contract/terms.json'));
  vocab = JSON.parse(read('engine/vocab.json'));
  styles = JSON.parse(read('engine/flat-engine/styles.json'));
  ok('contract/tables.json, garment-spec.schema.json, terms.json, vocab.json, styles.json parse');
} catch (e) {
  fail(`contract file unparsable: ${e.message}`);
  process.exit(1);
}

// ---- 2. schema draft enums == vocab.json -------------------------------------
{
  const draftProps = schema.$defs.draftSpec.properties;
  let drift = 0;
  for (const [field, def] of Object.entries(vocab.fields)) {
    const prop = draftProps[field];
    if (!prop) { fail(`schema draftSpec missing vocab field '${field}'`); drift += 1; continue; }
    const want = JSON.stringify(def.values);
    const got = JSON.stringify(prop.enum);
    if (want !== got) { fail(`schema draftSpec.${field} enum drift: schema ${got} vs vocab ${want}`); drift += 1; }
  }
  if (!drift) ok(`schema draftSpec enums match engine/vocab.json (${Object.keys(vocab.fields).length} fields)`);
}

// ---- 3. term registry defects ------------------------------------------------
{
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
  const ids = new Set();
  const phrases = new Map();
  let bad = 0;
  for (const term of terms.terms) {
    if (ids.has(term.id)) { fail(`duplicate term id '${term.id}'`); bad += 1; }
    ids.add(term.id);
    if (!['drawable', 'honest'].includes(term.status)) { fail(`term '${term.id}' invalid status '${term.status}'`); bad += 1; }
    if (term.status === 'drawable' && !term.capability) { fail(`drawable term '${term.id}' has no capability`); bad += 1; }
    if (term.capability) {
      const [field, value] = term.capability.split('=');
      if (!vocab.fields[field]) { fail(`term '${term.id}' capability names unknown vocab field '${field}'`); bad += 1; }
      else if (value && !vocab.fields[field].values.includes(value)) { fail(`term '${term.id}' capability value '${value}' not in vocab.${field}`); bad += 1; }
    }
    for (const p of [term.canonical, ...(term.synonyms || [])]) {
      const n = norm(p);
      if (phrases.has(n) && phrases.get(n) !== term.id) { fail(`phrase '${p}' maps to both '${phrases.get(n)}' and '${term.id}'`); bad += 1; }
      phrases.set(n, term.id);
    }
  }
  if (!bad) ok(`term registry sound: ${terms.terms.length} terms, ${phrases.size} phrases, ids unique, capabilities valid`);
}

// ---- 4. generated consumers in sync ------------------------------------------
try {
  execFileSync('node', [join(here, 'gen-contract.mjs'), '--check'], { stdio: 'pipe' });
  ok('contract.gen.hpp / contract.gen.js (web + backend) in sync with tables.json');
} catch (e) {
  fail(`generated contract files out of sync: ${String(e.stdout || e.stderr || e).slice(0, 300)}`);
}

// ---- 4b. constants table in sync (K4 mandal) ---------------------------------
// engine/constants.yaml is the single source for embedded design assumptions;
// constants.gen.hpp must match it byte for byte, and every row must carry a
// valid verified/assumed/refuted status (gen-constants validates the rows).
try {
  execFileSync('node', [join(here, 'gen-constants.mjs'), '--check'], { stdio: 'pipe' });
  ok('constants.gen.hpp in sync with engine/constants.yaml (K4 constants table)');
} catch (e) {
  fail(`constants table out of sync/invalid: ${String(e.stdout || e.stderr || e).slice(0, 300)}`);
}

// ---- 5a. manifest vocabulary-coverage scan (local only) ----------------------
// TUR 9 (17 Ağu) düzeltmesi — İSİM YANLIŞTI. Bu kontrol bir GİZLİLİK taraması
// değil, bir KAPSAM taramasıdır: 58-set'in ürettiği her oov ifadesinin
// terms.json'da bir term id'sine düşmesini şart koşar. Girdisi telifli 58-set;
// bu makinede yok ve olmayacak, dolayısıyla 9 kontrolün 1'i BURADA ÖLÜ.
// Dürüstçe ilan edilmişti ama yine de hiçbir şeyi tutmuyordu.
// KURAMADIĞIM ŞEY: bu kapsamın manifest'siz eşdeğeri YOKTUR. Korpusun kelime
// dağarcığı ancak korpustan okunur; uydurulmuş bir vekil sahte bir kontrol olur.
// Onun yerine, korumaya ÇALIŞTIĞI şeyin (telifli girdi ile repo arasındaki
// sınır) manifest gerektirmeyen ve bugün ölçülebilen kısmı 5b'de kuruldu.
{
  const manPath = join(root, 'benchmark-58', 'manifest.json');
  if (!existsSync(manPath)) {
    ok('58-set manifest absent — vocabulary-coverage scan CANNOT run here (input is the copyrighted set; no honest manifest-free equivalent exists). The privacy boundary it was named after is enforced by 5b instead.');
  } else {
    const man = JSON.parse(readFileSync(manPath, 'utf8'));
    const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
    const known = new Set();
    for (const term of terms.terms) for (const p of [term.canonical, ...(term.synonyms || [])]) known.add(norm(p));
    const unmapped = new Map();
    for (const p of man.photos) {
      if (p.category !== 'garment') continue;
      for (const t of (p.oov || [])) if (!known.has(norm(t))) unmapped.set(t, (unmapped.get(t) || 0) + 1);
    }
    if (unmapped.size) for (const [t, n] of unmapped) fail(`manifest oov phrase unmapped in terms.json (x${n}): '${t}'`);
    else ok('leak scan: every 58-set oov phrase resolves to a term id');
  }
}

// ---- 5b. copyright boundary: no protected input is TRACKED in git ------------
// TUR 9 (17 Ağu). 5a'nın adı "leak scan"di ama gerçek sızıntı hiç ölçülmüyordu.
// Yasa CLAUDE.md'de düz yazıyla duruyor ("patterns_real/ ASLA push edilmez") ve
// CLAUDE.md gitignore'da — makine onu okuyamıyor, ve 2026-08-16'da ölçüldü:
// yasa ile ağaç UYUŞMUYOR. Yasa artık contract/gizlilik.json'da, makine okuyor.
// Manifest gerekmez: girdi git'in kendi indeksi. Eşik/tolerans/pin yok — sayı
// "takipli telifli dosya" ve hedefi 0.
{
  let law;
  try { law = JSON.parse(read('contract/gizlilik.json')); }
  catch (e) { law = null; fail(`copyright boundary: contract/gizlilik.json unreadable — the LAW itself is gone, so the gate cannot run (${String(e.message).slice(0, 120)}). A missing law is never a pass.`); }
  let leaked = law ? 0 : 1;
  for (const p of (law ? law.korunan_yollar : [])) {
    const allow = new Set(p.izinli || []);
    let tracked = [];
    try {
      tracked = execFileSync('git', ['ls-files', '-z', '--', p.yol], { cwd: root, encoding: 'utf8' })
        .split('\0').filter(Boolean);
    } catch (e) { fail(`copyright boundary: git ls-files failed for '${p.yol}' — the gate lost its input (${String(e.message).slice(0, 120)})`); leaked += 1; continue; }
    const bad = tracked.filter((f) => !allow.has(f));
    if (!bad.length) { ok(`copyright boundary '${p.yol}': 0 tracked files beyond the ${allow.size} declared tools`); continue; }
    leaked += bad.length;
    const shown = bad.slice(0, 6).join(', ');
    fail(`copyright boundary BREACHED — '${p.yol}' has ${bad.length} TRACKED file(s) in git: ${shown}${bad.length > 6 ? `, +${bad.length - 6} more` : ''}\n      why protected: ${p.neden}\n      the repo is public unless proven otherwise; tracked means downloadable. Deleting history is DAMLA'S call (DAMLA-KUYRUK K1) — this gate only refuses to stay silent.`);
  }
  if (!leaked) ok('copyright boundary clean: no protected input tracked in git');
}

// ---- 6. flat style records inside the contract's flat.* namespace ------------
{
  const flatProps = schema.$defs.flatRecipe.properties;
  const partProps = flatProps.parts.properties;
  let bad = 0;
  const checkNum = (key, v, where) => {
    const p = flatProps[key];
    if (!p) { fail(`styles.json ${where}: field '${key}' not declared in contract flat.*`); bad += 1; return; }
    if (p.enum && !p.enum.includes(v)) { fail(`styles.json ${where}: ${key}='${v}' outside contract enum`); bad += 1; }
    if (p.type === 'number' || p.type === 'integer') {
      if (typeof v !== 'number' || (p.minimum !== undefined && v < p.minimum) || (p.maximum !== undefined && v > p.maximum)) {
        fail(`styles.json ${where}: ${key}=${v} outside contract bounds [${p.minimum}, ${p.maximum}]`); bad += 1;
      }
    }
  };
  for (const [k, v] of Object.entries(styles.shared)) checkNum(k, v, 'shared');
  for (const [name, st] of Object.entries(styles.styles)) {
    for (const [k, v] of Object.entries(st)) {
      if (k.startsWith('_')) continue; // _pin, _comment: metadata, not contract fields
      if (k === 'parts') {
        for (const pk of Object.keys(v)) if (!partProps[pk]) { fail(`styles.json ${name}.parts: unknown part flag '${pk}'`); bad += 1; }
      } else if (k === 'own') {
        for (const [ok2, ov] of Object.entries(v)) checkNum(ok2, ov, `${name}.own`);
      } else checkNum(k, v, name);
    }
  }
  if (!bad) ok(`flat style records validate against contract flat.* (${Object.keys(styles.styles).length} styles)`);
}

// ---- 7. runtime vision validator fixtures ------------------------------------
{
  const { validateVision } = await import(join(root, 'web/js/spec-validate.js'));
  let bad = 0;
  // valid semantic answer passes untouched
  const good = { garment: 'dress', neckline: 'vNeck', sleeveStyle: 'balloon', outOfVocab: ['peplum'], closure: { type: 'ties', location: 'waist' } };
  const r1 = validateVision(good);
  if (r1.report.length) { fail(`valid vision answer produced strikes: ${r1.report.join('; ')}`); bad += 1; }
  if (JSON.stringify(r1.clean) !== JSON.stringify(good)) { fail('valid vision answer was mutated'); bad += 1; }
  // a render knob smuggled into the answer MUST be stripped
  const smuggled = { garment: 'dress', capPuff: 2.6, seed: 7, armholeHollow: 0.1 };
  const r2 = validateVision(smuggled);
  if ('capPuff' in r2.clean || 'seed' in r2.clean || 'armholeHollow' in r2.clean) { fail('render knob passed the vision gate'); bad += 1; }
  if (r2.report.length !== 3) { fail(`expected 3 strip strikes, got ${r2.report.length}`); bad += 1; }
  // an out-of-enum value is nulled, never passed through
  const r3 = validateVision({ garment: 'dress', neckline: 'plunging-bardot' });
  if (r3.clean.neckline !== null) { fail('out-of-enum neckline passed the vision gate'); bad += 1; }
  if (!bad) ok('runtime vision validator fixtures pass (valid passes, render knobs stripped, bad enum nulled)');
}

// ---- 8. create.js picker options subset of the vocabulary --------------------
{
  const src = read('web/js/create.js');
  const specRe = /key:\s*'([a-zA-Z]+)'[\s\S]*?options:\s*\[(\[[\s\S]*?\])\s*\],\s*for:/g;
  let m, bad = 0, checked = 0;
  while ((m = specRe.exec(src)) !== null) {
    const [, key, optsSrc] = m;
    const def = vocab.fields[key];
    if (!def) continue; // non-vocab pickers (keyhole/ruffle UI enums) are their own words
    const values = [...optsSrc.matchAll(/\[\s*'([^']+)'/g)].map((x) => x[1]);
    for (const v of values) {
      checked += 1;
      if (!def.values.includes(v)) { fail(`create.js picker '${key}' offers '${v}' not in vocab`); bad += 1; }
    }
  }
  if (!bad) ok(`create.js picker options subset of the vocabulary (${checked} option values checked)`);
}

console.log(failures ? `\ncontract validation FAILED (${failures})` : '\ncontract validation GREEN');
process.exit(failures ? 1 : 0);
