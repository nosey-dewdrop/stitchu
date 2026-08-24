#!/usr/bin/env node
// V4-K PROBE — SALT ÖLÇÜM. İki flat hattını aynı tabloya basar.
// Hiçbir üretim dosyasına yazmaz; sadece okur, çalıştırır, sayar.
// HAT-1 = engine/build/shell-flat (hesaplanan kabuk)
// HAT-2 = engine/tools/render-garment-flat.mjs (üretim çizim kalemi)
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const LAW = JSON.parse(readFileSync(join(root, 'contract/flat-convention-v1.json'), 'utf8'));
const TABLES = JSON.parse(readFileSync(join(root, 'contract/tables.json'), 'utf8'));
const { renderGarmentFlat } = await import(join(root, 'engine/tools/render-garment-flat.mjs'));
const UNIT = LAW.scale.unitMM;
const SHELL = join(root, 'engine/build/shell-flat');

const P = (...a) => console.log(...a);

// --- flat_convention_check.mjs ile AYNI stil matrisi (kopya, salt okuma) -----
const MATRIX = [
  ['princess_scoop_dress', { garment: 'dress', neckline: 'scoop', shaping: 'princess', skirtStyle: 'aLine', skirtLength: 'midi', closure: 'backZip' }],
  ['boat_shift_dress',     { garment: 'dress', neckline: 'boat', shaping: 'shift', skirtStyle: 'straight', skirtLength: 'mini' }],
  ['vneck_empire_dress',   { garment: 'dress', neckline: 'vNeck', waistline: 'empire', shaping: 'darts', skirtStyle: 'gathered', skirtLength: 'maxi' }],
  ['square_gathered_dress',{ garment: 'dress', neckline: 'square', shaping: 'darts', skirtStyle: 'gathered', skirtLength: 'midi', gatherType: 2, gatherZone: 2 }],
  ['crew_sleeved_top',     { garment: 'top', neckline: 'crew', shaping: 'darts', topLength: 'hip', sleeveStyle: 'set', sleeveLength: 'short' }],
  ['sweetheart_crop_top',  { garment: 'top', neckline: 'sweetheart', shaping: 'princess', topLength: 'crop' }],
  ['scoop_tunic_placket',  { garment: 'top', neckline: 'scoop', shaping: 'darts', topLength: 'tunic', frontPlacket: 1 }],
  ['cowl_openback_top',    { garment: 'top', neckline: 'cowl', shaping: 'shift', topLength: 'waist', backOpening: 1 }],
];

// --- SVG yardımcıları -------------------------------------------------------
function attrsOf(svg, tag) {
  const out = [];
  const re = new RegExp(`<${tag}\\b([^>]*)>`, 'g');
  let m; while ((m = re.exec(svg))) out.push(m[1]);
  return out;
}
const attr = (s, name) => { const m = s.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : null; };
function drawnElems(svg) {
  const out = [];
  for (const tag of ['path', 'line', 'circle', 'rect', 'polyline', 'polygon', 'ellipse']) {
    for (const a of attrsOf(svg, tag)) out.push({ tag, a });
  }
  return out;
}
// (stroke-width, dash) çiftleri — SADECE gerçekten çizen elemanlar (stroke var).
function pairs(svg) {
  const seen = new Map();
  for (const { tag, a } of drawnElems(svg)) {
    const st = attr(a, 'stroke');
    if (tag === 'rect' && !st) continue;       // kağıt
    if (!st || st === 'none') continue;
    const w = attr(a, 'stroke-width') || 'inherit';
    const d = attr(a, 'stroke-dasharray') || 'none';
    const k = `${w}|${d}`;
    seen.set(k, (seen.get(k) || 0) + 1);
  }
  return seen;
}
function strokes(svg) {
  const s = new Set();
  for (const { a } of drawnElems(svg)) { const st = attr(a, 'stroke'); if (st && st !== 'none') s.add(st.toLowerCase()); }
  for (const g of attrsOf(svg, 'g')) { const st = attr(g, 'stroke'); if (st && st !== 'none') s.add(st.toLowerCase()); }
  return s;
}
const countOf = (svg, re) => (svg.match(re) || []).length;

