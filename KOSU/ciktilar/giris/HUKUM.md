# A3 hukmu — bes fotograf okundu, kalip ciktı, AMA cikti hala ayni

Bu dosya adimin KENDI kusurunu ilan eder. Kabul sartlari saglandi; urun sorusu
("bunu bir insan satin alir mi?") HAYIR ve nedeni olculdu.

## Ne calisiyor (olculdu)

- 5 fotograf vision-graf-v1 semasinda okundu; `bash engine/tests/0509-vision-sema.sh`
  -> 25 hukum, **0 kirmizi**. Gecit bes ayri ihlal enjekte edilerek YANLISLANDI
  (kirmizi bastigi gorulldu), tautolojik degil.
- 5 graf.json uretildi, hepsi `grafdogrula gercek36` -> **0 kirmizi**.
- 5 flat.png + 5 kalip-36.png, hepsi 900x1200 (esik 400). Kontak: `giris-foto-5.png`.
- Onbellekte 5 dosya, `okuyan: isci-A3`, **llmCagri = 0**.
- Celiski tablosu 13 satir; hepsinde `kazanan = olcum` (yasa 5).

## Ne CALISMIYOR — ciktilar birbirinin AYNISI

Bes fotografin **dordu** bayt-ayni flat/kalip uretiyor. Yalniz 3 numara
(uzun kollu biba-O120579) farkli. Kanit:

    md5 KOSU/ciktilar/giris/*/kalip-36.png
    1,2,4,5 -> db31de3471229c507d768121f43d08e8   (AYNI)
    3       -> f9cc7cc93afbf34370eb5e2c52ac0a5a   (farkli)

### Kok neden ARANDI ve BULUNDU (iki katman)

**1. `ops[]` bir PROGRAM DEGIL, bir KAYITTIR.**
`contract/graf-v1.json`: *"Uygulanan op kayitlari, sirayla"* — yani op'lar zaten
uygulanmis sayilir, geometri `panels`/`seams` icinde durur. Olcum:
`rg ops engine/src/grafciz-cli.cpp` -> **hic eslesme yok**; cizici op listesini
okumaz bile. Motorda `applyOp()` VAR (`engine/src/grafop.cpp`) ama onu disari
veren bir CLI YOK.

Bu yuzden uretici op'un geometrik etkisini grafin kendi diline (landmark
referansi) yaziyor. O katman calisiyor: 3 numarada kol `landmark.elbow`'dan
`landmark.wrist`'e tasindi ve kalip sayfasinda kol parcasi gozle GORULUR
sekilde uzadi.

**2. Kalan dordunun op'lari GERCEKTEN bos is.**
Taban grafta etek hem'i zaten `landmark.knee`, kol hem'i zaten `landmark.elbow`.
1, 2 ve 4 numaranin okumasi da tam bu iki landmark'a cozunuyor -> `extendTo`
hicbir seyi tasimiyor. 5 numara (arka yuz) hic op uretmiyor.
Yani cikti ayni cunku **uygulanan fark sifir**, cizici bozuk oldugu icin degil.

### Asil darbogaz: okumanin tasidigi bilginin cogu motora GIREMIYOR

Her fotografta okunan ama motorda karsiligi olmayan kalemler
(`dikilebilir.md` "cevrilemeyen" tablosu):

| okuma | neden gecemedi |
|---|---|
| `setNeckline` (sweetheart, dik yaka) | motorun op sozlugunde yaka bicimi op'u yok |
| `addPanel` (peplum, yaka bandi) | `attach`/`overlay` var ama uretici panel govdesini kuramiyor |
| `addClosure` (on orta dugme) | taban grafta **on orta dikis yok**; `closure` baglanacak dikis bulamiyor |
| `addPatch` (yama cep) | motorda karsiligi yok |
| `mergeSeam` (bel dikisi olmayan shift) | motorda dikis KALDIRAN op yok |
| `setWidthTarget` | op degil, cozucu hedefi (contract yasa 3) — grafa yazilmaz, cozucuye A2'de girer |

Yani hat ucu uca calisiyor ama **dar bogaz okuma degil, op sozlugu**. Fotograf
okumasi 5 giysiyi birbirinden ayirt ediyor (13 celiski satiri, panel/kenar/dikis
farklari `dikilebilir.md`'de); motor bu farklarin yalniz kol/etek BOYUNU
uygulayabiliyor.

## Bunun anlami

Adim kendi kabul sartlarini karsiliyor ama **satilir bir cesitlilik uretmiyor**.
Kapanacak yer A6/A6c (op sozlugu ve cumle->graf cevirisi) ve `applyOp`'u disari
veren bir CLI. Ikisi de A3'un izin listesi disi (madde 3) -> acikSorular.

Sessiz "promptla devam" YAPILMADI, gorsel de gizlenmedi: kontak sayfasi dort
ayni satiri oldugu gibi gosteriyor.
