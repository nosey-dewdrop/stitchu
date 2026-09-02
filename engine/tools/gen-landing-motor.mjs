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

const { draft } = await import(join(ROOT, 'engine/tools/spec-diff.mjs'));
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
