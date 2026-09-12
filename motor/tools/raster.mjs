#!/usr/bin/env node
// raster.mjs — SVG -> PNG at a COMMANDED pixel size, via headless Chrome.
//
// Why this exists (F-E, 2026-08-23): the F-D shots were rasterised at whatever
// size happened to fall out (locket-EU38-flat.png came out 1400x493). Etsy's
// PUBLISHED listing-photo minimum is 2000 px on the SHORTEST side, and Etsy only
// turns on zoom above that. A 493 px short side cannot be listed at pro quality.
// Before/after comparison is only honest if both sides go through ONE rasteriser,
// so every F-E shot is produced here.
//
// No rsvg-convert / cairosvg on this machine (checked); Chrome is present.
//
//   node engine/tools/raster.mjs <in.svg> <out.png> [shortSidePx=2000]

import { readFileSync, writeFileSync, mkdtempSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export function rasterise(svgPath, outPng, shortSide = 2000) {
  if (!existsSync(CHROME)) throw new Error(`no headless Chrome at ${CHROME}`);
  const svg = readFileSync(svgPath, 'utf8');
  const vb = svg.match(/viewBox="([\d.\-\s]+)"/);
  if (!vb) throw new Error(`${svgPath}: no viewBox, cannot size the raster`);
  const [, , vw, vh] = vb[1].trim().split(/\s+/).map(Number);

  // scale so the SHORT side lands on shortSide; the long side follows the
  // viewBox aspect exactly (no letterboxing, no crop).
  const k = shortSide / Math.min(vw, vh);
  const W = Math.round(vw * k), H = Math.round(vh * k);

  const dir = mkdtempSync(join(tmpdir(), 'stitchu-raster-'));
  const html = join(dir, 'p.html');
  writeFileSync(html,
    `<!doctype html><meta charset="utf-8">` +
    `<style>html,body{margin:0;padding:0;background:#fff}` +
    `svg{display:block;width:${W}px;height:${H}px}</style>` +
    svg.replace(/width="100%"/, `width="${W}"`).replace(/<svg /, `<svg height="${H}" `));

  // --user-data-dir MUST be unique per invocation. Without it two concurrent
  // rasterisations share Chrome's default profile, the second one hands its work
  // to the first process and then waits forever; a mutation run of this gate
  // piled up 10 live Chrome processes and hung. Found the hard way, 2026-08-23.
  try {
    execFileSync(CHROME, [
      '--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      '--no-default-browser-check', '--force-device-scale-factor=1',
      `--user-data-dir=${join(dir, 'chrome-profile')}`,
      `--screenshot=${outPng}`, `--window-size=${W},${H}`,
      `--virtual-time-budget=4000`, `file://${html}`,
    ], { stdio: 'pipe', timeout: 60000 });
  } catch (e) {
    // Headless Chrome writes the PNG and then sometimes fails to reap ("Trying
    // to load the allocator multiple times"), so execFileSync reports ETIMEDOUT
    // on work that actually SUCCEEDED. Judge the artefact, not the exit code —
    // but only forgive when the artefact is really there and non-empty.
    if (!existsSync(outPng) || statSync(outPng).size === 0) throw e;
  }
  if (!existsSync(outPng) || statSync(outPng).size === 0) {
    throw new Error(`${outPng}: chrome produced no image`);
  }

  return { W, H, viewBox: [vw, vh] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inSvg, outPng, px] = process.argv;
  if (!inSvg || !outPng) {
    console.error('usage: raster.mjs <in.svg> <out.png> [shortSidePx=2000]');
    process.exit(2);
  }
  const r = rasterise(inSvg, outPng, px ? Number(px) : 2000);
  console.log(`${outPng}  ${r.W}x${r.H}  (viewBox ${r.viewBox[0]}x${r.viewBox[1]})`);
}
