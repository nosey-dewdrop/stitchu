// yerel-kopru.js — SITE -> KOSU/servis.mjs. (A1, 12 Eyl 2026)
//
// NEDEN VAR. Sitenin flat kalemi (web/lib/siluet-ciz.js) bir SILUET OKUMASI
// ister; okuma bir fotografin `claude -p` ile okunmasindan cikar
// (KOSU/siluet-oku.mjs). Tarayici alt surec calistiramaz. Aradaki tek halka
// KOSU/servis.mjs'tir; bu dosya o servise giden HTTP kablosudur, baska hicbir
// sey yapmaz. Geometri yok, varsayilan yok, uydurma yok.
//
//   node KOSU/servis.mjs      ->  http://localhost:7311
//
// UCLAR (servis.mjs):
//   POST /oku            {adi, veri(base64 dataURL)} -> { is: "<id>" }
//   GET  /durum?is=<id>  { durum, adim, yuzde, not, okuma, flatSvg, kalipSvg, hata }
//
// SESSIZ VARSAYILAN YASAK. Servis ayakta degilse cagiran ERR_SERVIS_YOK alir ve
// mesajda servisin ADI ve calistirma komutu gecer. "Olmadi ama bir sey ciz" yok.

// Sayfa servis.mjs tarafindan sunuluyorsa ayni kokene konusuruz (CORS yok);
// baska bir sunucudan (python -m http.server, vercel dev) aciliyorsa 7311'e.
export const KOPRU_KOMUT = 'node KOSU/servis.mjs';

export function kopruKoku() {
  const l = globalThis.location;
  if (l && l.port === '7311') return '';           // ayni koken
  return 'http://localhost:7311';
}

/** Servis ayakta mi? Tek bir ucuz istek; ayakta degilse false. */
export async function kopruAyaktaMi() {
  try {
    const r = await fetch(kopruKoku() + '/durum?is=__yoklama__', { cache: 'no-store' });
    // 404 = servis ayakta, is yok. Iste bu yeterli kanit.
    return r.status === 404 || r.ok;
  } catch {
    return false;
  }
}

export const SERVIS_YOK_MESAJ =
  `ERR_SERVIS_YOK: yerel servis çalışmıyor — terminalde "${KOPRU_KOMUT}" çalıştır (http://localhost:7311)`;

function dataUrl(file) {
  return new Promise((coz, red) => {
    const fr = new FileReader();
    fr.onload = () => coz(fr.result);
    fr.onerror = () => red(new Error('ERR_DOSYA: fotoğraf okunamadı'));
    fr.readAsDataURL(file);
  });
}

/**
 * Fotografi servise yollar, bitene kadar /durum'u yoklar, SILUET OKUMASINI
 * dondurur. Okuma dakikalar surer; her yoklamada `ilerleme` cagrilir ki ekran
 * donmasin — gosterilen sayilar servisin KENDI alanlaridir (adim/yuzde/not),
 * burada uydurulan bir animasyon degil.
 *
 * @param {File} file
 * @param {(d:{yuzde:number,adim:string,not:string,saniye:number})=>void} ilerleme
 * @returns {Promise<{okuma:object, is:object}>}  is = servisin tam durum nesnesi
 * @throws  ERR_SERVIS_YOK / ERR_OKUYUCU / ERR_CIZIM / ... (hepsi adiyla)
 */
export async function fotograftanOkuma(file, ilerleme = () => {}) {
  const kok = kopruKoku();
  const veri = await dataUrl(file);

  let is;
  try {
    const r = await fetch(kok + '/oku', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ adi: file.name || 'girdi.png', veri }),
    });
    const j = await r.json();
    if (!r.ok || j.hata) throw new Error(j.hata || ('HTTP ' + r.status));
    is = j.is;
  } catch (e) {
    // Aga hic ulasilamadiysa sebep neredeyse her zaman "servis kapali"dir ve
    // ekranda ADIYLA yazmasi gerekir (A1 sarti 4).
    if (e instanceof TypeError) throw new Error(SERVIS_YOK_MESAJ);
    throw e;
  }

  const t0 = Date.now();
  for (;;) {
    await new Promise((r) => setTimeout(r, 1500));
    let d;
    try {
      d = await (await fetch(kok + '/durum?is=' + encodeURIComponent(is), { cache: 'no-store' })).json();
    } catch (e) {
      throw new Error(SERVIS_YOK_MESAJ + ' (okuma sürerken bağlantı koptu: ' + ((e && e.message) || e) + ')');
    }
    const saniye = Math.round((Date.now() - t0) / 1000);
    if (d.durum === 'hata') throw new Error(`[${d.adim || 'koşu'}] ${d.hata}`);
    ilerleme({ yuzde: d.yuzde || 1, adim: d.adim || '…', not: d.not || '', saniye });
    if (d.durum === 'bitti') {
      if (!d.okuma) throw new Error('ERR_OKUMA_YOK: servis bitti dedi ama okuma yollamadı');
      return { okuma: d.okuma, is: d };
    }
  }
}

/** servis.mjs'in urettigi dosyayi (flat.svg, kalip-36.png...) indirme adresi. */
export function dosyaAdresi(yol) {
  return kopruKoku() + '/dosya?yol=' + encodeURIComponent(yol);
}
