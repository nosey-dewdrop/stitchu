#!/usr/bin/env node
// vision-probe: tek tek foto(lar)ı CANLI worker'dan okur, HAM cevabın tamamını
// benchmark-58/probes/<tarih>/<foto>.json'a bankalar (kredi tam hasat kuralı).
// Sayaç/verdict yok — bu araç sadece "vision bugün gerçekte ne okuyor" sorusuna
// kanıt üretir. Kullanım:
//   node engine/tools/vision-probe.mjs "13.48.06" "13.50.24"
// Argüman: photos-1024 içindeki dosya adının herhangi bir parçası.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PHOTOS = join(root, 'benchmark-58', 'photos-1024');
const API = 'https://stitchu-api.damummyphus.workers.dev/api/analyze';
const TOKEN_FILE = join(root, 'benchmark-58', '.benchmark-token');
const BENCH_TOKEN = existsSync(TOKEN_FILE) ? readFileSync(TOKEN_FILE, 'utf8').trim() : '';

const wanted = process.argv.slice(2);
if (!wanted.length) {
  console.error('kullanım: vision-probe.mjs <foto-adı-parçası> [...]');
  process.exit(1);
}
const files = readdirSync(PHOTOS).filter((f) => wanted.some((w) => f.includes(w)));
if (!files.length) {
  console.error('eşleşen foto yok:', wanted.join(', '));
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = join(root, 'benchmark-58', 'probes', stamp.slice(0, 10));
mkdirSync(outDir, { recursive: true });

for (const file of files) {
  const b64 = execFileSync('base64', ['-i', join(PHOTOS, file)], { encoding: 'utf8' }).replace(/\n/g, '');
  const tmp = join(root, 'benchmark-58', '.req.json');
  writeFileSync(tmp, JSON.stringify({ image: b64, mediaType: 'image/jpeg' }));
  const curlArgs = ['-s', '-m', '120', '-X', 'POST', API, '-H', 'content-type: application/json'];
  if (BENCH_TOKEN) curlArgs.push('-H', `x-sb-bench: ${BENCH_TOKEN}`);
  curlArgs.push('--data', `@${tmp}`);
  const raw = execFileSync('curl', curlArgs, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 16 });
  const outFile = join(outDir, file.replace(/\.jpg$/i, '') + `.${stamp}.json`);
  writeFileSync(outFile, raw);
  let spec = null;
  try {
    const data = JSON.parse(raw);
    const text = data?.content?.[0]?.text || '';
    spec = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch { /* ham cevap zaten bankada */ }
  console.log('---', file);
  if (spec) {
    console.log('  neckline:', spec.neckline, '| straps:', JSON.stringify(spec.straps),
      '| garment:', spec.garment, '| sleeve:', spec.sleeveStyle, '| backDetail:', JSON.stringify(spec.backDetail));
    if (spec.ratios) console.log('  ratios:', JSON.stringify(spec.ratios));
  } else {
    console.log('  SPEC PARSE EDİLEMEDİ, ham cevap:', outFile);
  }
  console.log('  bankalandı:', outFile);
}
