// spec-diff.mjs — EDİTLEME HATTI (F-I).
//
// Damla'nın sözü: "midjourney gibi editleme olacak: fiyonk ekle şuraya,
// uzatma, kısaltma, yakayı değiştirme".
//
// Model GEOMETRİ üretmez. Model bir spec DIFF üretir; bu dosya o diff'i
// deterministik olarak yürütür:
//
//   spec DIFF -> şema doğrulama -> sicil kontrolü (shipped değilse ADIYLA red)
//             -> AYNI beden/gövde ile yeniden üretim -> ÖNCE/SONRA
//
// Neden diff, neden tüm spec değil: tüm spec'i yeniden yazan bir model, adı
// geçmeyen alanları da (kol boyu, etek boyu) sessizce varsayılana çeker; alıcı
// "yakayı değiştir" der, eteği kısalmış bir kalıp alır. Diff'te dokunulan alan
// SAYILIDIR, ve dokunulmayan panelin bayt-aynı kalması bir KAPIdır
// (engine/tests/edit_locality_check.mjs).
//
// Tek gerçek kaynağı: spec -> engine çevirisi web/js/engine.js'in engineSpec'i
// (ürünle aynı fonksiyon; kopya sürüklenmesi 2026-07-18'de 'puff'u FULL saydırdı).
//
// Kullanım:
//   node engine/tools/spec-diff.mjs <base.json> <diff.json> [--png <dizin>]
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { VOCAB, canonical } from '../../web/js/vocab.gen.js';
import { engineSpec } from '../../web/js/engine.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const LOCALITY = JSON.parse(
  readFileSync(join(ROOT, 'contract', 'edit-locality-v1.json'), 'utf8'),
);
const COMPOSITION = JSON.parse(
  readFileSync(join(ROOT, 'contract', 'composition.json'), 'utf8'),
);

// Standart gövde (mm/cm karışmasın: web'in kullandığı cm alanları).
export const BODY = {
  bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36,
};

let enginePromise = null;
export function loadEngine() {
  if (!enginePromise) {
    const require2 = createRequire(join(ROOT, 'x.mjs'));
    enginePromise = require2(join(ROOT, 'engine', 'dist', 'stitchu-engine.js'))();
  }
  return enginePromise;
}

// ── 1. ŞEMA DOĞRULAMA ───────────────────────────────────────────────────────
// Diff = { ops: [ { op, field, value, why? } ] }. Başka bir şey yok: model
// koordinat, panel adı ya da serbest metin gönderemez.
const OPS = ['set', 'unset'];

export function validateDiff(diff) {
  const errors = [];
  if (!diff || typeof diff !== 'object') return ['DIFF şema: nesne değil'];
  if (!Array.isArray(diff.ops)) return ['DIFF şema: ops dizisi yok'];
  if (!diff.ops.length) return ['DIFF şema: ops boş — düzenleme yok'];
  diff.ops.forEach((o, i) => {
    if (!o || typeof o !== 'object') { errors.push(`op[${i}]: nesne değil`); return; }
    if (!OPS.includes(o.op)) errors.push(`op[${i}]: bilinmeyen op '${o.op}' (geçerli: ${OPS.join(', ')})`);
    if (typeof o.field !== 'string' || !o.field) { errors.push(`op[${i}]: field yok`); return; }
    if (!LOCALITY.fieldZones[o.field]) {
      errors.push(`op[${i}]: '${o.field}' düzenlenebilir alan değil (contract/edit-locality-v1.json fieldZones)`);
    }
    if (o.op === 'set' && (o.value === undefined || o.value === null)) {
      errors.push(`op[${i}]: set '${o.field}' için value yok`);
    }
  });
  return errors;
}

// ── 2. SİCİL KONTROLÜ ───────────────────────────────────────────────────────
// Sicil = vocab.gen.js (engine/vocab.json'dan üretilir, yani motorun DERLEDİĞİ
// kelime listesi) + contract/composition.json (yayınlanmış bileşen kaydı).
// Sicilde olmayan bir değer ADIYLA reddedilir; sessizce en yakınına düşmez.
const OFF = (field) => (VOCAB[field] ? VOCAB[field].values[0] : undefined);

