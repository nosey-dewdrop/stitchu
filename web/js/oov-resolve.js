// oov-resolve.js — SÖZLÜK-DIŞI BİR KELİMENİN TEK YARGI YERİ (M3-primitif).
//
// NEDEN AYRI BİR DOSYA. Bu yargıyı iki hat birden istiyor: fotoğraf hattı
// (vision-bridge.js, `outOfVocab` dizisi) ve prompt hattı (prompt-parse.js,
// cümlede anlaşılmayan kelimeler). İki hat aynı tabloyu ayrı ayrı okusaydı
// ikisi zamanla ayrı cevap verirdi — aynı kelimeye fotoğraftan "reddedildi",
// yazıdan "hiç" demek, dürüstlük katmanının kendisini yalancı yapardı. Yargı
// burada BİR KEZ yazılıdır; iki hat da onu çağırır.
//
// ⛔ TABLO KODA GÖMÜLMEZ. Kurallar (regex + sebep + öneri) contract/
// vision-tasima-v1.json'da, çözümler contract/vocab-resolution-v1.json'da
// durur; ikisi de contract.gen.js üzerinden ÜRETİLEREK gelir. Bu dosyada tek
// bir moda terimi yazılı değildir ve kapı (engine/tests/primitif_ifade_check.mjs)
// bunu contract'ın kendi regex'lerini kaynakta arayarak ölçer.
//
// ⛔ ÜÇÜNCÜ YOL YOK. Her kelime ya `eslendi` (bir eksen + o eksenin KATMAN 1
// primitif demeti) ya `reddedildi` (adıyla, sebep + en yakın dikilebilir öneri)
// çıkar. Sessizce düşen kelime = kullanıcıya söylenmeyen bir eksik.
import { VISION_TASIMA, PRIMITIF_COZUM } from './contract.gen.js?v=152';

/**
 * Tek bir sözlük-dışı terim için karar.
 * @param {string} term  kullanıcının/fotoğrafın kendi kelimesi
 * @param {object} [spec] varsa: eşlenen eksen bu giyside GERÇEKTEN çizildi mi
 * @returns {{term, durum:'eslendi'|'reddedildi', ...}}
 */
export function oovKarariVer(term, spec) {
  const tbl = VISION_TASIMA.oovEsleme;
  for (const rule of tbl.kurallar) {
    if (!new RegExp(rule.ara, 'i').test(term)) continue;
    if (rule.durum === 'eslendi') {
      const drawn = !!(spec && spec[rule.eksen] && spec[rule.eksen] !== 'none' &&
        spec[rule.eksen] !== 'straight' && spec[rule.eksen] !== false);
      const key = `${rule.eksen}.${rule.deger}`;
      const cozulen = PRIMITIF_COZUM[key];
      // ⭐ Cevap bir EKSEN ADINDA bitmiyor. Madde 9: ifade gücü sabit kelime
      // menüsünden değil Kenar/Panel/Dikiş primitiflerinden gelir; eşleşmenin
      // karşılığı o yüzden bir demettir. Demet bulunamazsa sessiz kalınmaz.
      return {
        term, durum: 'eslendi', kural: rule.ad, eksen: rule.eksen, deger: rule.deger,
        cozum: rule.cozum, cizildi: drawn,
        demet: cozulen ? cozulen.bundle : [],
        demetNot: cozulen ? cozulen.note : '',
        demetYok: cozulen ? null
          : `${key} contract/vocab-resolution-v1.json'da çözülmüş bir demet taşımıyor`,
      };
    }
    return { term, durum: 'reddedildi', kural: rule.ad, sebep: rule.sebep, oneri: rule.oneri };
  }
  return { term, durum: 'reddedildi', kural: 'bilinmeyen',
    sebep: tbl.bilinmeyen.sebep, oneri: tbl.bilinmeyen.oneri };
}

/**
 * ADAY TERİMLER: hangi kelimeler tabloya sorulacak.
 *
 * @param {(string|null)[]} tokens  cümlenin TAMAMI, sırasıyla (fold'lanmış).
 *        Bağlaç (stopword) yerlerinde `null` durur: 'a hood' diye bir terim
 *        tabloya sorulmasın diye — soru kullanıcının kelimesi olmalı, cümlenin
 *        dilbilgisi değil.
 * @param {number[]} bilinmeyen  tabloya sorulacak token indeksleri (cümlede
 *        hiçbir eksene bağlanamamış olanlar)
 *
 * ⚠ İKİLİLER KOMŞULUKTAN ÇIKAR, ARTIK KELİMELERİ YAN YANA DİZMEKTEN DEĞİL.
 * Ölçülmüş hata: 'welt pocket ... hood' cümlesinde 'pocket' bir eksene bağlanıp
 * listeden düşüyor, geriye 'welt' ve 'hood' kalıyordu; artıkları sırayla
 * eşleyen bir çağrı bunlardan 'welt hood' diye VAR OLMAYAN bir terim üretip
 * onu kapüşon kuralına eşliyordu. Aday artık cümledeki GERÇEK komşuluktur ve
 * komşu kelime bir eksene bağlanmış olsa bile ikiliye girebilir — 'welt pocket'
 * tam olarak böyle bir terimdir: 'pocket' çizilebilir, 'welt pocket' değildir,
 * ve kullanıcının duyması gereken cümle ikincisidir.
 * Tanınan (bilinmeyen olmayan) ikili kazanır ve iki ucunu da tüketir.
 */
export function oovAdaylari(tokens, bilinmeyen) {
  const sor = new Set(bilinmeyen);
  const tuketildi = new Set();
  const adaylar = [];
  for (const i of [...sor].sort((a, b) => a - b)) {
    if (tuketildi.has(i)) continue;
    let secildi = null;
    for (const [a, b] of [[i - 1, i], [i, i + 1]]) {
      if (a < 0 || b >= tokens.length || tuketildi.has(a) || tuketildi.has(b)) continue;
      if (!tokens[a] || !tokens[b]) continue;
      const ikili = `${tokens[a]} ${tokens[b]}`;
      if (oovKarariVer(ikili).kural !== 'bilinmeyen') { secildi = [ikili, a, b]; break; }
    }
    if (secildi) { adaylar.push(secildi[0]); tuketildi.add(secildi[1]); tuketildi.add(secildi[2]); }
    else { adaylar.push(tokens[i]); tuketildi.add(i); }
  }
  return adaylar;
}
