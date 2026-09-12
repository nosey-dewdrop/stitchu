#!/usr/bin/env node
// engine/tests/0509-wasm-sanity.mjs — A1b, 2026-09-06. Brief madde 8.
//
// NE OLCER. Regresyon setini BELLEK SINIRLI bir Node worker'inda (worker_threads
// resourceLimits + --max-old-space-size) wasm olarak kosar ve uc seyi arar:
//   (1) trap / panic / abort  (2) bellek asimi (worker ERR_WORKER_OUT_OF_MEMORY)
//   (3) cikti farki
// Ucunden biri = KIRMIZI.
//
// (3) HAKKINDA DURUST SINIR — "NATIVE ILE FARK" BUGUN OLCULEMIYOR.
// Brief "native ile cikti farki" diyor. OLCULDU (2026-09-06): bu hatta NATIVE
// bir flat uretici YOK. Kalip motoru flat SVG'yi yalniz wasm uzerinden veriyor
// (web/vendor/stitchu-engine.js -> web/js/download.js flatSVG); engine/build
// altindaki ikililer (drape-preview, dxf-export, *_check) flat SVG basmiyor.
// Yani karsilastirilacak ikinci bir UYGULAMA yok.
// Bunun yerine olculen sey: AYNI wasm'in bellek sinirli worker'daki ciktisi,
// ANA SURECTE uretilip commit edilmis TABAN ciktisiyla bayt bayt ayni mi.
// Bu, bellek baskisi altinda sessiz bozulmayi (kismi cikti, NaN, kirpilmis
// tampon) yakalar — ki bellek sinirli kosumun asil amaci odur. Native/wasm
// ikiligi gercekten gerektiginde native flat uretici A2'de dogar; o zaman bu
// dosyaya IKINCI bir kiyas eklenir. Bugun eksik olan sey burada ADIYLA duruyor,
// gecit "native karsilastirmasi yapildi" gibi davranmiyor.
//
// EXIT: 0 yesil · 1 kirmizi · 8 henuz-yok (bundle/taban yok) · 2 arac hatasi

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const BUNDLE = join(ROOT, 'web/vendor/stitchu-engine.js');
const GIRDILER = join(ROOT, 'KOSU/regresyon/girdiler.json');
const TABAN = join(ROOT, 'KOSU/regresyon/taban');

// Bellek tavani. 8 GB makinede (CLAUDE.md) tek worker; wasm heap + bundle
// icin 512 MB eski nesil yeterli olmali — asilirsa gecit KIRMIZI ve sebep
// ERR_WORKER_OUT_OF_MEMORY adiyla yazilir (sessizce buyutulmez).
const ESKI_NESIL_MB = 512;
const YIGIN_MB = 16;
const TAVAN_MS = 180000;

const sha = (s) => createHash('sha256').update(s).digest('hex');

