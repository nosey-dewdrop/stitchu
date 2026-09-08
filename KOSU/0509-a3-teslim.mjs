// KOSU/0509-a3-teslim.mjs — bir fotografin TAM teslimi:
//   graf.json + flat.svg/png + kalip-36.svg/png + kaynak-yolu.txt + dikilebilir.md
// Tek fotograf, tek komut (madde 12: toplu uretim tek komutta kosulmaz).
import { writeFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { uret, ciz } from './0509-a3-uret.mjs';
import { png } from './0509-a3-png.mjs';

const [sha, dizin, no] = process.argv.slice(2);
if (!sha || !dizin) { console.error('kullanim: node KOSU/0509-a3-teslim.mjs <sha> <dizin> <no>'); process.exit(2); }

const r = uret(sha, dizin);
const c = ciz(r.grafYol, dizin);
const p = {};
for (const ad of ['flat', 'kalip-36'])
  p[ad] = c[ad].durum === 'OK' ? await png(`${dizin}/${ad}.svg`, `${dizin}/${ad}.png`, 900) : { ok: false, neden: c[ad].stderr };

// grafdogrula: kirmizi hukum sayisi
let dogrula = { durum: 'KOSMADI' };
try {
  const out = execFileSync('engine/build/grafdogrula', [r.grafYol, 'gercek36', '--json'], { encoding: 'utf8' });
  const j = JSON.parse(out);
  dogrula = { durum: 'KOSTU', kirmizi: (j.kirmizi ?? j.hukumler?.filter?.((h) => h.durum === 'FAIL')?.length ?? 0), ham: j };
} catch (e) {
  dogrula = { durum: 'HATA', stderr: String(e.stderr || e.message).trim().split('\n').slice(-2).join(' | ') };
}

const o = r.okuma;
const sat = (x) => (x == null ? '-' : x);
const md = `# ${no}. ${o.girdiYolu.split('/').pop()} — dikilebilir mi?

**Kaynak fotograf:** \`${o.girdiYolu}\` (sha ${sha.slice(0, 12)})
**Gorunum:** ${o.gorunum} · **Arka:** ${o.arka?.koken}${o.arka?.koken === 'turetildi' ? ' (TURETILDI, fotograftan degil)' : ' (fotograftan)'}
**Okuyan:** ${o.okuyan} — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
${o.paneller.map((x) => `| panel \`${x.id}\` | ${x.gorulduMu ? 'GORULDU' : 'gorulmedi (tabandan)'} — ${x.kanit} | ${x.guven} |`).join('\n')}
${o.kenarlar.map((x) => `| kenar \`${x.panel}/${x.kenar}\` | ${x.landmarkUst}..${x.landmarkAlt} oraninda **${x.oran}**, ${x.bicim}${x.buzguAraligi ? `, buzgu [${x.buzguAraligi}]` : ''} | ${x.guven} |`).join('\n')}
${o.dikisler.map((x) => `| dikis \`${x.id}\` | ${x.a} ↔ ${x.b}, oran [${x.oranAralik}]${x.gorunurMu ? '' : ' (GORUNMUYOR, cikarim)'} | ${x.guven} |`).join('\n')}
| kapanma | ${o.kapanma.yer} / ${o.kapanma.tur} | ${o.kapanma.guven} |
| simetri | cfAyna ${o.simetri.cfAyna}, cbAyna ${o.simetri.cbAyna} | ${o.simetri.guven} |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
${(o.celiskiTablosu || []).map((x) => `| ${x.kalem} | ${x.claude} | ${x.olcum} | **${x.kazanan}** (${x.kaynak}) | ${x.sonuc} |`).join('\n') || '| — | — | — | — | tablo BOS; olculmedi[] bak |'}

## Motora ne gecti?

Okuma dili (fotograf) ile motorun op sozlugu ayni sey degil. Ceviri ve **cevrilemeyenler**:

| okuma op'u | motor op'u | not |
|---|---|---|
${r.uygulanan.map((x, i) => `| — | \`${x.op}\` | ${JSON.stringify(x.args)} |`).join('\n')}
${r.cevrilemeyen.map((x) => `| \`${x.okumaOp}\` | **YOK** | ${x.neden} — dogduran okuma: ${x.dogduran} |`).join('\n')}

**Cozucu hedefi** (grafa YAZILMAZ, contract yasa 3): ${r.hedefler.length} adet.
${r.hedefler.map((h) => `- ${h.ring} / ${h.ratioTo} = ${h.ratio} (kaynak: ${h.kaynak})${h.uyari ? ` — ${h.uyari}` : ''}`).join('\n')}

**Landmark kaybi** (motor ara noktaya baglanamiyor, en yakin landmark secildi):
${r.kayiplar.map((k) => `- \`${k.op}\`: ${k.kayip}`).join('\n') || '- yok'}

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | ${c.flat.durum} | ${sat(c.flat.bayt)} |
| flat.png | ${p.flat.ok ? 'OK' : 'HATA'} | ${sat(p.flat.bayt)} |
| kalip-36.svg | ${c['kalip-36'].durum} | ${sat(c['kalip-36'].bayt)} |
| kalip-36.png | ${p['kalip-36'].ok ? 'OK' : 'HATA'} | ${sat(p['kalip-36'].bayt)} |

**grafdogrula (gercek36):** ${dogrula.durum}${dogrula.kirmizi !== undefined ? ` — kirmizi hukum: ${dogrula.kirmizi}` : ''}${dogrula.stderr ? ` (${dogrula.stderr})` : ''}

## Okunamayanlar (sessiz default YOK)

${(o.okunamayanlar || []).map((x) => `- ${x}`).join('\n')}

## Olculmedi

${(o.olculmedi || []).map((x) => `- ${x}`).join('\n')}

## Motorun op sozlugunde KARSILIGI OLMAYANLAR

${(o.eksikOp || []).map((x) => `- ${x}`).join('\n')}
`;
writeFileSync(`${dizin}/dikilebilir.md`, md);

console.log(JSON.stringify({
  no, sha: sha.slice(0, 12), girdi: o.girdiYolu, dizin,
  uygulanan: r.uygulanan.map((x) => x.op), cevrilemeyen: r.cevrilemeyen.length,
  cizim: c, png: p, grafdogrula: { durum: dogrula.durum, kirmizi: dogrula.kirmizi },
  celiskiSatiri: (o.celiskiTablosu || []).length,
}, null, 1));
