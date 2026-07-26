// bugra-parity — motor draft vs satın alınmış Bugra kalıplarının GERÇEK mm geometrisi.
// Ground truth: bugra-geometry.json (A0 PDF vektör çıkarımı, kalibrasyon 4cm bar = 40.00mm,
// kaynak: bugra-extract.py + patterns_real/BUGRA-DEFTER.md). LLM yok, kanaat yok — sadece mm.
//
// Bugra ölçüleri 8 beden nested: outer = en büyük beden, inner = en küçük.
// Motor EU38-sınıfı gövdeyle (bust 88) çizer; adil kıyas MID = (inner+outer)/2.
// Bugra dikiş payı DAHİL basıyor (defter notu); motor payı da yazdırılır — sistematik
// ~2×SA farkı tabloda görünür olsun diye iki sütun da ham verilir, gizli düzeltme yok.
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// DİKKAT: engine/dist 18 Tem'de kaldı (cupSeam YOK); güncel build web/vendor'da (24 Tem).
// dist tazelenince burası dist'e geri döner.
const createEngine = require(join(HERE, '../../../web/vendor/stitchu-engine.js'));
const engine = await createEngine();

const GT = JSON.parse(readFileSync(join(HERE, 'bugra-geometry.json'), 'utf8'));

// BUGRA-DEFTER.md parça adları ↔ geometry.json kayıtları (bbox ile eşlenmiş, el ile teyitli)
const NAMED = {
  corset_bustier: [
    { name: 'Upper Cup',      w: 278, h: 291, perim: 998 },
    { name: 'Lower Cup',      w: 211, h: 232, perim: 842 },
    { name: 'Front Side',     w: 169, h: 294, perim: 622 },
    { name: 'Front Center',   w: 114, h: 357, perim: 615 },
    { name: 'Back Side',      w: 281, h: 120, perim: 647 },
    { name: 'Back Center',    w: 521, h: 178, perim: 1303 },
  ],
  locket_top: [
    { name: 'Front Body',     w: 366, h: 543, perim: 1922 },
    { name: 'Back Body',      w: 272, h: 480, perim: 1418 },
    { name: 'Collar',         w: 213, h: 169, perim: 622 },
    { name: 'Collar Lining',  w: 158, h: 171, perim: 501 },
    { name: 'Lower Sleeve',   w: 398, h: 180, perim: 980 },
    { name: 'Upper Sleeve',   w: 537, h: 221, perim: 1254 },
  ],
};

// geometry.json'dan named tabloya mid-beden oranı bağla (outer bbox en yakın kayıt)
for (const key of Object.keys(NAMED)) {
  const pool = [...GT[key].pieces];
  for (const n of NAMED[key]) {
    let best = null, bd = 1e9;
    for (const p of pool) {
      const d = Math.abs(p.bbox_w_mm - n.w) + Math.abs(p.bbox_h_mm - n.h);
      if (d < bd) { bd = d; best = p; }
    }
    if (best && bd < 30) {
      n.midW = (best.bbox_w_mm + best.inner_bbox_w_mm) / 2;
      n.midH = (best.bbox_h_mm + best.inner_bbox_h_mm) / 2;
      n.midPerim = (best.outer_perimeter_mm + best.inner_perimeter_mm) / 2;
      pool.splice(pool.indexOf(best), 1);
    }
  }
}

const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };
const base = { waistline: 'natural', fabric: 'woven', sleeveLength: 'short', skirtStyle: 'aLine',
  skirtLength: 'mini', topLength: 'hip', frontPlacket: false, tieClosure: 0, sleeveCap: 0,
  collarType: 0, collarEdge: 0, gatherType: 0, gatherZone: 0, backOpening: 0, backSlit: 0,
  ruffledStraps: 0, peplum: 0, placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0,
  hemShape: 0, shoulderStyle: 0, buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0 };

function bez(p0, c, n = 10) {
  let len = 0, px = p0.x, py = p0.y;
  for (let i = 1; i <= n; i++) {
    const t = i / n, mt = 1 - t;
    const x = mt*mt*mt*p0.x + 3*mt*mt*t*c.cp1x + 3*mt*t*t*c.cp2x + t*t*t*c.x;
    const y = mt*mt*mt*p0.y + 3*mt*mt*t*c.cp1y + 3*mt*t*t*c.cp2y + t*t*t*c.y;
    len += Math.hypot(x - px, y - py); px = x; py = y;
  }
  return len;
}
function measure(cmds) {
  let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, perim = 0, px = 0, py = 0;
  let area2 = 0, sx = 0, sy = 0; // shoelace (bezier'i kirişle yaklaşır — bbox amaçlı yeterli)
  for (const c of cmds) {
    if (c.type === 'close') { area2 += px * sy - sx * py; continue; }
    const x = c.x, y = c.y;
    if (c.type === 'move') { px = x; py = y; sx = x; sy = y; }
    else if (c.type === 'line') { perim += Math.hypot(x - px, y - py); area2 += px * y - x * py; px = x; py = y; }
    else if (c.type === 'curve') { perim += bez({ x: px, y: py }, c); area2 += px * y - x * py; px = x; py = y; }
    minx = Math.min(minx, x); maxx = Math.max(maxx, x);
    miny = Math.min(miny, y); maxy = Math.max(maxy, y);
  }
  return { w: Math.round(maxx - minx), h: Math.round(maxy - miny),
           perim: Math.round(perim), area: Math.round(Math.abs(area2) / 2 / 100) }; // cm2
}
// Bugra parçaları A0 sayfasında yatık durabiliyor -> yön-bağımsız kıyas: (uzun, kısa)
const longShort = (w, h) => (w >= h ? [w, h] : [h, w]);

