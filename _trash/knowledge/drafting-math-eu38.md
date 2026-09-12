# Doğrulanmış çizim matematiği — EU38 (solver'ın zemini, TAHMİN YASAK)

Kaynak: Aldrich *Metric Pattern Cutting for Women's Wear* 6. baskı p.11 (verbatim, HIGH) +
çapraz-doğrulama. Tam kaynak listesi: `reports/2026-07-29-endustri-arastirmasi.md` yanı sıra
bu tur araştırma (agent abf5dcc). Güven: HIGH=birincil/verbatim, MED=ikincil, LOW=forum.

> **GÜVEN ETİKETİ DENETİMİ — 2026-08-17 (Tur 5).** "HIGH" bu dosyada iki ayrı şeye takılmış:
> (a) birincil kaynaktan **verbatim alıntı**, (b) o alıntıdan yapılan **çıkarım**. İkincisi HIGH
> değildir ve bu dosyaya bir kez çürük sayı soktu (§"Ön vs arka armscye", aşağıda silindi).
> Bugünkü sicil:
> - **HAK EDİLMİŞ (verbatim, Aldrich p.11 tablosu):** beden kodu tuzağı · EU38 blok ölçüleri
>   tablosu · armscye DEPTH 21.0/21.4 · bust dart 7.0/7.6cm. ⚠ Kitabın kendisi elimizde YOK;
>   alıntı `git show` ile doğrulanamaz — **kaynak-güveni HIGH, alıntı-doğrulaması AÇIK.**
> - **HAK EDİLMİŞ (ölçüm, birincil kalıp):** ön/arka oyuk EĞRİLİĞİ (8/8 beden, aşağıda).
> - **ETİKETİ DÜŞÜRÜLDÜ:** "Yan dikiş ön = arka EŞİT olmalı" HIGH→**MED, ŞARTLI** (aşağıya bak).
> - **SİLİNDİ:** "ön armscye daha uzun, fark 1.5–2.5cm" — kaynaksız çıkarım.
> **Kural: bir satır bir kaynağın CÜMLESİ değil, ondan çıkarılmış bir SONUÇ ise HIGH yazılmaz.**

## Beden kodu tuzağı (HIGH)
"EU38/UK12" klasik = **büst 88cm**. Aldrich 6. baskı yeniden numaralandırdı: büst 88 = beden 10,
"beden 12" = büst 92. Bizim defterimiz büst **920mm (92)** kullanmış = Aldrich'te beden 12. Solver'da
hangi büste çalıştığımızı NET tut (88 mi 92 mi), etikete güvenme.

## EU38 blok ölçüleri — Aldrich p.11 (HIGH)
| ölçü (cm) | büst 88 (beden 10) | büst 92 (beden 12) |
|---|---|---|
| büst | 88 | 92 |
| bel | 72 | 76 |
| kalça | 96 | 100 |
| sırt genişliği | 34.4 | 35.4 |
| ön genişlik (chest) | 32.4 | 33.6 |
| omuz boyu | 12.25 | 12.5 |
| **bust dart intake** | **7.0** | **7.6** |
| üst kol (top arm) | 28.4 | 29.6 |
| **armscye DEPTH (dikey)** | **21.0** | **21.4** |

- **Armscye DEPTH = dikey düşüş, ÇEVRE DEĞİL.** Çevre slota 21 koyma.
- **Armhole ÇEVRESİ Aldrich'te yok** — çizilen scye'den ölçülür. Sanity çapa: **toplam armhole ~40-44cm (≈42)**, MED.
- Underbust: yayınlanmamış, uydurma yasak.

## Bust dart (HIGH)
- Standart blok = **B-cup** (büst − üst-büst = 5.08cm/2in). Aldrich dart = **7.0cm (88) / 7.6cm (92)**.
- Cup kuralı: 1 cup = 2.54cm büst-farkı; her cup ~+2.5cm dart shaping. D-cup dart ≈ 3× B-cup.
- Açı tek başına cup'ın fonksiyonu DEĞİL — aynı cm daha kısa pende daha büyük açı. **cm ağız taşınabilir sayı.**
- BİZİM 05: 9.8cm/41.5° = **C-D cup** (Locket dolgun couture parça), standart B-cup değil.

## Sleeve cap (kol kapağı)
- **Cap height: tek katsayı YOK, sistemler anlaşmıyor.** Aldrich: geometrik kuruluş (armhole÷2 diyagonal ÷3).
  Oransal RTW: **AH/4** (yaygın). Armstrong: vücut ölçüsü. → hard-code etme, savunulabilir seç + not düş.
- **Cap ease (cap dikiş − armhole):** dokuma fitted **1.25-1.75in (3-4.5cm)** veya taç üzeri ~%10.
  Kumaşa göre (HIGH): gömlek ~1in, elbise/bluz **2-3cm**, ceket 4-6cm; >7.5cm = kötü draft şüphesi.
  Dissent (Fasanella): iyi eşleşen cap ~0 ease ister. Felsefe ayrımı, not düş.
- **EASE DAĞITIMI (HIGH, herkes hemfikir) — 06'nın düzeltmesi:**
  - Koltukaltı→çentik bölgeleri (iki yan): **%0 ease, armhole'a BİREBİR eşleşir.**
  - TÜM ease çentiklerin ÜSTÜNDE, taç üzerinde.
  - Bölüşüm ≈ **1/3 ön cap, 2/3 arka cap** (arka daha çok, omuz hareketi için).
