// ============================================================================
// atolye-contact.mjs — KONTAK SAYFASI (2026-08-01)
//
// Damla, 1 Agu 14:00: "sadece 1 urun mu var, vocab kombinasyonlari yok mu?
// digerlerini gormemiz lazim". Hakli: tezgah 'dress'e civiliydi, styles.json'un
// 31 kaydindan 14'u UST'tu ve hicbiri disari cikmiyordu.
//
// Bu arac built sayfadan (web/atolye.html — once `node engine/tools/
// build-atolye.mjs`) modul script'ini keser, UI katmanini atar, draw()'u N
// farkli durumla cagirir ve hepsini TEK buyuk PNG izgarasina dizer. Her karenin
// altinda kombinasyonun etiketi durur. Tek bakista urun yelpazesi.
//
// Kullanim:
//   node engine/tools/atolye-contact.mjs              -> /tmp/stitchu-contact
//   node engine/tools/atolye-contact.mjs <out-dir>
//   node engine/tools/atolye-contact.mjs --dead       -> OLU KADRAN TARAMASI
//   node engine/tools/atolye-contact.mjs --probe      -> NaN / CRASH TARAMASI
//
// --dead ve --probe iddia degil OLCUM uretir: ingredients.js'teki inertKeys()
// ve bant-govde kapilari bu iki taramanin ciktisina dayanir.
//
// PNG: cairosvg (core/third_party/garmentcode/.venv). SVG grid'i tek belge
// olarak kurulur (tek <style>, her kare bir <g transform>), boylece harici
// birlestirici — montage/ImageMagick — gerekmez; makinede zaten yok.
// ============================================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = join(ROOT, '..');
const args = process.argv.slice(2);
const MODE = args.find((a) => a.startsWith('--')) || '';
const OUT = args.find((a) => !a.startsWith('--')) || '/tmp/stitchu-contact';

// ---------------------------------------------------------------- the layers
// Same cut as atolye-proof.mjs: pen + ingredients + foldlines + lexicon,
// everything before the DOM layer ("// TEZGAH").
const html = readFileSync(join(REPO, 'web/atolye.html'), 'utf8');
const m = html.match(/<script type="module">\n([\s\S]*?)\n<\/script>/);
if (!m) { console.error('FAIL: web/atolye.html icinde modul script yok'); process.exit(1); }
let src = m[1];
const cut = src.indexOf('// TEZGAH');
if (cut === -1) { console.error('FAIL: TEZGAH isareti yok'); process.exit(1); }
src = src.slice(0, src.lastIndexOf('// ====', cut));