export function sicilCheck(ops) {
  const rejects = [];
  for (const o of ops) {
    const field = o.field;
    const value = o.op === 'unset' ? OFF(field) : o.value;
    if (typeof value === 'boolean' || typeof value === 'number') continue; // keyhole/skirtLengthMM
    if (!VOCAB[field]) {
      // Sözlükte enum'u olmayan alan (skirtLengthMM gibi) — şema zaten geçirdi.
      continue;
    }
    const c = canonical(field, value);
    if (c === undefined) {
      rejects.push(
        `SİCİLDE YOK: ${field}='${value}' — motorun sözlüğünde böyle bir değer yok ` +
        `(geçerli: ${VOCAB[field].values.join(', ')})`,
      );
      continue;
    }
    // Bileşen kaydı: composition.json bir bileşeni bu alana bağlamışsa, kapalı
    // olmayan değer o bileşenin ilan ettiği değerlerden biri olmalı. Temel
    // alanlar (neckline crew/scoop...) bileşen değildir, sözlük onlar için sicildir.
    const comps = COMPOSITION.components.filter((k) => k.specField === field);
    if (comps.length && c !== OFF(field)) {
      const declared = comps.flatMap((k) => k.values);
      const baseField = comps.some((k) => k.id.includes('.')); // neckline.ext gibi kısmi kayıt
      if (!declared.includes(c) && !baseField) {
        rejects.push(
          `SEVK EDİLMEDİ: ${field}='${c}' — composition.json bu alanda sadece ` +
          `[${declared.join(', ')}] ilan ediyor`,
        );
      }
    }
  }
  return rejects;
}

// ── 3. UYGULAMA ─────────────────────────────────────────────────────────────
// mode 'diff'   : SADECE adı geçen alanlar değişir (kanun budur).
// mode 'rewrite': modelin tüm spec'i yeniden yazdığı hâl — adı geçmeyen alanlar
//                 varsayılana düşer. ANTI-HACK için var; kapı bunu KIRMIZI görmek zorunda.
export function applyDiff(base, ops, mode = 'diff') {
  const out = mode === 'rewrite' ? {} : { ...base };
  if (mode === 'rewrite') {
    // Model "her şeyi yeniden yazdı": sadece garment/temel iskelet + diff kalır.
    out.garment = base.garment;
  }
  for (const o of ops) {
    if (o.op === 'unset') out[o.field] = OFF(o.field);
    else out[o.field] = o.value;
  }
  return out;
}

export function touchedZones(ops) {
  const z = new Set();
  for (const o of ops) for (const k of (LOCALITY.fieldZones[o.field] || [])) z.add(k);
  return [...z];
}

// Bir alan birden çok bölgeye aitse untouchable listeleri KESİŞTİRİLİR:
// bölgelerden birinde serbest olan panel serbesttir.
export function untouchablePatterns(zones) {
  if (!zones.length) return [];
  const lists = zones.map((z) => (LOCALITY.zones[z] ? LOCALITY.zones[z].untouchable : []));
  return lists.reduce((a, b) => a.filter((p) => b.includes(p)));
}

// ── 4. AYNI GÖVDE İLE YENİDEN ÜRETİM ────────────────────────────────────────
export async function draft(spec, body = BODY) {
  const engine = await loadEngine();
  let out;
  try {
    out = JSON.parse(engine.draftJSON(engineSpec(spec), body));
  } catch (e) {
    return { error: String(e && e.message ? e.message : e) };
  }
  return out;
}

const pieceBytes = (p) => JSON.stringify(p);
export const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

