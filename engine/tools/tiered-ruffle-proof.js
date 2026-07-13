/* tiered-ruffle-proof.js — drafts an A-line midi dress with the 3-tier hem
   ruffle through the REAL wasm engine and renders every Ruffle piece to SVG,
   so the cascade can be LOOKED at before shipping.
   run:  node engine/tools/tiered-ruffle-proof.js  -> engine/tools/tiered-ruffle-proof.svg */
const createEngine = require(process.env.HOME + '/damla_projects_2026/00_currently_on_working/stitchu/engine/dist/stitchu-engine.js');
const fs = require('fs');
const M = [88, 70, 94, 37, 40.5, 58, 35];

function path(cmds) {
  let d = '';
  for (const c of cmds) {
    if (c.type === 'move') d += `M${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
    else if (c.type === 'line') d += `L${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
    else if (c.type === 'curve') d += `C${c.cp1x.toFixed(1)} ${c.cp1y.toFixed(1)} ${c.cp2x.toFixed(1)} ${c.cp2y.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
    else if (c.type === 'close') d += 'Z';
  }
  return d;
}

createEngine().then(e => {
  const out = JSON.parse(e.draftJSON('dress','princess','natural','woven','scoop','none','short','aLine','midi','hip', true, 3, ...M));
  if (out.issues.length) { console.error('VALIDATOR ISSUES:', out.issues); process.exit(1); }
  const ruffles = out.pattern.pieces.filter(p => p.name.includes('Ruffle'));
  console.log(`pieces: ${out.pattern.pieces.length} total, ${ruffles.length} ruffle tiers, fabric ${out.pattern.fabricMeters140} m`);
  ruffles.forEach(p => console.log(` - ${p.name}: ${p.cutInstruction}`));

  const SCALE = 0.28, PAD = 40, GAP = 60;
  let y = PAD, maxW = 0, body = '';
  for (const p of ruffles) {
    const xs = p.commands.filter(c => 'x' in c).map(c => c.x);
    const ys = p.commands.filter(c => 'y' in c).map(c => c.y);
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    body += `<g transform="translate(${PAD},${y})">` +
      `<g transform="scale(${SCALE})">` +
      `<path d="${path(p.commands)}" fill="#fdf8f5" stroke="#111" stroke-width="4"/>` +
      `<path d="${path(p.markings)}" fill="none" stroke="#8f2038" stroke-width="3" stroke-dasharray="14 10"/>` +
      (p.grainline ? `<line x1="${p.grainline.fromX}" y1="${p.grainline.fromY}" x2="${p.grainline.toX}" y2="${p.grainline.toY}" stroke="#111" stroke-width="3"/>` : '') +
      `</g>` +
      `<text x="0" y="${h * SCALE + 26}" font-family="Helvetica" font-size="15" fill="#111">${p.name} — ${p.cutInstruction}</text>` +
      `</g>`;
    y += h * SCALE + GAP;
    maxW = Math.max(maxW, w * SCALE);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${maxW + PAD * 2 + 500}" height="${y + PAD}" ` +
    `viewBox="0 0 ${maxW + PAD * 2 + 500} ${y + PAD}"><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`;
  fs.writeFileSync(__dirname + '/tiered-ruffle-proof.svg', svg);
  console.log('wrote engine/tools/tiered-ruffle-proof.svg');
});
