# GECE7 — DURUM (şef tutanağı)

Koşu: KOSU-v7. Şef kod yazmaz (Halka 0 hariç); kart yazar, ajan salar, hakem salar.
Hedef sabit: **fotoğraf + prompt → kalıp + flat.**

## Sıra — §4 HALKA YAPISI (26 Ağu düzeltmesi)

| Halka | Fazlar | Durum |
|---|---|---|
| **0 — ISINMA** | disk + hedef koşusu tabanı | ✅ **BİTTİ** (şef koşturdu) |
| **1 — AL DENE** | **F-İNDİR** → F0 → F2 | ← şimdi buradayız |
| **2 — MOTOR** | F3 ⇄ F5 (operatör başına alt-kart) | bekliyor |
| **3 — DERİNLİK** | F4 → F6 → F7 → F8 → F9 | bekliyor |

**F1 Halka 0'a soğuruldu.** **F3B bu koşudan ÇIKARILDI**, H7 hedef koşusunda yok.

## Tablo

| Faz | Etiket | Ajan | Hakem | Durum |
|-----|--------|------|-------|-------|
| Halka 0 | `halka0-yesil` | şef (ajan yok) | — | ✅ BİTTİ, kart `GECE7/HALKA0.md` |
| F-İNDİR | **`F-INDIR-yesil`** ✅ | 2 tur koştu, `ee1414c`+`072705c` → `cce710d`+`fac2993` | 2 tur koştu | ✅ **GEÇTİ** (2. tur) — kart `GECE7/F-INDIR.md`, hüküm `GECE7/HAKEM-F-INDIR.md` |
| F0 | `F-INDIR-yesil`'den dallanır | — | — | SIRADAKİ — kart **`GECE7/F0.md`** (hakem yazdı) |

> ▶ **KOŞU AÇILDI** (26 Ağu, Damla): Halka 1 → F-İNDİR → F0 → F2, sonra Halka 2
> (F3 ⇄ F5), sonra Halka 3 (F4 → F6 → F7 → F8 → F9). **F9 kapanana kadar durulmaz.**
> F3B koşulmaz. Damla koşunun dışındadır (§3.4); zevk kararları dahil her karar
> hakeme gider, hakem `GECE7/KARARLAR.md`'ye gerekçesiyle yazar.

## İKİ DÜZELTME — her faz ajanına ve hakeme geçirilir (26 Ağu, Damla)

1. **H10 ikiye ayrılır.**
   - **H10a** — fotoğrafta **görünmesi mümkün olmayan** alanlar (arka, iç, örtülü).
     **Cırcıra BAĞLANMAZ**; yükselmesi tek başına faz kapatmaz da kapatmamazlık etmez.
   - **H10b** — fotoğrafta **görünen ama alınamayan** alanlar. **Cırcır YALNIZ H10b'ye
     bakar** ve §0B tavanı H10b'ye uygulanır: H10b yükselirken H2 yükselmiyorsa faz kapanmaz.
   - Taban tablosundaki tek `H10 %58.3` sayısı **ayrıştırılmamıştır**; ayrıştıran ilk faz
     iki sayıyı da `n`'siyle basar, hakem tabanı günceller (§3.8 md.1 — tabana yalnız hakem dokunur).
2. **F2'nin İLK işi §1F fotoğraf havuzu.** dropped 10 silinir, havuz **19'a** iner, kalan
   19'un **künyeleri** çıkar (kaynak, lisans, çekim koşulu), **hakem etiketler** — H2'nin
   doğru cevabı makine etiketi olmaktan çıkar. F2'nin başka hiçbir işi bu bitmeden başlamaz.

## Son kapı sayıları — taban, n=5

`ctest --test-dir engine/build -R hedef_kosu` · taban `contract/hedef-kosu-taban.json`

| H1 | H2 | H3 | H4 | H5 | H6 | H8 | H9 | H10 | H11 |
|----|----|----|----|----|----|----|----|-----|-----|
| 5/5 | %92.2 | 4 | ÖLÇEMEDİM | 0 / 5 çift | ÖLÇEMEDİM | 31 | ÖLÇEMEDİM | %58.3 | 3.1 ms |

