// KOSU/0509-a3-teslim.mjs — bir fotografin TAM teslimi:
//   graf.json + flat.svg/png + kalip-36.svg/png + kaynak-yolu.txt + dikilebilir.md
// Tek fotograf, tek komut (madde 12: toplu uretim tek komutta kosulmaz).
import { writeFileSync, existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { uret, ciz } from './0509-a3-uret.mjs';
import { png } from './0509-a3-png.mjs';

const [sha, dizin, no] = process.argv.slice(2);
if (!sha || !dizin) { console.error('kullanim: node KOSU/0509-a3-teslim.mjs <sha> <dizin> <no>'); process.exit(2); }

const r = uret(sha, dizin);
if (!r.grafYol) { console.error(JSON.stringify({ no, sha: sha.slice(0, 12), MOTOR_REDDETTI: r.motor }, null, 1)); process.exit(1); }
const c = ciz(r.opsYol, dizin, r.hedefYol);
const p = {};
for (const ad of ['flat', 'kalip-36'])
  p[ad] = c[ad].durum === 'OK' ? await png(`${dizin}/${ad}.svg`, `${dizin}/${ad}.png`, 900) : { ok: false, neden: c[ad].stderr };

// grafdogrula: kirmizi hukum sayisi
let dogrula = { durum: 'KOSMADI' };
{
  // grafdogrula kirmizi varsa exit 1 doner ama JSON'u yine stdout'a yazar: spawnSync ile exit koduna
  // bakmadan okunur (execFileSync firlatiyordu ve her kirmizi teslim "HATA" gorunuyordu — olculdu 2026-09-09).
  const d = spawnSync('engine/build/grafdogrula', [r.grafYol, 'gercek36', '--json', '--hedef', r.hedefYol], { encoding: 'utf8', maxBuffer: 64e6 });
  try {
    const j = JSON.parse(d.stdout);
    if (typeof j.kirmizi !== 'number') throw new Error('grafdogrula ciktisinda `kirmizi` alani yok');
    dogrula = { durum: 'KOSTU', kirmizi: j.kirmizi,
                fail: j.hukumler.filter((h) => !h.gecti && !h.bilgi).map((h) => `${h.kural}: ${h.hedef}`),
                hedef: j.hukumler.filter((h) => h.kural === 'hedef').map((h) => h.deger) };
  } catch (e) {
    dogrula = { durum: 'HATA', exit: d.status, stderr: String(d.stderr || e.message).trim().split('\n').slice(-2).join(' | ') };
  }
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

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (\`grafuygula\`) taban grafa bu ${r.ops.length} emri sirayla uyguladi; cizici (\`grafciz --ops\`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
${(o.opDemeti || []).map((x, i) => `| ${i + 1} | \`${x.op}\` | \`${JSON.stringify(x.args).slice(0, 160)}${JSON.stringify(x.args).length > 160 ? '…' : ''}\` | ${x.neden} |`).join('\n')}

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; \`grafuygula --hedef\` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): ${r.hedefler.length} adet.
${r.hedefler.map((h) => `- istenen: ${h.ring} / ${h.ratioTo} = ${h.ratio} (kaynak: ${h.kaynak})${h.uyari ? ` — ${h.uyari}` : ''}`).join('\n')}
${(r.motor.hedef || []).map((h) => `- motor: ${h}`).join('\n')}
${(dogrula.hedef || []).map((h) => `- dogrulayici (gercek36): ${h}`).join('\n')}
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | ${c.flat.durum} (data-ops=${sat(c.flat.dataOps)}) | ${sat(c.flat.bayt)} |
| flat.png | ${p.flat.ok ? 'OK' : 'HATA'} | ${sat(p.flat.bayt)} |
| kalip-36.svg | ${c['kalip-36'].durum} | ${sat(c['kalip-36'].bayt)} |
| kalip-36.png | ${p['kalip-36'].ok ? 'OK' : 'HATA'} | ${sat(p['kalip-36'].bayt)} |

**grafdogrula (gercek36):** ${dogrula.durum}${dogrula.kirmizi !== undefined ? ` — kirmizi hukum: **${dogrula.kirmizi}**` : ''}${dogrula.fail?.length ? ` (${dogrula.fail.join('; ')})` : ''}${dogrula.stderr ? ` (${dogrula.stderr})` : ''}

## Okunamayanlar (sessiz default YOK)

${(o.okunamayanlar || []).map((x) => `- ${x}`).join('\n')}

## Olculmedi

${(o.olculmedi || []).map((x) => `- ${x}`).join('\n')}

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

${(o.eksikPrimitif || []).map((x) => `- ${x}`).join('\n')}
`;
writeFileSync(`${dizin}/dikilebilir.md`, md);

console.log(JSON.stringify({
  no, sha: sha.slice(0, 12), girdi: o.girdiYolu, dizin,
  op: r.ops.map((x) => x.op), motor: r.motor,
  cizim: c, png: p, grafdogrula: { durum: dogrula.durum, kirmizi: dogrula.kirmizi, fail: dogrula.fail },
  celiskiSatiri: (o.celiskiTablosu || []).length,
}, null, 1));
