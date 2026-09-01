#!/usr/bin/env node
// arka_koken_check.mjs — F3-arka KAPISI: ARKA YÜZ NEREDEN GELDİ, VE SÖYLENİYOR MU?
//
// DAMLA'NIN CÜMLESİ (edge case, kendi sözü): arka fotoğraf VARSA okunur ve
// tasarlanır. SADECE ön varsa sistem arkayı UYDURUR ve uydurduğunu İLAN eder.
// Uydurulan arka: asla dekolte, asla süs, asla asimetri — en sade dikilebilir
// arka. Kullanıcı elle/promptla değiştirirse etiket `soruldu`; sormak varsayılan
// değildir, akış DURMAZ.
//
// NE ÖLÇÜYOR (sevk edilen modüllerin KENDİSİ üstünde — web/lib/arka-koken.js,
// web/js/download.js, web/vendor'daki wasm paketi; node-only bir kopya değil):
//
//   1. SADECE-ÖN fixture: ön fotoğraf ingest'inin bıraktığı köken kaydına
//      arkaDamgala(false) uygulanınca arka alanlarının %100'ü uydurma|soruldu
//      olur — ön kareden "görüldü" sanılan arka okuma dahil (ön fotoğraf arkayı
//      GÖREMEZ), elle/promptla seçilen alan (`soruldu`) DOKUNULMAZ kalır.
//   2. Uydurulan arka EN SADE değere çekilir (dekolte/süs değeri kalmaz).
//   3. İLAN dosyanın İÇİNDE: indirilen flat SVG'nin kökünde uydurma etiketli
//      arka alanlarının %100'ü adıyla durur (data-koken-alanlar), kök
//      data-arka-koken="uydurma" taşır ve BACK görünümünün altında
//      "ARKA: UYDURMA" ibaresi OKUNUR (metin, metadata değil).
//   4. ARKA-FOTO fixture: arkaDamgala(true) ile arka alanlarının %100'ü
//      `gorulen` olur ve flat kökü data-arka-koken="gorulen" taşır, uydurma
//      ibaresi BASILMAZ.
//   5. Ürün yolu gerçekten bağlı: create.js ingest yolu arkaDamgala'yı,
//      download.js flat yolu arkaDurumu'nu çağırıyor (kaynak üstünde ölçülür;
//      bağlantısız bir kütüphane yeşil kapı açamaz).
//
// SIFIR API ÇAĞRISI, SIFIR MALİYET.

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

// Sevk edilen yükleyicinin kendisi node'da koşsun diye aynı DOM stub'ı
// (indir_check.mjs / cizim_giysi_mi.mjs ile aynı, aynı sebepten).
const BUNDLE = join(ROOT, 'web/vendor/stitchu-engine.js');
const engine0 = existsSync(BUNDLE) ? await require(BUNDLE)() : null;
globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine0) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };

