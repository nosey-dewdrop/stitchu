# KART V7-R — YEDİRME ORANI: YAYINLANMIŞ KAYNAK ARAŞTIRMASI

ETİKET: PARALEL (V7-A ile aynı anda; dosya kesişimi YOK)
SÜRE TAVANI: 45 dk

## NE
Kol oyuğu yayı ile kol kapağı yayı arasındaki **yedirme oranı (cap ease)** için
yayınlanmış kaynak bul; bir bant (min–max, hangi giysi sınıfı, hangi beden)
ve o bandın kaynağını tablo hâlinde yaz. Ayrıca "puf kol" ve "balon kol"un
NİCEL tarifi (kapak yüksekliği artışı, kol ağzı büzgü oranı) için yayınlanmış
sayı ara.

## GİRDİ DOSYALARI (isim isim — başka dosya AÇMA)
- `ENV.md`, `RULES.md`
- `knowledge/drafting-math-eu38.md`
- `knowledge/cap-ease-isareti-2026-08-17.md`
- `knowledge/armscye-on-arka-2026-08-17.md`
- `knowledge/` altındaki diğer dosyaları `ls` ile listele, sadece adı kol/cap/
  armscye/sleeve/ease geçenleri aç.
- Web araması serbest (WebSearch/WebFetch). Model ağırlığı indirme / API
  anahtarı / ücretli servis YASAK.

## ÇIKTI
`GECE/V7-R.md` — üç bölüm:
1. **HÜKÜM TABLOSU**: satır başına → iddia · sayı/bant · kaynak (yazar, yayın,
   sayfa/bölüm) · lisans/erişim · GÜVEN (yayınlanmış / ikincil / DOĞRULANMADI).
2. **BİZİM ÖLÇÜMÜMÜZ**: repodaki mevcut sayılar (yukarıdaki knowledge dosyaları
   + `patterns_real/geometry/geometry-full.json` varsa) kaynakla ÇELİŞİYOR mu.
   Çelişki varsa ikisini de yaz, HÜKÜM VERME (motor ölçüyü basar, yargılamaz).
3. **KAPI ÖNERİSİ**: `sleeve_cap_ease` kapısı hangi bandı kullanmalı, tek
   cümle + kaynak. Yayın YOKSA açıkça "yayınlanmış formül YOK, bant şu
   ölçümden" yaz — uydurma bant YASAK.

Bittiğinde `GECE/V7-R.md`'yi KENDİN commit et:
`git add GECE/V7-R.md && git commit -m "v7-r: published sources for sleeve cap ease band"`
Commit hash'ini raporunda yaz.

## YASAKLAR
- KOD YAZMA. Tek satır kaynak dosyası bile değiştirme.
- `GECE/KOSU.md`, `GECE-KOSUSU-v6.md`, başka kartlar: AÇMA.
- `patterns_real/` altındaki satın alınmış PDF'lere DOKUNMA (okuma dahil).
- "muhtemelen / genelde böyledir" YASAK — her sayının yanında kaynak.

## RAPOR FORMATI
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut/kaynak) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
