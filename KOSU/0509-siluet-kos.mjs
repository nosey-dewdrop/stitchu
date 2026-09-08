// KOSU/0509-siluet-kos.mjs — kaynak (b) kosucusu (A3).
// web/js/vision-siluet.js'i node'da kosar. JPEG cozumu PIL ile (sips/PIL disinda
// bagimlilik yok); ham RGBA gecici bir .raw dosyasindan okunur.
//   node KOSU/0509-siluet-kos.mjs GIRDI/hedef-fotograflar/<x>.jpg
// Cikti: tek satir JSON (oranlar() ciktisi + girdiYolu).
import { execFileSync } from 'node:child_process';
import { readFileSync, unlinkSync } from 'node:fs';
import { oranlar } from '../web/js/vision-siluet.js';

const yol = process.argv[2];
if (!yol) { console.error('kullanim: node KOSU/0509-siluet-kos.mjs <foto>'); process.exit(2); }

// PIL: JPEG -> RGBA ham bayt + boyut. Yeniden olcekleme YOK; oran zaten olcekten bagimsiz,
// ama 8 GB makinede cok buyuk fotograf icin uzun kenar 900px'e indirilir (oran korunur).
const tmp = `/tmp/0509-siluet-${process.pid}.raw`;
const boyut = execFileSync('python3', ['-c', `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGBA')
w,h = im.size
if max(w,h) > 900:
    s = 900.0/max(w,h)
    w,h = int(round(w*s)), int(round(h*s))
    im = im.resize((w,h), Image.BILINEAR)
open(sys.argv[2],'wb').write(im.tobytes())
print(w,h)
`, yol, tmp], { encoding: 'utf8' }).trim().split(/\s+/).map(Number);

const [width, height] = boyut;
const data = readFileSync(tmp);
unlinkSync(tmp);
const cikti = oranlar({ width, height, data });
console.log(JSON.stringify({ girdiYolu: yol, genislikPx: width, yukseklikPx: height, ...cikti }));