// ---------------------------------------------------------------- the space
// 30 kombinasyon. Amac yeni giysi TASARLAMAK degil (CLAUDE.md: yeni stil
// onerme) — kalemin ZATEN cizebildigi ama tezgahtan cikmayan uzayi gostermek.
// Her satir: [etiket, durum farki]. Hepsi ayni tohumdan (seed 7) determinist.
const T = { _garment: 'top' };
const BAND = { _bodice: 'band' };
const COMBOS = [
  // --- elbise: yaka ailesi (kalemin ayri egri cizdigi uc + iki hazir ayar)
  ['elbise · yuvarlak · kisa kol', {}],
  ['elbise · V · kisa kol', { _neckShape: 'v', neckDepth: 20 }],
  ['elbise · kare · kisa kol', { _neckShape: 'square', neckDepth: 13, neckWidth: 1.22 }],
  ['elbise · kalp · kolsuz', { _neckShape: 'sweetheart', neckDepth: 14, sleeve: false }],
  ['elbise · kayik · kolsuz', { _neckShape: 'boat', neckDepth: 6, neckWidth: 1.55, sleeve: false }],
  ['elbise · kruvaze · uzun kol', { _neckShape: 'wrap', neckDepth: 20, neckWidth: 1.15, wrapTie: true, sleeveLen: 42 }],

  // --- elbise: etek bollugu + kol kapagi + bel bagi
  ['elbise · klos maxi · puf kol', { hemLevel: 105, skirtFull: 2.55, skirtCurve: 0.8, capPuff: 2.4, sleeveLen: 12 }],
  ['elbise · A kesim · dirsek kol', { skirtFull: 1.95, sleeveLen: 28 }],
  ['elbise · kalem etek · kolsuz', { skirtFull: 1.02, waistNip: 0.26, sleeve: false }],
  ['elbise · dilimli etek · kolsuz', { gorePanels: true, goreCount: 8, skirtFull: 2.0, sleeve: false }],
  ['elbise · buzgulu · fiyonk bel', { shirr: true, gatherRatio: 2.2, _waistTie: 'bow' }],
  ['elbise · kusak bel · uzun kol', { _waistTie: 'tie', sleeveLen: 42, skirtFull: 1.95 }],

  // --- elbise: bant govde (bandeau) vs aski panelleri
  ['elbise · bandeau · aski yok', { ...BAND, sleeve: false }],
  ['elbise · bant · oturan korsaj', { ...BAND, sleeve: false, fittedBand: true }],
  ['elbise · bant · ince aski', { ...BAND, sleeve: false, straps: true, strapWidth: 1.4 }],
  ['elbise · bant · kalin aski + firfir', { ...BAND, sleeve: false, straps: true, strapWidth: 4.0, ruffle: 0.9 }],

  // --- UST: boy kovalari (kalem: cropped 5 / hip 16 / tunic 30)
  ['ust · crop · yuvarlak · kolsuz', { ...T, hemLevel: 6, sleeve: false }],
  ['ust · kalca boyu · yuvarlak · kisa kol', { ...T, hemLevel: 16 }],
  ['ust · tunik · yuvarlak · uzun kol', { ...T, hemLevel: 30, sleeveLen: 42 }],

  // --- UST: yaka ailesi
  ['ust · kayik · kolsuz · prenses', { ...T, hemLevel: 16, _neckShape: 'boat', neckDepth: 7, neckWidth: 1.42, sleeve: false }],
  ['ust · kare · puf kol', { ...T, hemLevel: 16, _neckShape: 'square', neckDepth: 13, neckWidth: 1.22, capPuff: 2.4, sleeveLen: 12 }],
  ['ust · V · dirsek kol', { ...T, hemLevel: 16, _neckShape: 'v', neckDepth: 18, sleeveLen: 28 }],
  ['ust · kalp · spagetti aski', { ...T, hemLevel: 16, _neckShape: 'sweetheart', neckDepth: 14, sleeve: false, spaghettiStrap: true }],
  ['ust · kruvaze · kisa kol', { ...T, hemLevel: 16, _neckShape: 'wrap', neckDepth: 20, neckWidth: 1.15 }],

  // --- UST: kutu kesim
  ['ust · boxy crop · kolsuz', { ...T, hemLevel: 6, boxy: true, sleeve: false }],
  ['ust · boxy tunik · kisa kol', { ...T, hemLevel: 30, boxy: true }],

  // --- UST: peplum ailesi (kalemde SADECE ust'te okunuyor)
  ['ust · peplum kisa · kolsuz', { ...T, hemLevel: 16, _peplum: 'half', sleeve: false }],
  ['ust · peplum dolgun · puf kol', { ...T, hemLevel: 16, _peplum: 'full', capPuff: 2.4, sleeveLen: 12 }],
  ['ust · peplum sivri · kare yaka', { ...T, hemLevel: 16, _peplum: 'pointed', _neckShape: 'square', neckDepth: 13, sleeve: false }],
  ['ust · peplum + firfir · buzgulu', { ...T, hemLevel: 16, _peplum: 'full', peplumRuffle: true, shirr: true, gatherRatio: 2.2, sleeve: false }],
  ['ust · bant + aski · peplum', { ...T, ...BAND, hemLevel: 16, sleeve: false, straps: true, _peplum: 'full' }],
  ['ust · bandeau · buzgulu peplum', { ...T, ...BAND, hemLevel: 6, sleeve: false, shirr: true, gatherRatio: 2.2, _peplum: 'full', peplumRuffle: true }],

  // --- biye kadranlari + kruvaze yonu (1 Agu'ya kadar compile()'da sabitti)
  ['elbise · dantel biye · V yaka', { _neckShape: 'v', neckDepth: 20, sleeve: false, laceNeck: true, laceHem: true, laceWidth: 2.4, laceScallops: 22 }],
  ['elbise · kruvaze sol uste · buzgulu', { _neckShape: 'wrap', _wrapDir: 'left', neckDepth: 20, neckWidth: 1.15, wrapTie: true, shirr: true, gatherRatio: 2.2 }],
];

