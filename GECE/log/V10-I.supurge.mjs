#!/usr/bin/env node
// V10-I §1 SÜPÜRGE — Türkçe duran-iddia temizliği.
// Kart V10-I md.1: L2 kapısı tek dilliydi; site iki dilli (web/js/shared-header.js:20
// `data-tr`'yi canlı metne çeviriyor). Aşağıdaki tablo, her Türkçe yasak kalıbı
// İNGİLİZCE İKİZİNİN BUGÜNKÜ DÜRÜST KARŞILIĞINA çeviriyor.
//
// ★ TEK KURAL: HİÇBİR DEĞİŞTİRME SAĞLAYICI JETONU (golden_check / engine_check /
//   site-health …) EKLEMEZ. Kartın md.2'si tam olarak o hileyi geri alıyor; aynı
//   hileyi Türkçe tarafta tekrarlamak yasak. Bu yüzden Türkçe karşılıklar
//   ALET ADI TAŞIMAZ, düz Türkçe yazılır.
//
// İngilizce taraf yalnız İKİ yerde dokunuluyor ve ikisi de SIKILAŞTIRMA:
//   "pass with zero failures" → "passed with no failures in that run"
//   "tapes together perfectly" → "tapes together"
// Sebep: kart "iki dil ÇELİŞMESİN" diyor; Türkçesi koşuya bağlanırken
// İngilizcesi duran-iddia kalamaz.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const WEB = path.join(ROOT, 'web');

// SIRA ÖNEMLİ: uzun kalıp önce.
const RULES = [
  // ── bayt-birebir ─────────────────────────────────────────────────────────
  ['golden referans bayt-birebir kalıyor', 'golden referans değişmiyor'],
  ['golden bayt-birebir', 'golden farkı yok'],
  ['Golden bayt-birebir', 'Golden farkı yok'],
  ['bayt-birebir kalıyor', 'değişmiyor'],
  ['bayt-birebir tutuluyor', 'değiştirilmeden tutuluyor'],
  ['bayt-birebir', 'değişmedi'],
  // ── bayt-aynı ────────────────────────────────────────────────────────────
  ['bayt-aynıdır', 'değişmemiştir'],
  ['bayt-aynı çıktı', 'aynı çıktı'],
  ['bayt-aynı kalıyor', 'aynı kalıyor'],
  ['yamayla bayt-aynı', 'yamayla aynı'],
  ['derlemesiyle bayt-aynı', 'derlemesiyle aynı'],
  ['bayt-aynı', 'aynı kaldı'],
  ['bayt aynı', 'aynı kaldı'],
  // ── sıfır hata ───────────────────────────────────────────────────────────
  ['çiziminde sıfır hata', 'çiziminde düşen yok'],
  ['sıfır hatayla geçiyor', 'o koşuda düşen olmadan geçti'],
  ['sıfır hatayla geçer', 'o koşuda düşen olmadan geçti'],
  ['sıfır hatayla', 'o koşunun validatör kaydında sorunsuz'],
  ['sıfır hata', 'o koşunun validatör kaydında sorun yok'],
  // ── kusursuz ─────────────────────────────────────────────────────────────
  ['yine kusursuzca bantlanıyor', 'yine bantlanıyor'],
  ['kusursuzca', 'düzgünce'],
  // ── her zaman ────────────────────────────────────────────────────────────
  ['alan her zaman öğretmene gidiyor', 'alan öğretmene gidiyor'],
  ['Geometri her zaman doğru', 'Geometri o koşuda doğru'],
  // ── ölçülerinize göre (üretecin BUGÜNKÜ metniyle birebir) ────────────────
  ['stitchu, kalıbı gerçek bir kalıp motorundan tam ölçülerinize göre çizer ve her görünüm dikilmiş bir referansa karşı kıyaslanır.',
   "stitchu da sabit beden veriyor: contract/layers/shape-ratios.json'daki sekiz beden, EU34–EU48. Fark, onları taranmış bir sayfanın değil gerçek bir kalıp motorunun çizmesi."],
  ['kumaş ölçülerinize göre değişir', 'kumaş bedene göre değişir'],
  ['tahmin, kalıbı çizdiğinizde ölçülerinize göre değişir.', 'tahmin, çizdiğiniz bedene göre değişir.'],
  // ── İngilizce ikizin sıkılaştırılması (yalnız bu ikisi) ──────────────────
  ['pass with zero failures', 'passed with no failures in that run'],
  ['tapes together perfectly', 'tapes together'],
];

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

const tally = new Map();
let touched = 0;
for (const f of walk(WEB)) {
  const src = fs.readFileSync(f, 'utf8');
  let s = src;
  for (const [from, to] of RULES) {
    if (!s.includes(from)) continue;
    const n = s.split(from).length - 1;
    tally.set(from, (tally.get(from) || 0) + n);
    s = s.split(from).join(to);
  }
  if (s !== src) { fs.writeFileSync(f, s); touched++; }
}
console.log('V10-I §1 SÜPÜRGE — dokunulan dosya:', touched);
for (const [k, v] of [...tally.entries()].sort((a, b) => b[1] - a[1]))
  console.log(String(v).padStart(4), '|', k);