// ── 5. LOKALLİK RAPORU ──────────────────────────────────────────────────────
// İhlal = untouchable kalıbına uyan bir panelin baytlarının değişmesi
// (ya da ortadan kalkması / yeni doğması).
export function localityReport(beforePattern, afterPattern, zones) {
  const pats = untouchablePatterns(zones).map((p) => new RegExp(p));
  const b = new Map(beforePattern.pieces.map((p) => [p.name, pieceBytes(p)]));
  const a = new Map(afterPattern.pieces.map((p) => [p.name, pieceBytes(p)]));
  const names = new Set([...b.keys(), ...a.keys()]);
  const violations = [];
  const held = [];
  for (const n of names) {
    if (!pats.some((r) => r.test(n))) continue;
    const bv = b.get(n); const av = a.get(n);
    if (bv === av) { held.push(n); continue; }
    if (bv === undefined) violations.push(`${n}: düzenlemeden SONRA doğdu (bölge dışı)`);
    else if (av === undefined) violations.push(`${n}: düzenlemeden sonra KAYBOLDU (bölge dışı)`);
    else violations.push(`${n}: baytları değişti ${sha(bv)} -> ${sha(av)}`);
  }
  return { violations, held: held.sort(), checked: held.length + violations.length };
}

// ── 6. TAM HAT ──────────────────────────────────────────────────────────────
export async function runEdit(base, diff, { mode = 'diff', body = BODY } = {}) {
  const schema = validateDiff(diff);
  if (schema.length) return { stage: 'şema', rejected: schema };
  const sicil = sicilCheck(diff.ops);
  if (sicil.length) return { stage: 'sicil', rejected: sicil };
  const after = applyDiff(base, diff.ops, mode);
  const beforeDraft = await draft(base, body);
  const afterDraft = await draft(after, body);
  if (beforeDraft.error) return { stage: 'üretim', rejected: [`ÖNCE: ${beforeDraft.error}`] };
  if (afterDraft.error) return { stage: 'üretim', rejected: [`SONRA: ${afterDraft.error}`] };
  const zones = touchedZones(diff.ops);
  const locality = localityReport(beforeDraft.pattern, afterDraft.pattern, zones);
  // SİCİL, ÖLÇÜLMÜŞ HÂLİ: diff bir şey istedi ama kalıp hiç kımıldamadıysa,
  // o değer okunuyor ama SEVK EDİLMİYOR demektir. Sessiz no-op = yalan.
  const noop = JSON.stringify(beforeDraft.pattern.pieces) === JSON.stringify(afterDraft.pattern.pieces);
  return {
    stage: 'tamam',
    rejected: noop
      ? [`SESSİZ NO-OP: ${diff.ops.map((o) => `${o.field}=${o.op === 'unset' ? OFF(o.field) : o.value}`).join(', ')} ` +
         '— şema ve sicil geçti ama kalıp bayt bayt aynı kaldı (okunuyor, çizilmiyor)']
      : [],
    zones,
    before: beforeDraft,
    after: afterDraft,
    afterSpec: after,
    locality,
    noop,
  };
}

// ── ÖNCE/SONRA GÖRSEL ───────────────────────────────────────────────────────
const pathD = (cmds) => cmds.map((c) => {
  if (c.type === 'move') return `M ${c.x} ${c.y}`;
  if (c.type === 'line') return `L ${c.x} ${c.y}`;
  if (c.type === 'curve') return `C ${c.cp1x} ${c.cp1y} ${c.cp2x} ${c.cp2y} ${c.x} ${c.y}`;
  if (c.type === 'close') return 'Z';
  return '';
}).join(' ');

const ptsOf = (c) => {
  const p = [];
  if (c.x !== undefined) p.push([c.x, c.y]);
  if (c.cp1x !== undefined) p.push([c.cp1x, c.cp1y]);
  if (c.cp2x !== undefined) p.push([c.cp2x, c.cp2y]);
  return p;
};

