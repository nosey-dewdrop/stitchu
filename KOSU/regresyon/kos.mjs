#!/usr/bin/env node
// KOSU/regresyon/kos.mjs — 0509 sessiz regresyon seti (A1b, 2026-09-06).
//
// NE YAPAR. KOSU/regresyon/girdiler.json'daki sabit girdileri bugun kosabilen
// hattan gecirir (spec -> flatSVG), ciktilari KOSU/regresyon/cikti/<adim>/<girdi>/
// altina yazar ve bir onceki TABAN ciktisiyla karsilastirir. Amac bir adimin
// duzelttigi seyin baska bir topolojiyi sessizce bozmadigini olcmek.
//
//   node KOSU/regresyon/kos.mjs            karsilastir  (exit 0 fark yok, 1 fark var)
//   node KOSU/regresyon/kos.mjs --taban    mevcut ciktiyi YENI TABAN olarak yaz
//
// TABAN: KOSU/regresyon/taban/<girdi>/flat.svg. --taban YALNIZ ciktiyi kasten
// degistiren adimlarin (A2/A4/A6/A7) kapanisinda kosucu tarafindan verilir.
//
// KOSMAYAN GIRDI SESSIZ ATLANMAZ: her girdi icin ya cikti ya "kosmadi: <neden>"
// satiri yazilir; ikisi de olmayan bir girdi olamaz.
//
// DETERMINIZM: yalniz SVG yazilir (PNG degil) — PNG headless Chrome'dan geciyor
// ve bayt olarak tekrar uretilebilir degil. SVG hattin dogrudan ciktisi.

import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const GIRDILER = join(HERE, 'girdiler.json');
const TABAN_DIZIN = join(HERE, 'taban');
const CIKTI_DIZIN = join(HERE, 'cikti');
const TABAN_MOD = process.argv.includes('--taban');
const require = createRequire(import.meta.url);

// adim adi: kosucu KOSU_ADIM ile verir; yoksa "elle"
const ADIM = process.env.KOSU_ADIM || 'elle';

function sha(s) { return createHash('sha256').update(s).digest('hex').slice(0, 16); }

// ---------------------------------------------------------------- hat kurulumu
// uret.mjs ile AYNI hat: wasm bundle + web/js/download.js flatSVG. Tarayici
// nesneleri (document/window/URL) burada da taklit edilir; bundle onlari
// yuklenirken ariyor. Bu taklit uret.mjs'ten kopyalandi, ayni satirlar.
const BUNDLE = join(ROOT, 'web/vendor/stitchu-engine.js');

async function hatKur() {
  if (!existsSync(BUNDLE)) return { hata: 'wasm bundle yok: web/vendor/stitchu-engine.js (bash engine/build-wasm.sh)' };
  let flatSVG;
  try {
    const engine = await require(BUNDLE)();
    globalThis.document = {
      createElement: () => ({ click() {}, style: {} }),
      head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
    };
    globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
    globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
    ({ flatSVG } = await import(join(ROOT, 'web/js/download.js')));
  } catch (e) {
    return { hata: 'hat kurulamadi: ' + String(e && e.message || e) };
  }
  return { flatSVG };
}

// ---------------------------------------------------------------- olcum
// SVG'den KIYASLANABILIR sayilar. Ham SVG bayt farki cok gurultulu olurdu
// (ondalik kuyrugu), o yuzden fark hem bayt hem de bu olcum uzerinden bakilir;
// rapor edilen sey olcum farkidir, bayt farki yalniz bilgi.
function olc(svg) {
  const nitelik = (kaynak, ad) => {
    const m = kaynak.match(new RegExp(ad + '="([^"]*)"'));
    return m ? m[1] : null;
  };
  const kok = svg.slice(0, 800);
  const yollar = svg.match(/<path[^>]*>/g) || [];
  const rolSay = {};
  for (const p of yollar) {
    const r = nitelik(p, 'data-rol') || 'rolsuz';
    rolSay[r] = (rolSay[r] || 0) + 1;
  }
  return {
    bayt: Buffer.byteLength(svg, 'utf8'),
    sha: sha(svg),
    width: nitelik(kok, 'width'),
    height: nitelik(kok, 'height'),
    dataScale: nitelik(kok, 'data-scale'),
    dataUnitMM: nitelik(kok, 'data-unit-mm'),
    dataSinif: nitelik(kok, 'data-sinif'),
    dataSize: nitelik(kok, 'data-size'),
    dataDugum: nitelik(kok, 'data-dugum'),
    yolSayisi: yollar.length,
    rolSayisi: rolSay,
  };
}

