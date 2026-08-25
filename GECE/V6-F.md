# V6-F — ÇIPA SÖZLÜĞÜ İNDEKSLENDİ, KAPI YEŞİLE DÖNMEDİ (dönemez)

Ham çıktılar: `GECE/log/V6-F.kapi.ONCE.txt` · `GECE/log/V6-F.kapi.SONRA.txt` ·
`GECE/log/V6-F.ada3bf9.txt` · `GECE/log/V6-F.indeks-denemesi.txt` ·
`GECE/log/V6-F.revert-tavani.txt` · `GECE/log/V6-F.mutasyon.txt`.
Her sayının yanında onu basan komut var.

## HÜKÜM (önce, sonra gerekçe)

**1. KARTIN ÖNCÜLÜ ÖLÇÜLDÜ VE YANLIŞ ÇIKTI.** Kart diyor ki
"`vocab_reference_check` faz açılışında (`ada3bf9`) YEŞİLDİ — ölçüldü."
**DEĞİLDİ.** Kendim ölçtüm:

```
git worktree add -f -q $WT ada3bf9
bash engine/tests/vocab_reference_check.sh --tree $WT
→ taban toplam 10438 · bugun toplam 10444 (delta +6) · HUKUM: FAIL (6 artan, 0 yeni)
```
Artan 6: `garment +6` · `neckline +1` · `shaping +1` · `skirtStyle +1` ·
`topLength +1` · `yoke +1`. Tam çıktı `GECE/log/V6-F.ada3bf9.txt`.
`ada3bf9`'in kendi commit mesajı da "113 tests, **6 red**, inherited name set
unchanged" diyor — `vocab_reference_check` o 6'nın biriydi.

→ **RULES md.9 (YENİ KIRMIZI AD) İHLAL EDİLMEDİ.** `4529921` yeni bir kırmızı AD
doğurmadı; zaten kırmızı olan bir adın SAYISINI derinleştirdi (+36).
İhlal edilen, ratchet'in kendi yasası ("sayi YALNIZ DUSEBILIR").

**2. KAPI BU KARTLA YEŞİLE DÖNEMEZ — TAVAN ÖLÇÜLDÜ.** Çıpa işini ağaçtan
TAMAMEN kaldırdım (`anchors-v1.json` + `gen-anchors.mjs` silinmiş worktree):

```
→ bugun toplam 10444 (delta +6) · HUKUM: FAIL (6 artan, 0 yeni)
```
(`GECE/log/V6-F.revert-tavani.txt`) — yani `ada3bf9`'in aynısı. **`git revert`
kapıyı yeşile döndürmüyor.** Kalan +6 başka bir işin, ve kaynağı benim
yasaklı dosyalarımda. Kartın SON ÇARE'si, satın aldığı şey sıfır olduğu için
UYGULANMADI: 19 kaynaklı çıpayı + 4 kapılı bekçiyi + 3 mutasyon kanıtını
yakıp yerine yine kırmızı bir kapı koymak, RULES md.10'un "en iyi olan" testini
geçmiyor. Gerekçe burada, karar Damla'nın.

**3. ONARIM YAPILDI, SÖZLÜK KÜÇÜLDÜ, BİLGİ KAYBOLMADI.** `-12 satır`.

## 1. KÖK SEBEP — DOSYA BAZINDA KANITLANDI

`4529921`'in getirdiği +36 satırın **36'sı da `contract/anchors-v1.json`'da**;
üretecin kaynağı (`gen-anchors.mjs`) **0** satır getiriyor. Komut ve çıktı:

```
grep -In -w -- <EKSEN> contract/anchors-v1.json | wc -l
grep -In -w -- <EKSEN> engine/tools/gen-anchors.mjs | wc -l
```
| eksen | anchors-v1.json | gen-anchors.mjs |
|---|---|---|
| neckline | **17** | 0 |
| backSlit · exposedZip · sleeveCap · yoke(±) | 2 / 2 / 2 / 1 | 0 |
| backDetail · buttonRow · edgeFinish · garment · hemShape · peplum · ruffledStraps · shoulderStyle | 1 | 0 |
| keyhole · skirt · sleeve (enum DEĞERİ) | 1 / 2 / 1 | 0 |

