// vision-siluet.js — KAYNAK (b): giysi silueti -> ORANLAR (A3, 2026-09-08).
//
// NE OLCER. Fotograftaki giysinin dis hattini (siluet) bulur ve ondan yalniz
// ORAN uretir: etek boyu / kol boyu / genislik, hepsi landmark'a gore oran.
// MUTLAK MM URETMEZ ve uretemez — fotografta olcek yoktur (contract/vision-graf-v1.json
// yasa 2). Bir piksel sayisi tek basina hicbir sey soylemez; anlam yalniz iki
// olcunun ORANINDADIR.
//
// NEDEN ORAN, SAYI DEGIL. Ayni elbisenin iki cekimi arasinda piksel boyu 2 kat
// degisebilir (kadraj); omuz genisligine BOLUNMUS boy ikisinde de aynidir. Bu
// yuzden her cikti bir bolme sonucudur ve payi/paydasi adiyla yazilir.
//
// ORANLAR GRAFA DOGRUDAN YAZILMAZ (yasa 3). Buradan cikan sayi A2 kisit
// cozucusune HEDEF olarak girer; cozucu dikis esitligini korur ve en yakin orani
// bulur. Sapma olculur, onizleme (A5) gosterir.
//
// TARAYICI + NODE. Ayni dosya iki yerde de kosar: tarayicida <canvas>, node'da
// cagiran taraf {width,height,data} veren bir nesne gecirir (RGBA, 4 bayt/piksel).
// Piksel okuma disinda DOM'a dokunmaz.

