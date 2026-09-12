// overlay-png — MOTORUN kalip parcasi ile SATIN ALINMIS Bugra kalibinin ayni
// bedendeki halkasini AYNI mm olceginde UST USTE basar, yanina sayisal fark
// tablosu cikarir. (V5-B, 2026-08-24.)
//
// NEDEN: overlay'in uc parcasi repoda ayri ayri vardi (bugra-dump = motor
// poligonlari, geometry-full.json = Bugra mm halkalari, raster.mjs = SVG->PNG)
// ama BIRLESTIREN TEK KOMUT yoktu. Bu dosya o komut.
//
// ─── HIZALAMA USULU (serbest parametre YOK) ────────────────────────────────
// ring-compare.py ile AYNI: iki kontur da KENDI bbox min kosesine tasinir
// (x saga, y asagi). Dondurme yok, olcekleme yok, en-iyi-oturtma yok.
// mm = mm: SVG kullanici birimi 1 = 1 mm, viewBox mm cinsindendir.
//
// ─── Y EKSENI ──────────────────────────────────────────────────────────────
// geometry-full.json ham PDF kullanici uzayidir (meta.unit = "mm (PDF pt *
// 25.4/72)"), yani y YUKARI artar. Motor poligonlari y ASAGI artar (SVG'ye
// oldugu gibi cizilir, bkz. GECE/f-d-kalip-plot.mjs). Bu yuzden Bugra
// halkasina ring-compare.py load_trace() ile AYNI donusum uygulanir:
// y_yerel = ymax - y. Bu bir kalibrasyon degil, iki uzayin beyan edilmis
// yon farkidir; serbest parametre degildir.
//
// ─── BEDEN ─────────────────────────────────────────────────────────────────
// bugra-dump'in govdesi (bugra-dump.cpp:61) bust 88 / waist 68 / hip 94 cm.
// geometry-full.json sizeChartMM'de bu TAM OLARAK Bugra 36'dir (880/680/940);
// Bugra 38 = 920/720/980. Yani motorun ciziminin karsiligi 36 halkasidir.
// Varsayilan beden bu yuzden 36. Kart EU38 istedigi icin --size=38 de kosulur
// ve BEDEN UYUSMAZLIGI her ciktida acikca yazilir, gizlenmez.
//
// ─── BU BIR KAPI DEGIL ─────────────────────────────────────────────────────
// Fark tablosu BILGIDIR, esik degildir. Hicbir kapi Bugra'ya benzerlikle
// kurulmaz. Buradaki hicbir sayidan "kalip yanlis" hukmu cikarilamaz.
//
// kullanim:
//   node engine/tools/bugra/overlay-png.mjs [locket|corset] [--size=36]
//                                           [--out=GECE/log/V5-B.overlay]
//                                           [--px=1200] [--names]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rasterise } from '../raster.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');

const LAW = JSON.parse(readFileSync(join(ROOT, 'contract/flat-convention-v1.json'), 'utf8'));
// Motor = kanun murekkebi. Bugra = ikinci murekkep + kesik cizgi.
// (Tek-murekkep kanunu FLAT cizimin kanunudur; bu bir flat degil, iki KAYNAGI
// ayirt etmek zorunda olan bir kanit levhasidir. Ayrim hem RENK hem KESIK ile
// kurulur ki gri basildiginda da okunsun.)
const INK_ENGINE = LAW.ink.color;
const INK_BUGRA = '#c0392b';
const PAPER = LAW.ink.paper;

const MODES = {
  locket: { arg: 'locket', gtPattern: 'locket_top' },
  corset: { arg: '', gtPattern: 'corset_bustier' },
};

