# KART F11-D — VİTRİNİN ÖNCE/SONRA HÂLİ (isci-vitrin)

## NE
Gecenin başındaki ve şu andaki `docs/` + landing (`web/`) durumunu karşılaştır;
F9 (docs_truth_check) ve F10 (landing_truth_check) fazlarının vitrine
DOKUNUP DOKUNMADIĞINI dosya yoluyla kanıtla.

## BAĞLAM (ölçülmüş)
Gece `962407d`'de başladı, ağaç hâlâ `962407d` ve kod tarafı temiz. F9 ve F10
kapıları kırmızı düştü, işleri ana dala girmedi. Yani vitrinin "önce"si ile
"sonra"sı AYNI olabilir — ama bunu İDDİA etme, ÖLÇ.

## GİRDİ DOSYALARI
- `GECE/F9.md`, `GECE/F9-A.md`, `GECE/F9-B.md`, `GECE/F9-C.md`
- `GECE/F10.md`, `GECE/F10-A.md`, `GECE/F10-B.md`, `GECE/F10-C.md`, `GECE/F10-D.md`
- `GECE/log/F9A.gate.before.txt`, `GECE/log/F9.gate.after.txt`
- `GECE/log/F10B.gate.before.txt`, `GECE/log/F10C.gate.after.txt`,
  `GECE/log/F10D.gate.after.txt`
- `GECE/log/F10A.site-health.txt`, `GECE/log/F10C.site-health.txt`,
  `GECE/log/F10D.site-health.txt`

## ÇIKTI
- `GECE/F11-D.md` — tutanak
- `GECE/log/F11D.site-health.txt` — bugünkü `node engine/tools/site-health.mjs` çıktısı

## ÖNCE GREP / ÖLÇ
1. `git diff --stat 962407d..HEAD -- docs web README.md` → boş mu?
2. `git log --oneline 962407d..HEAD` → hiç commit var mı?
3. `node engine/tools/site-health.mjs` koş → `GECE/log/F11D.site-health.txt`.
   Kırık iç link / sitemap 404 / `?v` gerilemesi sayılarını yaz.

## CEVAPLANACAK
1. **ÖNCE/SONRA FARKI VAR MI?** docs/ ve web/ bayt olarak değişti mi? Değişmediyse
   "önce == sonra" de ve bunu diff çıktısıyla kanıtla. F11 brief'i "önce/sonra
   ekran görüntüsü yolları" istiyor — değişiklik YOKSA çekilecek iki ayrı görüntü
   de yoktur; bunu dürüstçe yaz, sahte bir "sonra" üretme.
2. **F9'un SAYISI NE İDDİA ETMİŞTİ?** F9 tutanağı "faz öncesi 16+36 ihlal →
   faz sonrası 0+0" diyor. Bu 0+0 ana dalda GEÇERLİ Mİ? (`engine/tests/
   docs_truth_check.sh` diskte YOK — doğrula.) Geçerli değilse: docs'taki
   duran-iddia ihlalleri BUGÜN hâlâ 16+36 mı? Ölçemiyorsan (kapı dosyası
   silindi) "ÖLÇÜLEMEDİ, çünkü kapı ana dala girmedi" yaz.
3. **F10'un SAYISI NE İDDİA ETMİŞTİ?** F10-A "18 iddia · DOĞRU 0 · YALAN 1 ·
   KANITSIZ 17" demiş. Landing bugün hâlâ o 18 iddiayı taşıyor mu? Bunu
   `web/index.html`'i okuyup SAY. (Not: `web/index.html` ELLE yazılan bir
   dosyadır, `contract/generated-paths.sha256`'daki 57 üretilmiş yolda DEĞİL —
   §0.15 istisnası. Yani orada duran yalan bir üreteç kusuru değil, yazılmış
   bir cümledir.)
4. **YALAN 1 HANGİSİ?** F10-A'nın "YALAN" dediği tek iddiayı ADIYLA çıkar ve
   bugün hâlâ sayfada olup olmadığını satır numarasıyla göster. Bu, Damla'nın
   dışarı söyleyebileceği bir cümle — sessiz kalma.

## YASAKLAR
- Hiçbir şeyi DÜZELTME. Bu bir sayım kartı; `docs/`, `web/`, `README.md`'ye
  tek karakter yazma.
- Yalnızca `GECE/` altına yaz.
- "Site iyi görünüyor / temiz" yasak (§0.2, RULES inv.3). Her hüküm bir
  dosya yolu + satır numarası taşır.
- Hüküm verme, SAY. "Bu iddia kaldırılmalı" deme; "bu iddia kanıtsız, kanıtı
  olacak test yok" de.
- Commit ATMA.

## SÜRE TAVANI
maxTurns 40.
