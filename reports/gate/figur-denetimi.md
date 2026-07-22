# FİGÜR DENETİMİ — flat'ler croquis figürüne oturuyor mu? (2026-07-22)

> Damla emri: FIGURE_BASE turuna girmeden önce sayıyla gör — boru/kutu mu,
> figürel mi. SALT ÖLÇÜM: repo'ya kod yazılmadı, pin'e dokunulmadı, motor
> C++/golden byte-identical. Ölçüm göz kararı DEĞİL — `<path class="body">`
> SVG geometrisinden ekstremum-tabanlı (script /tmp/figur/measure.mjs).
> Damla'nın sözü: "gusto algımız yetmez ama teknik çizim tamamen matematiksel iş" — bu rapor onu sayıya döküyor.

═══════════════════════════════════════════════════════════════════
## TEK CÜMLE HÜKÜM
**16 flat'ten 8'i BORU (bel/göğüs oyuğu YOK) — ve boru olanların HEPSİ TOP,
figürel olanların HEPSİ DRESS.** Sınır tam garment tipinde: top gövdesi
(`buildHalf` garment==='top' dalı) bust=shoulder=hip kutu çiziyor, bel çekmesi
uygulanmıyor. Dress gövdesi figürel (bel oyuğu 0.71-0.77). FIGURE_BASE turu
ÖNCE 8 top stilini etkiler; dress'ler zaten banda yakın.

═══════════════════════════════════════════════════════════════════
## 1) REFERANS ORAN BANDI (kaynak öncelik: template > emsal > EU36)

| Metrik | Değer | Kaynak | Not |
|---|---|---|---|
| waist/bust (bel oyuğu) | **~0.78** | EU36 dress-form 66/84 (Damla verdi) | ana fit metriği; croquis'te bel belirgin girer |
| waist/hip | ~0.72 | EU36 66/92 | flat'te hip ölçülemedi (aşağı bak) |
| bust/hip | ~0.91 | EU36 84/92 | — |
| omuz eğim açısı | **ÖLÇÜLMEDİ** | template görselinden derece okunamadı (raster, ölçek yok) | 9-baş croquis'te ~18-22° tipik (literatür), teyit edilmedi |
| göğüs hattı / gövde boyu | **ÖLÇÜLMEDİ** | template'te başlık ızgarası var ama piksel-kalibrasyon yapılmadı | 9-baş: büst ≈ 2. başlık (~0.22 boy), landmark turunda ölçülecek |

**gusto-corpus'ta figür oranı YOK:** `proportion_bands` sadece knob'lar tutuyor
(waistNip/bustProject/skirtFull) — omuz/kalça, bel/kalça, omuz eğimi bandı hiç
kaydedilmemiş. Emsal flat'ler PDF/PNG (SVG değil) → geometrik ölçüm yapılamadı.
Bu başlı başına bir bulgu: **referans figür bandı henüz hiçbir yerde donmuş değil.**

═══════════════════════════════════════════════════════════════════
## 2+3) MEVCUT ÇIKTI ÖLÇÜMÜ + TABLO

Ekstremum tabanlı (omuz=üst %3-9 max, bust=%11-25 max, bel=%27-42 min); göz kararı yok.
Bant referansı waist/bust ~0.78 (EU36). "bant içinde" = 0.72–0.84 penceresi.

| Stil | garment | bust | waist | **waist/bust** | bant içinde? | profil |
|---|---|---|---|---|---|---|
| princess_dress | dress | 82.9 | 58.6 | **0.707** | H (biraz dar) | figürel ✓ |
| wrap_dress | dress | 82.9 | 60.2 | **0.726** | E | figürel ✓ |
| dress_princess_scoop_aline_midi | dress | 82.9 | 60.2 | **0.726** | E | figürel ✓ |
| dress_square_princess_circle (id47) | dress | 82.9 | 60.2 | **0.726** | E | figürel ✓ |
| gore_skirt_dress | dress | 82.9 | 61.8 | **0.745** | E | figürel ✓ |
| dress_boat_aline_tieback | dress | 82.9 | 63.4 | **0.765** | E | figürel ✓ |
| drawstring_babydoll | pinli | 89.5 | 74.3 | **0.830** | E (sınır) | orta |
| peterpan_puff | pinli | 81.9 | 74.4 | **0.908** | H | az oyuk |
| top_boat_princess | top | 70.5 | 69.4 | **0.984** | H | **BORU** |
| top_crew_dart | top | 70.4 | 69.4 | **0.986** | H | **BORU** |
| top_scoop_cami | top | 70.5 | 69.4 | **0.984** | H | **BORU** |
| top_crew_boxy_crop | top | 70.5 | 69.8 | **0.990** | H | **BORU** (kasıtlı boxy) |
| top_crew_boxy_sleeve | top | 70.4 | 69.4 | **0.986** | H | **BORU** (kasıtlı boxy) |
| top_princess_peplum | top | 70.4 | 69.4 | **0.986** | H | **BORU** |
| top_sq_shirred_peplum | top | 70.4 | 69.4 | **0.986** | H | **BORU** |
| top_sq_puff_shirred_peplum | top | 70.4 | 69.4 | **0.986** | H | **BORU** |