// ---------------------------------------------------------------- fark
function farkBul(taban, simdi) {
  const farklar = [];
  const anahtarlar = new Set([...Object.keys(taban), ...Object.keys(simdi)]);
  for (const a of anahtarlar) {
    const t = taban[a], s = simdi[a];
    if (a === 'rolSayisi') {
      const roller = new Set([...Object.keys(t || {}), ...Object.keys(s || {})]);
      for (const r of roller) {
        if ((t || {})[r] !== (s || {})[r]) {
          farklar.push(`rolSayisi.${r}: ${(t || {})[r] ?? 'yok'} -> ${(s || {})[r] ?? 'yok'}`);
        }
      }
      continue;
    }
    if (JSON.stringify(t) !== JSON.stringify(s)) farklar.push(`${a}: ${JSON.stringify(t)} -> ${JSON.stringify(s)}`);
  }
  return farklar;
}

// ---------------------------------------------------------------- ana
const cfg = JSON.parse(readFileSync(GIRDILER, 'utf8'));
const BODY = { size: cfg.beden || 'EU38' };
const { flatSVG, hata: hatHatasi } = await hatKur();

const ciktiKok = join(CIKTI_DIZIN, ADIM);
mkdirSync(ciktiKok, { recursive: true });

const satirlar = [];
let farkli = 0, kosmayan = 0, kosan = 0;
const ozet = [];

