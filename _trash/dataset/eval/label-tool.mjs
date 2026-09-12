#!/usr/bin/env node
// K5 hand-label tool (LOCAL ONLY — serves your own dataset photos on localhost).
//
// Ground truth for the vision cascade eval base. Labels the four cascade fields
// {garment, neckline, sleeveLength, skirtStyle} with the CONTRACT enum ids
// (contract/garment-spec.schema.json $defs.visionReading — K1's semantic layer).
// Teacher answers are NEVER shown (independent hand labels, no anchoring).
//
// Run:   node dataset/eval/label-tool.mjs        then open  http://localhost:8791
// Saves: dataset/eval/hand-labels.json after EVERY photo (crash-safe, resumable).
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const DATASET = join(here, '..');
const ROOT = join(DATASET, '..');
const OUT = join(here, 'hand-labels.json');
const PORT = 8791;

const candidates = JSON.parse(readFileSync(join(here, 'candidates.json'), 'utf8'));
const schema = JSON.parse(readFileSync(join(ROOT, 'contract', 'garment-spec.schema.json'), 'utf8'));
const vr = schema.$defs.visionReading.properties;
const enumOf = (f) => vr[f].enum.filter((v) => v !== null);
const FIELDS = {
  garment: enumOf('garment'),
  neckline: enumOf('neckline'),
  sleeveLength: enumOf('sleeveLength'),
  skirtStyle: enumOf('skirtStyle'),
};

const load = () => (existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { _note: 'K5 eval base: independent hand labels, contract visionReading enum ids. null = not visible / not applicable / cannot tell.', labels: {} });

