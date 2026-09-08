// KOSU/0509-a3-overlay.mjs — fotograf + flat OVERLAY kontagi (brief A3 teslimi; hakem A3 kusur 4).
// Fotograflar TELIFLI: cikti KOSU/ciktilar/_yerel/giris/ (gitignore, commit edilmez). Uretimi yasak degil, yayimi yasak.
// Her teslim: fotograf (GIRDI/ yolu kaynak-yolu.txt'den) + ustune %55 saydam flat.svg, ayni yukseklige olceklenmis.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync('KOSU/ciktilar/_yerel/giris', { recursive: true });
for (const n of [1, 2, 3, 4, 5]) {
  const d = `KOSU/ciktilar/giris/${n}`;
  const foto = readFileSync(`${d}/kaynak-yolu.txt`, 'utf8').split('\n')[0];
  if (!existsSync(foto)) { console.log(n, 'FOTO YOK', foto); continue; }
  const html = `<html><body style="margin:0;background:#fff;width:1200px;height:900px;position:relative">
<img src="file://${resolve(foto)}" style="position:absolute;left:0;top:0;height:900px">
<img src="file://${resolve(d + '/flat.svg')}" style="position:absolute;left:0;top:0;height:900px;opacity:.55;mix-blend-mode:multiply">
<div style="position:absolute;left:8px;bottom:8px;font:14px sans-serif;background:#fff9;padding:2px 6px">${n}. ${foto.split('/').pop()} + flat (croquis36, %55)</div></body></html>`;
  const h = `KOSU/ciktilar/_yerel/giris/overlay-${n}.html`, png = `KOSU/ciktilar/_yerel/giris/overlay-${n}.png`;
  writeFileSync(h, html); rmSync(png, { force: true });
  const prof = `/tmp/a3ov-${n}-${Date.now()}`;
  const cp = spawn(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${prof}`, `--screenshot=${png}`, '--window-size=1200,900', '--no-sandbox', '--allow-file-access-from-files', `file://${resolve(h)}`], { stdio: 'ignore' });
  let cikti = false; cp.on('exit', () => { cikti = true; });
  for (let t = 0; t < 30000 && !cikti; t += 100) await bekle(100);
  try { cp.kill('SIGKILL'); } catch {}
  console.log(n, existsSync(png) ? `OK ${statSync(png).size} B ${png}` : 'PNG YOK');
}