// -------------------------------------------------------------- esik
// Arka plan, kosede oturan pikselden OLCULUR, sabit degil: bu fotograflarda arka
// plan gri (muze), beyaz (duvar) ya da krem (asili) olabiliyor. Dort koseden
// medyan alinir; giysi kosede duruyorsa (nadir) siluet buyur ve orani bozardi,
// bu yuzden dort kose birbirinden 40'tan fazla ayrisiyorsa OLCULEMEDI dondurur.
// OLCULEN ARIZA (2026-09-08): dort koseden tek bir renk almak bu fotograf
// setinin YARISINI reddediyordu — muze cekimlerinin arka plani DUZ DEGIL,
// yumusak bir gradyan/vinyet (mary-quant-O1454732 kose dagilimi 61, ossie-clark
// 83, mary-quant-O365926 106). Tek renk + tek esik boyle bir zeminde ya giysiyi
// yutuyor ya zemini giysi sayiyor.
//
// DUZELTME: arka plan artik SATIR BASINA olculur. Her satirin en sol ve en sag
// kSerit pikselinin medyani o satirin zemin rengidir; gradyan dikeyde de yatayda
// da yavas degistigi icin satir yerel zemini gercek zemine cok yakindir.
// "guvenilir" olcutu de degisti: mutlak renk yayilimi degil, satir icindeki
// SOL-SAG farki — sol ve sag seritler birbirinden cok ayrisiyorsa (yani zemin
// yatayda hizli degisiyorsa) o fotograf gercekten okunamaz.
const kSerit = 10;
export function arkaPlanRengi(im) {
  const { width: w, height: h, data } = im;
  const oku = (x, y) => { const i = (y * w + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
  const medyan = (a) => { a = a.slice().sort((p, q) => p - q); return a[a.length >> 1]; };
  const satirRenk = new Array(h);
  let enBuyukFark = 0;
  const farklar = [];
  for (let y = 0; y < h; y++) {
    const sol = [[], [], []], sag = [[], [], []];
    for (let k = 0; k < kSerit; k++) {
      const a = oku(k, y), b = oku(w - 1 - k, y);
      for (let c = 0; c < 3; c++) { sol[c].push(a[c]); sag[c].push(b[c]); }
    }
    const ms = sol.map(medyan), mg = sag.map(medyan);
    const fark = Math.hypot(ms[0] - mg[0], ms[1] - mg[1], ms[2] - mg[2]);
    farklar.push(fark);
    if (fark > enBuyukFark) enBuyukFark = fark;
    satirRenk[y] = [(ms[0] + mg[0]) / 2, (ms[1] + mg[1]) / 2, (ms[2] + mg[2]) / 2];
  }
  farklar.sort((a, b) => a - b);
  const ortancaFark = farklar[farklar.length >> 1];
  // genel (geriye donuk) renk: butun satirlarin ortalamasi
  const renk = [0, 1, 2].map((c) => satirRenk.reduce((s, r) => s + r[c], 0) / h);

  // ---- VINYET OLCUMU (2026-09-08, overlay ile bulundu).
  // Satir-yerel zemin modeli, zeminin bir satir BOYUNCA (yatayda) yavas degistigini
  // varsayar. Radyal vinyette bu varsayim yanlistir: kose koyu, kenar ortasi acik,
  // ve fark satirin KENDI seritlerinden GORULMEZ (iki uc da ayni koyulukta).
  // Olcum: ust ve alt kenar seritlerinin ORTA noktasi ile KOSE noktasi arasindaki
  // fark. Duz zeminde ~0; vinyette buyuk. Bu, kendi modelimin gecerliligini olcen
  // bir testtir — esigi gecerse fotograf "okunamadi" olur, uydurma sayi uretilmez.
  const kenarOrta = (y) => {
    const xs = [Math.floor(w * 0.5) - 5, Math.floor(w * 0.5) + 5];
    const c = [0, 0, 0];
    for (const x of xs) { const p = oku(x, y); for (let k = 0; k < 3; k++) c[k] += p[k] / xs.length; }
    return c;
  };
  let vinyet = 0;
  for (const y of [4, h - 5]) {
    const kose = oku(6, y), om = kenarOrta(y);
    vinyet = Math.max(vinyet, Math.hypot(kose[0] - om[0], kose[1] - om[1], kose[2] - om[2]));
  }
  // VINYET SAYISI RET SEBEBI DEGIL — OLCULDU ve YANLIS CIKTI (2026-09-08).
  // Vinyet esigi (45) once ret olcutu yapildi; overlay ile karsilastirilinca
  // TERS calistigi gorüldü: siluetin GORSEL OLARAK dogru izledigi biba-O1194418
  // vinyet 61.5 ile reddediliyor, siluetin vinyeti izledigi mary-quant-O1454732
  // vinyet 39.6 ile geciyordu. Yani bu sayi "zemin duz mu" sorusunu olcuyor,
  // "siluet giysiyi izliyor mu" sorusunu DEGIL — ve karar verilmesi gereken soru
  // ikincisi. Sayi bilgi olarak KALIR (zeminVinyet), hukum TASIMAZ.
  // Hukum artik overlay'e bakan insan/ajan tarafindan verilir (kaliteElle),
  // uydurma bir esikle degil.
  return {
    renk, satirRenk, dagilim: ortancaFark, enBuyukFark, vinyet,
    guvenilir: ortancaFark <= 40,
    neden: ortancaFark > 40 ? `zemin yatayda hizli degisiyor (sol-sag farki ${ortancaFark.toFixed(1)} > 40)` : null,
  };
}

// Her satirda giysi pikselinin en sol/en sag sinirini bulur.
// "Giysi pikseli" = arka plan renginden esikten UZAK piksel. Esik dagilimdan
// turetilir (dagilim + 30), sabit degil.
export function siluetSatirlari(im, opt = {}) {
  const { width: w, height: h, data } = im;
  const bg = opt.bg || arkaPlanRengi(im);
  const esik = opt.esik ?? Math.max(38, bg.dagilim + 30);
  const satirlar = new Array(h);
  for (let y = 0; y < h; y++) {
    // zemin rengi SATIR BASINA (gradyan icin); yoksa genel renge duser
    const [br, bgc, bb] = (bg.satirRenk && bg.satirRenk[y]) || bg.renk;
    let sol = -1, sag = -1, sayi = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const d = Math.hypot(data[i] - br, data[i + 1] - bgc, data[i + 2] - bb);
      if (d > esik) { if (sol < 0) sol = x; sag = x; sayi++; }
    }
    satirlar[y] = { y, sol, sag, genislik: sol < 0 ? 0 : sag - sol + 1, sayi };
  }
  return { satirlar, esik, bg };
}

// Gurultu temizligi: bir satirin genisligi komsularinin medyanindan cok
// ayrisiyorsa (etiket, askı, tripod ayagi) o satir DUSURULUR ve adiyla sayilir.
// Silme degil ISARETLEME: dusen satir sayisi cikitida durur.
export function temizle(satirlar, pencere = 9) {
  const n = satirlar.length;
  const out = satirlar.map((s) => ({ ...s, dusuk: false }));
  const yari = pencere >> 1;
  for (let y = 0; y < n; y++) {
    const pen = [];
    for (let d = -yari; d <= yari; d++) {
      const j = y + d;
      if (j >= 0 && j < n && satirlar[j].genislik > 0) pen.push(satirlar[j].genislik);
    }
    if (pen.length < 3) continue;
    pen.sort((a, b) => a - b);
    const med = pen[pen.length >> 1];
    if (med > 0 && satirlar[y].genislik > med * 2.2) out[y].dusuk = true;
  }
  return out;
}

// -------------------------------------------------------------- ayak/aski kesimi
// OLCULEN ARIZA (2026-09-08, biba-O1194418): siluetin en alt satirlari giysi
// DEGIL, mankenin AYAGIDIR (tripod borusu). Kesilmezse "etek ucu genisligi"
// boruyu olcer: profil 0.8'de 455 px iken 0.98'de 204 px'e dusuyordu ve A form
// etek "daralan" gorunuyordu — sayi yanlis, isaret bile ters.
//
// KESME KURALI. En alttan yukari bakmak YETMEZ (ilk denemede boyle yazildi ve
// OLCULEREK duzeltildi): tripodun TABANI genistir, borusu degil. biba-O1194418'de
// alt satir 606 px (taban), ustundeki boru 28 px, giysinin etek ucu 441 px.
// Alttan yukari "dar oldugu surece kes" kurali taban satirinda hemen durur ve
// hicbir sey kesmez.
//
// DOGRU KURAL: giysinin altinda bir BOGAZ (govde medyaninin kSapPayi'sindan dar
// kesintisiz bant) ara; boyle bir bogaz varsa giysi onun USTUNDE biter ve bogazin
// BASLADIGI satirdan asagisi kesilir — bogaz da altindaki taban da gider.
// Bogaz giysinin ust yarisinda aranmaz (bel dar olabilir): yalniz %55'ten asagi.
// Kesilen satir sayisi ciktida ADIYLA durur; sessiz kirpma yok.
const kSapPayi = 0.45;    // govde medyaninin %45'inden dar = sap/bogaz
const kSapEnAz = 8;       // en az bu kadar satir kesintisiz dar olmali (tek satirlik gurultu degil)
export function sapKes(dolu) {
  if (dolu.length < 20) return { kesik: dolu, kesilen: 0, sapY: null };
  const gen = dolu.map((s) => s.genislik).slice().sort((a, b) => a - b);
  const med = gen[gen.length >> 1];
  const esik = med * kSapPayi;
  const n = dolu.length;
  // asagidan yukari tara, dar bantlarin EN USTTEKI baslangicini bul (alt yaride)
  let bogazBas = -1;
  let i = n - 1;
  while (i >= Math.floor(n * 0.55)) {
    if (dolu[i].genislik < esik) {
      let j = i;
      while (j >= 0 && dolu[j].genislik < esik) j--;
      if (i - j >= kSapEnAz) bogazBas = j + 1;   // bandin en ust satiri
      i = j;
    } else i--;
  }
  if (bogazBas < 0) return { kesik: dolu, kesilen: 0, sapY: null, esikPx: Number(esik.toFixed(1)) };
  const kesilen = n - bogazBas;
  // Guvenlik: giysinin %40'indan fazlasi "sap" cikiyorsa olcum SUPHELIDIR, kesme.
  if (kesilen > n * 0.4) return { kesik: dolu, kesilen: 0, sapY: null, supheli: true, esikPx: Number(esik.toFixed(1)) };
  return { kesik: dolu.slice(0, bogazBas), kesilen, sapY: dolu[bogazBas].y, esikPx: Number(esik.toFixed(1)) };
}

// Ayni bogaz kurali YUKARIDAN: mankenin basi/boynu. Boyun bogazi giysinin ust
// %35'inde aranir (giysinin kendi beli daha asagidadir ve kesilmemelidir).
export function basKes(dolu) {
  if (dolu.length < 20) return { kesik: dolu, kesilen: 0, basY: null };
  const gen = dolu.map((s) => s.genislik).slice().sort((a, b) => a - b);
  const med = gen[gen.length >> 1];
  const esik = med * kSapPayi;
  const n = dolu.length;
  let bogazSon = -1;
  let i = 0;
  while (i <= Math.floor(n * 0.35)) {
    if (dolu[i].genislik < esik) {
      let j = i;
      while (j < n && dolu[j].genislik < esik) j++;
      if (j - i >= kSapEnAz) bogazSon = j;     // bandin altindaki ilk satir
      i = j;
    } else i++;
  }
  if (bogazSon < 0) return { kesik: dolu, kesilen: 0, basY: null, esikPx: Number(esik.toFixed(1)) };
  if (bogazSon > n * 0.4) return { kesik: dolu, kesilen: 0, basY: null, supheli: true, esikPx: Number(esik.toFixed(1)) };
  return { kesik: dolu.slice(bogazSon), kesilen: bogazSon, basY: dolu[bogazSon].y, esikPx: Number(esik.toFixed(1)) };
}

// -------------------------------------------------------------- oranlar
// Giysinin dikey uzanimini bulur (ilk ve son dolu satir), sonra istenen
// yuksekliklerde genislik okur. HER CIKTI BIR ORANDIR: payi ve paydasi adiyla.
export function oranlar(im, opt = {}) {
  const { satirlar, esik, bg } = siluetSatirlari(im, opt);
  if (!bg.guvenilir) {
    return { hukum: 'OLCULEMEDI', kalite: 'GUVENILMEZ', neden: bg.neden || 'zemin modeli gecersiz', olcutler: { zeminSolSagFarki: Number(bg.dagilim.toFixed(1)), zeminVinyet: Number(bg.vinyet.toFixed(1)) } };
  }
  const t = temizle(satirlar);
  const doluHam = t.filter((s) => s.genislik > 0 && !s.dusuk);
  if (doluHam.length < 20) return { hukum: 'OLCULEMEDI', neden: `siluet bulunamadi (dolu satir ${doluHam.length} < 20)` };
  const sap = sapKes(doluHam);
  // OLCULEN ARIZA (2026-09-08, biba-O120579): siluetin en UST satirlari giysi
  // degil MANKENIN BASI/BOYNU. Kesilmezse "omuz genisligi" boynu olcer (29 px)
  // ve boy/omuz 12.5 gibi anlamsiz bir oran cikar. Bas da tripod gibi bir bogazla
  // (boyun) govdeye baglanir; ayni kural yukaridan uygulanir.
  const bas = basKes(sap.kesik);
  const dolu = bas.kesik;
  if (dolu.length < 20) return { hukum: 'OLCULEMEDI', neden: `sap/bas kesildikten sonra siluet kalmadi (${dolu.length} satir)` };

  const yUst = dolu[0].y, yAlt = dolu[dolu.length - 1].y;
  const boy = yAlt - yUst + 1;
  const gen = (frac) => {
    const y = Math.round(yUst + frac * (boy - 1));
    const yakin = dolu.filter((s) => Math.abs(s.y - y) <= 2);
    if (!yakin.length) return null;
    yakin.sort((a, b) => a.genislik - b.genislik);
    return yakin[yakin.length >> 1].genislik;
  };

  // En genis ve en dar noktalar: bel/etek ucu bunlardan cikar.
  let enGenis = 0, enGenisY = -1;
  for (const s of dolu) if (s.genislik > enGenis) { enGenis = s.genislik; enGenisY = s.y; }

  // Bel = ust yarida (giysinin ust %55'i) yerel EN DAR nokta; omuz altindan asagi bakilir.
  let bel = Infinity, belY = -1;
  for (const s of dolu) {
    const f = (s.y - yUst) / (boy - 1);
    if (f < 0.18 || f > 0.55) continue;
    if (s.genislik < bel) { bel = s.genislik; belY = s.y; }
  }
  if (!isFinite(bel)) { bel = 0; belY = -1; }

  // Omuz genisligi: en ust %8'lik bandin EN GENIS satiri (kol basi dahil).
  let omuz = 0;
  for (const s of dolu) {
    const f = (s.y - yUst) / (boy - 1);
    if (f <= 0.08 && s.genislik > omuz) omuz = s.genislik;
  }

  const olc = (ad, pay, payda, payAd, paydaAd) =>
    (payda > 0 && pay > 0
      ? { ad, oran: Number((pay / payda).toFixed(4)), pay: payAd, payda: paydaAd, payPx: pay, paydaPx: payda }
      : { ad, hukum: 'OLCULEMEDI', neden: `${payAd}=${pay}px ${paydaAd}=${payda}px` });

  // ---------------------------------------------------------- KENDI KENDINI YARGILAMA
  // OLCULEN ARIZA (2026-09-08, overlay ile GORULDU): "hukum: OLCULDU" tek basina
  // yalan soyluyordu. mary-quant-O1454732'de siluet giysiyi degil VINYETI izliyor
  // (kenar cizgisi elbisenin cok disinda buyuk bir oval), yine de OLCULDU diyordu;
  // mary-quant-O365926'da yan kenarlar giysinin ICINE kayiyor (soluk cizgili kumas
  // duvar rengine yakin). Sayi uretmek onu dogru yapmiyor.
  //
  // Uc olcut, hepsi ORANA bagli ve fotograftan olculur:
  //  (1) doluluk — siluet kutusunun icinde gercekten giysi pikseli olan oran.
  //      Vinyet izlendiginde kutu kocaman, doluluk dusuk.
  //  (2) kenarPurузlulugu — komsu satirlar arasi sol/sag sicramasinin medyani,
  //      giysi genisligine gore. Kumas zemine yakinsa kenar titrer.
  //  (3) simetri — sol ve sag kenarin orta eksene uzakligi; manken ortalanmis
  //      cekimlerde giysi kabaca simetriktir, vinyet ovali de simetriktir, bu
  //      yuzden tek basina yetmez ama digerleriyle birlikte ayirt eder.
  // Hicbiri "duzeltme" yapmaz; yalniz GUVEN dusurur ve nedeni adiyla yazar.
  const orta = dolu.map((s) => (s.sol + s.sag) / 2);
  const ortancaOrta = orta.slice().sort((a, b) => a - b)[orta.length >> 1];
  let doluPiksel = 0, kutuPiksel = 0;
  const sicrama = [];
  for (let i = 0; i < dolu.length; i++) {
    doluPiksel += dolu[i].sayi;
    kutuPiksel += dolu[i].genislik;
    if (i) sicrama.push(Math.abs(dolu[i].sol - dolu[i - 1].sol) + Math.abs(dolu[i].sag - dolu[i - 1].sag));
  }
  sicrama.sort((a, b) => a - b);
  const ortancaSicrama = sicrama.length ? sicrama[sicrama.length >> 1] : 0;
  const ortancaGenislik = dolu.map((s) => s.genislik).sort((a, b) => a - b)[dolu.length >> 1];
  const doluluk = kutuPiksel > 0 ? doluPiksel / kutuPiksel : 0;
  const puruz = ortancaGenislik > 0 ? ortancaSicrama / ortancaGenislik : 1;
  const kayma = ortancaGenislik > 0
    ? Math.abs(orta.reduce((s, m) => s + Math.abs(m - ortancaOrta), 0) / orta.length) / ortancaGenislik
    : 1;
  const kusur = [];
  if (doluluk < 0.72) kusur.push(`doluluk ${(doluluk * 100).toFixed(0)}% < 72% (siluet kutusu giysiden buyuk — zemin/vinyet izleniyor olabilir)`);
  if (puruz > 0.06) kusur.push(`kenar puruzu ${(puruz * 100).toFixed(1)}% > 6% (kenar titriyor — kumas zemine yakin)`);
  if (kayma > 0.12) kusur.push(`orta eksen kaymasi ${(kayma * 100).toFixed(1)}% > 12%`);
  const kalite = kusur.length === 0 ? 'GUVENILIR' : (kusur.length === 1 ? 'ZAYIF' : 'GUVENILMEZ');

  return {
    hukum: kalite === 'GUVENILMEZ' ? 'OLCULEMEDI' : 'OLCULDU',
    kalite,
    kusur,
    neden: kalite === 'GUVENILMEZ' ? 'siluet giysiyi izlemiyor: ' + kusur.join('; ') : undefined,
    olcutler: { doluluk: Number(doluluk.toFixed(4)), kenarPuruzu: Number(puruz.toFixed(4)), ortaKaymasi: Number(kayma.toFixed(4)) },
    piksel: { yUst, yAlt, boyPx: boy, omuzPx: omuz, belPx: bel, belY, enGenisPx: enGenis, enGenisY, esik: Number(esik.toFixed(1)) },
    dusenSatir: t.filter((s) => s.dusuk).length,
    sapKesimi: { kesilenSatir: sap.kesilen, sapBasY: sap.sapY, esikPx: sap.esikPx ?? null, supheli: !!sap.supheli },
    basKesimi: { kesilenSatir: bas.kesilen, basSonY: bas.basY, supheli: !!bas.supheli },
    // Boy/omuz: giysinin ne kadar UZUN oldugu, omuz genisligine gore.
    oranlar: [
      olc('boy/omuz', boy, omuz, 'giysi boyu', 'omuz genisligi'),
      olc('bel/omuz', bel, omuz, 'en dar bel', 'omuz genisligi'),
      olc('etekUcu/omuz', gen(0.98) || 0, omuz, 'etek ucu genisligi', 'omuz genisligi'),
      olc('enGenis/omuz', enGenis, omuz, 'en genis nokta', 'omuz genisligi'),
      olc('bel/enGenis', bel, enGenis, 'en dar bel', 'en genis nokta'),
      // Bel YERI: giysi boyunun neresinde. Bu bir oran degil KONUM oranidir.
      belY >= 0 ? { ad: 'belKonum', oran: Number(((belY - yUst) / (boy - 1)).toFixed(4)), pay: 'bel y', payda: 'giysi boyu' }
                : { ad: 'belKonum', hukum: 'OLCULEMEDI', neden: 'bel bandinda dolu satir yok' },
    ],
    profil: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.98].map((f) => ({ f, genislikPx: gen(f) })),
  };
}

export default { arkaPlanRengi, siluetSatirlari, temizle, oranlar };