function draft(spec, label) {
  const out = JSON.parse(engine.draftJSON({ ...base, ...spec }, BODY));
  if (out.error) { console.log(label, 'ERROR', out.error); return null; }
  if (out.issues && out.issues.length) console.log(label, 'ISSUES', out.issues);
  const pieces = [];
  for (const p of out.pattern.pieces) {
    if (/bias|binding|ruffle/i.test(p.name)) continue;
    pieces.push({ name: p.name, ...measure(p.commands) });
  }
  return pieces;
}

// motor parça adı → Bugra defter adı (null = yapısal fark, sayı kıyası yapılmaz)
// GROUP: motor princess'i cup'ları center+side böler, Bugra tek cup keser —
// grup toplamı (genişlikler dikiş hattında yan yana, alanlar toplanır) kıyaslanır.
const GROUPS = {
  corset_bustier: [
    { motor: ['Upper Cup Center Front', 'Upper Cup Side Front'], bugra: 'Upper Cup' },
    { motor: ['Lower Cup Center Front', 'Lower Cup Side Front'], bugra: 'Lower Cup' },
    { motor: ['Top Center Back', 'Top Side Back'], bugra: 'Back Center' }, // Bugra arka: fold tek parça + yan
  ],
};
const MAP = {
  corset_bustier: {},
  locket_top: {
    'Top Front': 'Front Body', 'Top Back': 'Back Body',
    'Sleeve': null,               // Bugra 2 parçalı (Upper+Lower) — motor tek parça = YAPISAL FARK
    'Shirt Collar Stand (yaka bandı)': null,   // Bugra tek büyük yaka+astar; motor stand+blade
    'Shirt Collar Blade (yaka yaprağı)': null,
    'Front Neck Facing': null, 'Back Neck Facing': null, // Bugra'da facing yok (astarlı yaka)
  },
};

function row(label, mw, mh, gw, gh) {
  const [ml, ms] = longShort(mw, mh), [gl, gs] = longShort(Math.round(gw), Math.round(gh));
  console.log(`  ${label.padEnd(34)} ${String(ml).padStart(4)}x${String(ms).padStart(4)}   ` +
    `${String(gl).padStart(4)}x${String(gs).padStart(4)}     ` +
    `${String(ml - gl).padStart(5)}  ${String(ms - gs).padStart(5)}   ` +
    `${(((ml - gl) / gl) * 100).toFixed(0).padStart(4)}% ${(((ms - gs) / gs) * 100).toFixed(0).padStart(4)}%`);
}

function compare(key, motorPieces, title) {
  console.log(`\n=== ${title} — motor ${motorPieces.length} parça vs Bugra ${NAMED[key].length} parça ===`);
  console.log('  (kenarlar yön-normalize: uzunxkısa; Bugra=mid beden, dikiş payı DAHİL her ikisinde)');
  console.log('  parça                              motor       Bugra      Δuzun  Δkısa   sapma%');
  const usedGt = new Set(), usedMotor = new Set();
  for (const g of (GROUPS[key] ?? [])) {
    const ms = g.motor.map(n => motorPieces.find(p => p.name === n)).filter(Boolean);
    const gt = NAMED[key].find(n => n.name === g.bugra);
    if (!ms.length || !gt) continue;
    ms.forEach(p => usedMotor.add(p.name)); usedGt.add(gt.name);
    // grup: genişlikler dikiş hattında yan yana -> toplanır; boy = en uzun parça
    const sumW = ms.reduce((a, p) => a + p.w, 0), maxH = Math.max(...ms.map(p => p.h));
    row(`${g.motor.length}x[${ms.map(p=>p.name.replace(/ (Center|Side) /,' ')).join('+').slice(0,20)}]`,
        sumW, maxH, gt.midW ?? gt.w, gt.midH ?? gt.h);
  }
  const map = MAP[key];
  for (const mp of motorPieces) {
    if (usedMotor.has(mp.name)) continue;
    const gtName = map[mp.name];
    const gt = gtName ? NAMED[key].find(n => n.name === gtName) : undefined;
    if (gtName === null || (gtName !== undefined && !gt)) {
      console.log(`  ${mp.name.padEnd(34)} ${String(mp.w).padStart(4)}x${String(mp.h).padStart(4)}   YAPISAL FARK (Bugra'da farklı konstrüksiyon)`);
      continue;
    }
    if (gt === undefined) {
      console.log(`  ${mp.name.padEnd(34)} ${String(mp.w).padStart(4)}x${String(mp.h).padStart(4)}   EŞLEME YOK (haritaya ekle ya da yapısal fark)`);
      continue;
    }
    usedGt.add(gt.name);
    row(mp.name.slice(0, 34), mp.w, mp.h, gt.midW ?? gt.w, gt.midH ?? gt.h);
  }
  for (const n of NAMED[key]) if (!usedGt.has(n.name))
    console.log(`  (motor karşılığı yok)              ----x----   ${String(Math.round(n.midW ?? n.w)).padStart(4)}x${String(Math.round(n.midH ?? n.h)).padStart(4)}   <- Bugra ${n.name} — MOTOR EKSİĞİ`);
}

const bustier = draft({ garment: 'top', shaping: 'princess', neckline: 'sweetheart',
  sleeveStyle: 'none', topLength: 'cropped', cupSeam: 1 }, 'BUSTIER');
if (bustier) compare('corset_bustier', bustier, 'CORSET BUSTIER (motor: sweetheart princess strapless + cupSeam)');

const locket = draft({ garment: 'top', shaping: 'dart', neckline: 'crew',
  sleeveStyle: 'straight', collarType: 5, frontPlacket: true }, 'LOCKET');
if (locket) compare('locket_top', locket, 'LOCKET TOP (motor: dart top + shirt collar + set-in sleeve)');
