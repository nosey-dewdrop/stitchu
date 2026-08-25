# KART V9-F — `GECE/INDEX.md` SON HÂLİ (yönlendirme tablosu)

ETİKET: **PARALEL** (V9-C · V9-D · V9-E ile aynı anda; dosya kümesi kesişmiyor)
SÜRE TAVANI: **45 dk**

## NE
`GECE/INDEX.md`'yi koşunun SON hâline getir: bu gece koşusunun ürettiği
**HER kalıcı dosya** yönlendirme tablosuna girsin (§6/V9). Index bir
yönlendirme tablosudur — özet değil, tekrar anlatı değil.

## SENİN DOSYAN (tek dosya)
- `GECE/INDEX.md`

## GİRDİ (okunur, DEĞİŞTİRİLMEZ)
- `ENV.md` · `RULES.md`
- `GECE/INDEX.md` (mevcut hâli)
- Dizin LİSTELERİ (içerik okuman gerekmez, ama tek satır tanım için
  başlık satırlarını okuyabilirsin):
  `ls GECE/` · `ls GECE/KART/` · `ls GECE/log/` · `ls GECE/probe/` ·
  `ls GECE/kurtarma/` · `ls docs/`
- `GECE/KAPI.md` (hakem hükümleri — OKU, DEĞİŞTİRME)

## KAPSAMA GİRECEK HER ŞEY (eksiksiz)
1. **Faz tutanakları:** `GECE/V0.md` … `GECE/V7.md` — faz başına tek satır:
   faz adı · TEK CÜMLE ne yaptığı · tutanak yolu.
2. **V0 alt tutanakları:** `GECE/V0-0A.md` … `V0-0F.md`, `V0-0R.md`.
3. **Faz alt tutanakları:** `GECE/V1-*.md` … `GECE/V9-*.md` (V9'unkiler bu
   gece yazılıyor: `V9-A`, `V9-R`, `V9-B`, `V9-C`, `V9-D`, `V9-E` — dosya
   yoksa satırı "yazılıyor" diye değil, **koşu sonunda var olacak yolla**
   yaz ve tutanağında hangilerinin diskte OLMADIĞINI belirt).
4. **`GECE/KART/`** — kart dosyaları: faz başına tek satır + kart sayısı.
   Kart kart liste ŞART DEĞİL; ama V9 kartları (`V9-A`…`V9-F`) adıyla dursun.
5. **`GECE/log/`** — log dosyaları: faz başına gruplanmış, en az
   ctest açılış/kapanış logları + mutasyon logları + kapı kanıt logları
   ADIYLA. `GECE/log/V9.ctest.opening.txt`, `GECE/log/V9-B.red-before.txt`,
   `GECE/log/V9-B.mutasyon.txt` MUTLAKA dursun.
6. **Kalıcı yardımcı dosyalar:** `GECE/KAPI.md` · `GECE/KOSU.md` ·
   `GECE/kapi.sh` · `GECE/mutasyon.sh` · `GECE/mutasyon.tsv` ·
   `GECE/kapi.sha` · `GECE/probe/` · `GECE/kurtarma/` ·
   `GECE/f0-*.json`, `GECE/f0-*.mjs`, `GECE/f0-*.py`, `GECE/f-*.mjs`.
7. **`GECE/arsiv/`** — TEK satır: "önceki koşuların tutanakları, bu koşuda
   KANIT DEĞİL, açılmaz." (İçini LİSTELEME, AÇMA.)
8. **`docs/` ağacı** — kısa yönlendirme: hangi doküman neyi anlatıyor
   (tek satır), hangileri arşiv.

## BİÇİM ŞARTLARI
- Her satır: **yol + tek cümle**. Anlatı, özet, tekrar YOK.
- Her yolun diskte VAR olduğunu `test -e` ile DOĞRULA. Olmayan yol
  Index'e girmez; girmesi gerekiyorsa "YOK" damgasıyla girer.
- Duran-iddia yazma (RULES §6): "bitti / hazır / ALL PASS / 0.00mm /
  byte-identical" gibi cümle kurma. Index hüküm vermez, YÖNLENDİRİR.
- Hüküm cümlesi kurma: bir fazın "kapandığını" sen ilan etmezsin.
  Kapanma hükmü `GECE/KAPI.md`'de hakemindir; sen yalnız yolunu gösterirsin.

## ÇIKTI
- `GECE/INDEX.md` (son hâli)
- `GECE/V9-F.md` — kısa tutanak: kaç yol tablolandı · kaçı `test -e` ile
  doğrulandı · diskte BULUNAMAYAN yollar (isim isim) · kapsam dışı
  bıraktığın ne varsa SEBEBİYLE.

## YASAKLAR
- `GECE/INDEX.md` ve `GECE/V9-F.md` DIŞINDA hiçbir dosyaya YAZMA.
- `GECE/arsiv/` AÇILMAZ, LİSTELENMEZ.
- `KOSU.md`'ye DOKUNMA (şefin dosyası).
- Faz tutanaklarının İÇİNİ okuyup özetleme — tek cümlelik tanım için
  yalnız BAŞLIK satırı yeter.
- ÖLÇMEDEN yol yazma: `test -e` ile doğrulanmamış yol Index'e girmez.

## RAPOR
yapılan (dosya yolu + commit hash) · ölçülen (kaç yol · kaçı doğrulandı) ·
yapılamayan (sebep) · kart dışı fark edilen.
İşini KENDİ COMMIT'İNLE bitir (lowercase ingilizce mesaj, co-author YOK).
