# HALKA 0 — ISINMA (şef koşturdu, faz ajanı salınmadı)

2026-08-26. §4 HALKA YAPISI: "disk temizliği + hedef koşusunun tabanı →
ratchet'in ölçeceği bir taban doğar."

## 1. DİSK — 4.1 GB açıldı, boş disk 145 → 149 GB

Silinen yalnız **çağıranı olmayan makine çıktısı**:

| Ne | Boyut | Neden silindi |
|---|---|---|
| `Logs/katalog-2026-08-05/` içindeki **22.704 hücre dizini** | ~3.5 GB | `katalog.py` çıktısı, kodda çağıranı yok |
| `design_patterns/Arşiv.zip` | 297 MB | 73 PNG'nin **CRC'si diskteki kopyalarla birebir aynı** (73/73 doğrulandı), çağıranı yok |

`Logs/` 4.0 GB → 593 MB · `design_patterns/` 787 MB → 490 MB.

**Kanıt bilerek korundu:** `cells.jsonl` (17 MB), `katalog-index.json` (14 MB),
`matrix-summary.json`, `kontakt/` duruyor — "%96.3" iddiasının verisi bunlar,
silinen sadece ham hücre çıktısıydı.

**SİLİNMEDİ ve neden:**
- `Logs/paket-2026-08-06/` — `engine-check/harness/run-all.sh:61` onu okuyor (canlı çağıran).
- `new_flats/` (92 MB) — **satın alınmış telifli malzeme**, üstelik `volume_1/volume_2`
  `goldens-v2.json` · `boxpleat.hpp` · `yoke.hpp` tarafından çağrılıyor. Git'te
  değil, yani silme geri alınamaz. Şefin tek taraflı kararı değil → `DAMLA.md`.
- `design_patterns/crops/` + `flats-clean/` — `imitate.mjs`, `flat-metre.py`,
  `goldens.json` çağırıyor.
- Küçük `Logs/taban-*` ve `gradeset-*` dizinleri (~250 MB) — raporlarda kanıt
  olarak anılıyor, kazancı riskini karşılamıyor.

## 2. HEDEF KOŞUSU KURULDU

`engine/tests/hedef_kosu.mjs` + `add_test` (kök `package.json` yok, doğru).
Tek komut, §3.6'nın istediği:

```
ctest --test-dir engine/build -R hedef_kosu
```

Zincirin hiçbir halkası taklit edilmiyor — ürünün kendi fonksiyonları koşuyor:
bankalı `seen` → `web/js/vision-bridge.js` pick* → `engine/dist` draftJSON →
`engine/tools/render-garment-flat.mjs`.

**SIFIR API ÇAĞRISI, SIFIR KURUŞ** (§3.9): fixture `vision/eval/live-2026-08-22.json`,
mühürlü. Yenilemek bir faz kararıdır.

## 3. TABAN SAYILARI — `contract/hedef-kosu-taban.json` (n=5)

| # | Sayı | Taban | Not |
|---|------|-------|-----|
| H1 | Tamamlanma | **5/5** | beşi de kalıp + flat üretti |
| H2 | Görülen alanda isabet | **%92.2** | 47/51 alan yargısı |
| H3 | Uydurma alan | **4** | göz "görünmüyor" dedi, vision değer bastı, ilan yok |
| H4 | Gereksiz dikiş | **ÖLÇEMEDİM** | F5'in dört sebep katmanı kodda yok |
| H5 | Dikilebilirlik | **0 / 5 çift** | ⚠ kalıpta yalnız `armhole`+`sleeve_cap` rolleri ilan edili |
| H6 | Konvansiyon sapması | **ÖLÇEMEDİM** | manken çapası `flat_convention_check` içinde, bu koşuya bağlı değil |
| H8 | İfade edilemeyen | **31** | 26 outOfVocab + 5 sözlükte olmayan alan okuması |
| H9 | Çıkarımda makullük | **ÖLÇEMEDİM** | görünmeyen alanda makullük hakemi yok |
| H10 | Çıkarıldı oranı | **%58.3** | 70/120 alan default'tan geldi |
| H11 | Süre | **medyan 3.1 ms** | ⚠ VLM turu HARİÇ; tavana bağlı (<10 sn), cırcıra değil |

