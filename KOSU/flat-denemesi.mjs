// KOSU/flat-denemesi.mjs — bir okuma JSON'undan flat cizilebiliyor mu? (11 Eyl 2026)
// Kapi kullanir: okuyucunun ciktisi gercekten CIZILEBILIR mi, kirmizi var mi.
//   node KOSU/flat-denemesi.mjs <okuma.json> [cikis.svg]
// Cikti tek satir: "CIZILDI kirmizi=0" | "CIZILDI kirmizi=2: ..." | "CIZILEMEDI: <hata>"
import { readFileSync, writeFileSync } from 'node:fs';
import { ciz } from './siluet-ciz.mjs';   // CLI sarmalayicisi kanunu kurar

const [yol, cikis] = process.argv.slice(2);
if (!yol) { console.log('KULLANIM'); process.exit(2); }
let okuma;
try { okuma = JSON.parse(readFileSync(yol, 'utf8')); }
catch (e) { console.log('CIZILEMEDI: okuma-okunamadi ' + e.message); process.exit(1); }
try {
  const r = ciz(okuma);
  const kirmizi = r.kirmizi || [];
  if (cikis && r.svg) writeFileSync(cikis, r.svg);
  console.log(kirmizi.length === 0 ? 'CIZILDI kirmizi=0'
    : `CIZILDI kirmizi=${kirmizi.length}: ${kirmizi.slice(0, 3).join(' | ')}`);
  process.exit(kirmizi.length === 0 ? 0 : 1);
} catch (e) { console.log('CIZILEMEDI: ' + e.message); process.exit(1); }
