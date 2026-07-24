// komuta.mjs — KOMUTA EKRANI üreteci (iç araç, canlı DEĞİL).
// Zincir durumu + sayılar + açık kapılar + son kontakt linki tek ekranda.
// Mevcut JSON/rapor kaynaklarından STATİK HTML derler. GÜVENLİK: çıktı
// reports/gate/komuta.html (web/ DIŞI, deploy'a girmez) + noindex; iç durum
// ekranı herkese açık siteye sızmaz. Damla lokalde açar.
//
//   node komuta.mjs   ->  reports/gate/komuta.html
//
// Kaynaklar: gate kuyruğu (gate.mjs), gusto kalibrasyon (gusto-lint), ctest
// sayısı (CMakeLists add_test grep), golden pin (GOLDEN-PIN.md), NEREDEYİZ
// (NABIZ.md son izler), benchmark sayıları (CLAUDE.md status satırı).

import { readFileSync, existsSync, readdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { listCards } from './gate.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : '');

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function ctestCount() {
  const cm = read('engine/CMakeLists.txt');
  return (cm.match(/add_test/g) || []).length;
}

function goldenPin() {
  const g = read('engine/GOLDEN-PIN.md');
  const m = g.match(/### (\d{4}-\d\d-\d\d) — ([\d,]+) lines, md5 (\w+)/);
  return m ? { date: m[1], lines: m[2], md5: m[3].slice(0, 8) } : null;
}

function neredeyiz() {
  // Tek canlı kaynak: NABIZ.md son işlem izleri (DEVAM-FASHION.md 2026-07-24 temizlikte kaldırıldı).
  const d = read('reports/gate/NABIZ.md');
  if (!d) return '(NABIZ.md yok)';
  const lines = d.trim().split('\n').filter((l) => l.trim());
  return lines.slice(-15).join('\n') || '(nabız boş)';
}

function frozenCorpus() {
  try { return JSON.parse(read('contract/gusto-corpus.json'))._frozen; } catch { return null; }
}

function build() {
  const pending = listCards('pending');
  const all = listCards('all');
  const contacts = readdirSync(join(root, 'reports/gate')).filter((f) => f.endsWith('-contact.html'));
  const g = goldenPin();
  const numbers = [
    ['ctest', `${ctestCount()} test`],
    ['golden pin', g ? `${g.lines} satır · md5 ${g.md5} · ${g.date}` : 'yok'],
    ['gusto korpus', frozenCorpus() ? `DONMUŞ ${frozenCorpus()}` : 'yok'],
    ['açık kapı (pending)', String(pending.length)],
    ['toplam kart', String(all.length)],
  ];

  const gateRows = all.length
    ? all.map((c) => `<tr class="${c.status}"><td>${esc(c.id)}</td><td>${esc(c.type)}</td><td>${esc(c.title)}</td><td><b>${c.status}</b></td><td>${c.contact ? `<a href="${esc(c.contact.replace('reports/gate/', ''))}">kontakt</a>` : '—'}</td><td>${esc(c.reason || '')}</td></tr>`).join('')
    : '<tr><td colspan="6" style="color:#7a8">kuyruk boş</td></tr>';

  const numCells = numbers.map(([k, v]) => `<div class="num"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('');
  const contactLinks = contacts.length ? contacts.map((c) => `<li><a href="${esc(c)}">${esc(c)}</a></li>`).join('') : '<li style="color:#7a8">henüz kontakt sayfası yok</li>';

  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>stitchu · komuta ekranı (iç)</title>
<style>
  :root{--navy:#1f3a5f;--line:#bcd7ee;--mute:#5b7089}
  body{margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;color:var(--navy);background:#eef4fb;padding:32px}
  .wrap{max-width:1000px;margin:0 auto}
  h1{font-family:Didot,Georgia,serif;font-weight:400;font-size:28px;margin:0 0 4px}
  .tag{color:var(--mute);font-size:13px;margin-bottom:24px}
  .nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:28px}
  .num{background:#fff;border:1px solid var(--line);border-radius:10px;padding:14px}
  .num .k{display:block;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--mute)}
  .num .v{display:block;font-size:15px;font-weight:600;margin-top:6px}
  h2{font-size:14px;text-transform:uppercase;letter-spacing:1px;color:var(--mute);margin:24px 0 10px}
  table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden;font-size:13px}
  th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line)}
  th{background:#f6faff;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--mute)}
  tr.pending td b{color:#b26a1e} tr.approved td b{color:#2e7d54} tr.rejected td b{color:#9a4444}
  .box{background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px;font-size:13px;line-height:1.6;white-space:pre-wrap}
  ul{margin:0;padding-left:18px;font-size:13px}
  a{color:#3f74a8}
</style></head><body><div class="wrap">
  <h1>stitchu · komuta ekranı</h1>
  <div class="tag">v1.1 fashion zinciri · iç araç (noindex, deploy'a girmez) · NABIZ.md</div>
  <div class="nums">${numCells}</div>
  <h2>Damla Kapısı — kuyruk</h2>
  <table><thead><tr><th>id</th><th>tür</th><th>başlık</th><th>durum</th><th>kontakt</th><th>gerekçe</th></tr></thead><tbody>${gateRows}</tbody></table>
  <h2>Kontakt sayfaları</h2>
  <ul>${contactLinks}</ul>
  <h2>Neredeyiz</h2>
  <div class="box">${esc(neredeyiz())}</div>
</div></body></html>`;
  const outRel = 'reports/gate/komuta.html';
  writeFileSync(join(root, outRel), html);
  return outRel;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const out = build();
  console.log('komuta ekrani:', out, '(ic arac, noindex, deploy disi)');
}
export { build };