Bant dışı olanların HEPSİ **düz yönde** (bel yeterince girmiyor); hiçbiri fazla-dar değil.

═══════════════════════════════════════════════════════════════════
## LANDMARK BULGUSU ("bel NEREDE" — Damla'nın asıl teşhisi)

Ölçüm sırasında metodoloji kanıtı: İLK denememde bel-y'yi gövde boyunun sabit
fraksiyonundan (H*0.34) tahmin ettim → dresslerde waist/hip **>1.0** (imkansız)
çıktı, çünkü etek varken sabit fraksiyon bel yerine etek ortasına düştü.
**Bel landmark'ı bilinmeden bel bile güvenilir ölçülemiyor** — bu tam Damla'nın
"serbest Y yasak, her dikiş landmark'a bağlanmalı" kuralının kanıtı. Ekstremuma
(gerçek en-dar-nokta) geçince sayı doğrulandı.

- **TOP'ta bel yok:** garment==='top' dalı `uaX = shp*0.98` (underarm=omuz), `bustX`
  omuzla eşit, yan kenar bele kadar düz iniyor → en-dar-nokta ≈ bust → boru.
  `waistNip` typical 0.07 uygulanıyor ama etkisi küçük (emp*0.93) ve bust zaten
  dar olduğu için görünmüyor.
- **DRESS'te bel var:** `eX = emp*(1-waistNip)`, bust `emp`ten geniş → nip görünür.
- **landmark koordinat sistemi (figure-landmarks.json) HENÜZ YOK** — neckBase/
  shoulderTip/bustApex/underbust/waist/hip/crotch sayısal tablosu kurulmadı.
  Ölçüm bunun eksikliğini kanıtladı.

═══════════════════════════════════════════════════════════════════
## 4) HÜKÜM (sayıyla)

- **BORU profili veren: 8/16** (waist/bust > 0.93) — **HEPSİ TOP.**
- **Banda yakın/figürel: 6/16** (≤ 0.82) — **HEPSİ DRESS** (+2 pinli orta).
- **FIGURE_BASE turu ÖNCE 8 top stilini etkiler** (bir kısmı, hepsi değil):
  dress gövdesi zaten figürel, top gövdesi kutu. Kök tek yerde: `buildHalf`
  garment==='top' dalı (bust=shoulder, bel çekmesi yok).
- **2 boxy top (crop/sleeve) KASITLI kutu** — Damla onaylı boxy primitifi; bunlar
  düzeltilMEmeli (figüre çekmek boxy karakterini bozar). Yani gerçek düzeltilecek
  boru = **6 top** (crew_dart, boat_princess, scoop_cami, princess_peplum,
  sq_shirred_peplum, sq_puff_shirred_peplum). Bunlar figürel olmalıydı.

**En kötü 3 (boru, görselli):**
- top_crew_dart (0.986) — `reports/gate/figur-img/top_crew_dart.png` (tam dikdörtgen, sıfır oyuk)
- top_boat_princess (0.984) — `reports/gate/figur-img/top_boat_princess.png`
- top_princess_peplum (0.986) — `reports/gate/figur-img/top_princess_peplum.png`

**En iyi 3 (figürel, görselli):**
- princess_dress (0.707) — `reports/gate/figur-img/princess_dress.png` (bel oyuğu + göğüs formu + flare)
- wrap_dress (0.726) — `reports/gate/figur-img/wrap_dress.png`
- dress_princess_scoop_aline_midi (0.726) — `reports/gate/figur-img/dress_princess_scoop_aline_midi.png`

═══════════════════════════════════════════════════════════════════
## 5) OVERLAY (bonus) — ÖLÇÜLMEDİ
Emsal flat'ler PDF/PNG raster + ölçek bilinmiyor → aynı-ölçek overlay güvenilir
kurulamadı (yanlış hizalama yanlış fark haritası verir). Landmark turunda flat
figür koordinat sistemi kurulunca overlay anlamlı olur (template SVG'ye karşı).

═══════════════════════════════════════════════════════════════════
## FIGURE_BASE TURU İÇİN SOMUT GİRDİ (kararı Damla'da)
1. Kök: `_engine-full.mjs` buildHalf garment==='top' dalında bust=shoulder=hip.
   Dress dalındaki figürel gövde mantığını top'a taşı (boxy hariç tutarak).
2. `contract/figure-bands.json` (kaynaklı) + `contract/figure-landmarks.json`
   (bel/omuz/büst/underbust/hip NEREDE) — henüz ikisi de YOK; bu turun ürünü.
3. Bağlama kuralı: her parça bir landmark'a (etek=waist/underbust, askı=shoulderTip,
   empire=underbust). Serbest Y yasağı = suite'e mandal.
4. Kalıp/draft DOKUNULMAZ (zaten EU34-52 gerçek matematik; sorun sadece FLAT figürde).
5. id47 sayaca YAZILMADI — kol flutter, figür oturunca kol dahil yeniden yargılanır.

## KANIT
Motor C++ dokunulmadı, golden byte-identical (7c3d83f2), ctest 48/48 (bu tur
öncesi teyitli), rapor+görsel dışında repo'ya yazım YOK, pin dokunulmadı.
Ölçüm scripti: /tmp/figur/measure.mjs (geçici, repo dışı). Veri: /tmp/figur/data.json.
