# KARARLAR — karar defteri (kilit değil, progresif)

Kural: buradaki bir kararı değiştirmek serbest, ama **"değişir eğer" satırındaki ölçüm yapılmadan değişmez.**
"Aa şunu yapalım" yeni bir satır açar, eskisini silmez; eski satıra "iptal, tarih, ölçüm" yazılır.
Yeni oturum önce en alttaki "Nerede kaldık?" bölümünü okur.

| # | Tarih | Karar | Gerekçe | Değişir eğer |
|---|---|---|---|---|
| K1 | 2026-09-05 | Çekirdek **Edge/Panel/Seam grafı**; kenarlar landmark + oranla, mm yok. Enum çıktı formatına giremez | HEDEF 9; enum motoru 48 switch ile sözlük menüsüydü, sınırsızlık imkânsızdı (5 Eyl ölçümü: 436 dallanma) | P3'te Buğra'nın iki kalıbı ya da 5 emsal graf ile **ifade edilemezse** ve eksik op eklenerek de kapanmazsa |
| K2 | 2026-09-05 | Aynı graf **iki bedende** değerlenir: gerçek36 (+grade) → kalıp, croquis36 → flat | HEDEF 4-5; flat ideal beden, kalıp giyilebilir beden | — (Damla'nın maddesi) |
| K3 | 2026-09-05 | Panel kaynağı önce **Halka2B** (2B çizim, bedene referanslı). **Yüzey3B** aynı arayüzün ikinci uygulaması, ürün canlıyken denenir | Temmuz'da 3B yüzey mühürlendi, 1 Eyl'de NaN + 7-30 s + omuz/kol/yaka yüzeyden çıkmıyor diye bırakıldı. Bu kez mimariyi değiştirmeden, grafın altında | Yüzey3B kapıları: NaN yok, EU36 <500 ms native, dikiş kenarı 3B yay = 2B uzunluk ≤0.5 mm, kol ve yaka yüzeyden geliyor, dikilebilirlik tablosu Halka2B'den kötü değil — **hepsi** geçerse kaynak Yüzey3B olur |
| K4 | 2026-09-05 | Enum katmanı (`GarmentSpec`, 39 tip) yalnız geçiş; P4'te sevk yolundan çıkar, P5/P6'da girişler doğrudan graf üretince silinir | HEDEF 9, 13 | — |
| K5 | 2026-09-05 | Flat emsali: `KOSU/ciktilar/flat-secim.md`'deki 5 deer-and-doe çizimi; konvansiyon sayıları oradan ölçülmüş (`flat-olcum.json`, `flat-convention-v1.json`) | Tek stüdyo = tek croquis; ölçülebilir | Damla `GIRDI/iyi-flat/adaylar/` içinden başka seçerse: `KOSU/flat-olcum.py` yeniden koşar, contract yeniden türer |
| K6 | 2026-09-05 | **Hakem ajanı yok.** Kapı = çalıştırılabilir test + png'ye Claude (ana oturum) bakar. Faz başına 1 taze işçi, en çok 2 deneme, alt-ajan yok | 5-6 Eyl: iki hakem her turda kapsam büyüttü, F1 26 commit/16 saat, 3. deneme hep sinyalsiz; 4 Eyl: 69 alt-ajan | İki faz üst üste "geçti" dediğim png Damla'ya "satmam" dedirtirse hakemlik modeli yeniden açılır |
| K7 | 2026-09-05 | Sıralı koşu, build -j2, ctest hedefli; tam ctest yalnız deploy öncesi | MacBook Air ısınıyor, 8 GB | Makine değişirse |
| K8 | 2026-09-05 | Her fazın teslimi bir **png**; png'siz faz bitmemiş | 5-6 Eyl: 16 saat altyapı, sıfır görsel | — |
| K9 | 2026-09-05 | Eski flat/kalıp/paket çıktıları onaysız; parite kurulmaz; P4'te silinir, graftan yeniden üretilir | HEDEF 14 | — |
| K10 | 2026-09-05 | Sabit beden 34-44; made-to-measure yok | 29 Tem: Lekala/Sewist fiyat tabanı, ZOZO/unspun battı; ölçü şekli belirlemiyor | — |
| K11 | 2026-09-05 | Landing'de fiyat/satış cümlesi yok; ilk toile Damla dikene kadar | HEDEF §4; 600+ saatte kumaşa kesilmiş çıktı yok | Damla paket-03'ü dikip prova listesini doldurunca |
| K12 | 2026-09-05 | Fotoğraf hattı üç kaynak: poz landmark'ı + siluet oranı + Claude semantiği; çelişkide ölçüm kazanır; yalnız LLM ile sessiz devam yok | HEDEF 8, 11; vision tek başına isim uyduruyordu | Landmark modeli tarayıcıda kurulamazsa deftere yazılır, (b)+(c) ile devam, ilan edilir |
| K13 | 2026-09-05 | Buğra referans, ayar hedefi değil; Buğra'ya sabit eklemek reward hacking | 28 Tem Damla: "geometri knows it all" | — |
| K15 | 2026-09-05 | Kabul komutları fazdan ÖNCE yazılır (`KOSU/kabul/P1-P9.sh`), mühürlenir (`KOSU/muhur.sh`); `KOSU/sinyal.sh` her faz sonu ve oturum başı koşar: mühür + enum tabanı + kapanan fazların kabulü + madde defteri | rabadon §8 hata 1-3: ölçütü işi yapan yazmıştı, liste takip edilmemişti, süreç ilerleyip iş yerinde saymıştı | — |
| K14 | 2026-09-05 | Sadece ön fotoğraf: en sade dikilebilir arka (düz, orta arka kapanma) + görünür ilan + neden. İkinci fotoğraf alanı isteğe bağlı | HEDEF §2 | — |

## Madde defteri (HEDEF §1-§4; her faz sonunda güncellenir)

| Madde | Durum | Kanıt |
|---|---|---|
| 1 foto+prompt=kalıp+flat | AÇIK | — |
| 2 edit | KISMEN: 15 op + replay var (graf_op_check); görsel ve doğal dil yok | `docs/GRAF-IR.md` |
| 3 hesap | KISMEN: doğrulayıcı + sanal dikiş 3 bedende 0 kırmızı; çizim yok | `graf_dikilebilir_check` |
| 4 iki beden | KISMEN: contract var, çizim yok | `contract/body-v1.json` |
| 5 konvansiyon | KISMEN: sayılar var, uygulanan flat yok | `flat-convention-v1.json` |
| 6 kumaş | AÇIK (eski hatta katsayı) | — |
| 7 en az parça | AÇIK | — |
| 8 tech tavanı yok | AÇIK | — |
| 9 sözlük yok | KISMEN: graf var, enum 436 dallanma | `enum_dallanma_check --measure` |
| 10 rehber/püf | AÇIK (eski hatta var, graftan değil) | — |
| 11 kök neden | sürekli | — |
| 12 Buğra | AÇIK | — |
| 13 repo temizliği | AÇIK | — |
| 14 eski çıktı silinir | AÇIK | — |
| §2 edge case | AÇIK (eski hat tablosu bayat) | — |
| §4 Damla diker | AÇIK | — |

## Nerede kaldık?

- 2026-09-05 21:35 — Koşu belgesi `KOSU-STITCHU.md` (rabadon-5 biçimi), kabul scriptleri P1-P9 + mühür + `sinyal.sh` yazıldı; `sinyal.sh hizli` YEŞİL (enum 436, kapanan faz 0). Sıradaki: **P1** — Damla "başla" deyince. Her fazın kapanışı: `sinyal.sh tam` yeşil → `sinyal.taban.json kapanan`'a faz eklenir → madde defteri + bu bölüm + `DEVIR-PROMPT.md` güncellenir.

- 2026-09-05 19:10 — Plan yazıldı (`KOSU-STITCHU.md`). Koşu durdu; son commit `2a654269` (F2a: graf IR, 15 op, doğrulayıcı, 3 bedende 0 kırmızı). Sıradaki: **P1 graftan çizim**. Henüz başlamadı.
