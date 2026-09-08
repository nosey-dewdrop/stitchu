// KOSU/0509-a3-png.mjs — SVG -> PNG. KOSU/uret.mjs'in png() fonksiyonunun ayni
// mantigi (kendi kopyasi degil, ayni olculmus recete: izole --user-data-dir,
// poll+SIGKILL, 60 s dis tavan). Neden kopya: uret.mjs bir SPEC listesi uzerinde
// kosuyor ve import edilebilir bir png() disari vermiyor; ORADAKI dosyaya
// dokunmak A3'un izin listesi disi.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

export async function png(svgPath, pngPath, w = 900, h = 1200) {
  if (!existsSync(CHROME)) return { ok: false, neden: 'Chrome yok: ' + CHROME };
  const d = join(tmpdir(), `a3shot-${Math.random().toString(36).slice(2)}`);
  mkdirSync(d, { recursive: true });
  execFileSync('cp', [svgPath, join(d, 'a.svg')]);
  writeFileSync(join(d, 'i.html'),
    `<html><body style="margin:0;background:#fff"><img src="a.svg" style="width:${w}px;display:block"></body></html>`);
  rmSync(pngPath, { force: true });
  const cp = spawn(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
    `--user-data-dir=${d}/profil`, `--screenshot=${pngPath}`, `--window-size=${w},${h}`,
    '--no-sandbox', '--default-background-color=FFFFFF', `file://${d}/i.html`], { stdio: 'ignore' });
  let cikti = false; cp.on('exit', () => { cikti = true; });
  const TAVAN = 60000, ADIM = 100;
  let onceki = -1, sabit = 0, ok = false;
  for (let t = 0; t < TAVAN && !cikti; t += ADIM) {
    await bekle(ADIM);
    let boy = 0; try { boy = statSync(pngPath).size; } catch { boy = 0; }
    if (boy > 0 && boy === onceki) sabit++; else sabit = 0;
    onceki = boy;
    if (sabit >= 2) { ok = true; break; }
  }
  if (!cikti) { try { cp.kill('SIGKILL'); } catch {} }
  if (!ok) { try { ok = statSync(pngPath).size > 0; } catch { ok = false; } }
  if (!cikti) await Promise.race([new Promise((r) => cp.once('exit', r)), bekle(5000)]);
  try { rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); } catch {}
  let bayt = 0; try { bayt = statSync(pngPath).size; } catch {}
  return { ok, bayt };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [svg, out, w] = process.argv.slice(2);
  const r = await png(svg, out, w ? Number(w) : 900);
  console.log(JSON.stringify({ svg, png: out, ...r }));
  process.exit(r.ok ? 0 : 1);
}
