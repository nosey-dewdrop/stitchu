# A4 hukmu (elle, 2026-09-09) — flat fashion flat oldu, motor gercek olcuyor

Onceki hukum (A3, 9 Eyl): bes fotograf primitif emir listesiyle motordan gecti; kalan kusur "arka paneller acilmis
kitap pozunda, kol pozu" (A4). Bu dosya A4'un OLCUMUNU ilan eder; kontak `KOSU/ciktilar/giris/a4-kontak-tur3.png`,
hakem `KOSU/ciktilar/hakem/A4/`.

## Damla'nin tek olcutu: emsalin yaninda ayni turden bir fashion flat gibi gorunuyor mu?

Kontak (tur 1-3): her teslimin flat'i (on + arka) emsal 13'un (deer-and-doe Mica) yaninda, AYNI olcekte, bel hizali.
Cizici (`engine/src/flatsvg.cpp`) bastan yazildi; kural grafin yapisindan okunur, giysi-tipi dali yok:

1. Gorunum = kat ekseni: x=0'da kat kenari ya da dikis tasiyan panel (cf -> on, cb -> arka) o gorunumun paneli;
   eksenli paneller kendi beden koordinatinda, x=0'da aynali. Arka paneller artik ARKA gorunumde ("kitap pozu" bitti).
2. Eksensiz panel (kol) dikildigi gorunumlerde sarkar: kol oyugunun en ust noktasi S (omuz ucu), en alt U (koltukalti);
   tup U'dan croquis kol ekseni (shoulderTip -> wrist, sevkPoz 82.2 derece) boyunca iner; gorunur genisligi panel
   genisligi / pi (GIRDI/iyi-flat 07'de olculdu: kol gorunur genisligi 0.49 x gogus yarimi, cevre/pi ile uyumlu);
   kapak basi S -> O disbukey kubik.
3. Cizgi hiyerarsisi = dikis partnerinin gorunumu: partner ayni gorunumdeyse ince (bel, kol oyugu, on orta),
   obur gorunumde ya da kesim kenariysa kalin (yan, omuz, etek ucu, kol); ust dikis izi yalniz bitirmeli kesim
   kenarinda (hem/faced) kesikli; pens tek cizgi, agiz koprulu; centik flat'te yok.
4. Croquis silueti: landmark'lardan gorunmez olcum yolu (`data-rol="siluet"`), KAPI B oradan olcer.

## Sayilar (emsal 13 bizim olcege 0.944 mm/px, omuz->bel 390 mm esitlendi)

| kalem | emsal 13 | croquis36 | fark |
|---|---|---|---|
| gogus yarim | 177 | 210 | +33 mm (%19) |
| bel yarim | 158 | 171 | +13 mm (%8) |
| omuz->gogus y | 227 | 255 | +28 mm |
| omuz->bel y | 390 | 390 | 0 |
| kalca | olculemedi (emsalde etek klosu, flat-secim.md) | 225 | — |

Karar ajani (n=4 emsal: 13, 14, Cashmerette Lenox/Hampden): gogus yarim / omuz->bel medyan 0.50 (0.44-0.52), bizim 0.538;
bel 0.406 (n=6), bizim 0.437. Fark %7-8; payda ankraji (ilk murekkep = arka yaka tepesi ~ nape; bizde nape 20 mm) farkin
yarisini aciklar. **KARAR: croquis cevre/4 yasasi A4'te DEGISMEZ** (F1'in 7 turluk gerekcesi, body_check (g), gen-contract,
wasm_body_check bagli); kok neden adiyla: tup yasasinin yatay/dikey orani emsalden hic olculmemis (dikey n=7-11, yatay n=0).
Devredilen sayi: gogusYarimOverTorso 0.50 (n=4), belYarimOverTorso 0.406 (n=6); on kosul payda tanimi + n>=8.