- H2'nin doğru cevabı **makine etiketi** (§1F) → sayı geçici.
- H5 yalnız `armhole↔sleeve_cap` çiftinde ölçülebiliyor; kalıpta başka kenar rolü ilan edili değil.
- H11 cırcıra değil **tavana** bağlı (<10 sn) ve **VLM turu hariç**.

## ctest

**Sayma yöntemi düzeltildi (hakem, K3): resmi sayı `ctest -N`'in listelediğidir,
`grep -c add_test` DEĞİL** — CMakeLists satır 906'da bir *yorumun* içinde
`add_test(NAME …)` geçiyor ve grep'i 1 fazla saydırıyor. Eski "119 test" o şişmiş sayıydı.

| ağaç | listelenen (`ctest -N`) | DISABLED | koşan | yeşil | kırmızı |
|---|---|---|---|---|---|
| Halka 0 sonu (`34586c8`) | 118 | 1 (`h10_gate_check`) | **117** | 111 | **6** |
| F-İNDİR 1. tur (`b791db5`) | 119 | 1 (`h10_gate_check`) | **118** | 111 | **7** ⛔ |
| **F-İNDİR 2. tur (`fac2993`)** | **120** | 1 (`h10_gate_check`) | **119** | **113** | **6** ✅ |

F-İNDİR iki tur boyunca **iki test ekledi** (`indir_check` #120, `flat_tables_check` #95).
Hiçbir test silinmedi/yeniden adlandırılmadı.

**Miras 6 kırmızı (değişmedi):** `flat_pattern_agree_check` · `flat_artifact_census` ·
`style_check` · `sizechart_source_check` · `contract_check` (ilan edilmiş karar,
bilerek kırmızı) · `figure_check` (`dress_bandeau_circle` pinsiz).

✅ **7. KIRMIZI KAPANDI (2. tur):** `vocab_reference_check` yeşil. `garment` SCOPE içinde
**1188 → 1137** (taban 1186). Taban ve kapı betiği **bayt bayt dokunulmadı**
(`git diff --stat 34586c8 HEAD` boş). Düşüş kapalı enumun sökülmesinden:
`create.js`'te doğrudan enum karşılaştırması **44 → 4**. Hakem ayrı worktree'de
kendi saydı; −51'in dosya dosya dağılımı `GECE7/HAKEM-F-INDIR.md` §2'de.

## Son kapı sayıları — taban DEĞİŞMEDİ (n=5)

`ctest -R hedef_kosu` **YEŞİL**, H1–H11 taban değerinde; F-İNDİR görme/çıkarım
hattına tek satır dokunmadı. `contract/hedef-kosu-taban.json`'a dokunulmadı
(doğrulandı: dosyanın tek commit'i `f56941e`, Halka 0). H11 3.1 → 3.3 ms duvar
saati salınımıdır ve H11 cırcıra değil **tavana** (<10 sn) bağlıdır.

## Hakemin son hükmü

✅ **GEÇTİ** — kalıp **ve** flat artık ikisi de kullanıcının diskine iniyor (hakem ölçtü: 5 dosya `Logs/indir-check/`, flat ön+arka, çizime bakıldı), ctest **6 failed out of 119** = tam miras altı, `vocab_reference_check` **1137/1186** yeşil ve taban dokunulmadan, `hedef_kosu` yeşil ve altı sayı kötüleşmedi, hakemin **dört mutasyonunun dördü** kırmızı yandı; etiket `F-INDIR-yesil` atıldı, sıradaki kart `GECE7/F0.md`.

## Açık kuyruk

`GECE7/DAMLA.md` — 4 soru, hepsi en kısıtlayıcı varsayımla ilerletildi, koşu durmadı.

## Notlar

- GECE7/ 2026-08-26'da açıldı; önceki koşu klasörü `GECE/`.
- Damla'ya soru sorulmaz; `GECE7/DAMLA.md`'ye yazılır, varsayım karta işlenir.
- §3.8 md.1: **faz ajanı `contract/hedef-kosu-taban.json`'a dokunamaz.** Değiştiren hakemdir.
