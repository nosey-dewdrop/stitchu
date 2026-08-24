# KART V1-D — `figure_check` KIRMIZISI: DEVRALINACAK KARDEŞ VAR MI · PARALEL

## NE
`figure_check` (ctest #90) kırmızı: `dress_bandeau_circle` stilinin
`contract/figure-bands.json` → `mandal.taban_v3` içinde pini yok (16 pin var,
bu stil yok). Dosya bunu `_taban_v3_pinsiz_kalan` alanında kendisi yazıyor:
"DEVRALINACAK KARDEŞ YOK".

Tek sorun: **bu cümle ÖLÇÜLDÜ MÜ, yoksa varsayıldı mı?** Ölç. Pinli 16 stille
`dress_bandeau_circle` arasında, pinin ölçtüğü büyüklük bakımından geometrik
KARDEŞ olan bir stil var mı? Varsa değeri ondan DEVRAL ve devrin gerekçesini
dosyaya + commit mesajına yaz. Yoksa "yok"u KANITLA.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `contract/figure-bands.json`
- `engine/tests/` altında `figure_check` kaynağı (grep ile bul, OKU) —
  `taban_v3` pininin TAM OLARAK hangi büyüklüğü ölçtüğünü kaynaktan çıkar
- `git log`/`git show 396d42e` (kırmızıyı bilerek bırakan commit)
- 17 stilin (16 pinli + `dress_bandeau_circle`) tanımlandığı yer — kaynağı
  grep ile bul ve OKU

## YÖNTEM (sıra bağlayıcı)
1. Pinin ölçtüğü büyüklüğün TANIMINI test kaynağından çıkar ve raporda yaz.
   Tanımı bilmeden kardeşlik iddia edilemez.
2. 17 stilin topolojisini tabloya dök: hangi paneller, yaka var mı, kol var
   mı, etek ailesi ne, straplez mi. `dress_bandeau_circle` = bandeau (straplez)
   gövde + daire etek. Kardeş adayı = AYNI gövde ailesi + AYNI etek ailesi.
3. Aday(lar) için: adayın pin değeri · `dress_bandeau_circle`'ın bugün
   ölçülen değeri (0.872) · fark. Farkı `_kaynaklar`/tolerans bandına göre
   yorumla.
4. Kardeşlik SAVUNULABİLİRSE değeri devral, `figure-bands.json`a gerekçe
   alanıyla yaz, `_taban_v3_pinsiz_kalan` satırını güncelle, testi koş.
5. Savunulamıyorsa DOKUNMA. Kırmızı kalır. "Yok"un kanıtı = 2. adımdaki tablo.

## ÇIKTI
- (koşula bağlı) `contract/figure-bands.json`. Kanıt olduğu kapı: `figure_check`.
- `GECE/log/V1-D.kardes.txt` — 17 stilin topoloji tablosu + kardeşlik hükmü
  + önce/sonra test çıktısı.
- `GECE/log/V1-D.ctest.after.txt` — TAM ctest (yalnız dosyaya yazdıysan).

## ZORUNLU KAPILAR
1. Değişiklik yaptıysan TAM ctest koş; kırmızı AD kümesi büyüyemez (RULES §9).
2. Kapatamazsan: kök teşhis + en az bir ÖLÇÜLMÜŞ çözüm adayı + hangi faza
   kart olduğu (4.7). "Kardeş yok" tek başına yetmez — tabloyla kanıtla.

## YASAKLAR
- **`dress_bandeau_circle` için 0.872'yi (kapının kendi ölçtüğü sayıyı)
  PİNLEME.** Bu regen-vs-regen'dir, ölçüldü ve REDDEDİLDİ; dosyanın kendi
  yasağı. Yeşile döner ama kanıt üretmez.
- Bandı/toleransı GENİŞLETME. Kapıyı gevşeterek geçmek yasak (§7.1).
- `engine/` `recipes/` `web/` `docs/` altına dokunma.
- `contract/tables.json`'a dokunma (başka kartın konusu).
- Mevcut testleri değiştirme.

## SÜRE TAVANI
45 dk.

## ETİKET
PARALEL (V1-B, V1-E ile; dosya kümeleri kesişmiyor)
