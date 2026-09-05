# 0509 koşusu — ilerleme (11.3; koşunun tek ilerleme görünümü)

| tarih-saat | adım | durum | commit | saat | tek cümle |
|---|---|---|---|---|---|
| 2026-09-05 gece | 4.0a koşucu | HAZIR | 1 | — | `KOSU/0509-kosu.js` yazıldı; syntax OK (AsyncFunction parse), kuru koşu 0 ajan çağrısıyla 4.0b→4.11 sırasını bastı; işçi brief'i adım başına 647-878 kelime, hakem 279, karar 131; 4.8 `args.satarim` olmadan PROVA-BEKLIYOR'da durdu (beklenen). Sıradaki: Damla "başla" → `Workflow scriptPath=KOSU/0509-kosu.js` → 4.0b. |
| 2026-09-06 | 4.0a koşucu v2 | HAZIR | 1 | — | Akış v2 işlendi (referans kilidi, ivme, 4.1a/b, 4.5a-e, güvenli taban, devir notu); kuru koşu syntax OK, 0 ajan; işçi brief 650-1008 kelime. Sıradaki: Damla "başla". |
| 2026-09-06 | 4.0a koşucu v2.1 | HAZIR | 1 | — | Dört çelişki kapandı (13.19): ölçek çözücüde sert kısıt, kapi.sh stdout yalnız JSON, locality etkilenen küme ilanı, grafdogrula/solver_utils kilitte. Kuru koşu syntax OK. |
| 2026-09-06 | 4.0a koşucu v2.2 | HAZIR | 1 | — | En kötü senaryo taraması (13.20): resume yükleme, tag -f, bütçe sayacı, uygula sonrası kilit, tur bütçesi, dosya bazlı kilit, 4.0b/c ve 4.1a/b/c bölünmesi, ucuz metrik, regresyon tabanı, DEVAM şartı, hakem tavanı, kilit açma, satmam yolu; anahtar yok → işçi okuması + önbellek. Kuru koşu syntax OK. |