for (const g of cfg.girdiler) {
  const dizin = join(ciktiKok, g.ad);
  mkdirSync(dizin, { recursive: true });

  // spec kaynagi: dogrudan spec ya da onbellekteki fotograf tarifi
  let spec = g.spec || null;
  let specKaynak = 'girdiler.json spec';
  if (!spec && g.specKaynak === 'onbellek') {
    // fotograf girdisi: onbellekteki tarifin enYakinSpec'i
    const ilk = g.fotograflar && g.fotograflar[0];
    let bulundu = null;
    if (ilk && existsSync(join(ROOT, ilk))) {
      const h = createHash('sha256').update(readFileSync(join(ROOT, ilk))).digest('hex');
      const yol = join(ROOT, 'KOSU', 'onbellek', h + '.json');
      if (existsSync(yol)) {
        const t = JSON.parse(readFileSync(yol, 'utf8'));
        bulundu = t.enYakinSpec || null;
        specKaynak = 'KOSU/onbellek/' + h.slice(0, 16) + '....json enYakinSpec';
      }
    }
    if (bulundu) {
      spec = Object.fromEntries(Object.entries(bulundu).filter(([k]) => !k.startsWith('_')));
      // "yok-op" gibi motorda karsiligi olmayan degerler DUSURULUR ama adiyla yazilir
      const dusen = [];
      for (const [k, v] of Object.entries(spec)) {
        if (typeof v === 'string' && v === 'yok-op') { dusen.push(k); delete spec[k]; }
      }
      if (dusen.length) specKaynak += ' (motorda opu olmayan eksenler dusuruldu: ' + dusen.join(', ') + ')';
    }
  }

  if (hatHatasi) {
    satirlar.push(`kosmadi: ${g.ad}: ${hatHatasi}`);
    writeFileSync(join(dizin, 'kosmadi.txt'), hatHatasi + '\n');
    kosmayan++; continue;
  }
  if (!spec) {
    const neden = 'spec yok (girdiler.json spec vermiyor ve onbellekte tarif bulunamadi)';
    satirlar.push(`kosmadi: ${g.ad}: ${neden}`);
    writeFileSync(join(dizin, 'kosmadi.txt'), neden + '\n');
    kosmayan++; continue;
  }

  let svg = null, hata = null;
  try {
    const r = await flatSVG(spec, BODY);
    svg = r && r.svg;
    if (!svg || typeof svg !== 'string') { hata = 'flatSVG svg dondurmedi: ' + JSON.stringify(r && Object.keys(r)); }
  } catch (e) {
    hata = 'flatSVG firlatti: ' + String(e && e.message || e);
  }

  if (hata) {
    // K2/K5 gibi DUSMESI BEKLENEN girdiler icin bu bir arıza degil, olculen hal.
    const bek = g.beklenen ? ` (beklenen: ${g.beklenen})` : '';
    satirlar.push(`kosmadi: ${g.ad}: ${hata}${bek}`);
    writeFileSync(join(dizin, 'kosmadi.txt'), hata + bek + '\n');
    kosmayan++;
    ozet.push({ ad: g.ad, durum: 'KOSMADI', neden: hata, beklenen: g.beklenen || null, topoloji: g.topoloji });
    continue;
  }

  kosan++;
  writeFileSync(join(dizin, 'flat.svg'), svg);
  const olcum = olc(svg);
  olcum._specKaynak = specKaynak;
  olcum._spec = spec;
  // graftan cizim (kalip.svg / dikilebilir.json) BUGUN YOK — adiyla yazilir
  olcum._eksik = ['kalip.svg: graftan cizim hatti yok (A2)', 'dikilebilir.json: graf degerleme hatti yok (A2)'];
  writeFileSync(join(dizin, 'olcum.json'), JSON.stringify(olcum, null, 2) + '\n');

  const tabanDizin = join(TABAN_DIZIN, g.ad);
  if (TABAN_MOD) {
    mkdirSync(tabanDizin, { recursive: true });
    writeFileSync(join(tabanDizin, 'flat.svg'), svg);
    writeFileSync(join(tabanDizin, 'olcum.json'), JSON.stringify(olcum, null, 2) + '\n');
    satirlar.push(`taban yazildi: ${g.ad} (${olcum.bayt} B, sha ${olcum.sha})`);
    ozet.push({ ad: g.ad, durum: 'TABAN', topoloji: g.topoloji });
    continue;
  }

  const tabanOlcumYol = join(tabanDizin, 'olcum.json');
  if (!existsSync(tabanOlcumYol)) {
    satirlar.push(`kosmadi: ${g.ad}: taban yok (once --taban ile kosulmali)`);
    kosmayan++;
    ozet.push({ ad: g.ad, durum: 'TABANSIZ', topoloji: g.topoloji });
    continue;
  }
  const tabanOlcum = JSON.parse(readFileSync(tabanOlcumYol, 'utf8'));
  const farklar = farkBul(
    Object.fromEntries(Object.entries(tabanOlcum).filter(([k]) => !k.startsWith('_'))),
    Object.fromEntries(Object.entries(olcum).filter(([k]) => !k.startsWith('_'))));
  if (farklar.length) {
    farkli++;
    satirlar.push(`FARK ${g.ad}: ${farklar.join(' | ')}`);
    ozet.push({ ad: g.ad, durum: 'FARK', farklar, topoloji: g.topoloji });
  } else {
    satirlar.push(`ayni: ${g.ad}`);
    ozet.push({ ad: g.ad, durum: 'AYNI', topoloji: g.topoloji });
  }
}

writeFileSync(join(ciktiKok, 'ozet.json'), JSON.stringify({
  adim: ADIM, tabanMod: TABAN_MOD, tarih: new Date().toISOString(),
  kosan, kosmayan, farkli, girdiSayisi: cfg.girdiler.length, girdiler: ozet,
}, null, 2) + '\n');

for (const s of satirlar) console.log(s);
console.log(`OZET adim=${ADIM} girdi=${cfg.girdiler.length} kosan=${kosan} kosmadi=${kosmayan} fark=${farkli}`);

process.exit(farkli > 0 ? 1 : 0);