// motor parca adi -> Bugra parca adi (geometry-full.json 'piece' alani).
// null = YAPISAL FARK, kiyas yapilmaz. Haritada olmayan parca "ESLEME YOK"
// diye raporlanir; sessizce dusurulmez.
// Adlar --names ile ikisi de listelenip ELLE eslendi (bbox tahmini yok):
// locket tarafinda alti ad birebir ayni; corset tarafinda yalniz parantezli
// ek acikliklar farkli. Bugra "EXTRA-TL (not in defter)" halkasinin motorda
// karsiligi yok -> tabloda "motor karsiligi yok" satiri olarak cikar.
const NAME_MAP = {
  locket_top: {
    'Front Body': 'Front Body',
    'Back Body': 'Back Body',
    'Upper Sleeve': 'Upper Sleeve',
    'Lower Sleeve': 'Lower Sleeve',
    'Collar': 'Collar',
    'Collar Lining': 'Collar Lining',
  },
  corset_bustier: {
    'Upper Cup': 'Upper Cup',
    'Lower Cup': 'Lower Cup',
    'Front Body Center': 'Front Body (center)',
    'Front Body Side': 'Front Body (side)',
    'Back Body Side': 'Back Body (side)',
    // DIKKAT: Bugra'nin bu parcasi ADINDA "center fold" tasiyor, yani ORTADAN
    // KATLI kesilen YARIM bir kaliptir. Motorun kesim talimati tabloda ayrica
    // basilir; kat farki varsa bbox/cevre farkinin buyuk kismi ORADAN gelir.
    'Back Body Center': 'Back Body (center fold)',
  },
};

const argv = process.argv.slice(2);
const modeKey = argv.find((a) => !a.startsWith('--')) ?? 'locket';
const opt = (k, d) => {
  const hit = argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};
const SIZE = opt('size', '36');
const OUT = resolve(ROOT, opt('out', 'GECE/log/V5-B.overlay'));
const PX = Number(opt('px', '1200'));
const NAMES_ONLY = argv.includes('--names');

const mode = MODES[modeKey];
if (!mode) { console.error(`bilinmeyen mod: ${modeKey} (locket|corset)`); process.exit(2); }

// ── motor tarafi ───────────────────────────────────────────────────────────
const BIN = join(ROOT, 'engine/build/bugra-dump');
if (!existsSync(BIN)) {
  console.error('bugra-dump yok, kuruluyor (Release)...');
  execFileSync('cmake', ['--build', join(ROOT, 'engine/build'), '--target', 'bugra-dump',
    '--config', 'Release'], { stdio: 'inherit' });
}
const dump = JSON.parse(execFileSync(BIN, mode.arg ? [mode.arg] : [], { encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024 }));

// ── Bugra tarafi ───────────────────────────────────────────────────────────
const GT = JSON.parse(readFileSync(join(ROOT, 'patterns_real/geometry/geometry-full.json'), 'utf8'));
const gtRings = GT.rings.filter((r) => r.pattern === mode.gtPattern && r.sizeGuess === SIZE);
const BODY_SIZE = (() => {
  // bugra-dump.cpp:61 govdesi -> sizeChartMM'de tam esitlik aranir (uydurma yok)
  const want = { bustMM: 880, waistMM: 680, hipMM: 940 };
  for (const [s, v] of Object.entries(GT.sizeChartMM))
    if (v.bustMM === want.bustMM && v.waistMM === want.waistMM && v.hipMM === want.hipMM) return s;
  return null;
})();

if (NAMES_ONLY) {
  console.log('MOTOR parcalari:'); for (const p of dump.pieces) console.log('  ', p.name);
  console.log('BUGRA parcalari:'); for (const r of gtRings) console.log('  ', r.piece);
  process.exit(0);
}

// ── geometri ───────────────────────────────────────────────────────────────
const bbox = (P) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of P) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
};
const closed = (P) => (P.length && (P[0][0] !== P.at(-1)[0] || P[0][1] !== P.at(-1)[1]) ? [...P, P[0]] : P);
const perim = (P) => { let s = 0; for (let i = 1; i < P.length; i++) s += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return s; };
// bbox min kosesine tasi (ring-compare.py usulu)
const toOrigin = (P) => { const b = bbox(P); return P.map(([x, y]) => [x - b.x0, y - b.y0]); };
// PDF y-yukari -> yerel y-asagi (ring-compare.py load_trace ile ayni)
const flipY = (P) => { const b = bbox(P); return P.map(([x, y]) => [x, b.y1 - y]); };

