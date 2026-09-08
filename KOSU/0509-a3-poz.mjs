// KOSU/0509-a3-poz.mjs — kaynak (a) OLCUMU: poz landmark'i gercekten kosuyor mu?
// Headless Chrome'da web/js/vision-landmark.js'i kosar (MediaPipe WASM tarayici ister).
// Cikti: fotograf basina OLCULDU / OLCULEMEDI + neden.
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, statSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const fotolar = process.argv.slice(2);
if (!fotolar.length) { console.error('kullanim: node KOSU/0509-a3-poz.mjs <foto...>'); process.exit(2); }

const d = join(tmpdir(), `a3poz-${Math.random().toString(36).slice(2)}`);
mkdirSync(d, { recursive: true });
cpSync('web/vendor/pose', join(d, 'vendor/pose'), { recursive: true });
cpSync('web/js/vision-landmark.js', join(d, 'vision-landmark.js'));
for (const f of fotolar) cpSync(f, join(d, f.split('/').pop()));

writeFileSync(join(d, 'i.html'), `<html><body><script type="module">
import { pozOlc } from './vision-landmark.js';
const tv = await import('./vendor/pose/vision_bundle.mjs');
const sonuc = [];
for (const ad of ${JSON.stringify(fotolar.map((f) => f.split('/').pop()))}) {
  try {
    const img = new Image(); img.src = ad;
    await img.decode();
    const r = await pozOlc(tv, img, './');
    sonuc.push({ foto: ad, hukum: r.hukum, hataKodu: r.hataKodu, neden: r.neden,
                 guven: r.guven, oranlar: r.oranlar, belY: r.belY });
  } catch (e) { sonuc.push({ foto: ad, hukum: 'HATA', neden: String(e).slice(0, 200) }); }
}
await fetch('/sonuc', { method: 'POST', body: JSON.stringify(sonuc) });
</script></body></html>`);

// ARAC ONARIMI (8.3): file:// uzerinden ES modul import'u CORS ile ENGELLENIYOR
// (olculdu: DOM 774 bayt, script hic kosmadi). Cozum: gecici yerel HTTP sunucusu.
// Ag disariya CIKMAZ, 127.0.0.1'e baglanir; model zaten self-host.
const { createServer } = await import('node:http');
const { readFileSync: rf, existsSync: ex } = await import('node:fs');
const MIME = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript',
               '.wasm': 'application/wasm', '.task': 'application/octet-stream', '.jpg': 'image/jpeg' };
let sonucJSON = null;
const srv = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/sonuc') {
    let b = ''; req.on('data', (c) => { b += c; });
    return req.on('end', () => { sonucJSON = b; res.writeHead(200); res.end('ok'); });
  }
  const yol = join(d, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, ''));
  if (!ex(yol)) { res.writeHead(404); return res.end('yok'); }
  const uzanti = yol.slice(yol.lastIndexOf('.'));
  res.writeHead(200, { 'Content-Type': MIME[uzanti] || 'application/octet-stream',
                       'Cross-Origin-Opener-Policy': 'same-origin',
                       'Cross-Origin-Embedder-Policy': 'require-corp' });
  res.end(rf(yol));
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;

// --dump-dom sayfa yuklenince DOM'u basar; modul + wasm icin virtual-time budget verilir.
const cp = spawn(CHROME, ['--headless=new', '--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--use-angle=swiftshader',
  `--user-data-dir=${d}/profil`, 
  `http://127.0.0.1:${port}/i.html`], { stdio: 'ignore' });
// sonuc POST ile gelene kadar yokla (en fazla 120 s), sonra Chrome'u oldur.
for (let t = 0; t < 120000 && sonucJSON === null; t += 200) await new Promise((r) => setTimeout(r, 200));
try { cp.kill('SIGKILL'); } catch {}
console.log(sonucJSON ?? JSON.stringify({ hukum: 'HARNESS_HATASI', neden: 'sayfa 120 s icinde sonuc gondermedi' }));
srv.close();
try { rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); } catch {}