## Kapilar (calistirma ciktisi)

    node engine/tests/flat_ayni_insan_check.mjs      -> OK 5 flat ayni insan (tolerans 2 mm)   [34 -> 0, pin kapandi]
    bash engine/tests/0509-vision-kabul.sh           -> KABUL kirmizi=0 (5/5 grafdogrula 0 kirmizi, yeni kapilarla)
    engine/build/grafdogrula giris/1/graf.json gercek36 | grep supresyon
      -> dikilen bel 660.00 mm (halka bel_halka x2) - hedef 660.00 = EMILMEYEN 0.00 mm, tolerans 2.00

## Motor devirleri (hepsi bu oturumda, ölçümle)

- **Supresyon kapisi tautolojik degil:** eski kapi cozucunun yazdigi orani okuyordu (%33 = pensPayi). Simdi EMILMEYEN
  olculur: dikilen bel halkasi x2 - (beden + bolluk). ILK OLCUM: taban graf +40 mm, teslim 1 +80 mm — pens agzi dikisin
  ustune bindirilmisti (b ucu a'nin kat tarafinda; bel kenarlari agzi iki kez sayiyordu). Duzeltme cozPens'te: agiz
  gecis yonunde a'dan sonra acilir, yan tepe agiz kadar disari kayar, apeks agzin ortasina; sonuc EMILMEYEN 0.00.
- **kPensPayi contract'ta:** `contract/graf-v1.json cozucu.pens.pensPayi` 1/3 (Aldrich, DOGRULANMADI; deger degismedi).
- **On/arka pens agzi farkli:** supresyon bedenin arkaPay'iyla bolunur; giris/1: on beden 19.14, arka 20.86 mm.
- **Etek pensi kalca supresyonu:** halka cifti panel uyeliginden (bele en yakin landmark'li halka): etek kalca-bel
  (on 13.70, arka 34.63 mm; arkaPay(kalca) 0.566), beden gogus-bel.
- **Yan dikis dogrulama + centik:** on/arka agiz farki yan dikisi 4.84 mm uzun birakiyordu; uzun tarafin bel-yan
  tepesi dikis boyunca (y) iceri alinir, centikler dikisin kesrine yeniden oturur (giris/1: yan_etek artik 0.00).
- **Gogus/kalca halkasi yatay kesit:** eskiden toplam = yan dikis BOYU (425 mm, dusey kenar). Simdi landmark y'sinde
  kontur kesiti: gogus 441.65 (yarim), kalca 475.00 (yarim).
- **Siluet hedefi birim:** okuma "bel/enGenis" yatay genislik orani; payda artik cizilen en genis yarim kesit x 4
  (genislik/genislik), gogus cevresi degil. Sapma hala buyuk (0.31): fotografin enGenis'i kol/puf dahil, ilan.
- **Cizici cozulmus grafi cizer:** fitLength + pens agzi eskiden yalniz dogrulayicinin kopyasinda cozuluyor, grafciz HAM
  grafi ciziyordu (kapi baska geometri, urun baska). `cozulmusGraf` ile flat ve kalip cozulmus grafla.
- **Kalip sayfasi:** kesim cizgisi pens agzini kopruler (ofset V bacaklari X ciziyordu), etiket Bugra yazimi: parca adi,
  CUT 2X MIRRORED, EU 36, Seam Allowance 1 cm - 3/8 in, For Hem 3 cm - 1 1/8 in, #n / N; grain oku, centik (on 1 / arka 2).

## Ilanli / kapsam disi

- `vocab_reference_check` A3'ten beri kirmizi (A6 ilani); bu turda `bust` +2, `hip` +1 (working tree): KAPI B'nin
  contract'taki nitelik adi `data-manken-bust-y` ve croquis siluet yolunun `landmark.hip` referanslari — beden sozlesmesi
  referansi, giysi sozlugu degil; kapinin beden kovasi yalniz sayi-degerli JSON anahtarini taniyor (arac siniri, ilan).
- Pens apeksi koltukalti hizasinda (taban graf `dart_*.1 to = landmark.underarm`): kalipta uzun sivri pens; taban geometrisi,
  A4 kapsami disi, sonraki adima.
- 1 = 2 ayni flat (ayni giysinin iki cekimi), A3 ilaniyla ayni.
- Peplum (on_ust_kat) hem'i V; etek yanlari kalcada kirik: A3 okumasinin op'lari, cizici degil.
