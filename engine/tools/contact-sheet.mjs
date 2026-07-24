// contact-sheet.mjs — Damla Kapısı kontakt sayfası üreteci.
// Mihenk/aday giysilerin render'ını + gusto-lint puanını + 3 gerçek Etsy
// emsalini yan yana koyar; altına "kalemim / değil + gerekçe" karar girişi
// basar. Karar reports/gate/ altına gate.mjs ile yazılır. Çıktı statik HTML;
// Damla lokalde açar, kararını verir, zincir kuyruktan okur.
//
//   node contact-sheet.mjs <cardId> "<baslik>" <item1.json> [item2.json ...]
// Her itemN.json: { slug, label, family?, terms?, props?, pieces?, pages?,
//   garmentKind?, flatSvgPath?, note? }  (gusto-lint için spec + görsel yolu)
// Yazar: reports/gate/<cardId>-contact.html + gate kartını (pending) açar.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { gustoScore } from './gusto-lint.mjs';
import { openCard } from './gate.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

// 3 sabit Etsy emsali (şartname referansları) — kontakt sayfasında yan sütun.
const ETSY_REFS = [
  { name: 'A1 Plain Bustier Dress', meta: 'A1 tek-tabaka · 4 sayfa · ~4 yapısal parça', src: 'benchmark-58/dress_patterns/A1Plainbustierdress.pdf' },
  { name: 'Bustier Dress Mixte', meta: 'A4 çok-sayfalı · 24 sayfa · tile+register', src: 'benchmark-58/dress_patterns/BustierdresMixte.pdf' },
  { name: 'BugraPatterns (satılan set)', meta: 'Etsy · elle Illustrator · 5 ayda 1.1k satış', src: 'benchmark-58/bugra-ref/' },
];

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function loadFlat(item) {
  const candidates = [
    item.flatSvgPath,
    item.slug && `web/patterns/vintage6070/${item.slug}-flat.svg`,
    item.slug && `web/patterns/svg/${item.slug}-flat.svg`,
  ].filter(Boolean);
  for (const c of candidates) {
    const p = join(root, c);
    if (existsSync(p)) return { path: c, svg: readFileSync(p, 'utf8') };
  }
  return null;
}

function scoreBadge(item, flat) {
  if (!flat) return { html: '<span class="badge miss">flat yok</span>', score: null };
  const spec = { family: item.family, terms: item.terms, props: item.props, pieces: item.pieces, pages: item.pages, garmentKind: item.garmentKind };
  const r = gustoScore(join(root, flat.path), spec);
  const cls = r.pass ? 'ok' : 'warn';
  const dims = Object.entries(r.dims).map(([k, d]) => `${k.replace('_bands', '').replace('_grammar', '')} ${d.score}`).join(' · ');
  return { html: `<span class="badge ${cls}">gusto ${r.overall} ${r.pass ? 'PASS' : 'düzeltme'}</span><div class="dims">${esc(dims)}</div>`, score: r.overall };
}

function itemCard(item) {
  const flat = loadFlat(item);
  const badge = scoreBadge(item, flat);
  const render = flat ? `<div class="flat">${flat.svg}</div>` : `<div class="flat empty">render bekliyor<br><small>${esc(item.slug || item.label)}</small></div>`;
  return `<article class="cand">
    <h3>${esc(item.label)}</h3>
    ${render}
    ${badge.html}
    ${item.note ? `<p class="note">${esc(item.note)}</p>` : ''}
    <div class="specrow">${item.family ? `aile: ${esc(item.family)} · ` : ''}${item.pieces != null ? `parça: ${item.pieces} · ` : ''}${item.pages != null ? `sayfa: ${item.pages}` : ''}</div>
  </article>`;
}

