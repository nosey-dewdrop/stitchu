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
const SPEC_V2 = JSON.parse(
  readFileSync(join(ROOT, 'contract', 'garment-spec-v2.json'), 'utf8'),
);

// ── ÇIPA SÖZLÜĞÜ ────────────────────────────────────────────────────────────
// contract/anchors-v1.json ÜRETİLMİŞ bir dosyadır (gen-anchors.mjs). Burada
// ELDE yazılmış bir liste YOKTUR: sözlük neyi ilan ediyorsa çıpa odur. Dosya
// yoksa/bozuksa çıpa kullanan her diff ADIYLA reddedilir (sessiz kabul yok).
let ANCHOR_CACHE = null;
export function anchorNames() {
  if (ANCHOR_CACHE) return ANCHOR_CACHE;
  try {
    const j = JSON.parse(readFileSync(join(ROOT, 'contract', 'anchors-v1.json'), 'utf8'));
    ANCHOR_CACHE = (j.anchors || []).map((a) => a.ad).filter(Boolean).sort();
  } catch {
    ANCHOR_CACHE = [];
  }
  return ANCHOR_CACHE;
}

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
// Diff = { ops: [ { op, field, value, why?, anchor?, t? } ] }. Başka bir şey
// yok: model koordinat, vertex, panel adı ya da serbest metin gönderemez.
//
// KONUM NASIL İFADE EDİLİR: `anchor` = ÜRETİLMİŞ çıpa sözlüğündeki bir AD,
// `t` = o çıpa boyunca 0..1 oran ofseti. VLM'e piksel koordinatı ya da vertex
// indeksi seçtirmek MİMARİ İHLALDİR — bu yüzden şemada koordinat alanı YOKTUR
// ve anahtar listesi KAPALIDIR: listede olmayan her anahtar ADIYLA reddedilir.
const OPS = ['set', 'unset'];
export const OP_KEYS = ['op', 'field', 'value', 'why', 'anchor', 't'];

export function validateDiff(diff) {
  const errors = [];
  if (!diff || typeof diff !== 'object') return ['DIFF şema: nesne değil'];
  if (!Array.isArray(diff.ops)) return ['DIFF şema: ops dizisi yok'];
  if (!diff.ops.length) return ['DIFF şema: ops boş — düzenleme yok'];
  const anchors = anchorNames();
  diff.ops.forEach((o, i) => {
    if (!o || typeof o !== 'object') { errors.push(`op[${i}]: nesne değil`); return; }
    for (const k of Object.keys(o)) {
      if (!OP_KEYS.includes(k)) {
        errors.push(
          `op[${i}]: '${k}' diff şemasında YOK — konum yalnız 'anchor' (çıpa adı) ` +
          `+ 't' (0..1 oran) ile ifade edilir, koordinat/vertex gönderilemez ` +
          `(izinli anahtarlar: ${OP_KEYS.join(', ')})`,
        );
      }
    }
    if (!OPS.includes(o.op)) errors.push(`op[${i}]: bilinmeyen op '${o.op}' (geçerli: ${OPS.join(', ')})`);
    if (typeof o.field !== 'string' || !o.field) { errors.push(`op[${i}]: field yok`); return; }
    if (!LOCALITY.fieldZones[o.field]) {
      errors.push(`op[${i}]: '${o.field}' düzenlenebilir alan değil (contract/edit-locality-v1.json fieldZones)`);
    }
    if (o.op === 'set' && (o.value === undefined || o.value === null)) {
      errors.push(`op[${i}]: set '${o.field}' için value yok`);
    }
    // ── ÇIPA ──
    if (o.anchor !== undefined) {
      if (typeof o.anchor !== 'string' || !o.anchor) {
        errors.push(`op[${i}]: anchor bir ÇIPA ADI (metin) olmalı, '${JSON.stringify(o.anchor)}' geldi`);
      } else if (!anchors.length) {
        errors.push(
          `op[${i}]: ÇIPA SÖZLÜĞÜ YOK: anchor='${o.anchor}' doğrulanamadı — ` +
          'contract/anchors-v1.json okunamadı/boş (gen-anchors.mjs koşmamış). Sessiz kabul edilmez.',
        );
      } else if (!anchors.includes(o.anchor)) {
        errors.push(
          `op[${i}]: ÇIPA SİCİLDE YOK: anchor='${o.anchor}' — üretilmiş çıpa sözlüğünde ` +
          `(contract/anchors-v1.json) böyle bir çıpa yok (geçerli: ${anchors.join(', ')})`,
        );
      }
    }
    // ── ORAN OFSETİ ──
    if (o.t !== undefined) {
      if (o.anchor === undefined) {
        errors.push(`op[${i}]: t=${o.t} verildi ama anchor YOK — oran ofseti neyin üstünde ölçüleceği bilinmiyor`);
      }
      if (typeof o.t !== 'number' || !Number.isFinite(o.t)) {
        errors.push(`op[${i}]: ÇIPA ORANI SAYI DEĞİL: t=${JSON.stringify(o.t)} (anchor='${o.anchor}', geçerli 0..1)`);
      } else if (o.t < 0 || o.t > 1) {
        errors.push(`op[${i}]: ÇIPA ORANI ARALIK DIŞI: t=${o.t} (anchor='${o.anchor}', geçerli 0..1)`);
      }
    }
  });
  return errors;
}