// ---------------------------------------------------------------- worker tarafi
if (!isMainThread) {
  const { bundle, root, girdiler, beden } = workerData;
  const sonuc = { ciktilar: {}, hatalar: [] };
  try {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const engine = await require(bundle)();
    globalThis.document = {
      createElement: () => ({ click() {}, style: {} }),
      head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
    };
    globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
    globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
    const { flatSVG } = await import(join(root, 'web/js/download.js'));

    for (const g of girdiler) {
      try {
        const r = await flatSVG(g.spec, { size: beden });
        const svg = r && r.svg;
        if (typeof svg !== 'string' || !svg.length) {
          sonuc.hatalar.push({ ad: g.ad, tur: 'BOS_CIKTI', mesaj: 'flatSVG svg dondurmedi' });
          continue;
        }
        sonuc.ciktilar[g.ad] = { bayt: Buffer.byteLength(svg, 'utf8'), sha: sha(svg) };
      } catch (e) {
        const m = String(e && e.message || e);
        // DUSMESI BEKLENEN girdiler (K2 gibi) trap DEGILDIR: motor adiyla
        // reddediyor. Trap/panic/abort ayri isaretlenir.
        const trap = /RuntimeError|unreachable|memory access out of bounds|abort\(|panic/i.test(m);
        sonuc.hatalar.push({ ad: g.ad, tur: trap ? 'TRAP' : 'RET', mesaj: m.slice(0, 400) });
      }
    }
  } catch (e) {
    sonuc.hatalar.push({ ad: '(kurulum)', tur: 'KURULUM', mesaj: String(e && e.message || e).slice(0, 400) });
  }
  parentPort.postMessage(sonuc);
} else {
  // -------------------------------------------------------------- ana taraf
  const cik = (kod, obj) => { console.log(JSON.stringify(obj, null, 2)); process.exit(kod); };

  if (!existsSync(BUNDLE)) cik(8, { durum: 'HENUZ-YOK', neden: 'wasm bundle yok: web/vendor/stitchu-engine.js (bash engine/build-wasm.sh)' });
  if (!existsSync(GIRDILER)) cik(8, { durum: 'HENUZ-YOK', neden: 'KOSU/regresyon/girdiler.json yok' });
  if (!existsSync(TABAN)) cik(8, { durum: 'HENUZ-YOK', neden: 'KOSU/regresyon/taban yok (once --regresyon --taban)' });

  let cfg;
  try { cfg = JSON.parse(readFileSync(GIRDILER, 'utf8')); }
  catch (e) { cik(2, { durum: 'ARAC_HATASI', neden: 'girdiler.json okunamadi: ' + e.message }); }

  // yalniz spec'i DOGRUDAN olan girdiler; fotograf girdisinin speci onbellekten
  // gelir ve onu da ekleriz (regresyon kos.mjs ile ayni cozumleme).
  const girdiler = [];
  for (const g of cfg.girdiler) {
    let spec = g.spec || null;
    if (!spec && g.specKaynak === 'onbellek' && g.fotograflar && g.fotograflar[0]) {
      const foto = join(ROOT, g.fotograflar[0]);
      if (existsSync(foto)) {
        const h = createHash('sha256').update(readFileSync(foto)).digest('hex');
        const yol = join(ROOT, 'KOSU/onbellek', h + '.json');
        if (existsSync(yol)) {
          const t = JSON.parse(readFileSync(yol, 'utf8'));
          const e = t.enYakinSpec || {};
          spec = Object.fromEntries(Object.entries(e).filter(([k, v]) => !k.startsWith('_') && v !== 'yok-op'));
        }
      }
    }
    if (spec) girdiler.push({ ad: g.ad, spec, beklenen: g.beklenen || null });
    else girdiler.push({ ad: g.ad, spec: null, beklenen: g.beklenen || null });
  }
  const kosulacak = girdiler.filter(g => g.spec);
  const specsiz = girdiler.filter(g => !g.spec).map(g => g.ad);

  const w = new Worker(fileURLToPath(import.meta.url), {
    workerData: { bundle: BUNDLE, root: ROOT, girdiler: kosulacak, beden: cfg.beden || 'EU38' },
    resourceLimits: { maxOldGenerationSizeMb: ESKI_NESIL_MB, maxYoungGenerationSizeMb: YIGIN_MB, stackSizeMb: 4 },
  });

  let bitti = false;
  const zaman = setTimeout(() => {
    if (!bitti) { w.terminate(); cik(1, { durum: 'KIRMIZI', neden: 'wasm worker ' + TAVAN_MS + ' ms icinde bitmedi (asili kaldi)' }); }
  }, TAVAN_MS);

  w.on('message', (sonuc) => {
    bitti = true; clearTimeout(zaman); w.terminate();

    const traplar = sonuc.hatalar.filter(h => h.tur === 'TRAP' || h.tur === 'KURULUM' || h.tur === 'BOS_CIKTI');
    const retler = sonuc.hatalar.filter(h => h.tur === 'RET');

    // taban ile bayt kiyasi
    const farklar = [], tabansiz = [];
    for (const [ad, o] of Object.entries(sonuc.ciktilar)) {
      const ty = join(TABAN, ad, 'flat.svg');
      if (!existsSync(ty)) { tabansiz.push(ad); continue; }
      const t = readFileSync(ty, 'utf8');
      const tsha = sha(t);
      if (tsha !== o.sha) {
        farklar.push({ ad, tabanBayt: Buffer.byteLength(t, 'utf8'), wasmBayt: o.bayt,
                       tabanSha: tsha.slice(0, 16), wasmSha: o.sha.slice(0, 16) });
      }
    }

    const kirmizi = traplar.length > 0 || farklar.length > 0;
    const rapor = {
      durum: kirmizi ? 'KIRMIZI' : 'YESIL',
      bellekSiniri: { maxOldGenerationSizeMb: ESKI_NESIL_MB, maxYoungGenerationSizeMb: YIGIN_MB },
      kosulan: Object.keys(sonuc.ciktilar).length,
      trap: traplar,
      adiylaRet: retler.map(r => ({ ad: r.ad, mesaj: r.mesaj.slice(0, 160) })),
      tabandanFark: farklar,
      tabansiz,
      specsiz,
      nativeKiyasi: 'YOK — bu hatta native flat uretici bulunmuyor (olculdu 2026-09-06); kiyas bellek sinirli wasm ciktisi ile commit li taban arasinda yapildi. Ayrinti: dosya basligi.',
    };
    cik(kirmizi ? 1 : 0, rapor);
  });

  w.on('error', (e) => {
    bitti = true; clearTimeout(zaman);
    const m = String(e && e.message || e);
    const oom = /ERR_WORKER_OUT_OF_MEMORY|out of memory/i.test(m);
    cik(1, { durum: 'KIRMIZI', neden: oom ? 'BELLEK ASIMI (ERR_WORKER_OUT_OF_MEMORY), tavan ' + ESKI_NESIL_MB + ' MB' : 'worker hatasi: ' + m.slice(0, 400) });
  });

  w.on('exit', (kod) => {
    if (!bitti) { clearTimeout(zaman); cik(1, { durum: 'KIRMIZI', neden: 'wasm worker mesaj vermeden exit ' + kod + ' (trap/abort olabilir)' }); }
  });
}
