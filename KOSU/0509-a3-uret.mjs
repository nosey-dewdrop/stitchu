// KOSU/0509-a3-uret.mjs — A3 URETICI (2026-09-09, Damla karari: motor taban + PRIMITIF EMIR LISTESI).
//
// HAT: KOSU/onbellek/<sha>.json (vision-graf-v1 okumasi; opDemeti = graf-v1 primitifleri)
//        -> ops.json (yalniz {op,args}; 'neden' okumada kalir)
//        -> engine/build/grafuygula taban ops.json  -> graf.json   (motor uygular)
//        -> engine/build/grafciz taban --ops ops.json  -> flat.svg / kalip-36.svg (motor ops SONRASI cizer)
//
// Bu dosyada CEVIRI YOK: okuma dogrudan primitif konusur (contract/vision-graf-v1.json yasa 9). Bir op motor
// tarafindan reddedilirse teslim DUSER ve nedeni adiyla raporlanir; sessiz atlama, JS'te geometri yok.
// Op'suz cizim yok: grafciz --ops bos listeyi ERR_NO_OPS ile reddeder (kirmizi).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const TABAN = 'KOSU/ciktilar/graf-ilk/graf.json';

export function uret(sha, cikisDizin) {
  const okuma = JSON.parse(readFileSync(`KOSU/onbellek/${sha}.json`, 'utf8'));
  mkdirSync(cikisDizin, { recursive: true });
  const ops = (okuma.opDemeti || []).map((o) => ({ op: o.op, args: o.args }));
  const opsYol = `${cikisDizin}/ops.json`;
  writeFileSync(opsYol, JSON.stringify(ops, null, 1) + '\n');

  // hedefler[] (siluet orani, vision-graf-v1 yasa 3): op degil, cozucu hedefi. grafuygula --hedef bunu ops SONRASI
  // halka bolluguna cevirir (contract cozucu.hedef siniri; kirpilma ve sapma notes + dikilebilir.md'de). Beden gercek36:
  // kalip bedeni; croquis flat kumas bollugu tasimaz (body-v1 kumasBollugu), hedef orada yalniz olculur.
  const hedefYol = `${cikisDizin}/hedefler.json`;
  writeFileSync(hedefYol, JSON.stringify(okuma.hedefler || [], null, 1) + '\n');
  const grafYol = `${cikisDizin}/graf.json`;
  const r = spawnSync('engine/build/grafuygula', [TABAN, opsYol, '--id', `foto-${sha.slice(0, 8)}`, '--hedef', hedefYol, '--beden', 'gercek36'], { encoding: 'utf8', maxBuffer: 64e6 });
  const motor = { exit: r.status, stderr: String(r.stderr || '').trim().split('\n').slice(-2).join(' | '),
                  hedef: String(r.stderr || '').split('\n').filter((l) => l.startsWith('hedef: ')).map((l) => l.slice(7)) };
  if (r.status !== 0) {
    // graf YAZILMAZ; eski graf.json varsa bayatlamasin diye silinmez, raporda adiyla durur
    return { okuma, opsYol, hedefYol, grafYol: null, ops, motor, hedefler: okuma.hedefler || [] };
  }
  writeFileSync(grafYol, r.stdout);
  writeFileSync(`${cikisDizin}/kaynak-yolu.txt`,
    `${okuma.girdiYolu}\nsha256 ${sha}\ngorunum ${okuma.gorunum}\n`
    + `okuyan ${okuma.okuyan} (llmCagri 0)\narka.koken ${okuma.arka?.koken}\n`
    + `cizim taban+ops (${ops.length} primitif emir; ${TABAN} + ops.json -> grafuygula/grafciz --ops)\n`
    + `hedef ${(okuma.hedefler || []).length} siluet orani -> grafuygula/grafciz --hedef hedefler.json (bolluk mm, sinir kirpmasi notes'ta)\n`);
  return { okuma, opsYol, hedefYol, grafYol, ops, motor, hedefler: okuma.hedefler || [] };
}

export function ciz(opsYol, cikisDizin, hedefYol = null) {
  const c = {};
  for (const [ad, body, mod] of [['flat', 'croquis36', 'flat'], ['kalip-36', 'gercek36', 'kalip']]) {
    try {
      const svg = execFileSync('engine/build/grafciz', [TABAN, '--ops', opsYol, ...(hedefYol ? ['--hedef', hedefYol] : []), body, mod], { encoding: 'utf8', maxBuffer: 64e6, stdio: ['ignore', 'pipe', 'pipe'] });
      writeFileSync(`${cikisDizin}/${ad}.svg`, svg);
      const m = /data-ops="(\d+)"/.exec(svg);
      c[ad] = { durum: 'OK', bayt: svg.length, dataOps: m ? Number(m[1]) : null };
    } catch (err) {
      c[ad] = { durum: 'HATA', stderr: String(err.stderr || err.message).trim().split('\n').slice(-3).join(' | ') };
    }
  }
  return c;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [sha, dizin] = process.argv.slice(2);
  if (!sha || !dizin) { console.error('kullanim: node KOSU/0509-a3-uret.mjs <sha256> <cikisDizin>'); process.exit(2); }
  const r = uret(sha, dizin);
  const c = r.grafYol ? ciz(r.opsYol, dizin, r.hedefYol) : { flat: { durum: 'KOSMADI' }, 'kalip-36': { durum: 'KOSMADI' } };
  console.log(JSON.stringify({ sha: sha.slice(0, 12), girdi: r.okuma.girdiYolu, cikis: dizin, op: r.ops.map((o) => o.op), motor: r.motor, hedefler: r.hedefler.length, cizim: c }, null, 1));
  process.exit(r.grafYol ? 0 : 1);
}