function ptPolyDist([px, py], poly) {
  let best = Infinity;
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[i + 1];
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    let d;
    if (L2 < 1e-12) d = Math.hypot(px - ax, py - ay);
    else { let u = ((px - ax) * dx + (py - ay) * dy) / L2; u = u < 0 ? 0 : u > 1 ? 1 : u; d = Math.hypot(px - (ax + u * dx), py - (ay + u * dy)); }
    if (d < best) best = d;
  }
  return best;
}
const stats = (a) => { const s = [...a].sort((x, y) => x - y); return { med: s[s.length >> 1], p95: s[Math.min(s.length - 1, Math.floor(s.length * 0.95))], max: s.at(-1) }; };

// ── levha ──────────────────────────────────────────────────────────────────
const n = (v) => (Math.round(v * 100) / 100).toFixed(2);
const dOf = (P) => 'M ' + P.map(([x, y]) => `${n(x)} ${n(y)}`).join(' L ') + ' Z';

function overlaySVG(title, sub, mPoly, gPoly) {
  const PAD = 20, HEAD = 34;
  const b = bbox([...mPoly, ...gPoly]);
  // Sayfa genisligi etiketi de tasimak zorunda: dar bir parcada (ör. Collar
  // Lining) baslik konturdan uzundur ve rasterda KIRPILIR. Kirpmayi gizlemek
  // yerine sayfa buyutulur (f-d-kalip-plot.mjs ayni dersi tasiyor).
  const labelW = Math.max(title.length * 7.0, sub.length * 4.6) + PAD * 2;
  const W = Math.max(b.w + PAD * 2, labelW), H = b.h + PAD * 2 + HEAD;
  const g = `<g transform="translate(${n(PAD)} ${n(PAD + HEAD)})">`
    + `<path d="${dOf(gPoly)}" fill="none" stroke="${INK_BUGRA}" stroke-width="${LAW.lineClasses.classes.outline.width}" stroke-dasharray="6 4" stroke-linejoin="round"/>`
    + `<path d="${dOf(mPoly)}" fill="none" stroke="${INK_ENGINE}" stroke-width="${LAW.lineClasses.classes.outline.width}" stroke-linejoin="round"/>`
    + '</g>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(W)} ${n(H)}" width="100%" `
    + `role="img" data-unit-mm="1" data-scale="1:1" data-kind="overlay-proof" `
    + `data-align="bbox-min-corner" data-size="${SIZE}">`
    + `<rect width="${n(W)}" height="${n(H)}" fill="${PAPER}"/>`
    + `<text x="${PAD}" y="18" font-family="Helvetica,Arial,sans-serif" font-size="13" font-weight="600" fill="${INK_ENGINE}">${title}</text>`
    + `<text x="${PAD}" y="30" font-family="Helvetica,Arial,sans-serif" font-size="9" fill="${INK_BUGRA}">${sub}</text>`
    + g + '</svg>';
}

// ── kosu ───────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
const lines = [];
const say = (s) => { lines.push(s); console.log(s); };

say(`overlay-png | ${mode.gtPattern} | motor: bugra-dump ${mode.arg || '(corset)'} | Bugra halkasi: beden ${SIZE}`);
say(`hizalama: bbox min kosesi (ring-compare.py usulu, serbest parametre YOK) | mm=mm, olcek 1:1`);
say(`BEDEN NOTU: bugra-dump govdesi bust 88 / waist 68 / hip 94 cm = Bugra ${BODY_SIZE ?? '?'}` +
    ` (sizeChartMM tam esitlik). Bu kosu beden ${SIZE} halkasina karsi.` +
    (BODY_SIZE === SIZE ? ' UYUSUYOR.' : ` UYUSMUYOR — motor ${BODY_SIZE ?? '?'} cizip ${SIZE} ile kiyaslaniyor, fark bu satirdan okunur.`));
