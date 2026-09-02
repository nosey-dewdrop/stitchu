#!/usr/bin/env node
// KOSU/puf-once-sonra.mjs — M1-puf ÜRÜN GÖRSELİ.
//
// Damla'nın gözüne giden tek sayfa: ÖNCE (düz kapak) / SONRA (büzgülü kapak),
// hem SEVK EDİLEN FLAT hem KALIBIN KOL PARÇASI, aynı bedende (EU38) ve aynı
// ölçekte. Hiçbir sayı elle yazılmaz: kol parçasının bbox'ı, kapak yayı, kol
// oyuğu ve büzgü oranı motorun o anki çıktısından ölçülür ve görselin üstüne
// basılır. Çıktı: KOSU/ciktilar/puf-kol.png (+ .svg).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const require = createRequire(join(ROOT, '/'));

globalThis.document = { createElement: () => ({ click() {}, style: {} }),
                        head: { appendChild: (el) => queueMicrotask(() => el.onload && el.onload()) } };
const engine = await require(join(ROOT, 'engine/dist/stitchu-engine.js'))();
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
const E = await import(join(ROOT, 'web/js/engine.js'));
const { flatSVG } = await import(join(ROOT, 'web/js/download.js'));

const mm = E.bodyForSize('EU38');
const BODY = { bust: mm.bust, waist: mm.waist, hip: mm.hip, shoulder: mm.shoulder,
               backLength: mm.backLength, armLength: mm.armLength, neck: mm.neck, upperBust: 0 };
const draft = (spec) => { const r = JSON.parse(engine.draftJSON(E.engineSpec(spec), BODY));
  if (r.error) throw new Error(`draft: ${r.error}`);
  return r.pattern || r; };

// ── ölçüm (kalıptan, uydurma yok) ──────────────────────────────────────────
const D = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function cubic(p0, c) {
  const out = [];
  for (let i = 1; i <= 48; i++) {
    const t = i / 48, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * c.cp1x + 3 * u * t * t * c.cp2x + t * t * t * c.x,
              u * u * u * p0[1] + 3 * u * u * t * c.cp1y + 3 * u * t * t * c.cp2y + t * t * t * c.y]);
  }
  return out;
}
function edgePoly(piece, first, last) {
  let cur = null; const pts = [];
  piece.commands.forEach((c, i) => {
    if (c.type === 'close') return;
    if (i === first) pts.push(cur ? cur : [c.x, c.y]);
    if (i >= first && i <= last) {
      if (c.type === 'curve' && cur) for (const p of cubic(cur, c)) pts.push(p);
      else pts.push([c.x, c.y]);
    }
    cur = [c.x, c.y];
  });
  return pts;
}
const polyLen = (p) => p.reduce((L, q, i) => i ? L + D(p[i - 1], q) : 0, 0);
const rolBoyu = (piece, role) => !piece ? 0 :
  (piece.edgeRoles || []).filter((r) => r.role === role)
    .reduce((L, r) => L + polyLen(edgePoly(piece, r.first, r.last)), 0);
const kolOf = (p) => p.pieces.find((x) => /(^|\s)Sleeve$/.test(x.name));
const oyukMM = (p) =>
  rolBoyu(p.pieces.find((x) => /Front$/.test(x.name) && (x.edgeRoles || []).some((r) => r.role === 'armhole_front')), 'armhole_front') +
  rolBoyu(p.pieces.find((x) => /Back$/.test(x.name) && (x.edgeRoles || []).some((r) => r.role === 'armhole_back')), 'armhole_back');
const bbox = (cmds) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const c of cmds) for (const [x, y] of [[c.x, c.y], [c.cp1x, c.cp1y], [c.cp2x, c.cp2y]])
    if (typeof x === 'number' && typeof y === 'number') {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};
