# G2-goz — kusur listesi (2026-09-02)

01-09 flat'leri gercek Etsy referanslarinin (GIRDI/iyi-flat/adaylar) yaninda
tek tek incelendi. Kapilar: `node engine/tests/cizim_giysi_mi.mjs` (a-k + g2)
ve `ctest -R 'golden|flat_mirror|manken_insan|edit_locality'` — hepsi YESIL.

## ONARILDI

### K1 — balon kol yatay "kanat" (02, 05) — EN KRITIK
- **Bolge:** kol. **Dosya:** `web/lib/flat-from-pattern.js` `sleeveGeometry`.
- **Ne yanlisti:** uzun balon kol neredeyse yatay aciliyordu (data-kol-aci 30.00,
  bandin tabani), omuzdan bilege tek kesintisiz diyagonal = Damla'nin "kanat"
  kusuru. Uzun DUZ kol (04) ayni Lf/Lu ile 36-38 dereceye sarkiyor ve dogru
  duruyordu.
- **Kok neden (CIZIM):** kolun aci tohumu kalibin kapanma ucgeninden geliyor;
  `cosPhi` formulunde etek-agzi genisligi Lh acisini SIGLASTIRIYOR. Balon kolun
  genis buzgulu mansedi (Lh 158 vs duz kolun 121) tohumu 20.6 dereceye cekiyor,
  o da 30 tabanina yuvarlaniyor. Manset genisligi bir STIL ekseni, sarkmayi
  belirlememeli.
- **Onarim:** taban artik kol UZUNLUGUYLA yukseliyor (Lf/Lh orani; kisa kolda
  ~1.9, uzunda 3.5+). Uzun kolda taban 38'e cikiyor (bilek kalca hizasina duser
  konvansiyonu), kisa kolda 30'da kaliyor. Band 20-40 sabit, kapi (j) etkilenmedi.
- **Sonuc:** 02, 05 artik 38 derece sarkiyor, uzun duz kardesiyle ayni. Duz kol
  (36-38 zaten) ve kisa kol degismedi.

### K2 — bel "kutusu" (01, 03, 04, 08, 09)
- **Bolge:** bel dikisi (beden-etek birlesim cizgisi). **Dosya:** ayni, ~satir 977.
- **Ne yanlisti:** beden bel dikisi HAM basiliyordu; her pens kapanmasi o kenarda
  bir kink birakir, cizimde ortada cukurlasan kirik yatay bir "kutu" olarak
  cikiyordu (etek ustunun smoothEdge'den once yasadigi ayni kusur).
- **Kok neden (CIZIM):** etek ustune smoothEdge (tek egri) uygulanmisti ama beden
  bel dikisine uygulanmamisti.
- **Onarim:** bel dikisi de artik `smoothEdge` ile tek egri. Iki uc nokta
  (yan kose + CF) byte-exact sabitleniyor, manken kazigi ve kapilar kimildamadi.

## ONARILMADI (durust liste)

### A1 — balon kol PUF hacmi yok (05, ve 02'de kismen)
- **Bolge:** kol. **Kok neden (KALIP):** cizim degil, motor eksigi. Balon kol
  sarkmasi artik dogru ama kolun kendisi duz koni; ust kenarda buzgulu puf
  KABARMASI cizilmiyor. CLAUDE.md zaten bunu biliyor: motorun eksigi "buzgulu
  ust katman operatoru" (Upper Sleeve, %29 buzgu). Kalip hatti bu operatoru
  uretmedigi icin cizim de basamaz. FAKE edilmedi (uydurma puf cizmek yasak).
- **Etki:** referans 04/10'daki kabarik puf gorunumu bizde yok; kol dogru sarkik
  ama "balon" degil "genis duz" okunuyor. Motor isi, cizim isi degil.

### A2 — 02 crew yaka CF'de kucuk centik + 05 vNeck derin/sivri
- **Bolge:** yaka cizgisi. **Kok neden (CIZIM/KONVANSIYON):** aynali iki yarim
  yaka egrisi CF'de teget uyusmadan bulusunca kucuk bir cusp (centik) kaliyor
  (02 crew'da hafif). 05'in vNeck'i derin ve sivri — ama bu KONVANSIYON GEREGI
  (contract: vNeck kendi derinligini korur, tavani 1.25 oran; musteri sectigi
  stil ekseni). vNeck'i sig crew'a kirpmak her yakayi crew yapardi.
- **Neden onarilmadi:** 02'deki centik cok kucuk (Etsy rafinda goze batmiyor);
  CF teget duzeltmesi poseBodice yaka geometrisine dokunur ve (g)/(k) yaka
  kapilarini riske atar — kazanci kucuk, riski buyuk. 05 vNeck by-spec, kusur
  degil. Ikisi de bilincli birakildi.

### A3 — bel dikisi CF'de hafif "V" inisi (01, 03, 08, 09)
- smoothEdge her yarimi temiz yay yapti ama iki aynali yay CF'de hafif acili
  bulusuyor, ortada nazik bir V inisi kaliyor. Fitted bel dikisi zaten CF'de
  biraz dususur; kirik kutu gitti, kalan inis dogal okunuyor. Birakildi.

## SON DEGERLENDIRME (kendi gozumle)
- **Raf-hazir:** 03, 06, 07, 08 (prenses en iyisi), 01 — Etsy vitrininde durur.
- **Iyilesti ama tam degil:** 02, 05 — kol sarkmasi duzeldi (kanat gitti), ama
  balon PUF hacmi yok (A1, motor isi). 05'in derin V'si by-spec.
- **04:** kol iyi sarkik; yatik yaka bebe-lob gibi cizilmis (flat collar sekli
  tartisilir ama kapidan gecti, kucuk).
- Genel: kanat ve kutu — iki en utandiran kusur — gitti. Kalan is motor tarafinda
  (puf operatoru), cizim tarafinda degil.

Once/sonra: `KOSU/ciktilar/goz-once-sonra.png`.