**H2 = %92.2, n=5 — §3.6'nın yazdığı sayının aynısı.** Harness bağımsız olarak
aynı rakamı üretti; doğru şeyi ölçtüğünün kanıtı. H8'in 26'sı da §1B ile aynı.

### Halka 0'ın en sert bulgusu: H10 = %58.3
Motora giden spec'in **yarısından fazlası fotoğraftan değil, default'tan geliyor.**
İlk ölçümümde bu %8.3 çıkmıştı, çünkü yalnız gözün 12 alanını sayıyordum; motorun
gördüğü **tam yüzey** üzerinden sayınca gerçek ortaya çıktı. §0B'nin tavanı
tam olarak bunun için var: H10 yükselirken H2 yükselmiyorsa faz kapanmaz.

## 4. MUTASYON KANITI (§3.8 md.3) — `GECE7/log/halka0.mutasyon.txt`

Kırmızı olamayan kapı, kapı değildir. Dördü de koşturuldu:

1. Değişmeden **üç koşu** → üçü de `CIRCIR SAĞLAM`, exit 0 (gürültüde yanmıyor).
2. Taban sıkılınca (H2 tabanı 99'a) → **EXIT 1**, iki sayı kırmızı; H10 tavanı da ateşledi.
3. Motor kırılınca (`garment='ZZBOZUK'`) → **EXIT 1**, H1 5/5 → **0/5**.
4. Geri alınınca → **EXIT 0**, yeşil.

**Mutasyonun bulduğu iki gerçek hata düzeltildi:** H11 eşitlik cırcırına bağlıydı
ve duvar saati ±0.3 ms sallanmasında kırmızı yanıyordu (böyle bir kapıyı herkes
yok saymayı öğrenir) → tavana bağlandı. H3'ün tanımı "sözlükte yok" idi, bu
KELİME sınıfıdır, uydurma değil → §3.6'nın tanımına çekildi, H8'e taşındı.

## 5. CTEST — 118 → 119 test, main durumu

`117 testin 111'i geçti, 6 kırmızı. Altısı da Halka 0'dan ÖNCE kırmızıydı`
(`hedef_kosu` yeşil geçti, 0.08 sn).

§1B dört kırmızı biliyordu; **iki tanesi listede yoktu, bu koşuda ölçüldü**:

- `contract_check` — **kaza değil, İLAN EDİLMİŞ KARAR.** `patterns_real/`'ın 41
  takipli telifli dosyası sayılıyor; Damla 17 Ağu'da "pdfleri silmicem, satın
  aldım" dedi, kapı bilerek kırmızı bırakıldı ki bedel görünür kalsın.
  Doğrulandı: benim eklediğim `contract/hedef-kosu-taban.json` ile ilgisi yok
  (dosyayı kaldırıp yeniden koştum, yine kırmızı).
- `figure_check` — tek stil düşürüyor: `dress_bandeau_circle`, "tabansız —
  figure-bands mandal.taban_v3'te pin yok". Diğer 17 stil yeşil.

Bilinen dört kırmızı: `flat_pattern_agree_check` · `flat_artifact_census` ·
`style_check` · `sizechart_source_check`.

## 6. VARSAYIMLAR (§3.4 — Damla'ya sorulmadı, en kısıtlayıcısı seçildi)

1. **n=10 değil n=5.** Bugün tam şemalı VLM okuması olan fotoğraf sayısı 5
   (`live-2026-08-22.json`). 10'a çıkarmak API parası yakar = faz kararı, Halka 0
   kararı değil. Taban n=5 ile basıldı ve her sayının yanında `n` yazıyor.
2. **`dataset/hedef-10/` kurulmadı.** §1F onu F2'nin işi olarak sayıyor
   (10 mühürlü + 5 yedek + KAYNAK.md). Halka 0 mevcut fixture'ı mühürledi.
3. **Telifli hiçbir şey silinmedi.** Git'te olmayan satın alınmış malzemenin
   silinmesi geri alınamaz; şefin tek taraflı kararı değil.