say(`motor parcasi ${dump.pieces.length} | Bugra halkasi ${gtRings.length} | validator issue ${dump.issues.length}`);
say('');
say('parca eslemesi                          Dbbox_W   Dbbox_H    Dcevre     Dcevre%   sapma_med  sapma_p95  sapma_max   PNG');
say('                                             mm        mm        mm         %          mm         mm         mm');
const cuts = [];

const usedGt = new Set();
const map = NAME_MAP[mode.gtPattern] ?? {};
let pngCount = 0;

for (const p of dump.pieces) {
  const gtName = map[p.name];
  if (gtName === null) { say(`  ${p.name.padEnd(36)} YAPISAL FARK (Bugra'da baska konstruksiyon) — kiyas YOK`); continue; }
  if (gtName === undefined) { say(`  ${p.name.padEnd(36)} ESLEME YOK (NAME_MAP'e eklenmedi) — kiyas YOK`); continue; }
  const ring = gtRings.find((r) => r.piece === gtName);
  if (!ring) { say(`  ${p.name.padEnd(36)} BUGRA HALKASI YOK (${gtName} @ ${SIZE}) — kiyas YOK`); continue; }
  usedGt.add(gtName);

  const mPoly = toOrigin(closed(p.cutPoly.length ? p.cutPoly : p.sewPoly));
  const gPoly = toOrigin(flipY(closed(ring.polygon)));
  const mb = bbox(mPoly), gb = bbox(gPoly);
  const mP = perim(mPoly), gP = perim(gPoly);
  const dev = stats(gPoly.map((q) => ptPolyDist(q, mPoly)));

  const slug = `${mode.gtPattern}-${SIZE}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  const svgPath = join(OUT, `${slug}.svg`), pngPath = join(OUT, `${slug}.png`);
  writeFileSync(svgPath, overlaySVG(
    `${p.name}  vs  Bugra "${gtName}" (beden ${SIZE})  —  1:1 mm`,
    `duz cizgi = motor kesim cizgisi | kesik cizgi = Bugra basili kontur | hizalama: bbox min kosesi | BU BIR KAPI DEGIL, sayilar bilgidir`,
    mPoly, gPoly));
  rasterise(svgPath, pngPath, PX);
  pngCount++;

  say(`  ${p.name.padEnd(36)} ${(mb.w - gb.w).toFixed(2).padStart(8)} ${(mb.h - gb.h).toFixed(2).padStart(9)} `
    + `${(mP - gP).toFixed(2).padStart(9)} ${(((mP - gP) / gP) * 100).toFixed(2).padStart(9)} `
    + `${dev.med.toFixed(2).padStart(10)} ${dev.p95.toFixed(2).padStart(10)} ${dev.max.toFixed(2).padStart(10)}   ${slug}.png`);
  cuts.push(`  ${p.name.padEnd(24)} motor kesim talimati: "${p.cut}"   |   Bugra parca adi: "${gtName}"`);
}

for (const r of gtRings) if (!usedGt.has(r.piece))
  say(`  (motor karsiligi yok)                ----      ----      ----      ----       ----       ----       ----   <- Bugra ${r.piece} ${r.wMM}x${r.hMM} cevre ${r.perimMM}`);

say('');
say('KESIM TALIMATLARI (kat/ayna farki bbox ve cevre farkinin kaynagi olabilir):');
for (const c of cuts) say(c);
say('');
say(`PNG ${pngCount} adet -> ${OUT}`);
say('OKUMA NOTU: Dbbox/Dcevre/sapma pozitifse motor parcasi Bugra konturundan BUYUK.');
say('Bugra basili kontur KESIM cizgisidir (defter: 1cm dikis payi dahil); motor tarafi da cutPoly.');
say('Sapma sutunu Bugra noktalarindan motor poligonuna dik mesafedir (bbox hizalamasi sonrasi).');
export { };