// ---------------------------------------------------------------- run
const COLS = 6;
const cellW = 470, cellH = 400, LBL = 26;     // kare + altinda etiket seridi

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Kalemin viewBox'i 940x680 SABIT, ama maxi elbise 680'in ALTINA tasiyor
// (ilk izgarada bir alt satira sarkti). Her kare kendi icerigine gore
// cerceveleniyor: cizim verisinden gercek sinir kutusu olculur.
// Kalem her sekli tek kanat cizip <g transform="translate(2*cx,0) scale(-1,1)">
// ile aynaliyor -> ayna nokta da hesaba katilir (cx = 240 on, 700 arka).
function bbox(svg) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  const re = /\sd="([^"]+)"/g;
  let m;
  while ((m = re.exec(svg))) {
    const nums = m[1].match(/-?\d+(?:\.\d+)?/g);
    if (!nums) continue;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = parseFloat(nums[i]), y = parseFloat(nums[i + 1]);
      const cx = x < 470 ? 240 : 700;            // hangi figurun kanadi
      const xm = 2 * cx - x;                     // ayna esi
      x0 = Math.min(x0, x, xm); x1 = Math.max(x1, x, xm);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  const pad = 26;
  return [x0 - pad, y0 - pad, (x1 - x0) + 2 * pad, (y1 - y0) + 2 * pad + 30];  // +30: FRONT/BACK yazisi
}

const runner = `
const __MODE = ${JSON.stringify(MODE)};
const __COMBOS = ${JSON.stringify(COMBOS)};
import { writeFileSync as __wf } from 'node:fs';

function mk(over) { return draw(Object.assign(defaultState(), over)); }

if (__MODE === '--probe') {
  // NaN / CRASH taramasi: topoloji capraz carpimi. Cikti = tablo.
  // Bu tarama ingredients.js'teki bant-govde kapilarinin GEREKCESIDIR.
  const AXES = [
    ['_garment', ['dress', 'top']],
    ['_bodice', ['shoulder', 'band']],
    ['_neckShape', ['round', 'v', 'square', 'sweetheart', 'boat', 'wrap']],
  ];
  const SWITCHES = ['sleeve', 'straps', 'spaghettiStrap', 'fittedBand', 'boxy',
    'shirr', 'gorePanels', 'princessSeam', 'wrapTie', 'cfGather',
    'laceNeck', 'laceSleeve', 'laceHem', 'casing', 'tie', 'tieBack', 'peplumRuffle'];
  let bad = 0, n = 0;
  for (const g of AXES[0][1]) for (const b of AXES[1][1]) for (const nk of AXES[2][1]) {
    for (const sw of SWITCHES) {
      const st = { _garment: g, _bodice: b, _neckShape: nk, [sw]: true, _peplum: 'full', _waistTie: 'bow' };
      n++;
      try {
        const svg = mk(st);
        const nan = (svg.match(/NaN|undefined/g) || []).length;
        if (nan) { bad++; console.log('KIRIK', g, b, nk, '+' + sw, 'x' + nan); }
      } catch (e) { bad++; console.log('CRASH', g, b, nk, '+' + sw, e.message); }
    }
  }
  console.log('probe: ' + n + ' kombinasyon, ' + bad + ' kirik');
  process.exit(bad ? 1 : 0);
}

if (__MODE === '--dead') {
  // OLU KADRAN TARAMASI: her topolojide her kadrani oynat, bayt farki var mi?
  // Fark yoksa kadran O TOPOLOJIDE OLU -> inertKeys() onu soldurmali.
  const DIALS = M.filter((x) => x[0] !== 'size' && x[0] !== 'seed')
    .map((x) => [x[0], x[6] === x[3] ? x[4] : x[3]]);        // varsayilandan uzak bir uc
  const BOOLS = FLAGS.concat(SFLAGS).map((x) => [x[0], !x[3]]);
  const TOPOS = [
    ['elbise/omuz', { _garment: 'dress', _bodice: 'shoulder' }],
    ['elbise/bant', { _garment: 'dress', _bodice: 'band' }],
    ['ust/omuz', { _garment: 'top', _bodice: 'shoulder' }],
    ['ust/bant', { _garment: 'top', _bodice: 'band' }],
  ];
  let mism = 0;
  for (const [tname, topo] of TOPOS) {
    const base = Object.assign(defaultState(), topo);
    const svg0 = draw(base);
    const dead = [], claimed = inertKeys(base);
    const ENUMS = [['_peplum', 'full'], ['_waistTie', 'bow'], ['_neckShape', 'v'], ['_wrapDir', 'left']];
    for (const [k, v] of DIALS.concat(BOOLS).concat(ENUMS)) {
      let svg1;
      try { svg1 = draw(Object.assign({}, base, { [k]: v })); } catch (e) { svg1 = 'CRASH'; }
      if (svg1 === svg0) dead.push(k);
    }
    const missed = dead.filter((k) => !claimed.has(k));
    const over = [...claimed].filter((k) => !dead.includes(k));
    console.log('[' + tname + ']');
    console.log('  olu (bayt-ayni)     :', dead.join(' ') || '-');
    console.log('  inertKeys soldurdu  :', [...claimed].join(' ') || '-');
    if (missed.length) { console.log('  ! olu ama SOLDURULMADI:', missed.join(' ')); mism++; }
    if (over.length) console.log('  ~ soldurulmus ama bayt farki var:', over.join(' '));
  }
  process.exit(0);
}

// ---- kontak sayfasi
const cells = [];
let ndet = 0;
for (const [label, over] of __COMBOS) {
  const a = mk(over), b = mk(over);
  if (a === b) ndet++; else console.log('DETERMINIST DEGIL: ' + label);
  const nan = (a.match(/NaN|undefined/g) || []).length;
  if (nan) console.log('KIRIK CIZIM (' + nan + '): ' + label);
  cells.push({ label, svg: a, nan });
}
console.log('determinist: ' + ndet + '/' + __COMBOS.length);
__wf(process.env.__CELLS_OUT, JSON.stringify(cells));
`;

