// Studio E2E (verifier arm): live site -> enter measurements -> click PDF
// button -> capture the print document exactly as the browser's Save-as-PDF
// would encode it (page.pdf = Chrome's print path, prefer CSS page size).
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'https://stitchu.noseydewdrop.com/studio.html';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
const t0 = Date.now();
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

// 1. wait for the first draft (wasm warm + regenerate)
await page.waitForFunction(() => {
  const s = document.getElementById('status');
  const b = document.getElementById('dl-pdf');
  return s && /re-evaluated/.test(s.textContent) && b && !b.disabled;
}, { timeout: 60000 });
const status0 = await page.$eval('#status', (e) => e.textContent);
const recipe0 = await page.$eval('#recipe-select', (e) => e.selectedOptions[0].textContent);
console.log(`LOADED (${Date.now()-t0} ms)  recipe: ${recipe0}`);
console.log(`  default: ${status0}`);

// 2. enter custom measurements (pear-ish body) — real keystrokes on the inputs
const meas = { bust: 96, waist: 70, hip: 116 };
for (const [k, v] of Object.entries(meas)) {
  const sel = `#m-${k}`;
  if (!(await page.$(sel))) { console.log(`  (no input ${sel}, skipped)`); continue; }
  await page.click(sel, { clickCount: 3 });
  await page.type(sel, String(v));
}
await page.waitForFunction((s0) => {
  const s = document.getElementById('status');
  const b = document.getElementById('dl-pdf');
  return s && /re-evaluated/.test(s.textContent) && b && !b.disabled;
}, { timeout: 20000 }, status0);
await new Promise((r) => setTimeout(r, 500)); // let the last rAF regen settle
const status1 = await page.$eval('#status', (e) => e.textContent);
const measBack = await page.evaluate(() => ({
  bust: document.getElementById('m-bust')?.value,
  waist: document.getElementById('m-waist')?.value,
  hip: document.getElementById('m-hip')?.value,
}));
console.log(`AFTER MEASUREMENTS ${JSON.stringify(measBack)}: ${status1}`);

// 3. stub window.print, click the button, verify the print DOM exists
await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
await page.click('#dl-pdf');
await page.waitForFunction(() => window.__printed > 0 && document.getElementById('print-root'), { timeout: 15000 });
const printInfo = await page.evaluate(() => {
  const root = document.getElementById('print-root');
  const pages = root.querySelectorAll('.print-page').length;
  const svgs = root.querySelectorAll('svg').length;
  const cover = root.querySelector('.print-title')?.textContent || '';
  return { pages, svgs, cover };
});
console.log(`PRINT DOM: window.print called, ${printInfo.pages} print pages, ${printInfo.svgs} svg blocks, cover: "${printInfo.cover}"`);

// 4. encode exactly like Save-as-PDF (Chrome print path, CSS @page A4 10mm)
const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, scale: 1 });
writeFileSync('/tmp/satis-verify/studio-e2e.pdf', pdf);
console.log(`PDF CAPTURED: /tmp/satis-verify/studio-e2e.pdf  ${pdf.length} bytes`);
await browser.close();