// Dokunulmayan paneller GRİ, değişen/yeni paneller MÜREKKEP: göz de kapının
// gördüğünü görsün.
export function patternSVG(pattern, changedNames, title) {
  // Paneller motorda AYNI orijinden çizilir; üst üste binmiş bir yığın göz için
  // okunmaz. Burada her panel kendi bbox'ıyla bir sıraya dizilir — geometri
  // DEĞİŞMEZ, sadece ötelenir (ötelemeyi kapı değil göz kullanır).
  const pad = 24;
  const laid = pattern.pieces.map((p) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const c of p.commands) for (const [x, y] of ptsOf(c)) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    return { p, x0, y0, w: x1 - x0, h: y1 - y0 };
  });
  let cursor = pad, rowH = 0;
  for (const it of laid) { it.dx = cursor - it.x0; it.dy = pad - it.y0; cursor += it.w + pad; rowH = Math.max(rowH, it.h); }
  const vbW = cursor, vbH = rowH + 2 * pad + 34;
  let inner = '';
  for (const it of laid) {
    const hot = changedNames.has(it.p.name);
    const col = hot ? '#c2410c' : '#b8b2a8';
    inner += `<g transform="translate(${it.dx} ${it.dy})">`;
    inner += `<path d="${pathD(it.p.commands)}" fill="none" stroke="${col}" stroke-width="${hot ? 2.6 : 1.2}"/>`;
    if (it.p.markings && it.p.markings.length) {
      inner += `<path d="${pathD(it.p.markings)}" fill="none" stroke="${col}" stroke-width="0.9" stroke-dasharray="5 4"/>`;
    }
    inner += '</g>';
    inner += `<text x="${it.dx + it.x0}" y="${rowH + pad + 16}" font-family="monospace" font-size="11" fill="${col}">${it.p.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
  }
  inner += `<text x="${pad}" y="${vbH - 6}" font-family="monospace" font-size="15" fill="#111">${title}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${vbW}mm" height="${vbH}mm" ` +
    `viewBox="0 0 ${vbW} ${vbH}">` +
    `<rect x="0" y="0" width="${vbW}" height="${vbH}" fill="#faf8f4"/>${inner}</svg>`;
}

export async function writePNG(svg, outPath) {
  const { Resvg } = await import('@resvg/resvg-js');
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1600 } }).render().asPng();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
  return { path: outPath, sha256: createHash('sha256').update(png).digest('hex') };
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('spec-diff.mjs')) {
  const [basePath, diffPath] = process.argv.slice(2);
  if (!diffPath) {
    console.error('kullanım: node engine/tools/spec-diff.mjs <base.json> <diff.json> [--png <dizin>]');
    process.exit(2);
  }
  const pngIdx = process.argv.indexOf('--png');
  const base = JSON.parse(readFileSync(basePath, 'utf8'));
  const diff = JSON.parse(readFileSync(diffPath, 'utf8'));
  const r = await runEdit(base, diff);
  console.log(`aşama: ${r.stage}`);
  if (r.rejected && r.rejected.length) {
    for (const m of r.rejected) console.log('  RED: ' + m);
    process.exit(1);
  }
  console.log(`bölge: ${r.zones.join(', ')}`);
  const bMap = new Map(r.before.pattern.pieces.map((p) => [p.name, JSON.stringify(p)]));
  const changed = new Set(r.after.pattern.pieces.filter((p) => bMap.get(p.name) !== JSON.stringify(p)).map((p) => p.name));
  for (const p of r.before.pattern.pieces) if (!r.after.pattern.pieces.some((q) => q.name === p.name)) changed.add(p.name);
  console.log(`ÖNCE  ${r.before.pattern.pieces.length} panel: ${r.before.pattern.pieces.map((p) => p.name).join(' | ')}`);
  console.log(`SONRA ${r.after.pattern.pieces.length} panel: ${r.after.pattern.pieces.map((p) => p.name).join(' | ')}`);
  console.log(`değişen panel (${changed.size}): ${[...changed].join(' | ') || '-'}`);
  console.log(`bölge dışı bayt-aynı tutulan panel (${r.locality.held.length}): ${r.locality.held.join(' | ') || '-'}`);
  console.log(`LOKALLİK İHLALİ: ${r.locality.violations.length}`);
  for (const v of r.locality.violations) console.log('  ! ' + v);
  if (pngIdx > 0) {
    const dir = process.argv[pngIdx + 1];
    const a = await writePNG(patternSVG(r.before.pattern, new Set(), 'ONCE'), join(dir, 'once.png'));
    const b = await writePNG(patternSVG(r.after.pattern, changed, 'SONRA'), join(dir, 'sonra.png'));
    console.log(`PNG ${a.path} sha256=${a.sha256.slice(0, 16)}`);
    console.log(`PNG ${b.path} sha256=${b.sha256.slice(0, 16)}`);
  }
  process.exit(r.locality.violations.length ? 1 : 0);
}