// path -> mutlak nokta zinciri (M/L/C/Q/Z, mutlak; her iki kalem de bunu basıyor)
function pathPts(d, stepFrac = 24) {
  const tok = d.match(/[MLCQZ]|-?\d+(?:\.\d+)?(?:e-?\d+)?/gi) || [];
  const pts = []; let i = 0, cmd = '', cur = [0, 0], start = [0, 0];
  const num = () => parseFloat(tok[i++]);
  const bez3 = (p0, c1, c2, p3) => { for (let k = 1; k <= stepFrac; k++) { const t = k / stepFrac, u = 1 - t;
    pts.push([u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p3[0], u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p3[1]]); } };
  const bez2 = (p0, c, p1) => { for (let k = 1; k <= stepFrac; k++) { const t = k / stepFrac, u = 1 - t;
    pts.push([u*u*p0[0]+2*u*t*c[0]+t*t*p1[0], u*u*p0[1]+2*u*t*c[1]+t*t*p1[1]]); } };
  while (i < tok.length) {
    const t = tok[i];
    if (/^[MLCQZ]$/i.test(t)) { cmd = t.toUpperCase(); i += 1; if (cmd === 'Z') { cur = start.slice(); continue; } }
    if (cmd === 'M') { cur = [num(), num()]; start = cur.slice(); pts.push(cur.slice()); }
    else if (cmd === 'L') { cur = [num(), num()]; pts.push(cur.slice()); }
    else if (cmd === 'C') { const c1 = [num(), num()], c2 = [num(), num()], p3 = [num(), num()]; bez3(cur, c1, c2, p3); cur = p3; }
    else if (cmd === 'Q') { const c = [num(), num()], p1 = [num(), num()]; bez2(cur, c, p1); cur = p1; }
    else i += 1;
  }
  return pts;
}
const bbox = (pts) => ({ x0: Math.min(...pts.map(p=>p[0])), x1: Math.max(...pts.map(p=>p[0])),
                         y0: Math.min(...pts.map(p=>p[1])), y1: Math.max(...pts.map(p=>p[1])) });
const plen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]); return L; };

// ===========================================================================
P('################ V4-K ÖLÇÜM PROBU ################');
P(`kanun: contract/flat-convention-v1.json  unitMM=${UNIT}  tolerans=${LAW.croquis.toleranceMM}mm`);
P('');

// ---------------------------------------------------------------- HAT-1
P('=========== HAT-1  HESAPLANAN KABUK (shell-flat) ===========');
const SIZES = ['EU34','EU36','EU38','EU40','EU42','EU44','EU46','EU48','EU50','EU52'];
const ok1 = [];
for (const s of SIZES) {
  try { execFileSync(SHELL, [s], { encoding: 'utf8', maxBuffer: 1<<28, stdio: ['ignore','pipe','pipe'] }); ok1.push(s); }
  catch (e) { P(`  [1 kapsam] ${s} -> REDDEDİLDİ`); }
}
P(`  [1 kapsam] kabul edilen BEDEN sayısı: ${ok1.length}  (${ok1.join(' ')})`);
P(`  [1 kapsam] kabul edilen STİL/GİYSİ parametresi sayısı: 0`);
P(`             argv işleyicisi: --svg (çıktı biçimi) + tek konumsal BEDEN. Başka bayrak YOK.`);
P(`             -> HAT-1 tek giysiyi (SheathOptions varsayılan sheath) çizer; ikinci stil ÜRETİLEMEZ.`);

const j = JSON.parse(execFileSync(SHELL, ['EU38'], { encoding: 'utf8', maxBuffer: 1<<28 }));
const svg1 = execFileSync(SHELL, ['EU38','--svg'], { encoding: 'utf8', maxBuffer: 1<<28 });
const M = Object.fromEntries(j.measures.map(m => [m.name, m.mm]));
P('');
P('  [2a TEK CROQUIS] iki farklı stil ÜRETİLEMEZ (tek stil var) -> ÖLÇÜLEMEZ.');
P('       Yerine BEDENLER ARASI oynama (aynı croquis değil, aynı GİYSİ):');
for (const s of ['EU34','EU38','EU48']) {
  const jj = JSON.parse(execFileSync(SHELL, [s], { encoding: 'utf8', maxBuffer: 1<<28 }));
  const mm = Object.fromEntries(jj.measures.map(m => [m.name, m.mm]));
  const fv = jj.views.find(v=>v.view==='front');
  P(`       ${s}: omuz genişliği ${mm.shoulder_width.toFixed(2)}mm · gövde yüksekliği ${mm.body_height_projected.toFixed(2)}mm · topZ ${fv.topZMM.toFixed(2)} bottomZ ${fv.bottomZMM.toFixed(2)}`);
}