let fails = 0;
const check = (label, cond, detail = '') => {
  if (cond) console.log(`ok    ${label}${detail ? ` — ${detail}` : ''}`);
  else { console.log(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`); fails += 1; }
};

if (!engine0) {
  console.log(`FAIL  sevk edilen wasm paketi YOK: ${BUNDLE} — engine/wasm/build-wasm.sh`);
  process.exit(1);
}

const KOKEN = await import(join(ROOT, 'web/js/provenance.js'));
const ARKA = await import(join(ROOT, 'web/lib/arka-koken.js'));
const { flatSVG } = await import(join(ROOT, 'web/js/download.js'));

// create.js'in kendi default spec'iyle aynı sınıf: EU38 kolsuz A-line elbise.
// Arka eksenleri spec'in İÇİNDE ki köken listesi (Object.keys) onları görsün —
// create.js'te de aynı sebeple defaults'ta duruyorlar.
const yeniSpec = () => ({
  garment: 'dress', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', shaping: 'dart',
  waistline: 'natural', fabric: 'woven', ruffle: 'none', keyhole: 'none',
  backOpening: 'none', laceUpBack: 'none', backDetail: 'none', backSlit: 'none',
});

const arkaAlanlar = ARKA.arkaAlanlari(Object.keys(yeniSpec()));
check('arka alan listesi spec eksenlerinden türedi (menü değil)',
  arkaAlanlar.length >= 4, arkaAlanlar.join(' '));

// ---------------------------------------------------------------------------
// FIXTURE 1 — SADECE ÖN: ön fotoğraf okundu, arka fotoğraf YOK.
// ---------------------------------------------------------------------------
console.log('\n--- fixture: SADECE-ÖN ---');
{
  const spec = yeniSpec();
  const alanlar = Object.keys(spec);
  const koken = KOKEN.yeniKoken(alanlar);
  // Ön ingest'in bıraktığı iz: ön eksenler görüldü...
  KOKEN.isaretle(koken, 'neckline', 'gorulen');
  KOKEN.isaretle(koken, 'skirtStyle', 'gorulen');
  // ...vision ön kareden bir AÇIK SIRT "gördü" sandı (göremez)...
  spec.backOpening = 'lowV';
  KOKEN.isaretle(koken, 'backOpening', 'gorulen');
  // ...ve kullanıcı arka yırtmacı KENDİ ELİYLE seçti.
  spec.backSlit = 'vent';
  KOKEN.isaretle(koken, 'backSlit', 'soruldu');

  const uydurulan = ARKA.arkaDamgala(koken, spec, alanlar, false, KOKEN.isaretle);

  const etiketler = arkaAlanlar.map((a) => `${a}:${koken[a].kaynak}`);
  check('arka alanlarının %100\'ü uydurma|soruldu',
    arkaAlanlar.every((a) => ['uydurma', 'soruldu'].includes(koken[a].kaynak)),
    etiketler.join(' '));
  check('ön kareden "görüldü" sanılan açık sırt uydurmaya düştü ve SADELEŞTİ',
    koken.backOpening.kaynak === 'uydurma' && spec.backOpening === 'none',
    `backOpening=${spec.backOpening} (${koken.backOpening.kaynak})`);
  check('kullanıcının kendi eli (soruldu) DOKUNULMADI',
    koken.backSlit.kaynak === 'soruldu' && spec.backSlit === 'vent',
    `backSlit=${spec.backSlit} (${koken.backSlit.kaynak})`);
  check('damga uydurulanları adıyla döndürdü (ekran ilanı bundan basılır)',
    uydurulan.length >= 3 && uydurulan.every((a) => arkaAlanlar.includes(a)),
    uydurulan.join(' '));
  check('arkaDurumu = uydurma', ARKA.arkaDurumu(koken, alanlar) === 'uydurma');

  // İNEN DOSYA: sevk edilen flatSVG (download.js) — köken kaydıyla.
  const { svg } = await flatSVG(spec, { size: 'EU38' }, koken, alanlar);
  const kok = svg.slice(0, svg.indexOf('>') + 1);
  const alanAttr = /data-koken-alanlar="([^"]*)"/.exec(kok);
  check('SVG kökünde data-koken-alanlar var', !!alanAttr, kok.slice(0, 160));
  const listelenen = alanAttr ? alanAttr[1].split(' ') : [];
  const uydurmaAlanlar = KOKEN.alanlar(koken, 'uydurma');
  check('uydurma etiketli arka alanlarının %100\'ü SVG kökünde adıyla',
    uydurmaAlanlar.length > 0 && uydurmaAlanlar.every((a) => listelenen.includes(a)),
    `uydurma: [${uydurmaAlanlar.join(' ')}] kökte: [${listelenen.join(' ')}]`);
  check('SVG kökü data-arka-koken="uydurma" taşıyor',
    /data-arka-koken="uydurma"/.test(kok));
  check('"ARKA: UYDURMA" ibaresi ÇİZİMDE okunur (metin, metadata değil)',
    svg.includes('ARKA: UYDURMA'));
  check('uydurma gerekçesi (düz sırt / ayna / fermuar) çizimde',
    /duz sirt, boyun on yakanin aynasi, gecmiyorsa fermuar/.test(svg));
}

// ---------------------------------------------------------------------------
// FIXTURE 2 — ARKA FOTO VAR: arka okundu.
// ---------------------------------------------------------------------------
console.log('\n--- fixture: ARKA-FOTO ---');
{
  const spec = yeniSpec();
  const alanlar = Object.keys(spec);
  const koken = KOKEN.yeniKoken(alanlar);
  // Arka fotoğraf ingest'i (create.js ingestArkaReading'in çekirdeği):
  // arka okundu — 'none' okumak da bir okumadır — ve damga vuruldu.
  ARKA.arkaDamgala(koken, spec, alanlar, true, KOKEN.isaretle);

  check('arka alanlarının %100\'ü gorulen',
    arkaAlanlar.every((a) => koken[a].kaynak === 'gorulen'),
    arkaAlanlar.map((a) => `${a}:${koken[a].kaynak}`).join(' '));
  check('arkaDurumu = gorulen', ARKA.arkaDurumu(koken, alanlar) === 'gorulen');

  const { svg } = await flatSVG(spec, { size: 'EU38' }, koken, alanlar);
  const kok = svg.slice(0, svg.indexOf('>') + 1);
  check('SVG kökü data-arka-koken="gorulen" taşıyor',
    /data-arka-koken="gorulen"/.test(kok));
  check('uydurma ibaresi BASILMADI (görülen arkaya uydurma damgası yalan olur)',
    !svg.includes('ARKA: UYDURMA'));
}

// ---------------------------------------------------------------------------
// 5 — ÜRÜN YOLU BAĞLI MI (kaynak üstünde; bağlanmamış kütüphane kapı açamaz)
// ---------------------------------------------------------------------------
console.log('\n--- ürün yolu bağları ---');
{
  const createSrc = readFileSync(join(ROOT, 'web/js/create.js'), 'utf8');
  const dlSrc = readFileSync(join(ROOT, 'web/js/download.js'), 'utf8');
  check('create.js ingest yolu arkaDamgala çağırıyor',
    /arkaDamgala\(koken, spec, KOKEN_ALANLARI/.test(createSrc));
  check('create.js arka fotoğraf kapısı var (ingestArkaReading)',
    /ingestArkaReading/.test(createSrc));
  check('download.js flat yolu arkaDurumu ile damga türetiyor',
    /arkaDurumu\(kokenKaydi/.test(dlSrc));
}

console.log(fails ? `\nARKA KÖKEN KAPISI: KIRMIZI — ${fails} FAIL` : '\nARKA KÖKEN KAPISI: YEŞİL');
process.exit(fails ? 1 : 0);
