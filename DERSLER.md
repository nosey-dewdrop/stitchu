# DERSLER — stitchu motor tarihçesinin damıtılmış hafızası

> Bu dosya 150+ eski md/rapor silinmeden ÖNCE onlardan damıtıldı (2026-07-24 temizlik turu).
> Amaç: batan yaklaşımları tekrar denememek, çalışanları korumak. Tarih değil DERS.
> Kod/veri gerçeği: `contract/*.json` (kodun okuduğu TEK şey) + `reports/gate/kapsam-checkpoint.json`.

---

## ÇALIŞAN YAKLAŞIMLAR — korunmalı (kanıtlı)

- **LLM JSON yazar, kod DEĞİL.** Model asla .svg/.html üretmez; sadece kapalı-enum şemalı JSON. Sayılar denetlenebilir, sürümlenir. (stitchu'nun asıl mimari kararı.)
- **Golden byte-identical testi.** Pinli sabit dump'a karşı her build taze çıktıyı çeker; regen-vs-regen yasak. Sessiz sürüklenmeyi bu yakalar.
- **Round-trip invariant** (spec→parça→spec geri). Yalnız bu kontrol `sleeveStyle:'puff'→None` sessiz düşüşünü yakaladı.
- **İç vs dış tutarlılık ayrımı.** Geometri "parçalar dikilir mi?" der; "elbiseyle uyuşur mu?" AYRI kanat. İkisi de gerekli.
- **Walking-the-seams doğrulaması.** Yan-dikiş balansı + omuz çifti + armhole/kol-kapağı eşleşmesi üretim öncesi tablo kontrolü.
- **4 kanatlı kapı (gate).** compile + flat + bant + parça + terzi gözü, deterministik ölçüm. Hakem üreteni yargılamaz.
- **Bridge-guard mandalı.** Köprü fallback'ı spec-driven yoldan uydurursa MANDAL kilitler (mutasyonla kanıtlı ctest).
- **İki-katman parser** (TOKEN_TERMS → FEATURE → COMBINE). Devrik cümlelerde tutarlı.

## BATAN / TERK EDİLEN — bir daha DENEME (en değerli kısım)

- **Sessiz enum fallback.** puff→None, neckline→Crew, skirt→ALine: bilinmeyen değere Err yerine varsayılan atamak = halüsinasyon. KURAL: primitif yoksa `ÜRETİLEMEZ` + eksik yaz, ASLA ikame.
- **İkame ile sahte GEÇTİ.** id31/44 square yerine crew çizilince hakem "geçti" gördü ama spec square değildi → geri alındı. İkame kapıyı kandırır.
- **Görsel doğrulamadan "iyi" demek.** SVG path'e / test output'a bakıp beğenmek yasak. render→PNG→GÖZLE bak, gerçek çıktıyı gör.
- **Şablon-tabanlı kılavuz metni.** Motor "babydoll görünce princess/gore/biye" istatistik ortalaması uydurdu. Kılavuz adımı üretilmiş parçanın GERÇEK kenarından türemeli.
- **Parça-listesi ↔ kılavuz bağlantısız.** "Kesilen dikilemez" kontrolü yoksa kılavuz olmayan parçayı anlatır. Header'da 8 parça, kesim listesinde 7 = phantom.
- **Uydurma eşik.** Emsal ölçülmeden sayı koymak (giriş guard mutlak 150mm çevre) matematiksel yanlış çıktı. Bilmiyorsan `ÖLÇÜLMEDİ` yaz.
- **A0 ölçek-down %69.4.** "Kalibrasyon karesine göre büyütün" = fiziksel hatayı müşteriye atmak. Parçaları döndür ya da iki A0'a böl.
- **Türkçe glyph kırpılması.** ğ/ı/ş font subset'e girmeyince üç kalıpta üç kez bozuldu. Subset'i kontrol et.
- **v1 "cut on fold varsayılan" yanlışı.** Sektör standardı CUT 1 PAIR (dikiş var); katlama İSTİSNA. v2'de düzeltildi.
- **Shadow-spec / çift kalibrasyon.** Elle-shirr (casing) vs fizik-shirred (panel) farklı konstrüksiyon; "iki şey = bir iş" sanmak. Template figür bandı (EU36) vs emsal PDF ölçüsü ayrı kaynak. KURAL: spec.field = TEK kaynak.

## HÂLÂ AÇIK / KIRMIZI (motor işi)

- **Halter V-dip artefaktı** (id21): ön CF birleşiminde mirror yarığı. 3 iterasyon, CF yatay-tangent kapanış gerekli.
- **Off-shoulder topoloji** (id46 vb): bardot band buildHalf mirror'da tutmuyor (halter-sınıfı). Ayrı buildHalf dalı + 3 deneme kuralı.
- **Köprü fallback id4**: spec-driven yol top-cami eşleşmesini tutturmuyor, fallback'ten çiziliyor. Kapatılmalı ya da ÜRETİLEMEZ.
- **Kumaş güvenliği**: kapanışsız dar yaka woven ise guard reddediyor. Parser fabric ataması (dar+kapanışsız → knit öner) eksik.

## TEKRAR EDEN TÖKEZLEME KALIPLARI

1. **Spec-motor eşleşme boşluğu** — gramer-temiz spec üretilir ama compile() referans-stil bulmaz (id4, id14/52/66/77). Spec doğru, KÖPRÜ eksik → sahte fallback riski.
2. **Ölçüm yokken uydurma** — landmark/band/parça-sayısı bilinmeyince olmayan threshold eklenir.
3. **"Ölçülmeden geçti" dendi** — hakem-teyit olmadan sayaç şişirildi. Bunu YAPMA.
4. **Topoloji değişimi = yüksek risk** — omuz/armhole atlayan her düğüm (halter/off-shoulder) mirror/CF gerekliliklerini kırar.

---

## SAYAÇ KARMAŞASININ GERÇEĞİ (2026-07-24 ölçümü)

Bu proje 10 farklı dosyada 10 farklı sayaç iddia ederek kendini tıkadı. TEK GERÇEK:
- **24 hakem-teyitli GEÇTİ / 103 hedef** → `reports/gate/kapsam-checkpoint.json` + NABIZ.md son satır. Makine-okunur, en güvenilir.
- Web canlı **27/54** = FARKLI metod (foto→tam kalıp, term-registry) — yanlış değil, başka ölçek.
- CLAUDE.md'deki **37/54** = BAYAT, eski regex metodu, terk edildi.

**KURAL BUNDAN SONRA:** Sayaç TEK yerde yaşar — `kapsam-checkpoint.json`. Md'ler sayaç yazmaz, oraya işaret eder. Bir daha "hangi dosya doğru?" sorusu olmayacak.