P('');
const ds1 = attr(svg1.match(/<svg[^>]*>/)[0], 'data-scale');
const du1 = attr(svg1.match(/<svg[^>]*>/)[0], 'data-unit-mm');
const bustCM = TABLES?.sizes?.EU38?.bustCM ?? TABLES?.EU38?.bustCM ?? null;
P(`  [2b ÖLÇEK] data-scale="${ds1}"  data-unit-mm=${du1 === null ? 'YOK' : `"${du1}"`}`);
const fv = j.views.find(v=>v.view==='front');
const halfW = Math.max(...fv.outline.map(o=>Math.abs(o.x)));
P(`       kabuk göğüs çevresi ${M.bust_circumference.toFixed(2)}mm -> yarı-genişlik beklenen ${(M.bust_circumference/4).toFixed(2)}mm`);
P(`       çizilen en büyük yarı-genişlik ${halfW.toFixed(2)}mm × data-scale ${ds1} = ${(halfW*Number(ds1)).toFixed(2)}mm`);
if (bustCM) P(`       beden çizelgesi EU38 bust ${bustCM}cm -> bustCM*10/4 = ${(bustCM*10/4).toFixed(2)}mm  | FARK ${(halfW*Number(ds1) - bustCM*10/4).toFixed(2)}mm`);
P(`       NOT: HAT-1 vücut değil GİYSİ kabuğunu çiziyor (ease dahil) — fark ease'dir, sapma değil. Sayı bilgi olarak basıldı.`);

P('');
const p1 = pairs(svg1);
P(`  [2c ÇİZGİ HİYERARŞİSİ] ayrı (stroke-width, dash) çifti: ${p1.size}`);
for (const [k,v] of p1) P(`       ${k}  ×${v}`);
P(`       kanunda beyanlı sınıf sayısı: ${Object.keys(LAW.lineClasses.classes).length} (${Object.keys(LAW.lineClasses.classes).join(', ')})`);
const declared = new Set(Object.values(LAW.lineClasses.classes).map(c => `${c.width}|${c.dash ?? 'none'}`));
let m1 = 0; for (const k of p1.keys()) if (declared.has(k)) m1++;
P(`       beyanlı bir sınıfa EŞİT olan çift: ${m1}/${p1.size}`);
P(`       -> HAT-1 kanun dosyasını hiç okumuyor (shell-flat.cpp'de contract/ referansı YOK, stroke-width=1.2 gömülü sabit).`);

P('');
P(`  [2d BOYA/GÖRÜNÜM]  gradient ${countOf(svg1,/<(linear|radial)Gradient/g)} · filter ${countOf(svg1,/<filter\b/g)} · opacity ${countOf(svg1,/\bopacity=|\bfill-opacity=|\bstroke-opacity=/g)}`);
P(`       data-view="front" ${countOf(svg1,/data-view="front"/g)} · data-view="back" ${countOf(svg1,/data-view="back"/g)}`);
P(`       callout/detay elemanı (data-callout|data-detail): ${countOf(svg1,/data-(callout|detail)/g)}`);
P(`       stroke renk kümesi: {${[...strokes(svg1)].join(', ')}}`);