- Çentik: tek çentik=ön, çift=arka; sleeve cap armhole etrafında "walk" edilerek konur (segment eşitliği buradan).
- ⚠ **2026-08-17: bizim "koltukaltı %0 ease Buğra'da DOĞRULANDI, artık −0.1mm" kaydımız GERİ ÇEKİLDİ.**
  O sayı `flatten-research/12`'nin bozuk ofsetinden geliyordu (kenar uçlarından ~SA kadar uzunluk
  buduyordu). Düzeltilmiş ölçümde ön koltukaltı artığı **+1.5mm**, arka **−1.6mm**, taç ease
  **−64.6mm** — kural literatürde HIGH kalıyor ama **bizim kalıp tanığımız artık onu 0.1mm
  hassasiyetle desteklemiyor.** Detay: `knowledge/seam-line-offset-2026-08-17.md`.

## Ön vs arka armscye — EĞRİLİK (ÖLÇÜLDÜ 2026-08-17, kaynak DEĞİŞTİ)
- **ÖN armscye daha DERİN/EĞRİ; arka daha düz.** Sezgi değil, ölçüm:
  ön yay/kiriş **1.232–1.262**, arka **1.161–1.177** — 8/8 bedende, bantlar hiç çakışmıyor.
  Toplam dönüş ön −103…−112°, arka −91…−102°. İkisi de büst pensine BAĞIŞIK
  (pens kapanınca oyuk kenarı rijit döner: yay, kiriş ve dönüş korunur).
- **Kaynak:** `knowledge/armscye-on-arka-2026-08-17.md` (Buğra Locket, `flatten-research/18-armscye-front-back.py`).
  Aldrich p.11 DEĞİL — p.11 bir ölçü tablosu sayfası, oyuk yayı taşımıyor.
- **UZUNLUK için ters yön geçerli: ARKA oyuk daha UZUN.** Kesim çizgisinde 8/8 beden,
  ön−arka = −13.83 … −1.50mm. Fark bedenle 9 kat daralıyor → **bu bir kanun değil,
  ölçülen giysinin grade'i.** Şart yazılacaksa İŞARET yazılır, büyüklük REPORTED kalır.
- ⚠ Ölçülen giysi **1 tane** (`locket_top`); `corset_bustier` strapless, oyuğu yok, tanık olamaz.

> **SİLİNDİ 2026-08-17 — kaynaksız çıkarım, HIGH etiketi hak edilmemişti.** Silinen iki satır aynen:
> `- **ÖN armscye daha DERİN/oyuk → ön eğri tipik daha UZUN; arka daha düz/kısa.** (kol öne uzanır)`
> `- Fark ~0.5-1in (1.5-2.5cm), ön uzun. Sabit evrensel oran YOK.`
>
> **Neden çürüdü (iz kalsın):** (a) cümle bu dosyanın iki kaynağının ikisinde de YOK — Aldrich p.11
> ölçü tablosudur ve bu dosyanın kendi satırı *"Armhole ÇEVRESİ Aldrich'te yok"* diyor;
> `reports/2026-07-29-endustri-arastirmasi.md` (git `0e67777`, diskte yok) içinde
> `armscye|scye|armhole` geçen 0 satır var. (b) Yapısı ele veriyor: gözlem ile çıkarım tek bir
> "→" ile kaynaştırılmış, gerekçe bir sezgi ("kol öne uzanır"). (c) Dosya kendi içinde çelişiyor:
> Aldrich p.11 sırt genişliği 34.4 > ön 32.4, ve bu dosyanın kendi HIGH cap-ease kuralı ease'in
> 2/3'ünü ARKAYA veriyor — ikisi de arka-uzunu gösterir. (d) Repodaki tek ölçülmüş gerçek kalıpta
> 8/8 bedende çürüyor. **Gözlem yarısı (eğrilik) doğruydu ve yukarıda ölçümle duruyor;
> çürüyen, ondan türetilen uzunluk çıkarımıdır.**

## Yan dikiş (MED — ŞARTLI, etiket 2026-08-17'de HIGH'dan düşürüldü)
- **Ön yan dikiş = arka yan dikiş, EŞİT olmalı** (aynı koltukaltı + bel çizgisine bağlı). Ön/arka boy
  farkı bel pensi/yaka/omuzla yutulur, yan dikişle ASLA.
- ⚠ **ŞART: pens KAPALIYKEN.** Buğra Locket'te büst pensi ön yan dikişin İÇİNE kesilmiş; ön yan
  dikiş iki parça (EU38: 186.7 + 44.7) ve aralarında pens bacakları var. **Pens kapanmadan
  ön ile arka yan dikiş kıyaslanamaz** — kıyaslanırsa 8 bedende −13.5…−15.5mm sahte ihlal çıkar.
  Bu, silinen armscye kalemiyle **aynı sınıf hata**: iki farklı büyüklüğü aynı ada koymak.
  Pens kapatılıp yeniden ölçüm **YAPILMADI** → `knowledge/armscye-on-arka-2026-08-17.md` §6.2.

## Solver'a 3 acil düzeltme (araştırma emri)
1. Beden-kodu: "12" etiketine değil **büst 88/92'ye** göre doğrula.
2. ~~Ön/arka armscye: **ön daha uzun/derin** (ters çevir).~~ **İPTAL 2026-08-17.** Doğrusu:
   ön daha EĞRİ, **arka daha UZUN** (8/8 beden). Uzunluk için şart yazılacaksa işaret yazılır:
   `ön_yay ≤ arka_yay` **ve** `ön_yay/kiriş > arka_yay/kiriş`; büyüklük REPORTED.
3. 257mm ön-scye + 9.8cm dart ONAYLI şişik — extraction'da dikiş payı/ease dahil olmuş, yeniden kontrol.
