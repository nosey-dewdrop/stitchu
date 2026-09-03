#!/usr/bin/env node
// shot-landing.mjs — VITRININ GORUNTUSU (M6-vitrin, IS 6).
//
// Damla'nin gozune giden dosya: sitenin ana akis sayfalarinin, TAMAMI gorunen
// ekran goruntuleri. Kapi degil, KAMERA — burada hicbir sey uretilmez, sadece
// sevk edilen sayfalar cekilir.
//
// ⚖ IKI SEY OLCULDU VE IKISI DE YOLU DEGISTIRDI (2026-09-03):
//
//  1. file:// ILE CEKILEMEZ. create.html bir ES-modul uygulamasi; file://
//     altinda modul yuklemesi CORS'a takiliyor ve kare BOMBOS geliyor
//     (olculdu: 68 KB'lik bos bir sayfa). O yuzden sayfalar yerel bir statik
//     sunucudan (STITCHU_SHOT_BASE) cekilir.
//
//  2. UZUN PENCERE DE CALISMIYOR. Headless Chrome bir sayfayi yalnizca
//     tepeden boyar: `#drawn` capasiyla da, ayni kokenli bir iframe icinde
//     scrollIntoView ile de kare BEMBEYAZ geldi (iki yol da denendi). Pencere
//     yuksekligini buyutmek de ise yaramiyor, cunku landing'in hero'su
//     `min-height:100vh` — pencere 15000 px olunca hero da 15000 px oluyor ve
//     geri kalan her sey karenin disina dusuyor (olculdu: 1440x15000 karesinin
//     serit 03'u bastan sona potikare).
//
//     Calisan tek yol BASKI: Chrome --print-to-pdf sayfanin TAMAMINI dizer,
//     pdftoppm da onu sayfa sayfa PNG'ye cevirir. Kirpma yok, secme yok;
//     sayfanin her santimi karede.
//
//   node engine/tools/shot-landing.mjs [cikti-dizini]
//   STITCHU_SHOT_BASE=http://127.0.0.1:8731  (varsayilan)
import { mkdirSync, existsSync, statSync, readdirSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = resolve(process.argv[2] || join(ROOT, 'KOSU/ciktilar/vitrin-2'));
const KOK = process.env.STITCHU_SHOT_BASE || 'http://127.0.0.1:8731';
mkdirSync(OUT, { recursive: true });

// sayfa · cikti onadi · kip. Ana akisin tamami: giris, dene, ciz, gizlilik, vitrin.
//
// ⚠ create.html BASKIYLA CEKILEMEZ, ve bu bir kusur DEGIL: web/css/app.css:226
// `@media print { body > *:not(#print-root){display:none} }` diyor, cunku o
// sayfanin baskisi GERCEK OLCEKLI KALIP cikitisidir, arayuzun resmi degil.
// Baskiyla cekilince kare bombos geldi (olculdu). O sayfa pencere kipinde
// cekilir: ilk ekran, kirpma yok.
const SAYFALAR = [
  ['index.html', 'vitrin-01-landing', 'baski'],
  ['al-dene.html', 'vitrin-02-al-dene', 'baski'],
  ['create.html', 'vitrin-03-create', 'pencere', 1440, 1700],
  ['privacy.html', 'vitrin-04-privacy', 'baski'],
  ['showcase.html', 'vitrin-05-showcase', 'baski'],
];

if (!existsSync(CHROME)) { console.error(`headless Chrome yok: ${CHROME}`); process.exit(3); }
try { execFileSync('pdftoppm', ['-v'], { stdio: 'pipe' }); }
catch { console.error('pdftoppm (poppler) yok — PDF sayfalari PNG olamaz'); process.exit(3); }

// Kosu kendi uretmedigi dosyayi birakmaz: eski vitrin-* kareleri silinir.
let silinen = 0;
for (const f of readdirSync(OUT)) if (/^vitrin-\d/.test(f)) { rmSync(join(OUT, f), { force: true }); silinen++; }
if (silinen) console.log(`eski vitrin-* karesi silindi: ${silinen}`);

for (const [sayfa, onad, kip, W, H] of SAYFALAR) {
  const dir = mkdtempSync(join(tmpdir(), 'stitchu-shot-'));
  if (kip === 'pencere') {
    const png = join(OUT, `${onad}-1.png`);
    try {
      execFileSync(CHROME, [
        '--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
        '--no-default-browser-check', '--force-device-scale-factor=1',
        `--user-data-dir=${join(dir, 'chrome-profile')}`,
        `--screenshot=${png}`, `--window-size=${W},${H}`,
        '--virtual-time-budget=12000', `${KOK}/${sayfa}`,
      ], { stdio: 'pipe', timeout: 240000 });
    } catch (e) {
      if (!existsSync(png) || statSync(png).size === 0) { console.error(`${sayfa}: ${e.message}`); process.exit(1); }
    }
    console.log(`${onad}  1 kare (pencere ${W}x${H})  <- ${KOK}/${sayfa}`);
    continue;
  }
  const pdf = join(dir, 'p.pdf');
  try {
    // --user-data-dir kosu basina TEKIL olmak zorunda: paylasilan profilde
    // ikinci Chrome isini birinciye devredip sonsuza kadar bekliyor
    // (raster.mjs'in 2026-08-23 dersi, ayni tuzak).
    execFileSync(CHROME, [
      '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      `--user-data-dir=${join(dir, 'chrome-profile')}`,
      `--print-to-pdf=${pdf}`, '--no-pdf-header-footer',
      '--virtual-time-budget=12000', `${KOK}/${sayfa}`,
    ], { stdio: 'pipe', timeout: 240000 });
  } catch (e) {
    if (!existsSync(pdf) || statSync(pdf).size === 0) { console.error(`${sayfa}: ${e.message}`); process.exit(1); }
  }
  // 96 dpi'da kare 816x1056 cikiyor ve gövde metni okunmuyordu (Damla'nin
  // gözüne giden dosya okunamiyorsa urun degil). 144 dpi = 1224x1584.
  execFileSync('pdftoppm', ['-png', '-r', '144', pdf, join(OUT, onad)], { stdio: 'pipe' });
  const kareler = readdirSync(OUT).filter((f) => f.startsWith(onad) && f.endsWith('.png'));
  console.log(`${onad}  ${kareler.length} kare  <- ${KOK}/${sayfa}`);
}
console.log(`\nekranlar: ${OUT}`);