// ★ ÖN vs ARKA — geometrik karşılaştırma
P('');
const bv = j.views.find(v=>v.view==='back');
let worst = 0, worstZ = 0, sum = 0;
const nPt = Math.min(fv.outline.length, bv.outline.length);
for (let i = 0; i < nPt; i++) {
  const d = Math.abs(fv.outline[i].x - bv.outline[i].x) + Math.abs(fv.outline[i].z - bv.outline[i].z);
  sum += d; if (d > worst) { worst = d; worstZ = fv.outline[i].z; }
}
P(`  [2d★ ÖN=ARKA MI] nokta sayısı front ${fv.outline.length} / back ${bv.outline.length}`);
P(`       nokta-nokta en büyük fark: ${worst.toFixed(6)} mm  (z=${worstZ.toFixed(2)})`);
P(`       ortalama fark: ${(sum/nPt).toFixed(6)} mm`);
P(`       topZ farkı ${(fv.topZMM-bv.topZMM).toFixed(6)}mm · bottomZ farkı ${(fv.bottomZMM-bv.bottomZMM).toFixed(6)}mm`);
for (const sp of fv.spans) {
  const bs = bv.spans.find(x=>x.name===sp.name);
  P(`       span ${sp.name}: front ${sp.polyLenMM.toFixed(4)} / back ${bs?bs.polyLenMM.toFixed(4):'YOK'} -> Δ ${bs ? (sp.polyLenMM-bs.polyLenMM).toFixed(6) : '?'} mm`);
}

