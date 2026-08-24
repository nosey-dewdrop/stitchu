# KART V0-0B — görü hattı envanteri

ETİKET: PARALEL · SÜRE TAVANI: 60 dk

## NE
Foto + prompt → spec hattı BUGÜN kaç örnekte doğru spec'e iniyor. Sayı üret,
iddia değil.

1) Hattı bul ve yolunu yaz: hangi dosyalar foto/prompt alıp spec üretiyor
   (`vision/`, `vision-student/`, varsa web tarafındaki çağrı yolu).
2) Elde duran örnek/eval korpusunu bul (`vision/eval*`, `vision/corpus`,
   `vision-student/`). Kaç örnek var, hangisi etiketli. Koşulabiliyorsa
   KOŞ ve isabet sayısını bas; koşulamıyorsa NEDEN koşulamadığını (eksik
   ağırlık / API anahtarı / veri yok) yaz — ağırlık indirme, anahtar kurma
   YASAK (§5.3 kalıcı veto), kuyruğa satır olarak yazılır.
3) Hataları SINIFLA: görme hatası mı (fotoğraftaki şeyi göremedi), kelime
   listesi hatası mı (sözlükte karşılığı yok), motor hatası mı (spec doğru,
   çizim yanlış). Sınıf başına adet + örnek.
4) vision-student kelime listesinin KAYNAĞI: elle mi yazılmış, yoksa bir
   sözlük/tablo dosyasından mı üretiliyor? Cevabı dosya yolu + satır
   numarasıyla göster. Üreteç varsa komutunu yaz.

## GİRDİ DOSYALARI
- ENV.md · RULES.md
- vision/ · vision-student/
- contract/garment-spec-v2.json (spec şeması karşılaştırması için, salt okunur)

## ÇIKTI
- `GECE/log/V0-0B.eval.txt` — koşulabildiyse ham çıktı
- `GECE/V0-0B.md` — isabet sayısı (payda dahil) + hata sınıf tablosu +
  kelime listesi kaynak hükmü (dosya yolu + satır)
  Kanıt olduğu kapı: V0 kapısı + V6'nın girdisi + V11'in önce/sonra sayısı.

## YASAKLAR
- Hattı ONARMA, prompt iyileştirme, şema değiştirme. V0 ölçüm fazıdır.
- Model ağırlığı indirme / API anahtarı kurma / bulut görsel servisi (kalıcı veto).
- Ücretli çağrı yapma. Ücret gerekiyorsa "ölçülemedi, sebep: X" yaz.
- İsabet oranını tahmin etme; payda yoksa "korpus yok" yaz.

## RAPOR FORMATI (zorunlu)
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