const tmp = join(tmpdir(), 'atolye-contact-run.mjs');
writeFileSync(tmp, src + runner);
const cellsPath = join(tmpdir(), 'atolye-contact-cells.json');
process.env.__CELLS_OUT = cellsPath;
await import(tmp);

if (MODE === '--probe' || MODE === '--dead') process.exit(0);

// ---------------------------------------------------------------- compose
const cells = JSON.parse(readFileSync(cellsPath, 'utf8'));
mkdirSync(OUT, { recursive: true });

// tek <style>: ilk kareden alinir, hepsi ayni (kalem her cizimde ayni blogu basar)
const styleBlock = (cells[0].svg.match(/<style>[\s\S]*?<\/style>/) || ['<style></style>'])[0];
const inner = (svg) => svg
  .replace(/^<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/<style>[\s\S]*?<\/style>/, '');

const rows = Math.ceil(cells.length / COLS);
const W = COLS * cellW, H = rows * cellH;
let grid = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
  + `<rect width="${W}" height="${H}" fill="#fff"/>${styleBlock}`;
cells.forEach((c, i) => {
  const x = (i % COLS) * cellW, y = Math.floor(i / COLS) * cellH;
  const vb = bbox(c.svg).map((v) => v.toFixed(1)).join(' ');
  // ic ice <svg>: kendi viewport'unu kurar ve TASANI KESER (ilk denemede
  // <g transform> kullanilmisti, maxi elbise alt satira sarkti)
  grid += `<svg x="${x}" y="${y}" width="${cellW}" height="${cellH - LBL}"`
    + ` viewBox="${vb}" preserveAspectRatio="xMidYMid meet">${inner(c.svg)}</svg>`
    + `<text x="${x + cellW / 2}" y="${y + cellH - 9}" text-anchor="middle"`
    + ` font-family="Times New Roman,serif" font-size="15" fill="#111">${esc(c.label)}</text>`
    + `<rect x="${x + 0.5}" y="${y + 0.5}" width="${cellW - 1}" height="${cellH - 1}"`
    + ` fill="none" stroke="#ddd" stroke-width="1"/>`;
});
grid += '</svg>';

const gridSvg = join(OUT, 'contact.svg');
writeFileSync(gridSvg, grid);
cells.forEach((c, i) => writeFileSync(join(OUT, String(i).padStart(2, '0') + '.svg'), c.svg));

const PY = join(REPO, 'core/third_party/garmentcode/.venv/bin/python');
const gridPng = join(OUT, 'contact.png');
if (existsSync(PY)) {
  execFileSync(PY, ['-c',
    'import sys,cairosvg;cairosvg.svg2png(url=sys.argv[1],write_to=sys.argv[2],output_width=int(sys.argv[3]))',
    gridSvg, gridPng, String(W)], { stdio: 'inherit' });
  console.log('PNG :', gridPng, `(${W}x${H}, ${cells.length} kombinasyon)`);
} else {
  console.log('cairosvg venv yok (' + PY + ') — sadece SVG yazildi');
}
console.log('SVG :', gridSvg);