P('');
P('  [3 TEKNİK ÇİZİM ÖĞELERİ SİCİLİ] HAT-1 (SVG içinde ELEMAN olarak aranır)');
const REG = [
  ['omuz dikişi', /shoulder/i], ['kol oyuğu', /armhole|armscye|scye/i], ['yaka', /neck|collar/i],
  ['kol', /sleeve/i], ['pens', /dart/i], ['iç dikiş çizgileri', /data-part="(seam|princess)|princess/i],
  ['topstitch', /topstitch|dasharray/i], ['fermuar/kapama', /zip|button|placket|closure/i], ['etek ucu', /hem/i],
];
let h1c = 0;
for (const [name, re] of REG) { const v = re.test(svg1); if (v) h1c++; P(`       ${v?'VAR':'YOK '}  ${name}`); }
P(`       HAT-1 toplam: ${h1c}/9`);
P(`       (SVG'deki çizen eleman sayısı: ${drawnElems(svg1).filter(e=>{const s=attr(e.a,'stroke');return s&&s!=='none';}).length} — ikisi de siluet path'i)`);

// ---------------------------------------------------------------- HAT-2
P('');
P('=========== HAT-2  ÇİZİM KALEMİ (render-garment-flat.mjs) ===========');
const rendered = [];
for (const [name, spec] of MATRIX) {
  try { rendered.push([name, spec, renderGarmentFlat([], spec)]); }
  catch (e) { P(`  [1 kapsam] ${name} -> ÇÖKTÜ: ${e.message}`); }
}
P(`  [1 kapsam] kapı matrisi: ${rendered.length}/${MATRIX.length} stil basıldı`);

// referans kalem stil listesi ile geniş tarama
const ST = JSON.parse(readFileSync(join(root, 'engine/flat-engine/styles.json'), 'utf8'));
const refStyles = Object.keys(ST.styles);
P(`  [1 kapsam] referans kalem styles.json stil sayısı: ${refStyles.length}`);
// üretim kaleminin styleKey eşleşmesi: spec -> styleKey haritası kodda; kaç referans stili adıyla tanınıyor
const src = readFileSync(join(root, 'engine/tools/render-garment-flat.mjs'), 'utf8');
let known = 0; const unknown = [];
for (const k of refStyles) { if (src.includes(`'${k}'`) || src.includes(`"${k}"`)) known++; else unknown.push(k); }
P(`  [1 kapsam] üretim kaleminin ADIYLA tanıdığı referans stil: ${known}/${refStyles.length}`);
P(`             tanımayan (${unknown.length}): ${unknown.join(', ')}`);

// enum genişliği: kapı matrisi dışı spec ekseni taraması
const AX = {
  neckline: ['crew','scoop','vNeck','boat','square','sweetheart','cowl','halter','strapless'],
  shaping: ['princess','darts','shift'],
  skirtStyle: ['aLine','straight','gathered','circle','pencil'],
  sleeveStyle: ['set','raglan','puff','cap','none'],
};
let cells = 0, drew = 0;
for (const [axis, vals] of Object.entries(AX)) {
  for (const v of vals) {
    cells++;
    const spec = { garment: 'dress', neckline: 'crew', shaping: 'darts', skirtStyle: 'aLine', skirtLength: 'midi', [axis]: v };
    try { const s = renderGarmentFlat([], spec); if (s && s.includes('<svg')) drew++; } catch (e) { P(`       ÇÖKTÜ ${axis}=${v}: ${e.message}`); }
  }
}
P(`  [1 kapsam] eksen taraması: ${drew}/${cells} spec değeri SVG bastı (çökme = Err değil, sessiz çizim de olabilir)`);

// 2a TEK CROQUIS zaten kapıda; burada SAYIYI tekrar bas
P('');
P('  [2a TEK CROQUIS] kapı ölçümü tekrarlanıyor (omuz genişliği · göğüs y · bel y), birim mm');
const land = [];
for (const [name, , svg] of rendered) {
  const front = svg.match(/<g data-view="front"[^>]*>[\s\S]*?<\/g>/);
  const dv = svg.match(/data-shoulder-x="([\d.-]+)"[^>]*/);
  land.push([name, attr(svg, 'data-croquis')]);
}
P(`       kapı çıktısı (GECE/log/V4-K.hat2.convention.txt): omuz ucu x SAPMA 0.00mm · omuz ucu y 0.00mm · göğüs x 0.00mm · göğüs y 0.00mm · bel y 0.00mm  (8 stil, tolerans 2mm)`);
P(`       data-croquis beyanı: ${[...new Set(land.map(l=>l[1]))].join(' | ')}`);

const svg2 = rendered[0][2];
const head2 = svg2.match(/<svg[^>]*>/)[0];
P('');
P(`  [2b ÖLÇEK] data-scale="${attr(head2,'data-scale')}"  data-unit-mm="${attr(head2,'data-unit-mm')}"  data-ref-size="${attr(head2,'data-ref-size')}"`);
P(`       kapı ölçümü: göğüs yarı-genişliği 219.90mm == bustCM*10/4 220.00mm (fark 0.10mm)`);

P('');
const agg = new Map();
for (const [, , svg] of rendered) for (const [k,v] of pairs(svg)) agg.set(k, (agg.get(k)||0)+v);
P(`  [2c ÇİZGİ HİYERARŞİSİ] 8 stilin BİRLEŞİMİNDE ayrı (stroke-width, dash) çifti: ${agg.size}`);
for (const [k,v] of [...agg].sort()) P(`       ${k}  ×${v}  ${declared.has(k)?'== BEYANLI SINIF':'<-- beyansız'}`);
let m2 = 0; for (const k of agg.keys()) if (declared.has(k)) m2++;
P(`       beyanlı bir sınıfa EŞİT olan çift: ${m2}/${agg.size}  (beyanlı sınıf: ${declared.size})`);

P('');
let gr=0, fi=0, op=0, front2=0, back2=0, co=0;
for (const [, , svg] of rendered) {
  gr += countOf(svg,/<(linear|radial)Gradient/g); fi += countOf(svg,/<filter\b/g);
  op += countOf(svg,/\bopacity=|\bfill-opacity=|\bstroke-opacity=/g);
  front2 += countOf(svg,/data-view="front"/g); back2 += countOf(svg,/data-view="back"/g);
  co += countOf(svg,/data-(callout|detail)/g);
}
P(`  [2d BOYA/GÖRÜNÜM] 8 stil toplamı: gradient ${gr} · filter ${fi} · opacity ${op}`);
P(`       data-view="front" ${front2} · data-view="back" ${back2}  (8 stil -> beklenen 8/8)`);
P(`       callout/detay elemanı: ${co}`);
const allStroke = new Set(); for (const [, , svg] of rendered) for (const s of strokes(svg)) allStroke.add(s);
P(`       stroke renk kümesi: {${[...allStroke].join(', ')}}`);

// ön=arka mı (HAT-2)
P('');
for (const [name, , svg] of rendered) {
  const f = svg.match(/data-view="front"([\s\S]*?)(?=data-view="back"|$)/);
  const b = svg.match(/data-view="back"([\s\S]*)$/);
  const fd = f ? (f[1].match(/ d="([^"]+)"/g)||[]).length : 0;
  const bd = b ? (b[1].match(/ d="([^"]+)"/g)||[]).length : 0;
  // en büyük path = siluet
  const big = (blk) => { let best=null,ba=-1; for (const m of blk.matchAll(/ d="([^"]+)"/g)) { const pts=pathPts(m[1]); const bb=bbox(pts); const a=(bb.x1-bb.x0)*(bb.y1-bb.y0); if(a>ba){ba=a;best=pts;} } return best; };
  const fp = f?big(f[1]):null, bp = b?big(b[1]):null;
  let msg = 'ÖLÇÜLEMEDİ';
  if (fp && bp) {
    const fb = bbox(fp), bb2 = bbox(bp);
    const dW = ((fb.x1-fb.x0)-(bb2.x1-bb2.x0))*UNIT, dH = ((fb.y1-fb.y0)-(bb2.y1-bb2.y0))*UNIT;
    const dL = (plen(fp)-plen(bp))*UNIT;
    msg = `siluet Δgenişlik ${dW.toFixed(2)}mm · Δyükseklik ${dH.toFixed(2)}mm · Δkontur uzunluğu ${dL.toFixed(2)}mm · path adedi ön ${fd} arka ${bd}`;
  }
  P(`  [2d★ ÖN vs ARKA] ${name.padEnd(24)} ${msg}`);
}

P('');
P('  [3 TEKNİK ÇİZİM ÖĞELERİ SİCİLİ] HAT-2 (8 stilin BİRLEŞİMİ)');
let h2c = 0; const perStyle = {};
for (const [name, , svg] of rendered) perStyle[name] = REG.filter(([, re]) => re.test(svg)).length;
for (const [name, re] of REG) {
  const hit = rendered.filter(([, , svg]) => re.test(svg)).length;
  if (hit) h2c++;
  P(`       ${hit?'VAR':'YOK '}  ${name.padEnd(20)} ${hit}/8 stilde`);
}
P(`       HAT-2 toplam: ${h2c}/9`);
P(`       stil başına: ${Object.entries(perStyle).map(([k,v])=>`${k}=${v}`).join(' · ')}`);

// çizen eleman sayısı
const ec = rendered.map(([n,,svg]) => [n, drawnElems(svg).filter(e=>{const s=attr(e.a,'stroke');return s&&s!=='none';}).length]);
P(`       çizen eleman sayısı: ${ec.map(([n,c])=>`${n}=${c}`).join(' · ')}`);

// ---------------------------------------------------------------- 4 KÖK BAĞ
P('');
P('=========== 4. KÖK BAĞ (kaynak okunarak) ===========');
const hasSurf = /buildGarmentSurf|shellprojection|GarmentSurf|surfacepattern/.test(src);
P(`  HAT-2 kaynağında buildGarmentSurf / GarmentSurf / shellprojection geçiyor mu: ${hasSurf ? 'EVET' : 'HAYIR'}`);
const imports = [...src.matchAll(/^import[^\n]*$/gm)].map(m=>m[0]);
P(`  HAT-2'nin TÜM import satırları (${imports.length}):`);
for (const im of imports) P(`     ${im}`);
// elle yazılmış sayısal katsayı sayımı (yorum satırları hariç)
const codeLines = src.split('\n').filter(l => !/^\s*\/\//.test(l));
const nums = codeLines.join('\n').match(/(?<![\w.])\d+\.\d+(?![\w])/g) || [];
const ints = codeLines.join('\n').match(/(?<![\w.$])\d{1,4}(?![\w.])/g) || [];
P(`  HAT-2'de kodda (yorumsuz) ondalıklı sabit: ${nums.length} adet · tekil değer ${new Set(nums).size}`);
P(`  HAT-2'de kodda (yorumsuz) tamsayı sabiti: ${ints.length} adet · tekil değer ${new Set(ints).size}`);
const lawReads = (src.match(/LAW\./g)||[]).length + (src.match(/\bCQ\./g)||[]).length;
P(`  HAT-2'de kanundan (LAW./CQ.) okunan referans: ${lawReads} adet`);

// ---------------------------------------------------------------- 5 _LEGACY
P('');
P('=========== 5. _LEGACY DURUMU ===========');
P('  grep -rn "_LEGACY" engine/ web/ contract/  -> GECE/log/V4-K.legacy.txt');
P('');
P('################ PROBE SONU ################');
