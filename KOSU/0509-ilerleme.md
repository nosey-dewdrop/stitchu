# 0509 koşusu — ilerleme (11.3; koşunun tek ilerleme görünümü)

| tarih-saat | adım | durum | commit | saat | tek cümle |
|---|---|---|---|---|---|
| 2026-09-05 gece | A1a koşucu | HAZIR | 1 | — | `KOSU/0509-kosu.js` yazıldı; syntax OK (AsyncFunction parse), kuru koşu 0 ajan çağrısıyla A1b→A12 sırasını bastı; işçi brief'i adım başına 647-878 kelime, hakem 279, karar 131; A9 `args.satarim` olmadan PROVA-BEKLIYOR'da durdu (beklenen). Sıradaki: Damla "başla" → `Workflow scriptPath=KOSU/0509-kosu.js` → A1b. |
| 2026-09-06 | A1a koşucu v2 | HAZIR | 1 | — | Akış v2 işlendi (referans kilidi, ivme, A2a/b, A6a-e, güvenli taban, devir notu); kuru koşu syntax OK, 0 ajan; işçi brief 650-1008 kelime. Sıradaki: Damla "başla". |
| 2026-09-06 | A1a koşucu v2.1 | HAZIR | 1 | — | Dört çelişki kapandı (13.19): ölçek çözücüde sert kısıt, kapi.sh stdout yalnız JSON, locality etkilenen küme ilanı, grafdogrula/solver_utils kilitte. Kuru koşu syntax OK. |
| 2026-09-06 | A1a koşucu v2.2 | HAZIR | 1 | — | En kötü senaryo taraması (13.20): resume yükleme, tag -f, bütçe sayacı, uygula sonrası kilit, tur bütçesi, dosya bazlı kilit, A1b/c ve A2a/b/c bölünmesi, ucuz metrik, regresyon tabanı, DEVAM şartı, hakem tavanı, kilit açma, satmam yolu; anahtar yok → işçi okuması + önbellek. Kuru koşu syntax OK. |
| 2026-09-06 | A1a koşucu v2.3 | HAZIR | 1 | — | 11 yama: regresyon Day-0 tabanı, kapi.sh boş değişken/CRASH, locality float toleransı, derleme çukuru ayrı bütçe, ERR_UNSOLVABLE yönü, kapı yokluğu yeşil, ivme yalnız sayısal, etkilenen küme C++ BFS, A9 Chrome 300 s, açık soru denemesi yakmaz, aynı-insan A5'te yumuşak. Kuru koşu syntax OK, brief 1032-1449 kelime. |
| 2026-09-06 | numaralandırma + oturum planı | HAZIR | 1 | — | Adımlar A1-A12 oldu (bölüm numarasıyla karışıyordu). Koşucu `args.sadece="A1,A2"` ile yalnız o adımları koşup DURUR; atlama yasağı: açılan adımdan öncekiler state.json'da GEÇTİ değilse başlamaz. Oturum planı belgede §4 tablosunda. |