const HTML = `<!doctype html><html><head><meta charset="utf-8"><title>stitchu K5 hand-label</title>
<style>
:root{--wine:#8f2038;--ink:#22252a;--bg:#faf8f6;--line:#e4ddd6}
*{box-sizing:border-box}body{margin:0;font:15px/1.45 -apple-system,system-ui,sans-serif;color:var(--ink);background:var(--bg);display:grid;grid-template-columns:minmax(0,1fr) 380px;height:100vh}
#photo{display:flex;align-items:center;justify-content:center;background:#efeae5;overflow:hidden}
#photo img{max-width:100%;max-height:100vh;object-fit:contain}
#panel{padding:18px 20px;overflow-y:auto;border-left:1px solid var(--line);background:#fff}
h1{font-size:15px;margin:0 0 4px}
#prog{font-size:13px;color:#6b6660;margin-bottom:12px}
#bar{height:4px;background:var(--line);margin:6px 0 14px}#fill{height:4px;background:var(--wine);width:0}
.f{margin-bottom:14px}
.f h2{font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px;color:#6b6660}
.opts{display:flex;flex-wrap:wrap;gap:6px}
button{font:14px inherit;padding:6px 10px;border:1px solid var(--line);background:#fff;cursor:pointer}
button.sel{background:var(--wine);color:#fff;border-color:var(--wine)}
button.null{border-style:dashed}
.f.off{opacity:.35;pointer-events:none}
#nav{display:flex;gap:8px;margin-top:16px}
#nav button{flex:1;padding:10px}
#save{background:var(--ink);color:#fff;border-color:var(--ink)}
kbd{background:#f0ece8;border:1px solid var(--line);border-radius:3px;padding:0 4px;font-size:11px}
#hint{font-size:12px;color:#6b6660;margin-top:14px}
#done{display:none;padding:14px;background:#eef7ee;border:1px solid #b9d8b9;margin-top:12px;font-size:14px}
</style></head><body>
<div id="photo"><img id="img" alt=""></div>
<div id="panel">
  <h1>stitchu — eval hand-label</h1>
  <div id="prog"></div><div id="bar"><div id="fill"></div></div>
  <div id="fields"></div>
  <div id="nav">
    <button id="prev">&#8592; onceki</button>
    <button id="save">kaydet + sonraki &#8594;</button>
  </div>
  <div id="hint">Klavye: her alanda secenek numaralari altta yazar. <kbd>0</kbd> = gorunmuyor/yok (null). <kbd>enter</kbd> kaydet+sonraki, <kbd>&#8592;</kbd> onceki. Etek gorunmuyorsa skirtStyle'i null birak; ust giysiyse zaten kapali. Emin degilsen null &mdash; tahmin ETME (ambar yasasi).</div>
  <div id="done">Bitti. hand-labels.json kaydedildi. Bu pencereyi kapatabilirsin.</div>
</div>
<script>
const FIELDS = __FIELDS__;
const KEYROWS = { garment:'12345', neckline:'123456789', sleeveLength:'123', skirtStyle:'12345' };
let photos = [], labels = {}, idx = 0, cur = {};
function applicable(f){
  const g = cur.garment;
  if (f === 'garment') return true;
  if (g === 'other' || g === 'trousers') return false;
  if (f === 'skirtStyle') return g === 'dress' || g === 'skirt' || !g;
  if (f === 'neckline' || f === 'sleeveLength') return g === 'dress' || g === 'top' || !g;
  return true;
}
function render(){
  const p = photos[idx];
  document.getElementById('img').src = '/photo/' + encodeURIComponent(p.photo);
  const n = Object.keys(labels).length;
  document.getElementById('prog').textContent = 'foto ' + (idx+1) + ' / ' + photos.length + '  -  etiketli ' + n;
  document.getElementById('fill').style.width = (100*n/photos.length) + '%';
  const box = document.getElementById('fields'); box.innerHTML = '';
  for (const [f, opts] of Object.entries(FIELDS)){
    const div = document.createElement('div');
    div.className = 'f' + (applicable(f) ? '' : ' off');
    div.innerHTML = '<h2>' + f + '</h2>';
    const row = document.createElement('div'); row.className = 'opts';
    opts.forEach((o, i) => {
      const b = document.createElement('button');
      b.textContent = o + ' ' ; const k = document.createElement('kbd'); k.textContent = (i+1); b.appendChild(k);
      if (cur[f] === o) b.classList.add('sel');
      b.onclick = () => { cur[f] = (cur[f] === o ? undefined : o); render(); };
      row.appendChild(b);
    });
    const nb = document.createElement('button'); nb.className = 'null' + (cur[f] === null ? ' sel' : '');
    nb.innerHTML = 'yok/gorunmuyor <kbd>0</kbd>';
    if (cur[f] === null) nb.classList.add('sel');
    nb.onclick = () => { cur[f] = (cur[f] === null ? undefined : null); render(); };
    row.appendChild(nb);
    div.appendChild(row); box.appendChild(div);
  }
}
function collect(){
  const out = {};
  for (const f of Object.keys(FIELDS)) out[f] = applicable(f) ? (cur[f] === undefined ? null : cur[f]) : null;
  return out;
}
async function save(next){
  const p = photos[idx];
  labels[p.hash] = { photo: p.photo, labels: collect(), labeledAt: new Date().toISOString() };
  await fetch('/save', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(labels) });
  if (next && idx < photos.length - 1){ idx++; loadCur(); render(); }
  else if (next) { document.getElementById('done').style.display = 'block'; render(); }
  else render();
}
function loadCur(){
  const p = photos[idx];
  cur = labels[p.hash] ? { ...labels[p.hash].labels } : {};
}
document.getElementById('save').onclick = () => save(true);
document.getElementById('prev').onclick = () => { if (idx>0){ idx--; loadCur(); render(); } };
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter'){ save(true); return; }
  if (e.key === 'ArrowLeft'){ if (idx>0){ idx--; loadCur(); render(); } return; }
  if (e.key === 'ArrowRight'){ if (idx<photos.length-1){ idx++; loadCur(); render(); } return; }
  // number keys act on the FIRST applicable field without a decision yet
  const fields = Object.keys(FIELDS).filter(applicable);
  const target = fields.find((f) => cur[f] === undefined) || fields[fields.length-1];
  if (!target) return;
  if (e.key === '0'){ cur[target] = null; render(); return; }
  const i = parseInt(e.key, 10) - 1;
  if (!isNaN(i) && i >= 0 && i < FIELDS[target].length){ cur[target] = FIELDS[target][i]; render(); }
});
(async () => {
  const d = await (await fetch('/data')).json();
  photos = d.photos; labels = d.labels;
  idx = photos.findIndex((p) => !labels[p.hash]); if (idx < 0) idx = 0;
  loadCur(); render();
})();
</script></body></html>`;

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(HTML.replace('__FIELDS__', JSON.stringify(FIELDS)));
  } else if (url.pathname === '/data') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ photos: candidates.photos, labels: load().labels }));
  } else if (url.pathname.startsWith('/photo/')) {
    const rel = normalize(decodeURIComponent(url.pathname.slice(7)));
    if (rel.startsWith('..')) { res.writeHead(403); res.end(); return; }
    try {
      const buf = readFileSync(join(DATASET, rel));
      res.writeHead(200, { 'content-type': 'image/jpeg' });
      res.end(buf);
    } catch { res.writeHead(404); res.end(); }
  } else if (url.pathname === '/save' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      try {
        const incoming = JSON.parse(body);
        const cur = load();
        cur.labels = incoming;
        cur.updatedAt = new Date().toISOString();
        writeFileSync(OUT, JSON.stringify(cur, null, 1));
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) { res.writeHead(400); res.end(String(e)); }
    });
  } else { res.writeHead(404); res.end(); }
});
server.listen(PORT, '127.0.0.1', () => {
  console.log(`K5 hand-label tool: http://localhost:${PORT}  (${candidates.photos.length} photos; saves to dataset/eval/hand-labels.json)`);
});
