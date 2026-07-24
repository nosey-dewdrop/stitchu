import fs from 'fs';
const labels = {
  w1: 'w1 · wrap-sol · A-line midi (baz — kanonik)',
  w2: 'w2 · wrap-sağ (ayna)',
  w3: 'w3 · gathered etek (akışkan/DVF)',
  w4: 'w4 · shift etek (düz)',
  w5: 'w5 · scoop derin V (surplice belirgin)',
  w6: 'w6 · kolsuz wrap',
};
const cells = Object.keys(labels).map(id => {
  const svg = fs.readFileSync(`reports/gate/mihenk07/${id}.svg`, 'utf8');
  return `<div class=cell><div class=cap>${labels[id]}</div><div class=art>${svg}</div>` +
    `<code>gate.mjs decide MIHENK-07 approve "${id} — kalemim"</code></div>`;
}).join('');
const html = `<!doctype html><html lang=tr><head><meta charset=utf-8><meta name=robots content=noindex>` +
  `<title>MIHENK-07 wrap elbise</title><style>body{font-family:-apple-system,Helvetica,Arial;margin:0;background:#f6faff;color:#1f3a5f;padding:28px}` +
  `h1{font-family:Didot,Georgia,serif;font-weight:400;font-size:26px;margin:0 0 4px}` +
  `.sub{color:#5b7089;font-size:13px;margin:0 0 24px;max-width:820px;line-height:1.5}` +
  `.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1200px}` +
  `.cell{background:#fff;border:1px solid #bcd7ee;border-radius:12px;padding:12px}` +
  `.cap{font-size:12px;font-weight:600;margin:0 0 8px}.art{border:1px solid #eef;border-radius:8px;overflow:hidden}` +
  `.art svg{width:100%;height:auto;display:block}code{display:block;background:#0f1b2b;color:#cfe3ff;padding:7px 9px;border-radius:6px;font-size:10.5px;margin-top:8px;word-break:break-all}` +
  `.note{max-width:820px;font-size:13px;color:#5b7089;margin:22px 0 0;line-height:1.6}</style></head><body>` +
  `<h1>MIHENK-07 — wrap elbise (yeni primitif: surplice + bel bağı)</h1>` +
  `<p class=sub>Mihenk 5'lisinin 2. hedefi. Yeni opt-in <b>spec.wrap</b> treatment: omuzdan karşı bele apex üzerinden geçen surplice çapraz kapanma + alttaki underlap + yan-dikişten çıkan bel bağı (düğüm+kuyruk). Body simetrik (gerçek wrap panel başına simetrik kesilir). Golden + pinler byte-identical (opt-in). Tarif verme, SEÇ: hangi wrap "kalemim"? Vekil taslağı: w1 (kanonik), runner-up w3 (akışkanlık için karşılaştır).</p>` +
  `<div class=grid>${cells}</div>` +
  `<p class=note>NOT: surplice yaka outline'da hâlâ simetrik vNeck notch; overlap edge surplice'i çiziyor. "Yaka çift okunuyor" dersen F3'te asimetrik surplice outline hakkı var. Teknik: ctest 48/48, golden byte-identical, flat_render_lint 6 varyant üretilebilir-temiz.</p>` +
  `</body></html>`;
fs.writeFileSync('reports/gate/MIHENK-07-contact.html', html);
console.log('MIHENK-07-contact.html', html.length, 'bytes');
