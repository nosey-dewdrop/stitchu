import fs from 'fs';
const labels = {
  g1: 'g1 · 6-gore midi (baz — motor default, mihenk hedefi)',
  g2: 'g2 · 6-gore maxi', g3: 'g3 · 8-gore midi (akışkan)',
  g4: 'g4 · 4-gore midi (yapılı)', g5: 'g5 · 6-gore mini',
  g6: 'g6 · 6-gore kolsuz sade',
};
const cells = Object.keys(labels).map(id => {
  const svg = fs.readFileSync(`reports/gate/mihenk08/${id}.svg`, 'utf8');
  return `<div class=cell><div class=cap>${labels[id]}</div><div class=art>${svg}</div>` +
    `<code>gate.mjs decide MIHENK-08 approve "${id} — kalemim"</code></div>`;
}).join('');
const html = `<!doctype html><html lang=tr><head><meta charset=utf-8><meta name=robots content=noindex>` +
  `<title>MIHENK-08 gode etek</title><style>body{font-family:-apple-system,Helvetica,Arial;margin:0;background:#f6faff;color:#1f3a5f;padding:28px}` +
  `h1{font-family:Didot,Georgia,serif;font-weight:400;font-size:26px;margin:0 0 4px}.sub{color:#5b7089;font-size:13px;margin:0 0 24px;max-width:820px;line-height:1.5}` +
  `.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1200px}.cell{background:#fff;border:1px solid #bcd7ee;border-radius:12px;padding:12px}` +
  `.cap{font-size:12px;font-weight:600;margin:0 0 8px}.art{border:1px solid #eef;border-radius:8px;overflow:hidden}.art svg{width:100%;height:auto;display:block}` +
  `code{display:block;background:#0f1b2b;color:#cfe3ff;padding:7px 9px;border-radius:6px;font-size:10.5px;margin-top:8px;word-break:break-all}.note{max-width:820px;font-size:13px;color:#5b7089;margin:22px 0 0;line-height:1.6}</style></head><body>` +
  `<h1>MIHENK-08 — godeli midi etek (gode flat kalemi)</h1>` +
  `<p class=sub>Mihenk 5'lisinin 3. hedefi. Gode motorda ZATEN canlı (6-panel, golden byte-identical). Bu halka flat KALEMİN gore'u çizmesini ekliyor: skirtStyle 'gore' → bel→hem eşit aralıklı panel seam'leri, her biri godet gibi dışa flare. Motor 6 panel kesiyor → flat 6 panel gösteriyor (listing = kalıp tutarlı). Tarif verme, SEÇ. Vekil taslağı: g1 (motor-tutarlı 6-gore midi).</p>` +
  `<div class=grid>${cells}</div>` +
  `<p class=note>Geometri doğrulandı: 6-gore CF + ±20/±40/±60 bel → ±31.6/±63.2/±94.8 hem, monoton flare (çapraz yok = üretilebilir). Panel seam DÜZ Q-flare; "seam eğrisi sert" dersen F3 eğri cilası hakkı var. ctest 48/48, golden byte-identical.</p>` +
  `</body></html>`;
fs.writeFileSync('reports/gate/MIHENK-08-contact.html', html);
console.log('MIHENK-08-contact.html', html.length, 'bytes');
