#!/usr/bin/env node
// gen-landing-motor.mjs — LANDING SAYILARI MOTORDAN GELİR, YAZARDAN DEĞİL
// (F10-vitrin, İŞ 1).
//
// NEDEN VAR. web/index.html aylarca elle çizilmiş "kanıt" SVG'leri taşıdı:
// "10 pieces · 2.5 m A-LINE DRESS" yazıyordu, motor aynı elbiseye bugün başka
// sayıda parça veriyor. gen-vitrin.mjs hedef_kosu'nun ölçümlerini sayfaya
// bağlamıştı; bu dosya aynı yasayı MOTORUN KENDİ ÇİZİMİNE genişletir:
//
//   * SAYILAR: parça sayısı, kumaş metresi, inşa adımı sayısı, beden kümesi,
//     kumaş kataloğu — hepsi engine.draftJSON / contract dosyalarından okunur
//     ve web/data/landing-motor.json'a yazılır; sayfadaki `data-motor="..."`
//     öğeleri o dosyadan doldurulur.
//   * ÇİZİMLER: sayfadaki kalıp ve flat görselleri elle çizilmiş taklit değil,
//     motorun bugünkü çıktısıdır — patternSVG (indirme düğmesinin bastığı aynı
//     bayt yolu) ve renderFlatFromPattern (flat düğmesinin aynı kalemi) bu
//     koşuda üretir, web/assets/motor/ altına yazar.
//
// engine/tests/vitrin_gercek_check.mjs bu üreteci YENİDEN koşturur ve sevk
// edilen bayt bugünkü koşudan sapmışsa KIRMIZI yakar; elle düzeltilmiş bir
// sayı ya da bayatlamış bir çizim yaşayamaz.
//
// SIFIR API ÇAĞRISI: her şey deterministik motor + contract okumasıdır.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');