// ── 1b. OPERATÖR SİCİLİ ─────────────────────────────────────────────────────
// Şema ve sözlük "bu kelime var mı" diye sorar. Sicil BAŞKA bir şey sorar:
// bu değerin GEREKTİRDİĞİ operatör sevk edildi mi? Kural uydurulmadı,
// contract/garment-spec-v2.json topology._role'den okunur: "bir değer,
// gerektirdiği operatörlerden biri `shipped` değilse İFADE EDİLEMEZ ve red o
// operatörün ADIYLA verilir."
//
// EŞLEME BENİM, STATÜ SÖZLEŞMENİN: aşağıdaki v1-alan -> v2-eksen tablosu bu
// dosyada açık yazılıdır ve tartışmaya açıktır; `status` sözleşmeden okunur.
// null = v2 ekseninin enum'unda karşılığı yok -> operatör SUÇLANMAZ, ayrı sayılır.
export const AXIS_MAP = {
  garment:     ['garment',     { dress: 'sheathDress', top: 'top', skirt: 'skirt' }],
  skirtStyle:  ['skirtShape',  { aLine: 'aLine', straight: 'straight', gathered: 'gathered', pleated: 'pleated', gore: 'gore', halfCircle: null }],
  sleeveStyle: ['sleeve',      { none: 'none', straight: 'setIn', balloon: 'puff' }],
  shaping:     ['suppression', { dart: 'dart', princess: 'seamOnly' }],
  collarType:  ['collar',      { none: 'none', peterPan: 'peterPan', flat: 'peterPan', crescent: 'peterPan', stand: 'stand', mock: 'stand', shirt: 'shirt' }],
  backOpening: ['closure',     { none: 'none', round: 'backOpening', lowV: 'backOpening', square: 'backOpening', keyhole: 'backOpening' }],
};

export const OPERATOR_STATUS = Object.fromEntries(
  Object.entries(SPEC_V2.operators).map(([k, v]) => [k, v.status]),
);

