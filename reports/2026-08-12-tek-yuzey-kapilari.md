# tek 3B yüzey günü — G0-G4 kapıları kapandı (10-12 Ağu koşusu)

## kapı skoru?

| Kapı | Nesne | Sonuç |
|---|---|---|
| **G0** | Buğra yer-gerçeği fikstürü (`flatten-research/fixtures.py`) | perim 1685.8mm, 0.021mm sapmayla yeniden üretildi ✅ |
| **G1** | Sertifikalı ARAP (`15-arap-proper.py`) — 04-BUGGY'nin ömürlük halefi | koni: strain %0.0037 + sektör açısı analitiğe 0.0058°; kalot: deficit'e 0.47°, strain 02 paritesinde ✅ |
| **G2** | Pens korunumu (`16-dart-conservation.py`) | **gerçek Buğra pensi 41.5° = develop-deficit'in kendisi (41.48°)**; K=16'da 0.50° farkla çıkıyor, strain %0.371; toplam, yerleşimden bağımsız (yayılım 0.057°) ✅ |
| **G3** | Tek yüzey + tek bel eğrisi (`17-garment-surface.py`) | yüzey çevreleri kontrat mm'sine 0.000; **gövde-altı vs etek-üstü farkı 0.000000mm** (üretim hattı: +2.947) ✅ |
| **G4** | Panel flatten + tapu | ön/arka strain %0.223; yan dikiş çifti 0.154mm ≤ 0.79375mm (1/32") ✅ |
| G5 | Buğra landmark mm kıyası | AÇIK — yüzeye omuz/kol oyuğu eğrileri gerek (sonraki oturum) |
| G6 | Round-trip sertifikası | AÇIK (plan gereği taşan iş) |

## mimarinin kanıtlanan cümlesi?
Bel eğrisi 3B'de TEK spline olarak yaşayıp bir kez örneklenince, iki panelin kenarları
onu PAYLAŞIR ve 2.95mm sınıfı halka farkı test edilmez — VAR OLAMAZ. `17`'nin çıktısı
bunu üretim hattının dondurulmuş arızasıyla yan yana basıyor.

## dürüst notlar (kapıya bağlanmayan)?
- `17`'deki yüzey yapısal kanıt içindir: elips oranı 1.35, bel→koltukaltı 180mm, ease 0
  AÇIK VARSAYIM etiketli. Kapılar bu sayılara değil YAPIYA bakıyor (kalibrasyon, paylaşım,
  tapu). Gerçek gövde kesitleri + ease alanı d(t,φ) + omuz/kol oyuğu → G5'in işi.
- Tek pensli gerçek kullanım: kalot tek pensle açılırsa metrik ~%6.6 strain'i kumaş
  ease'iyle taşır — `16` bunu rapor ediyor, gerçek kalıp da tek pensle tam bunu yaşıyor.
- İlk G2 kurgusu (kısmi yarık) %22 strain verdi ve ATILDI — dosyanın başında gerekçesi
  duruyor; çöp shiplenmedi.

## yol boyu bulunan ve düzeltilenler (sorulmamış ama önemli)?
1. **Build tipi kayıptı:** temizlik rebuild'i `CMAKE_BUILD_TYPE` BOŞ kurmuştu → `engine_check`
   2684s'e şişti, push kapısının 900s'lik koşusu hiç sığmıyordu. Release ile 2684s → **19s**.
   (`pushGate.timeoutSec=900` `.rabadon/guard.json`'da — süit artık rahat sığıyor.)
2. **Arşiv hatası harness'çe yakalandı:** `gradeset-2026-08-01` canlı referansmış
   (test_seamdeed) → geri alındı; keşif ajanının "referanssız" etiketi yanlıştı.
3. **katman-lint envanteri:** tek ihlal `printpack.py`'nin `import mapping`'i (L4 hakem
   üretici içini okuyor) — rapor modunda duruyor, Faz C'de kökten kalkacak.
4. Kalemde `stash@{0}` duruyor ("wip pen revision" — etek kıvrım çizgisi cilası, bugünkü
   işle ilgisiz). Damla kararı: uygula/at.

## Damla kararı bekleyenler?
- `Logs/katalog-2026-08-05` (3.8G) arşivi; `~/stitchu-arsiv` tarball'larının kaderi;
  `design_patterns/Arşiv.zip` bulut yedeği; git geçmişi filter-repo kazısı (eski karar açık).
