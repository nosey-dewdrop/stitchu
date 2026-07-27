import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
const [,, inp, outp, wArg] = process.argv;
const svg = fs.readFileSync(inp, 'utf8');
const r = new Resvg(svg, { fitTo: { mode: 'width', value: parseInt(wArg||'800') }, background: 'white' });
fs.writeFileSync(outp, r.render().asPng());
console.log('png:', outp);