// Yalnız diff'in DOKUNDUĞU alanları sormak yetmez: "kolu değiştir" diff'i
// geçerken spec'in kolsuz olması ayrı bir gerçektir. Bu yüzden sicil, diff
// UYGULANDIKTAN SONRAKİ spec'in tamamına sorulur; hangi alanın diff'te
// geçtiği `dokunulan` ile ayrıca işaretlenir.
export function operatorSicil(spec, touchedFields = []) {
  const touched = new Set(touchedFields);
  const engeller = [];   // {field, axis, value, v2, op, status, dokunulan}
  const enumsuz = [];    // eksen enum'unda karşılığı yok
  for (const [field, [axis, map]] of Object.entries(AXIS_MAP)) {
    const raw = spec[field];
    if (raw === undefined || raw === null) continue;
    if (!(raw in map)) { enumsuz.push({ field, axis, value: raw, reason: 'eşleme tablosunda yok' }); continue; }
    const v2 = map[raw];
    if (v2 === null) { enumsuz.push({ field, axis, value: raw, reason: `v2 ${axis} enum'unda karşılığı yok` }); continue; }
    const node = SPEC_V2.topology[axis] && SPEC_V2.topology[axis].values[v2];
    if (!node) { enumsuz.push({ field, axis, value: raw, reason: `v2 ${axis}.${v2} sözleşmede yok` }); continue; }
    for (const op of (node.requires || [])) {
      const status = OPERATOR_STATUS[op];
      if (status !== 'shipped') {
        engeller.push({ field, axis, value: raw, v2, op, status, dokunulan: touched.has(field) });
      }
    }
  }
  const rejected = engeller.map((e) => (
    `SİCİL — OPERATÖR SEVK EDİLMEDİ: '${e.op}' statüsü ${String(e.status).toUpperCase()} ` +
    `(gereken: ${e.field}='${e.value}' -> v2 ${e.axis}='${e.v2}'` +
    `${e.dokunulan ? ', bu alan DIFF\'TE geçiyor' : ', diff\'te geçmiyor ama spec taşıyor'})`
  ));
  return {
    rejected,
    engeller,
    enumsuz,
    operatorler: [...new Set(engeller.map((e) => e.op))].sort(),
    kaynak: `contract/garment-spec-v2.json@${SPEC_V2.version}`,
  };
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

// ── KARŞILAŞTIRMA GRANÜLARİTESİ — İLAN EDİLİR VE DENETLENİR ─────────────────
// Bölge dışı panelin "değişmedi" hükmü BAYT inceliğindedir: panelin tam JSON
// serileştirmesi karşılaştırılır, panel adı/sayısı/varlığı değil. Bu satır bir
// yorum değil, bir SÖZDÜR: edit_locality_check.mjs'in A4 mandalı hem bu ilanı
// okur hem de dokunulmayan bir panelde tek koordinatı 0.001mm oynatıp
// localityReport'un ihlal bastığını ölçer. Karşılaştırma bayttan panel
// varlığına indirilirse A4 KIRMIZI düşer (V6-B'de bu yönde diş YOKTU).
export const LOCALITY_GRANULARITY = 'bayt';
export const pieceBytes = (p) => JSON.stringify(p);
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
export async function runEdit(base, diff, { mode = 'diff', body = BODY, operatorGate = false } = {}) {
  const schema = validateDiff(diff);
  if (schema.length) return { stage: 'şema', rejected: schema };
  const sicil = sicilCheck(diff.ops);
  if (sicil.length) return { stage: 'sözlük', rejected: sicil };
  const after = applyDiff(base, diff.ops, mode);
  // OPERATÖR SİCİLİ — diff UYGULANDIKTAN SONRA sorulur.
  // ÖLÇÜLMÜŞ ÇELİŞKİ (V6-G): sicil `sleeve`/`collarFamily`/`skirtFamily` için
  // absent diyor, ama sevk edilen motor 'Puff Sleeve' ve 'Peter Pan Collar'
  // panellerini BASIYOR. Çelişki BURADA çözülmez. Bu yüzden sicil reddi
  // varsayılan olarak UYARI KANALIDIR (`r.sicil`) ve hattı kesmez; kapı
  // `operatorGate: true` ile AÇIKÇA istenir (RULES 4: yeni özellik opt-in,
  // varsayılan KAPALI). Sessiz geçiş yok: red her hâlde ADIYLA raporlanır.
  const sicilRapor = operatorSicil(after, diff.ops.map((o) => o.field));
  if (operatorGate && sicilRapor.rejected.length) {
    return { stage: 'sicil', rejected: sicilRapor.rejected, sicil: sicilRapor, afterSpec: after };
  }
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
    sicil: sicilRapor,
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
    console.error('kullanım: node engine/tools/spec-diff.mjs <base.json> <diff.json> [--png <dizin>] [--sicil-kapi]');
    process.exit(2);
  }
  const pngIdx = process.argv.indexOf('--png');
  const base = JSON.parse(readFileSync(basePath, 'utf8'));
  const diff = JSON.parse(readFileSync(diffPath, 'utf8'));
  const r = await runEdit(base, diff, { operatorGate: process.argv.includes('--sicil-kapi') });
  console.log(`aşama: ${r.stage}`);
  if (r.rejected && r.rejected.length) {
    for (const m of r.rejected) console.log('  RED: ' + m);
    process.exit(1);
  }
  // Sicil UYARI kanalı: kapı kapalıyken bile red ADIYLA basılır (sessiz geçiş yok).
  if (r.sicil && r.sicil.rejected.length) {
    console.log(`SİCİL UYARISI (${r.sicil.kaynak}) — ${r.sicil.rejected.length} operatör sevk edilmemiş:`);
    for (const m of r.sicil.rejected) console.log('  ! ' + m);
    console.log('  (kapı KAPALI: --sicil-kapi ile hattı kestirebilirsin)');
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