const pathOf = (cmds) => {
  let d = '', sx = 0, sy = 0;
  for (const c of cmds) {
    if (c.type === 'move') { d += `M${c.x.toFixed(1)},${c.y.toFixed(1)}`; sx = c.x; sy = c.y; }
    else if (c.type === 'line') d += `L${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    else if (c.type === 'curve') d += `C${c.cp1x.toFixed(1)},${c.cp1y.toFixed(1)} ${c.cp2x.toFixed(1)},${c.cp2y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    else if (c.type === 'close') d += `L${sx.toFixed(1)},${sy.toFixed(1)}Z`;
  }
  return d;
};

// ── veri ───────────────────────────────────────────────────────────────────
const BASE = { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'scoop',
               sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi' };
const BALON = { ...BASE, sleeveStyle: 'balloon', sleeveLength: 'long' };
const KOLONLAR = [
  { ad: 'ONCE — duz kapak',            spec: BASE },
  { ad: 'SONRA — puf kapak (buzgu)',   spec: { ...BASE, sleeveCap: 'puffed' } },
  { ad: 'ONCE — balon, kapak duz',     spec: BALON },
  { ad: 'SONRA — balon + puf kapak',   spec: { ...BALON, sleeveCap: 'puffed' } },
];

const veri = [];
for (const k of KOLONLAR) {
  const d = draft(k.spec);
  const kol = kolOf(d);
  const oyuk = oyukMM(d);
  const kapak = rolBoyu(kol, 'sleeve_cap');
  const { svg } = await flatSVG(k.spec, { size: 'EU38' });
  const front = /<g[^>]*data-view="front"[\s\S]*?<\/g>/.exec(svg);
  veri.push({ ...k, kol, oyuk, kapak, oran: kapak / oyuk, bb: bbox(kol.commands),
              flat: svg, frontOnly: front ? front[0] : null,
              isaret: (kol.notches || []).length / 2 });
}

// ── çizim ──────────────────────────────────────────────────────────────────
const COLW = 430, COLH = 760, PAD = 18;
// Kol parçası ölçeği TEK: dört sütun aynı ölçekte çizilir, yoksa "daha dolgun"
// iddiası ölçek numarasına döner. Ölçek en büyük parçaya göre seçilir.
const PIECE_H = 300;
const W = COLW * veri.length, H = COLH;
const S = Math.min(...veri.map((v) => Math.min((COLW - 2 * PAD) / v.bb.w, PIECE_H / v.bb.h)));
let inner = '';
veri.forEach((v, i) => {
  const ox = i * COLW;
  const vurgu = /SONRA/.test(v.ad);
  const col = vurgu ? '#c2410c' : '#8a8580';
  inner += `<rect x="${ox}" y="0" width="${COLW}" height="${H}" fill="${i % 2 ? '#fbf9f5' : '#f5f2ec'}"/>`;
  inner += `<text x="${ox + PAD}" y="30" font-family="monospace" font-size="15" fill="${col}">${v.ad}</text>`;

  // 1) SEVK EDİLEN FLAT (ön görünüş, dosyanın kendi SVG'si ölçeklenerek)
  const flatInner = v.flat.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const vb = /viewBox="([^"]+)"/.exec(v.flat);
  const [vx, vy, vw, vh] = vb ? vb[1].trim().split(/\s+/).map(Number) : [0, 0, 1, 1];
  const fs = Math.min((COLW - 2 * PAD) / vw, 330 / vh);
  inner += `<g transform="translate(${ox + PAD + ((COLW - 2 * PAD) - vw * fs) / 2} 44) scale(${fs}) translate(${-vx} ${-vy})">${flatInner}</g>`;

  // 2) KALIBIN KOL PARÇASI, dört sütunda AYNI ölçekte
  const gy = 420;
  const dx = ox + PAD + ((COLW - 2 * PAD) - v.bb.w * S) / 2 - v.bb.x * S;
  inner += `<g transform="translate(${dx} ${gy}) scale(${S})">` +
    `<path d="${pathOf(v.kol.commands)}" fill="none" stroke="${col}" stroke-width="${(vurgu ? 2.4 : 1.4) / S}"/>` +
    ((v.kol.notches && v.kol.notches.length)
      ? `<path d="${pathOf(v.kol.notches)}" fill="none" stroke="${col}" stroke-width="${1.6 / S}"/>` : '') +
    `</g>`;

  // 3) ÖLÇÜLEN SAYILAR (motorun o anki çıktısından)
  const satir = [
    `kol parcasi bbox   ${v.bb.w.toFixed(1)} x ${v.bb.h.toFixed(1)} mm`,
    `kapak yayi         ${v.kapak.toFixed(1)} mm`,
    `kol oyugu          ${v.oyuk.toFixed(1)} mm`,
    `kapak / oyuk       ${v.oran.toFixed(4)}`,
    `buzgu isareti      ${v.isaret}`,
  ];
  satir.forEach((s, j) => {
    inner += `<text x="${ox + PAD}" y="${H - 96 + j * 17}" font-family="monospace" font-size="12" fill="#333">${s}</text>`;
  });
});
inner += `<text x="${PAD}" y="${H - 8}" font-family="monospace" font-size="12" fill="#666">` +
  `stitchu M1-puf · EU38 · ust sira = sevk edilen flat (web/lib/flat-from-pattern.js), ` +
  `alt sira = kalibin kol parcasi (engine/src/buzgu.cpp), sayilar ayni kosudan olculdu</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  `<rect width="${W}" height="${H}" fill="#fff"/>${inner}</svg>`;

const out = join(ROOT, 'KOSU/ciktilar');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'puf-kol.svg'), svg);
const { Resvg } = await import(join(ROOT, 'engine/tools/node_modules/@resvg/resvg-js/index.js'));
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1720 } }).render().asPng();
writeFileSync(join(out, 'puf-kol.png'), png);
console.log('KOSU/ciktilar/puf-kol.png', png.length, 'bayt');
for (const v of veri)
  console.log(`  ${v.ad.padEnd(30)} bbox ${v.bb.w.toFixed(1)}x${v.bb.h.toFixed(1)}  kapak ${v.kapak.toFixed(1)}  oyuk ${v.oyuk.toFixed(1)}  oran ${v.oran.toFixed(4)}`);
