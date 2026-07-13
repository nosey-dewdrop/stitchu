/* sweetheart-proof.js — drafts a sweetheart dress through the REAL wasm engine
   and renders the front bodice + neck facing, PLUS the mirrored front so the
   heart reads the way the wearer sees it. LOOK before shipping.
   run:  node engine/tools/sweetheart-proof.js  -> engine/tools/sweetheart-proof.svg */
const createEngine = require(process.env.HOME + '/damla_projects_2026/00_currently_on_working/stitchu/engine/dist/stitchu-engine.js');
const fs = require('fs');
const M = [88, 70, 94, 37, 40.5, 58, 35];

function path(cmds, mirror) {
  const sx = mirror ? -1 : 1;
  let d = '';
  for (const c of cmds) {
    if (c.type === 'move') d += `M${(sx * c.x).toFixed(1)} ${c.y.toFixed(1)}`;
    else if (c.type === 'line') d += `L${(sx * c.x).toFixed(1)} ${c.y.toFixed(1)}`;
    else if (c.type === 'curve') d += `C${(sx * c.cp1x).toFixed(1)} ${c.cp1y.toFixed(1)} ${(sx * c.cp2x).toFixed(1)} ${c.cp2y.toFixed(1)} ${(sx * c.x).toFixed(1)} ${c.y.toFixed(1)}`;
    else if (c.type === 'close') d += 'Z';
  }
  return d;
}

createEngine().then(e => {
  const out = JSON.parse(e.draftJSON('dress','princess','natural','woven','sweetheart','none','short','aLine','midi','hip', false, 1, false, ...M));
  if (out.issues.length) { console.error('VALIDATOR ISSUES:', out.issues); process.exit(1); }
  const pieces = out.pattern.pieces;
  const front = pieces.find(p => p.name.includes('Bodice Center Front')) || pieces.find(p => p.name.includes('Bodice Front'));
  const side = pieces.find(p => p.name.includes('Bodice Side Front'));
  const facing = pieces.find(p => p.name.includes('Front Neck Facing'));
  console.log('pieces:', pieces.map(p => p.name).join(' | '));

  const S = 0.55, PAD = 30;
  let body = '';
  // Left: the mirrored center front pair = the heart as worn.
  body += `<g transform="translate(330,${PAD}) scale(${S})">` +
    `<path d="${path(front.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `<path d="${path(front.commands, true)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `</g><text x="230" y="${PAD + 320}" font-family="Helvetica" font-size="15" fill="#111">center front pair, mirrored on CF — the heart</text>`;
  // Middle: the actual pattern piece with markings.
  body += `<g transform="translate(620,${PAD}) scale(${S})">` +
    `<path d="${path(front.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `<path d="${path(front.markings, false)}" fill="none" stroke="#8f2038" stroke-width="2.5" stroke-dasharray="12 9"/>` +
    (front.grainline ? `<line x1="${front.grainline.fromX}" y1="${front.grainline.fromY}" x2="${front.grainline.toX}" y2="${front.grainline.toY}" stroke="#111" stroke-width="2.5"/>` : '') +
    `</g><text x="620" y="${PAD + 320}" font-family="Helvetica" font-size="15" fill="#111">${front.name}</text>`;
  // Right: side front + the facing that hugs the new neckline.
  if (side) body += `<g transform="translate(830,${PAD}) scale(${S})">` +
    `<path d="${path(side.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `</g><text x="830" y="${PAD + 320}" font-family="Helvetica" font-size="15" fill="#111">${side.name}</text>`;
  if (facing) body += `<g transform="translate(1030,${PAD}) scale(${S})">` +
    `<path d="${path(facing.commands, false)}" fill="#fdf8f5" stroke="#111" stroke-width="3"/>` +
    `</g><text x="1030" y="${PAD + 320}" font-family="Helvetica" font-size="15" fill="#111">${facing.name}</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="420" viewBox="0 0 1320 420">` +
    `<rect width="100%" height="100%" fill="#fff"/>${body}</svg>`;
  fs.writeFileSync(__dirname + '/sweetheart-proof.svg', svg);
  console.log('wrote engine/tools/sweetheart-proof.svg');
});
