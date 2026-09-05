// 0509-kapi-tablo.mjs — kapi.sh JSON'unu Damla'nin EKRANDA bakacagi tabloya cevirir (A1a).
//
// NEDEN VAR. kapi.sh cikti sozlesmesi geregi yalniz JSON basar (makine icin).
// Kosu kurali 1: "teslim ekranda bakilacak png; gorselsiz adim bitmemis".
// Bu dosya o JSON'u SVG tabloya, sonra KOSU/uret.mjs'in kanitli Chrome yolu ile
// PNG'ye cevirir. HIC ESIK/HUKUM URETMEZ: yalniz kapi.sh'in bastigini cizer.
//
//   node engine/tests/0509-kapi-tablo.mjs <kapi.json> <cikti.svg> [<cikti.png>]
//
// Chrome yoksa PNG atlanir, SVG yine yazilir (ve sebep basilir).

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync, spawn } from 'node:child_process'

const [, , jsonYol, svgYol, pngYol] = process.argv
if (!jsonYol || !svgYol) {
  console.error('kullanim: node engine/tests/0509-kapi-tablo.mjs <kapi.json> <cikti.svg> [<cikti.png>]')
  process.exit(2)
}

const d = JSON.parse(readFileSync(jsonYol, 'utf8'))
if (d.hata) { console.error(`kapi bozuk: ${d.hata}`); process.exit(3) }

// renk: durum -> (dolgu, metin). Kirmizi/crash ayni ailede, crash daha koyu.
const RENK = {
  YESIL:       ['#e7f4ec', '#186a3b'],
  KIRMIZI:     ['#fdeaea', '#a02020'],
  CRASH:       ['#f6d5d5', '#6b0f0f'],
  'HENUZ-YOK': ['#f2f2ef', '#6b6b63'],
}

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
const kirp = (s, n) => { const t = String(s ?? ''); return t.length > n ? t.slice(0, n - 1) + '…' : t }
const say = (v) => (v === null || v === undefined ? '—' : String(v))

const W = 1180, SATIR = 30, UST = 128, ALT = 54
const H = UST + d.gecitler.length * SATIR + ALT

// sutunlar: ad, durum, sayi, esik, kaynak(esigin geldigi satir), not
const X = { ad: 24, durum: 300, sayi: 418, esik: 486, kaynak: 560, not: 862 }

const satirlar = d.gecitler.map((g, i) => {
  const y = UST + i * SATIR
  const [dolgu, yazi] = RENK[g.durum] || ['#f2f2ef', '#333']
  return `  <g>
    <rect x="12" y="${y}" width="${W - 24}" height="${SATIR - 4}" fill="${i % 2 ? '#fbfbfa' : '#ffffff'}"/>
    <text x="${X.ad}" y="${y + 19}" class="ad">${esc(g.ad)}</text>
    <rect x="${X.durum}" y="${y + 4}" width="98" height="${SATIR - 12}" rx="3" fill="${dolgu}"/>
    <text x="${X.durum + 49}" y="${y + 19}" class="durum" fill="${yazi}" text-anchor="middle">${esc(g.durum)}</text>
    <text x="${X.sayi + 40}" y="${y + 19}" class="sayi" text-anchor="end">${esc(say(g.sayi))}</text>
    <text x="${X.esik + 40}" y="${y + 19}" class="sayi" text-anchor="end">${esc(say(g.esik))}</text>
    <text x="${X.kaynak}" y="${y + 19}" class="kaynak">${esc(kirp(g.kaynak, 44))}</text>
    <text x="${X.not}" y="${y + 19}" class="not">${esc(kirp(g.not, 46))}</text>
  </g>`
}).join('\n')