**İkisi ayrı sınıf, ve kartın teşhisi yalnız birincisi için doğruydu:**
- **TEKRAR (giderilebilir, 12 satır):** `neckline`'ın 17'sinin 12'si panel
  adının tekrarından — aynı panel adı `_olculenPaneller`'de bir kez, sonra her
  çıpanın `eslesen` listesinde bir daha yazılıyordu (10 çıpa + 1 orphan liste).
- **KAYNAK (giderilemez, 24 satır):** geri kalanı `anchors[].bilesen` içindeki
  `composition.json` bileşen id'leri (`backDetail`, `exposedZip`, `sleeveCap`…)
  ve `_olculenPaneller`'in TEK kopyası. Bunlar çıpanın kimden doğduğu; silmek
  bilgi atmaktır (`primitives-v1.json:_yasa.5`).

## 2. ONARIM — PANEL ADI DOSYADA BİR KEZ

`panelDeseni.eslesen` (adlar) → **`panelDeseni.eslesenIndeks`** (`_olculenPaneller`
dizisine 0-tabanlı indeks). `_bilesensizPaneller.adlar` → `_bilesensizPaneller.indeks`.
Üretecin kendisi de temizlendi: ilk taslakta yorumumda bir panel adını TIRNAK
İÇİNDE andım ve kapı onu saydı (`neckline` +1, ölçüldü) — ad yorumdan çıkarıldı,
maliyeti yorumun içine yazıldı.

**Ölçülen etki:** `neckline` `anchors-v1.json`'da **17 → 5**.
`grep -c -w -- "neckline" contract/anchors-v1.json` → `5`.

## 3. KARTIN ÜÇ SAYISI DÜŞMEDİ (şart buydu)

Komut: `node engine/tools/gen-anchors.mjs`
```
19 anchors, 7 carry an edge fraction, 86 panel names measured over 390 drafts
(59 refused by the engine), 37 names NOT born.
```
Komut: `sed -n '/^---8<---/,/^--->8---/p' GECE/log/V6-D.kapsam.txt | sed '1d;$d' > /tmp/kapsam.py && python3 /tmp/kapsam.py`
```
serbest terim (outOfVocab, tekil): 26
konum ibaresi TASIYAN terim: 13/26
cipa sozlugunun ibarenin TAMAMINI karsiladigi: 7/26 (konumlulara gore 7/13)
```
| sayı | V6-D | V6-F | |
|---|---|---|---|
| çıpa | 19 | **19** | = |
| kenar-oranlı | 7 | **7** | = |
| 26 terimden karşılanan | 7 | **7** | = |
| doğmayan ad | 37 | **37** | = |
| ölçülen panel adı | 86 | **86** | = |

## 4. BEKÇİ İNDEKSİ DE DOĞRULUYOR (kart md.4)

`anchor_source_check.mjs`'e **3a** kapısı eklendi, ve 1. kapıdan (regen-diff)
BAĞIMSIZ ateşliyor:
- `_olculenPaneller` **sıralı ve tekil** olmak zorunda — indeksin kanonik
  olmasını sağlayan şey bu.
- her indeks tamsayı ve menzil içinde; değilse KIRMIZI.
- `eslesen` (ad) alanı hâlâ duruyorsa KIRMIZI — eski tekrarlı biçime dönüş
  sessizce geçemez.
- panel yargıları (sıfır panel / bölge dışlaması) indeks ÇÖZÜLDÜKTEN sonra
  koşuyor, yani ada değil indekse bakıyor.

## 5. MUTASYON KANITI — 3 mutasyon, 3 kırmızı, 3 geri alma, yeşil

`GECE/log/V6-F.mutasyon.txt`

