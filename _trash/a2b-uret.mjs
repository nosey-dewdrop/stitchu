// a2b-uret.mjs — 0509 A2b teslim ureteci: graf.json -> flat/kalip/seri SVG + PNG.
// PNG yolu KOSU/uret.mjs'in olculmus Chrome yordamiyla AYNI (izole profil, poll+kill).
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const OUT = 'KOSU/ciktilar/graf-ilk';
const G = join(OUT, 'graf.json');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

function ciz(bodyId, mod, hedef) {
  const svg = execFileSync('engine/build/grafciz', [G, bodyId, mod], { maxBuffer: 1 << 26 }).toString();
  writeFileSync(hedef, svg);
  return svg;
}

async function png(svgPath, pngPath, w, h) {
  if (!existsSync(CHROME)) { console.log('Chrome yok'); return false; }
  const d = join(tmpdir(), `a2b-${Math.random().toString(36).slice(2)}`);
  mkdirSync(d, { recursive: true });
  execFileSync('cp', [svgPath, join(d, 'a.svg')]);
  writeFileSync(join(d, 'i.html'),
    `<html><body style="margin:0;background:#fff"><img src="a.svg" style="width:${w}px;display:block"></body></html>`);
  rmSync(pngPath, { force: true });
  const cp = spawn(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
    `--user-data-dir=${d}/profil`, `--screenshot=${pngPath}`, `--window-size=${w},${h}`,
    '--no-sandbox', '--default-background-color=FFFFFF', `file://${d}/i.html`], { stdio: 'ignore' });
  let cikti = false; cp.on('exit', () => { cikti = true; });
  let onceki = -1, sabit = 0, ok = false;
  for (let t = 0; t < 90000 && !cikti; t += 100) {
    await bekle(100);
    let boy = 0; try { boy = statSync(pngPath).size; } catch { boy = 0; }
    if (boy > 0 && boy === onceki) sabit++; else sabit = 0;
    onceki = boy;
    if (sabit >= 2) { ok = true; break; }
  }
  if (!cikti) { try { cp.kill('SIGKILL'); } catch {} }
  if (!ok) { try { ok = statSync(pngPath).size > 0; } catch { ok = false; } }
  if (!cikti) await Promise.race([new Promise((r) => cp.once('exit', r)), bekle(5000)]);
  try { rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); } catch {}
  return ok;
}

const vb = (svg) => svg.match(/viewBox="([-\d. ]+)"/)[1].trim().split(/\s+/).map(Number);
function px(svg, hedefGenislik) {
  const [, , w, h] = vb(svg);
  return [Math.round(hedefGenislik), Math.max(400, Math.round(hedefGenislik * h / w))];
}

const isler = [
  ['croquis36', 'flat', 'flat'],
  ['gercek36', 'kalip', 'kalip-36'],
];
for (const [b, m, ad] of isler) {
  const svg = ciz(b, m, join(OUT, `${ad}.svg`));
  const [w, h] = px(svg, 1400);
  const ok = await png(join(OUT, `${ad}.svg`), join(OUT, `${ad}.png`), w, h);
  console.log(`${ad}: svg ${svg.length} B, png ${w}x${h} ${ok ? 'ok' : 'YOK'}`);
}

// seri.png: EU34..EU44 YENIDEN DEGERLEME (olcekleme DEGIL) — ust uste NEST'lenmis kalip.
// Neden nest: yan yana dizim 6 kalip sayfasini 2200 px'e sikistirip okunmaz kiliyordu
// (olculdu: parcalar 60 px, etiket 3 px). Serinin gorulecek seyi ZATEN bedenler arasi
// FARKTIR; nested cizim (Bugra: 8 beden ayri renk; tilly: farkli dash) tam olarak onu gosterir.
// Ayni graf her bedende BASTAN degerlenir; hicbir sey olceklenmez.
const bedenler = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44'];
const opak = [0.30, 0.45, 1.00, 0.60, 0.45, 0.30];   // EU38 tam, uzaklastikca soluk
const kal = [1.2, 1.2, 2.6, 1.2, 1.2, 1.2];
const katmanlar = [];
let VX = Infinity, VY = Infinity, VX2 = -Infinity, VY2 = -Infinity;
for (const b of bedenler) {
  const svg = execFileSync('engine/build/grafciz', [G, b, 'kalip'], { maxBuffer: 1 << 26 }).toString();
  const [vx, vy, w, h] = vb(svg);
  VX = Math.min(VX, vx); VY = Math.min(VY, vy); VX2 = Math.max(VX2, vx + w); VY2 = Math.max(VY2, vy + h);
  // yalniz KESIM cizgileri (katman 1): nested seride okunan sey parcanin dis hattidir
  const yollar = [...svg.matchAll(/<path data-katman="1"[^>]*d="([^"]+)"/g)].map((m) => m[1]);
  if (!yollar.length) throw new Error(`${b}: kesim cizgisi yok`);
  katmanlar.push({ b, yollar });
}
const SW = VX2 - VX, SH = (VY2 - VY) + 120;
let seri = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VX.toFixed(3)} ${(VY - 100).toFixed(3)} ${SW.toFixed(3)} ${SH.toFixed(3)}" data-seri="EU34-EU44" data-yontem="yeniden-degerleme-nested">\n`;
seri += `  <rect x="${VX.toFixed(3)}" y="${(VY - 100).toFixed(3)}" width="${SW.toFixed(3)}" height="${SH.toFixed(3)}" fill="#ffffff"/>\n`;
katmanlar.forEach((k, i) => {
  seri += `  <g data-beden="${k.b}" fill="none" stroke="#111111" stroke-width="${kal[i]}" opacity="${opak[i]}">\n`;
  for (const d of k.yollar) seri += `    <path d="${d}"/>\n`;
  seri += `  </g>\n`;
});
katmanlar.forEach((k, i) => {
  const x = VX + 40 + i * (SW / 7);
  seri += `  <g opacity="${opak[i]}"><rect x="${x.toFixed(1)}" y="${(VY - 78).toFixed(1)}" width="34" height="${kal[i] * 4}" fill="#111"/>` +
          `<text x="${(x + 46).toFixed(1)}" y="${(VY - 66).toFixed(1)}" font-family="Helvetica,Arial,sans-serif" font-size="26" fill="#111">${k.b}</text></g>\n`;
});
seri += `  <text x="${(VX + 40).toFixed(1)}" y="${(VY - 20).toFixed(1)}" font-family="Helvetica,Arial,sans-serif" font-size="22" fill="#444">EU34-EU44: her beden AYRI degerleme (grade tablosu), olcekleme yok</text>\n`;
seri += '</svg>\n';
writeFileSync(join(OUT, 'seri.svg'), seri);
{
  const [w, h] = px(seri, 1800);
  const ok = await png(join(OUT, 'seri.svg'), join(OUT, 'seri.png'), w, h);
  console.log(`seri: ${w}x${h} ${ok ? 'ok' : 'YOK'} (${bedenler.length} beden nested)`);
}