// DOM stub — uctan_uca_check/indir_check ile aynı satırlar: sevk edilen loader
// node'da koşsun, paralel bir node-özel hat doğmasın.
globalThis.document = globalThis.document || {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
if (!globalThis.window) {
  const require2 = createRequire(import.meta.url);
  const engine = await require2(join(ROOT, 'engine/dist/stitchu-engine.js'))();
  globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
}
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:stub', revokeObjectURL: () => {} };

const { draft, pieceBytes } = await import(join(ROOT, 'engine/tools/spec-diff.mjs'));
const { bodyForSize } = await import(join(ROOT, 'web/js/engine.js'));
const { patternSVG } = await import(join(ROOT, 'web/js/download.js'));
const { renderFlatFromPattern } = await import(join(ROOT, 'web/lib/flat-from-pattern.js'));
const { FABRIC_CATALOG } = await import(join(ROOT, 'web/js/fabric-catalog.js'));

export const OUT_JSON = 'web/data/landing-motor.json';
export const PAGES = ['web/index.html'];
// Üretecin yazdığı çizimler. Anahtar = dosya adı, değer = üretim tarifi.
export const ASSET_DIR = 'web/assets/motor';

const BEDEN = 'EU38';
const kesim = (d) => d.pattern.pieces.filter((p) => p.sinif !== 'bitirme');

// Vitrindeki elbise: kolu olan dokuma a-line elbise — create.html'in kendi
// sözlük kelimeleri, özel bir vitrin dili değil.
const DRESS_SPEC = { garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'straight' };
const KNIT_SPEC = { garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'none',
                    fabric: 'knit', fabricStretchPct: 50 };
// Motorun kabul ettiği kol kümesi ölçüldü: engineSpec 'cap'i adıyla reddetti
// ("invalid sleeveStyle 'cap' (valid: none, straight, balloon)") — vitrin bu
// yüzden ÜÇ kol geometrisi gösterir, dört değil.
const SLEEVES = ['straight', 'balloon', 'none'];

// ── M6: VITRINDEKI ORNEKLER MOTORUN KENDI CIZIMI ───────────────────────────
// Bu blok M1-M3'un urettigi giysileri landing'e TASIR. Hicbiri elle cizilmis
// mock degil: her biri asagida yeniden draft edilir, sevk edilen flat kalemiyle
// (renderFlatFromPattern = flat indirme dugmesinin dosyasi) cizilir ve
// vitrin_gercek_check bu ureteci yeniden kosturup bayt bayt kiyaslar.
//
// PUF (M1-puf): ayni elbise, kapak duz -> kapak buzgulu. Sayilar kalibin kol
// parcasindan OLCULUR (sleeve_cap rolunun yay uzunlugu), yazilmaz.
const PUF_TABAN = { garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'straight' };
// KOMPOZISYON (M2-primitif): contract/primitives-v1.json'daki kompozisyonlardan
// vitrine giren ucu. Taban+eksenler o dosyadan OKUNUR, burada tekrar yazilmaz.
const VITRIN_KOMPOZISYON = ['K1-kruvaze-buzgulu-bel', 'K7-raglan-manset-fermuar',
                            'K8-dusuk-omuz-kutu-pili-cep'];
// KUMAS (M3-kumas): ayni elbise, TEK fark kumas. Dokuma vs ilanli strec orme.
const KUMAS_TABAN = { garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'none' };
// EDIT (edit-locality): ayni elbise, "yakayi 2 cm derinlestir".
const EDIT_TABAN = { garment: 'dress', skirtStyle: 'aLine', sleeveStyle: 'straight',
                     sleeveLength: 'long', neckline: 'crew' };
const EDIT_MM = 20;

// Kenar yay uzunlugu: kalibin kendi kubik komutlarindan, mm.
const cubicPts = (p0, c) => {
  const out = [];
  for (let i = 1; i <= 64; i++) {
    const t = i / 64, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * c.cp1x + 3 * u * t * t * c.cp2x + t * t * t * c.x,
              u * u * u * p0[1] + 3 * u * u * t * c.cp1y + 3 * u * t * t * c.cp2y + t * t * t * c.y]);
  }
  return out;
};
function roleArcMM(piece, role) {
  if (!piece) return 0;
  let total = 0;
  for (const r of (piece.edgeRoles || []).filter((x) => x.role === role)) {
    let cur = null; const pts = [];
    piece.commands.forEach((c, i) => {
      if (c.type === 'close') { cur = null; return; }
      if (i === r.first && cur) pts.push(cur);
      if (i >= r.first && i <= r.last) {
        if (c.type === 'curve' && cur) pts.push(...cubicPts(cur, c));
        else pts.push([c.x, c.y]);
      }
      cur = [c.x, c.y];
    });
    for (let i = 1; i < pts.length; i++)
      total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return total;
}
const mm1 = (v) => Number(v.toFixed(1));
const flatOf = (d, spec) => renderFlatFromPattern(d, {
  beden: BEDEN,
  sinif: { garment: spec.garment || 'dress', shaping: spec.shaping || 'dart',
           fabric: spec.fabric || 'woven' },
});

export async function build() {
  const body = bodyForSize(BEDEN);
  const dress = await draft(DRESS_SPEC, body);
  if (dress.error) throw new Error('motor vitrin elbisesini reddetti: ' + dress.error);
  const knit = await draft(KNIT_SPEC, body);
  if (knit.error) throw new Error('motor örme elbiseyi reddetti: ' + knit.error);

  const sizes = JSON.parse(readFileSync(join(ROOT, 'contract/layers/shape-ratios.json'), 'utf8')).sizes;

  const assets = {};
  assets['pattern-dress-eu38.svg'] = patternSVG(dress.pattern);
  for (const s of SLEEVES) {
    const d = await draft({ ...DRESS_SPEC, sleeveStyle: s }, body);
    if (d.error) throw new Error(`motor '${s}' kolu reddetti: ` + d.error);
    assets[`flat-${s}-eu38.svg`] = renderFlatFromPattern(d, {
      beden: BEDEN, sinif: { garment: 'dress', shaping: 'dart', fabric: 'woven' },
    });
  }

  // ── PUF: kapak duz -> kapak buzgulu, ayni elbise ────────────────────────
  const kolOf = (d) => d.pattern.pieces.find((p) => /(^|\s)Sleeve$/.test(p.name));
  const puf = {};
  for (const [ad, cap] of [['duz', 'plain'], ['puf', 'puffed']]) {
    const d = await draft({ ...PUF_TABAN, sleeveCap: cap }, body);
    if (d.error) throw new Error(`motor '${cap}' kapagi reddetti: ` + d.error);
    const kol = kolOf(d);
    if (!kol) throw new Error(`'${cap}' kapaginda kol parcasi yok`);
    assets[`flat-kapak-${ad}-eu38.svg`] = flatOf(d, PUF_TABAN);
    puf[ad] = {
      kapakYayiMM: mm1(roleArcMM(kol, 'sleeve_cap')),
      isaret: (kol.markings || []).length,
      adimlar: (d.pattern.guideSteps || []).length,
    };
  }
  puf.kapakArtisMM = mm1(puf.puf.kapakYayiMM - puf.duz.kapakYayiMM);
  puf.kaynak = 'draftJSON pattern.pieces[Sleeve].edgeRoles[sleeve_cap] yay uzunlugu';

  // ── KOMPOZISYON: contract/primitives-v1.json'dan, sabit menu kelimesi degil ─
  const PRIM = JSON.parse(readFileSync(join(ROOT, 'contract/primitives-v1.json'), 'utf8'));
  const kompozisyon = { kaynak: 'contract/primitives-v1.json kompozisyonlar', liste: [] };
  for (const ad of VITRIN_KOMPOZISYON) {
    const k = PRIM.kompozisyonlar[ad];
    if (!k) throw new Error(`kompozisyon contract'ta yok: ${ad}`);
    const spec = Object.assign({}, k.taban, ...k.eksenler);
    const d = await draft(spec, body);
    if (d.error) throw new Error(`motor '${ad}' kompozisyonunu reddetti: ` + d.error);
    assets[`flat-${ad}-eu38.svg`] = flatOf(d, spec);
    kompozisyon.liste.push({
      ad, baslik: k.baslik,
      eksenler: k.eksenler.map((e) => Object.entries(e).map(([a, v]) => `${a}=${v}`).join(' ')).join(' + '),
      parcalar: kesim(d).length,
    });
  }
  kompozisyon.sayi = kompozisyon.liste.length;
  kompozisyon.eksenSayisi = new Set(VITRIN_KOMPOZISYON
    .flatMap((ad) => PRIM.kompozisyonlar[ad].eksenler.flatMap((e) => Object.keys(e)))).size;

  // ── KUMAS: tek fark kumas ───────────────────────────────────────────────
  const kumasFarki = { kaynak: 'ayni spec, tek fark fabric; draftJSON parca listesi' };
  for (const [ad, ek] of [['dokuma', { fabric: 'woven' }],
                          ['orme', { fabric: 'knit', fabricStretchPct: 50 }]]) {
    const spec = { ...KUMAS_TABAN, ...ek };
    const d = await draft(spec, body);
    if (d.error) throw new Error(`motor '${ad}' kumasini reddetti: ` + d.error);
    assets[`flat-kumas-${ad}-eu38.svg`] = flatOf(d, spec);
    kumasFarki[ad] = { parcalar: kesim(d).length, kumasM: d.pattern.fabricMeters140 };
  }
  kumasFarki.parcaFarki = kumasFarki.dokuma.parcalar - kumasFarki.orme.parcalar;

  // ── EDIT: yakayi 2 cm derinlestir, kac panel kimildar? ──────────────────
  const eOnce = await draft(EDIT_TABAN, body);
  const eSonra = await draft({ ...EDIT_TABAN, editNeckDeepenMM: EDIT_MM }, body);
  if (eOnce.error || eSonra.error) throw new Error('motor edit ornegini reddetti: ' + (eOnce.error || eSonra.error));
  assets['flat-edit-once-eu38.svg'] = flatOf(eOnce, EDIT_TABAN);
  assets['flat-edit-sonra-eu38.svg'] = flatOf(eSonra, EDIT_TABAN);
  const oncekiBayt = new Map(eOnce.pattern.pieces.map((p) => [p.name, pieceBytes(p)]));
  const degisen = eSonra.pattern.pieces.filter((p) => oncekiBayt.get(p.name) !== pieceBytes(p));
  const adim = ((eSonra.pattern.edit || {}).adimlar || []).find((a) => a.op === 'op.neckDeepen');
  if (!adim || !adim.uygulandi) throw new Error('op.neckDeepen uygulanmadi: ' + (adim && adim.ret_gerekcesi));
  const edit = {
    istenenMM: EDIT_MM,
    toplamPanel: eSonra.pattern.pieces.length,
    degisenPanel: degisen.length,
    degisenAdlar: degisen.map((p) => p.name).join(' · '),
    sabitPanel: eSonra.pattern.pieces.length - degisen.length,
    cfOnceMM: mm1(adim.cf_derinlik_once_mm),
    cfSonraMM: mm1(adim.cf_derinlik_sonra_mm),
    yayOnceMM: mm1(adim.yarim_yaka_yayi_once_mm),
    yaySonraMM: mm1(adim.yarim_yaka_yayi_sonra_mm),
    biasUzatmaMM: mm1(adim.bias_serit_uzatma_mm),
    kaynak: 'draftJSON pattern.edit.adimlar[op.neckDeepen] + panel bayt kiyasi (spec-diff.mjs pieceBytes)',
  };

  const data = {
    _uretildi: 'engine/tools/gen-landing-motor.mjs — ELLE YAZILMAZ. Sayılar motorun kendi draftJSON çıktısından, çizimler aynı koşudan.',
    _yasa: [
      'web/index.html sayı taşıyan iddialarını bu dosyadan (data-motor) ya da web/data/vitrin.json\'dan (data-v) okur.',
      'engine/tests/vitrin_gercek_check.mjs bu üreteci yeniden koşturur; sapmış sayı/çizim KIRMIZI.',
    ],
    kaynak: 'engine.draftJSON (wasm) + contract/layers/shape-ratios.json + web/js/fabric-catalog.js',
    dress: {
      spec: DRESS_SPEC,
      beden: BEDEN,
      parcalar: kesim(dress).length,
      parcaAdlari: kesim(dress).map((p) => p.name).join(' · '),
      kumasM: dress.pattern.fabricMeters140,
      adimlar: (dress.pattern.guideSteps || []).length,
    },
    alineKnit: { spec: KNIT_SPEC, beden: BEDEN, parcalar: kesim(knit).length },
    beden: { sayi: sizes.length, liste: sizes.join(', '), kaynak: 'contract/layers/shape-ratios.json' },
    kumas: { sayi: Object.keys(FABRIC_CATALOG).length, kaynak: 'web/js/fabric-catalog.js (contract/fabric-catalog-v1.json)' },
    puf, kompozisyon, kumasFarki, edit,
  };
  return { data, assets };
}

// data-motor doldurucu — gen-vitrin.mjs'in data-v deseni, ikinci anahtar uzayı.
export const MPATH = /(<([a-z]+)(?:\s[^<>]*?)?\sdata-motor="([A-Za-z0-9_.]+)"(?:\s[^<>]*?)?>)([^<]*)(<\/\2>)/g;
export function fillPage(html, data) {
  const missing = [];
  const filled = [];
  const out = html.replace(MPATH, (_m, open, tag, key, _old, close) => {
    const val = key.split('.').reduce((o, k) => (o == null ? o : o[k]), data);
    if (val === undefined || val === null) { missing.push(key); return _m; }
    filled.push(`${key}=${val}`);
    return `${open}${val}${close}`;
  });
  return { out, missing, filled };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { data, assets } = await build();
  writeFileSync(join(ROOT, OUT_JSON), JSON.stringify(data, null, 2) + '\n');
  mkdirSync(join(ROOT, ASSET_DIR), { recursive: true });
  for (const [name, svg] of Object.entries(assets)) {
    writeFileSync(join(ROOT, ASSET_DIR, name), svg);
  }
  for (const rel of PAGES) {
    const f = join(ROOT, rel);
    const { out, missing, filled } = fillPage(readFileSync(f, 'utf8'), data);
    if (missing.length) {
      console.error(`${rel}: data-motor anahtarı landing-motor.json içinde YOK: ` + missing.join(', '));
      process.exit(1);
    }
    writeFileSync(f, out);
    console.log(`yazıldı: ${rel} [${filled.join(' · ')}]`);
  }
  console.log(`yazıldı: ${OUT_JSON} + ${ASSET_DIR}/ (${Object.keys(assets).join(', ')})`);
}
