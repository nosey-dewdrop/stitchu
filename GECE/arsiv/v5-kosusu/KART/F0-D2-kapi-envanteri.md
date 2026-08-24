# KART F0-D2 — KAPI ÖN-ENVANTERİ (12 TEST)
(F0-D tur tavanında kesildi, hiçbir şey yazmadı; ikiye bölündü. Bu 2/2.)
Bu tablo olmadan sonraki fazlar yeni test YAZAMAZ.

## NE
Mevcut 96 testten 12'sinin KAYNAĞINI okuyup ne ölçtüklerini tablola.

## GİRDİ DOSYALARI
- engine/CMakeLists.txt  (test adı → kaynak dosya eşlemesi)
- engine/tests/ altındaki ilgili kaynaklar

## ÖNCE GREP
- `grep -n "add_test\|closed_garment\|notch_alignment\|wearab" engine/CMakeLists.txt`

## YAPILACAK
Şu 12 testin HER BİRİ için — kaynağını OKUYARAK, adından tahmin etmeden:
  closed_garment_check · notch_alignment_check · wearability_check ·
  wearable_check · flatten_check · body_volume_check · garment_shell_check ·
  drape_check · sewable_census · sleeve_check · cap_sleeve_check · gather_check

Her satırda:
- test adı · kaynak dosya:satır
- NE ÖLÇÜYOR (tek cümle, kaynaktan)
- EŞİĞİ ne, eşik nereden geliyor (sabit mi, kontrat mı, pin mi)
- hangi gelecek kapıya denk gelir (dikilebilirlik / giyilebilirlik / kol /
  büzgü / düzleştirme / hacim)
- EKSİK NE (bu testin ölçmediği, ama o kapının gerektirdiği şey)
- BOŞ MU: test bir şey iddia edip hiçbir assert koşturmuyorsa (vacuous)
  bunu ayrıca işaretle.
Repoda olmayan teste "REPODA YOK" yaz.

## ÇIKTI
`GECE/F0-D2.md`. İLK İŞİN dosyayı 12 başlıkla AÇMAK; her testi bitirdikçe
hemen dosyaya EKLE. Sonda tek seferde yazma.

## YASAKLAR
- Hiçbir testi değiştirme, yeni test yazma, kırmızı kapatma, commit atma.
- reports/, Logs/, HEDEF.md okuma.
- Adından çıkarım yapma.

## SÜRE TAVANI
maxTurns 40. Kesilirsen dosyanın sonuna "KALAN İŞ: <hangi testler>" yaz.
