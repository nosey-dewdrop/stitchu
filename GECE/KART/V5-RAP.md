# KART V5-RAP — İKİ EKSİK İŞÇİ RAPORU (kod yazma)

## NE
`sewability_check.mjs` (V5-A) ve `draft_math_check.mjs` (V5-D) yazıldı,
koştu, kanıt logları diske düştü — ama İŞÇİ RAPORLARI hiç yazılamadı
(oturum kesildi). Diskteki loglardan iki raporu yaz. Yeni ölçüm yapma,
LOGDAKİ sayıyı KOMUTU YENİDEN KOŞTURARAK doğrula.

## ETİKET
PARALEL (V5-E ile). SÜRE TAVANI: 45 dk.
⚠ DOSYA KİLİDİ: `engine/` altında HİÇBİR dosyaya yazma — o ağaçta şu anda
BAŞKA bir işçi çalışıyor. Sen yalnız `GECE/V5-A.md` ve `GECE/V5-D.md`
yazacaksın. Başka dosya yok.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- engine/tests/sewability_check.mjs        (SADECE OKU)
- engine/tests/draft_math_check.mjs        (SADECE OKU)
- GECE/log/V5-A.bostest.txt · GECE/log/V5-A.mutasyon.txt
- GECE/log/V5-A.ctest.after.txt
- GECE/log/V5-D.run.txt · GECE/log/V5-D.bostest.txt
- GECE/log/V5-D.mutasyon.txt · GECE/log/V5-D.remedy.txt
- GECE/log/V5.ctest.opening.txt

## YAPILACAK
1. `GECE/V5-A.md` yaz. Bölümler: yapılan (dosya yolu + commit hash) ·
   ölçülen (sayı + onu basan komut) · yapılamayan (sebep) · kart dışı
   fark edilen. İçinde MUTLAKA olacaklar:
   - yedi maddenin HER BİRİ için bugünkü hüküm (SAYI ya da `ABSENT: sebep`);
   - 7 ABSENT'in ADIYLA listesi ve her birinin kök sebebi;
   - §4.2 boş test hükmü (`GECE/log/V5-A.bostest.txt` exit kodu ADIYLA);
   - §4.5 mutasyon hükmü (211→216 ve selfcross 0→44 ADIYLA);
   - ★ §4.7: tek kırmızının (211 kenar çentiğinin tabanı kesim çizgisinde
     değil) KÖK TEŞHİSİ + en az bir ÖLÇÜLMÜŞ çözüm adayı. Ölçüm yapman
     gerekirse `node engine/tests/sewability_check.mjs` koş ve çıktıyı ver;
     kaynak kod DEĞİŞTİRME. Aday ölçülemiyorsa "aday ÖLÇÜLMEDİ" yaz —
     UYDURMA.
   - ⚠ `GECE/log/V5-A.ctest.after.txt` KESİLMİŞ bir logdur (test 106'da
     duruyor, hüküm satırı YOK). Bunu ADIYLA yaz, "ctest geçti" DEME.
2. `GECE/V5-D.md` yaz. Aynı bölümler. İçinde MUTLAKA olacaklar:
   - 8 bedenin yargı sayımı (GEÇTİ 12 · KALDI 12 · KAYNAKSIZ 40) ve bunu
     basan komut;
   - 12 ihlalin ADIYLA hangi kalem/hangi beden olduğu;
   - RATCHET tavanlarının dördü (scye_depth · shoulder_width_front ·
     shoulder_width_back · back_neck_drop) sayısıyla;
   - §4.2 ve §4.5 hükümleri;
   - §4.7: `GECE/log/V5-D.remedy.txt`'nin ölçtüğü adaylar (bust +1.5cm,
     hip +3.5..5.0cm) ve BEDELİ — bu bir gövde girdisi kaymasıdır, golden
     mührünü ve pinleri etkiler; "uygulandı" DEME, aday olarak yaz;
   - ★ `body.shoulder` ÖLÜ GİRDİ bulgusu (10..80cm arası kalıp geometrisi
     bayt bayt aynı) — bu `sizechart_source_check` kırmızısıyla kesişiyor,
     ADIYLA yaz.
3. Her raporda kullandığın HER sayı için ya komut çıktısı ya dosya yolu +
   satır numarası olacak.

## YASAKLAR
- Kod yazma. `engine/` altında hiçbir dosyayı DEĞİŞTİRME (okumak serbest).
- `engine/CMakeLists.txt`'e dokunma, `add_test` ekleme, ctest KOŞTURMA
  (paralel işçi koşuyor, çakışır).
- "Baktım / doğru görünüyor / çalışıyor" YASAK (RULES 3).
- Hüküm YUMUŞATMA: kapı kırmızıysa kırmızı yaz. "Neredeyse geçti" yok.
- `patterns_real/` PDF'lerine dokunma.

## ÇIKTI
- `GECE/V5-A.md` · `GECE/V5-D.md`
Bitince commit at (lowercase english), hash'i bana raporunda yaz.