const hukum = d.gecitYesil ? 'GECTI' : 'KALMADI'
const hukumRenk = d.gecitYesil ? '#186a3b' : '#a02020'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>
    text { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; }
    .baslik { font-size: 21px; font-weight: 600; fill: #1a1a18; }
    .altbaslik { font-size: 12.5px; fill: #6b6b63; }
    .hukum { font-size: 15px; font-weight: 600; }
    .sutun { font-size: 10.5px; font-weight: 600; fill: #8a8a80; letter-spacing: .06em; }
    .ad { font-size: 12.5px; fill: #1a1a18; font-family: ui-monospace, Menlo, monospace; }
    .durum { font-size: 10.5px; font-weight: 600; letter-spacing: .04em; }
    .sayi { font-size: 12px; fill: #3a3a36; font-family: ui-monospace, Menlo, monospace; }
    .kaynak { font-size: 10.5px; fill: #6b6b63; font-family: ui-monospace, Menlo, monospace; }
    .not { font-size: 10.5px; fill: #5a5a54; }
    .ayak { font-size: 10.5px; fill: #8a8a80; }
  </style>
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <text x="24" y="36" class="baslik">0509 koşusu — geçit tablosu</text>
  <text x="24" y="56" class="altbaslik">commit ${esc(d.commit)} · ${esc(d.tarih)} · ${d.gecitSayisi} geçit · ${d.kirmiziSayisi} kırmızı · ${d.henuzYok.length} henüz-yok</text>
  <text x="24" y="80" class="hukum" fill="${hukumRenk}">${hukum}</text>
  <text x="${24 + 78}" y="80" class="altbaslik">eşikler contract/ ve *-baseline.json'dan okunur; koda gömülü eşik yok</text>
  <line x1="12" y1="98" x2="${W - 12}" y2="98" stroke="#e3e3de"/>
  <text x="${X.ad}" y="118" class="sutun">GEÇİT</text>
  <text x="${X.durum}" y="118" class="sutun">DURUM</text>
  <text x="${X.sayi + 40}" y="118" class="sutun" text-anchor="end">SAYI</text>
  <text x="${X.esik + 40}" y="118" class="sutun" text-anchor="end">EŞİK</text>
  <text x="${X.kaynak}" y="118" class="sutun">EŞİĞİN KAYNAĞI</text>
  <text x="${X.not}" y="118" class="sutun">NOT</text>
${satirlar}
  <line x1="12" y1="${UST + d.gecitler.length * SATIR + 2}" x2="${W - 12}" y2="${UST + d.gecitler.length * SATIR + 2}" stroke="#e3e3de"/>
  <text x="24" y="${UST + d.gecitler.length * SATIR + 24}" class="ayak">HENÜZ-YOK kırmızı sayılmaz; state.json ilkYeşil'de kayıtlı bir geçidin yokluğu kırmızıdır. CRASH = alt süreç çöktü (araç onarımı, eşik gevşetme değil).</text>
  <text x="24" y="${UST + d.gecitler.length * SATIR + 40}" class="ayak">alt süreç çıktısı: ${esc(d.log)} · üreten: bash engine/tests/0509-kapi.sh | node engine/tests/0509-kapi-tablo.mjs</text>
</svg>
`

mkdirSync(dirname(svgYol), { recursive: true })
writeFileSync(svgYol, svg)
console.log(`svg: ${svgYol} (${d.gecitler.length} satir)`)

// ---------------------------------------------------------------- png (KOSU/uret.mjs'in kanitli yolu)
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const bekle = (ms) => new Promise((r) => setTimeout(r, ms))

async function png(svgPath, pngPath, w, h) {
  if (!existsSync(CHROME)) { console.log('png atlandi: Chrome yok'); return false }
  const dir = join(tmpdir(), `kapi-tablo-${Math.random().toString(36).slice(2)}`)
  mkdirSync(dir, { recursive: true })
  execFileSync('cp', [svgPath, join(dir, 'a.svg')])
  writeFileSync(join(dir, 'i.html'),
    `<html><body style="margin:0;background:#fff"><img src="a.svg" style="width:${w}px;display:block"></body></html>`)
  rmSync(pngPath, { force: true })
  // izole --user-data-dir: acik duran kullanici Chrome'unun SingletonLock'una takilmasin
  // (KOSU/uret.mjs:74'te olculdu). Kapanmayan Chrome icin poll+SIGKILL, ayni dosyada gerekcesi var.
  const cp = spawn(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
    `--user-data-dir=${dir}/profil`,
    `--screenshot=${pngPath}`, `--window-size=${w},${h}`,
    '--no-sandbox', '--default-background-color=FFFFFF', `file://${dir}/i.html`],
    { stdio: 'ignore' })
  let cikti = false
  cp.on('exit', () => { cikti = true })
  const TAVAN = 90000, ADIM = 100
  let onceki = -1, sabit = 0, ok = false
  for (let t = 0; t < TAVAN && !cikti; t += ADIM) {
    await bekle(ADIM)
    let boy = 0
    try { boy = statSync(pngPath).size } catch { boy = 0 }
    if (boy > 0 && boy === onceki) sabit++; else sabit = 0
    onceki = boy
    if (sabit >= 2) { ok = true; break }
  }
  if (!cikti) { try { cp.kill('SIGKILL') } catch {} }
  if (!ok) { try { ok = statSync(pngPath).size > 0 } catch { ok = false } }
  if (!cikti) await Promise.race([new Promise((r) => cp.once('exit', r)), bekle(5000)])
  try { rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }) }
  catch (e) { console.log(`temp dizin silinemedi (${e.code}): ${dir}`) }
  return ok
}

if (pngYol) {
  const ok = await png(svgYol, pngYol, W, H)
  console.log(ok ? `png: ${pngYol}` : `png YAZILAMADI: ${pngYol}`)
  process.exit(ok ? 0 : 1)
}