export function buildContactSheet(cardId, title, items, stamp) {
  const cards = items.map(itemCard).join('\n');
  const refs = ETSY_REFS.map((r) => `<article class="ref"><div class="refthumb">Etsy emsal</div><h4>${esc(r.name)}</h4><p>${esc(r.meta)}</p><code>${esc(r.src)}</code></article>`).join('\n');
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kontakt · ${esc(title)}</title>
<style>
  :root{--navy:#1f3a5f;--line:#bcd7ee;--mute:#5b7089;--ok:#2e7d54;--warn:#b26a1e;--miss:#9a4444}
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;color:var(--navy);background:#f6faff;padding:32px}
  header{max-width:1100px;margin:0 auto 24px}
  h1{font-family:Didot,Georgia,serif;font-weight:400;font-size:30px;margin:0 0 6px}
  .sub{color:var(--mute);font-size:14px}
  .grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr;gap:28px;align-items:start}
  .cands{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px}
  .cand,.ref{background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px}
  .cand h3{font-size:15px;margin:0 0 10px}
  .flat{background:#fff;border-radius:6px;overflow:hidden}
  .flat svg{width:100%;height:auto;display:block}
  .flat.empty{display:flex;align-items:center;justify-content:center;height:150px;color:var(--mute);border:1px dashed var(--line);text-align:center;font-size:13px}
  .badge{display:inline-block;margin-top:10px;padding:3px 9px;border-radius:20px;font-size:12px;font-weight:600}
  .badge.ok{background:#e4f4ea;color:var(--ok)} .badge.warn{background:#fbeede;color:var(--warn)} .badge.miss{background:#f7e4e4;color:var(--miss)}
  .dims{color:var(--mute);font-size:11px;margin-top:6px;line-height:1.5}
  .note{font-size:12px;color:var(--mute);margin:8px 0 0}
  .specrow{font-size:11px;color:var(--mute);margin-top:8px;border-top:1px solid var(--line);padding-top:8px}
  aside h2{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--mute);margin:0 0 12px}
  .ref{margin-bottom:14px} .ref h4{margin:8px 0 4px;font-size:13px} .ref p{margin:0;font-size:12px;color:var(--mute)} .ref code{font-size:10px;color:#8aa}
  .refthumb{background:#eef4fb;border-radius:6px;height:56px;display:flex;align-items:center;justify-content:center;color:var(--mute);font-size:11px}
  .decide{max-width:1100px;margin:28px auto 0;background:#fff;border:1px solid var(--line);border-radius:10px;padding:20px}
  .decide h2{font-size:15px;margin:0 0 12px}
  .decide code{display:block;background:#0f1b2b;color:#cfe3ff;padding:12px 14px;border-radius:8px;font-size:13px;margin:8px 0;white-space:pre-wrap;word-break:break-all}
  .decide p{font-size:13px;color:var(--mute);margin:4px 0}
</style></head><body>
<header>
  <h1>${esc(title)}</h1>
  <div class="sub">Kart: <b>${esc(cardId)}</b> · Damla Kapısı · "bunların yanında durur mu?" · ${stamp ? esc(stamp) : 'stamp yok'}</div>
</header>
<div class="grid">
  <section>
    <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--mute);margin:0 0 12px">Adaylar (stitchu)</h2>
    <div class="cands">${cards}</div>
  </section>
  <aside>
    <h2>Emsal (Etsy) — yanında durur mu?</h2>
    ${refs}
  </aside>
</div>
<div class="decide">
  <h2>Kararın (lokalde çalıştır)</h2>
  <p><b>Onay / "kalemim":</b></p>
  <code>node engine/tools/gate.mjs decide ${esc(cardId)} approve "kalemim"</code>
  <p><b>"Değil" + tek cümle gerekçe</b> (gerekçe zevk sözlüğüne işlenir):</p>
  <code>node engine/tools/gate.mjs decide ${esc(cardId)} reject "buradaki sorun ..."</code>
  <p>Zincir kararı bir sonraki turda kuyruktan okur; pin ancak onayla yazılır.</p>
</div>
</body></html>`;
  const outRel = `reports/gate/${cardId}-contact.html`;
  writeFileSync(join(root, outRel), html);
  return outRel;
}

// ---- CLI ----------------------------------------------------------------
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const [cardId, title, ...itemPaths] = process.argv.slice(2);
  if (!cardId || !title || !itemPaths.length) {
    console.log('kullanim: contact-sheet.mjs <cardId> "<baslik>" <item1.json> [item2.json ...]');
    process.exit(2);
  }
  const items = itemPaths.map((p) => JSON.parse(readFileSync(p, 'utf8')));
  const stamp = process.env.STITCHU_STAMP || null;
  const outRel = buildContactSheet(cardId, title, items, stamp);
  try {
    openCard({ id: cardId, type: 'contact', title, contact: outRel, stamp });
    console.log('kontakt sayfasi:', outRel);
    console.log('gate karti acildi (pending):', cardId);
  } catch (e) {
    console.log('kontakt sayfasi:', outRel);
    console.log('NOT: gate karti acilamadi -', e.message);
  }
}