| # | mutasyon | sonuç | 3a'nın bastığı satır |
|---|---|---|---|
| T0 | yok | **EXIT=0** | — |
| M1 | `_olculenPaneller`'dan bir ad silindi (indeksler kaydı) | **EXIT=1** | `panel index 85 points at no panel (_olculenPaneller has 85)` — 4 ayrı çıpada |
| M2 | bir çıpanın `eslesenIndeks`'i `[9999]` yapıldı | **EXIT=1** | `panel index 9999 points at no panel` + `lands on ZERO panels` |
| M3 | indeks yerine ADA geri dönüldü (eski biçim) | **EXIT=1** | `panelDeseni still spells panel NAMES (eslesen)` |

Üçünün de geri alınması **EXIT=0**.

## 6. KAPANIŞ ÖLÇÜMÜ

`GECE/log/V6-F.kapi.SONRA.txt` — komut ve tam çıktı orada.

---

## KART DIŞI FARK EDİLENLER (dokunulmadı)

1. **FAZI ASIL BLOKE EDEN +6 BENİM KARTIMDA DEĞİL.** `ada3bf9`'te duran
   `garment +6 · neckline/shaping/skirtStyle/topLength/yoke +1`. Bu satırlar
   taban commit'i `495d58a` ile `ada3bf9` arasında bir yerde girmiş; hangi
   dosyadan geldiği **ARAŞTIRILMADI** (süre + kart yasağı). Kapı yeşile
   dönecekse iş BURADA, çıpa sözlüğünde değil. **Bu bir kart olarak yazılmalı.**
2. **Ratchet, kaynaklı bir sözlükle yapısal olarak çatışıyor.** Kapı satır
   sayıyor; kaynağına bağlı her yeni kontrat, kaynağın ADINI yazmak zorunda,
   ve o adlar kapalı enum sözcükleri. Yani "her kaydın yanında kaynağı dursun"
   (V6-D) ile "kapalı enum referansı artmasın" (bu kapı) aynı anda
   sağlanamıyor. Çözüm sınıfı: ya kapı `contract/` altındaki ÜRETİLMİŞ
   dosyaları kapsam dışı bıraksın (üretilmiş tablo kimsenin yazdığı referans
   değil), ya da taban üretilmiş dosyalar için ayrı tutulsun. **Damla/şef
   kararı, tek taraflı yapılmadı.**
3. Kirli çalışma ağacı ile commit'li ağaç arasında **+9 satır** fark ölçtüm
   (`--tree .` 10477 vs worktree 10468). 1'i benim yorumumdu ve düzeltildi;
   kalan 8'in kaynağı **DOĞRULANMADI** — `git status` kapsam içinde temiz
   görünüyor, yani gitignore'lu bir şey kapsamın içinde oturuyor olabilir.
   Kapının kendi başlığı bu sınıfı zaten uyarıyor.
4. `_olculenPaneller` artık indeksin tabanı olduğu için **sıralaması bir
   KONTRAT**. Bugün `[...panels.keys()].sort()` (JS varsayılan, kod noktası).
   Locale'e duyarlı bir sıralamaya geçilirse bütün indeksler sessizce kayar —
   bekçinin 3a "sıralı mı" kapısı bunu yakalar ama sebebini ADIYLA söylemez.

## GÖREMEDİKLERİM / ERİŞEMEDİKLERİM

- `engine/tools/spec-diff.mjs` (V6-G'nin dosyası) açılmadı; üretecin `draft()`
  bağımlılığı oradan geliyor, o dosya değişirse bu çıktı da değişir.
- `engine/src/`, `backend/`, `web/`, `patterns_real/` açılmadı (kart yasağı).
- Kapının tabanını **elle kesmedim** ve `vocab_reference_check.sh`'e
  **dokunmadım** (kart yasağı). Kapı hâlâ kırmızı; gevşetilerek geçilmedi.
- Görsel artefakt (PNG) üretilmedi: bu kart bir sözleşme+kapı onarımı,
  RULES md.3'ün render adımını gerektiren bir geometri iddiası taşımıyor.
