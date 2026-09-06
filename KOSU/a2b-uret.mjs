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

// seri.png: EU34..EU44 YENIDEN DEGERLEME (olcekleme degil) — her beden kendi kalibiyla,
// tek satirda yan yana. Her SVG ayri uretilir, tek sayfaya <g translate> ile dizilir.
const bedenler = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44'];
const parcalar = [];
let x = 0, maxH = 0;
for (const b of bedenler) {
  const svg = execFileSync('engine/build/grafciz', [G, b, 'kalip'], { maxBuffer: 1 << 26 }).toString();
  writeFileSync(join(OUT, `_yerel-seri-${b}.svg`), svg);
  const [vx, vy, w, h] = vb(svg);
  const ic = svg.replace(/^[\s\S]*?>\n/, '').replace(/<\/svg>\s*$/, '');
  parcalar.push({ b, x, vx, vy, w, h, ic });
  x += w + 60; maxH = Math.max(maxH, h);
}
const SW = x - 60, SH = maxH + 90;
let seri = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW.toFixed(3)} ${SH.toFixed(3)}" data-seri="EU34-EU44" data-yontem="yeniden-degerleme">\n`;
seri += `  <rect width="${SW.toFixed(3)}" height="${SH.toFixed(3)}" fill="#ffffff"/>\n`;
for (const p of parcalar) {
  seri += `  <g data-beden="${p.b}" transform="translate(${(p.x - p.vx).toFixed(3)} ${(60 - p.vy).toFixed(3)})">\n${p.ic}</g>\n`;
  seri += `  <text x="${(p.x + p.w / 2).toFixed(3)}" y="40" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="34" fill="#111">${p.b}</text>\n`;
}
seri += '</svg>\n';
writeFileSync(join(OUT, 'seri.svg'), seri);
{
  const [w, h] = px(seri, 2200);
  const ok = await png(join(OUT, 'seri.svg'), join(OUT, 'seri.png'), w, h);
  console.log(`seri: ${w}x${h} ${ok ? 'ok' : 'YOK'}`);
}
for (const b of bedenler) rmSync(join(OUT, `_yerel-seri-${b}.svg`), { force: true });
