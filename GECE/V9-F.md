# V9-F — `GECE/INDEX.md` SON HÂLİ (tutanak)

Kart: `GECE/KART/V9-F.md` · koşu: 2026-08-25 · yazılan dosya kümesi: `GECE/INDEX.md`
ve bu dosya. Başka hiçbir dosyaya bayt yazılmadı (`GECE/arsiv/` açılmadı, listelenmedi;
`GECE/KOSU.md`'ye dokunulmadı).

Bu dosya hüküm vermez. Faz kapanma hükmü `GECE/KAPI.md`'de hakemindir.

## 1. NE YAPILDI

`GECE/INDEX.md` bir yönlendirme tablosudur; koşunun ürettiği kalıcı dosyalar
kartın 8 maddesine göre tablolandı. Eklenen/değişen bölümler:

| bölüm | durum |
|---|---|
| üst yönlendirme tablosu (satır 6-40) | 1 satır düzeltildi (aşağıda §3) |
| **Faz tutanakları — tek satır, tek yol** | YENİ: V0…V7 + V9 için faz başına tek satır; V8'in yokluğu ilan edildi |
| V0 · V1 · V2 fazı | değişmedi |
| V3 fazı | 1 satır eklendi (`GECE/V3-R.md` tabloda yoktu) |
| V4 fazı | değişmedi |
| V5 fazı | 3 satır eklendi (`V5-H.md` · `V5-I.md` · `V5-R-kurtarma.md` tabloda yoktu) |
| V6 fazı | yan dal satırına "ana ağaçta YOK" damgası eklendi |
| V7 fazı | değişmedi |
| **V9 fazı** | YENİ bölüm: 7 tutanak + 2 kapı dosyası + 7 log satırı |
| **`GECE/KART/`** | YENİ bölüm: faz başına kart SAYISI + dizindeki ad aralığı |
| **`GECE/log/` — faz dışı ve devralınan loglar** | YENİ bölüm: faz bölümlerine girmeyen loglar |
| **Kalıcı yardımcı dosyalar** | YENİ bölüm: KAPI · KOSU · kapi.sh/sha · mutasyon.sh/tsv · f0-* üreteç→çıktı çiftleri · f-* · probe/ · kurtarma/ · arsiv/ |
| **`docs/` ağacı** | YENİ bölüm: 6 doküman + `edit/` + `reference/` + `archive/` tek satır tanımla |

## 2. ÖLÇÜM

Yöntem: `grep -oE '`[^`]+`' GECE/INDEX.md` ile bütün backtick'li belirteçler çekildi,
yol biçiminde olanlar süzüldü, her biri `test -e` ile denendi. Kısaltmalı yazımlar
(`GECE/log/V2-C.ctest.{before,after}.txt`, ya da bir liste içinde ön eki
tekrarlanmayan `V5-D.mutasyon.txt` gibi) elle genişletilip ayrı ayrı denendi.

Ölçümü basan komut bu dosyanın §6'sındadır; sayı oradan çıkar, bu cümleden değil.
Koşu anı: `GECE/V9-F.md` diskte VAR, `GECE/V9-C/D/E.md` ve `GECE/V9.md` YOK.

| kalem | sayı |
|---|---|
| tablodaki tekil yol belirteci | **349** |
| `test -e` ile DOĞRULANAN | **338** |
| diskte bulunamayan, **YOK/⚠ damgasıyla** tabloda duran | **5** |
| ana ağaçta yok, YAN DALDA duran (damgalı) | **3** |
| repo yolu OLMAYAN belirteç (yanlış pozitif) | **3** |

## 3. DİSKTE BULUNAMAYAN YOLLAR — İSİM İSİM

Kartın şartı: olmayan yol Index'e girmez; girmesi gerekiyorsa YOK damgasıyla girer.
Altısı da damgayla girdi.

1. **`GECE/F0.md`** — Index'in üst yönlendirme tablosu ("bugün ne var ne yok, sayılar
   nereden geldi") bu dosyayı gösteriyordu. `test -e` başarısız. Satır `GECE/V9-A.md`'ye
   çevrildi ve eski hedefin YOK olduğu satırın içine yazıldı. Nereye gittiği
   ARAŞTIRILMADI (`GECE/arsiv/` kart gereği açılmadı) — **DOĞRULANMADI**.
2. **`GECE/V9.md`** — V9'un ŞEF tutanağı. Bu satır yazılırken diskte yok; faz
   tutanakları tablosunda ⚠ ile duruyor.
3. **`GECE/V9-C.md`** · 4. **`GECE/V9-D.md`** · 5. **`GECE/V9-E.md`** — üç kâtip
   tutanağı. Kartlarının (`GECE/KART/V9-C.md`, `V9-D.md`, `V9-E.md`) hepsi diskte VAR,
   tutanakların kendisi bu satır yazılırken YOK. Kart §3'ün emri gereği satırlar
   "yazılıyor" diye değil, **koşu sonunda var olacak yolla** yazıldı; her satırın
   sonuna "bu satır yazılırken diskte YOK" şerhi düşüldü. Paralel işçiler
   (V9-C · V9-D · V9-E) yazdığında satır kendiliğinden doğru olur; dosyaların İÇİ
   açılmadı.
Not: `GECE/V9-F.md` (bu dosya) ilk taramada yoktu, yazıldıktan sonra doğrulandı.

**Ayrıca: ana ağaçta olmayan ama YAN DALDA duran üç yol** (V6 bölümünde damgalandı):
`contract/anchors-v1.json` · `engine/tools/gen-anchors.mjs` ·
`engine/tests/anchor_source_check.mjs` — üçü de `research/v6-cipa-editleme` @ `3d8903c`
dalında; ana ağaçta `test -e` başarısız.

**Repo yolu olmayan üç belirteç** (yanlış pozitif, düzeltme gerekmedi):
`research/v6-cipa-editleme` (git DAL adı, dosya değil) · `verify-generated.sh`
(k8s'in kendi betiği, V2-R'nin dış emsali) · `.info.txt` (bir dosya ADI değil, sonek
parçası; gerçek dosyalar `GECE/log/V7-E.png/` içinde 3 adet).

## 4. KAPSAM DIŞI BIRAKILAN — SEBEBİYLE

- **`GECE/arsiv/`** — kart §7 gereği tek satır olarak "Kalıcı yardımcı dosyalar"
  tablosuna girdi; içi AÇILMADI, LİSTELENMEDİ. `test -e GECE/arsiv` → VAR.
- **`GECE/log/` altındaki 101 `F*` dosyası** — kart §5 "faz başına gruplanmış" diyor;
  bu dosyalar bu koşunun fazlarına ait değil (önceki v5 koşusu). Dosya dosya değil,
  **desen olarak** (`F0*` · `F6*` · `F9*` · `F10*` · `F11*` · `F-C…F-N1*`) tek satırda
  tablolandı. Aynı sebeple dört `*.shots/` dizini dosya sayısıyla tek satır.
- **Faz tutanaklarının İÇİ** — kart yasağı. Tek cümlelik tanımlar yalnız her dosyanın
  `#` BAŞLIK satırından ve mevcut Index metninden alındı; V9-A/V9-B/V9-R için ek olarak
  yalnız ilk 8 satır (koşu künyesi) okundu.
- **Kart kart liste (`GECE/KART/`)** — kart §4 "ŞART DEĞİL" diyor. Faz başına sayı +
  ad aralığı yazıldı; V9 kartları (`V9-A`…`V9-F` + `V9-R`) adıyla duruyor.
- **`web/`** — V9-A "V10'un işi, dokunulmadı" diyor; Index'in docs bölümüne alınmadı.
- **Hüküm cümlesi** — hiçbir fazın kapandığı yazılmadı; "bitti/ALL PASS/0.00mm/
  byte-identical" biçiminde duran-iddia kurulmadı (RULES §6). Tabloda sayı geçtiği
  yerlerde ("353 yol", "kart sayısı") sayının kaynağı ya `test -e` ya `ls | wc -l`.

## 5. KART DIŞI FARK EDİLEN

- **V8 fazı yoktur.** `GECE/V8*.md` diskte yok ve kart V0…V7 + V9 sayıyor. Numaranın
  atlanmış olduğu Index'e açıkça yazıldı ki "kayıp dosya" diye okunmasın. Neden
  atlandığı **DOĞRULANMADI**.
- **Index'in üst tablosu bir ölü yol taşıyordu** (`GECE/F0.md`). Bu, V9-B'nin kurduğu
  `docs_truth_check` kapısının aradığı sınıfın ta kendisi — ama o kapının kapsamı
  `docs/**` + `README.md`, `GECE/` DEĞİL. Yani Index bugün hiçbir mekanik kapının
  denetiminde değil; ölü yolu bu tur elle bulundu. Kapsamı genişletmek bir KARAR,
  tek taraflı yapılmadı.
- **V4 kart sayısı 7**, Index'in V4 bölümü "altı işçi kartı" diyordu. Ölçüm:
  `ls GECE/KART/ | grep -c '^V4-'` → 7 (`V4-A` `V4-B` `V4-C` `V4-D` `V4-E` `V4-K` `V4-R`).
  Yeni KART tablosuna ölçülen sayı yazıldı; V4 bölümündeki eski cümleye DOKUNULMADI
  (o bölüm bu kartın çıktı kümesinde bir "düzeltme" değil, başka bir işçinin metni).
- **`engine/tests/docs-truth-baseline.json` diskte VAR** ve Index'e alındı; V9-B'nin
  tutanağı onu taban olarak adlandırıyor.

## 6. SAYIYI BASAN KOMUT

Aşağıdaki betik repo kökünden koşturulur; §2'deki üç sayıyı ve §3'ün listesini o basar.
Bir kapı değildir (exit kodu hüküm taşımaz), bir cetveldir.

```python
python3 - <<'EOF'
import re, os
txt = open('GECE/INDEX.md').read()
toks = {m for m in re.findall(r'`([^`]+)`', txt)
        if re.fullmatch(r'[A-Za-z0-9_./{},-]+', m)
        and ('/' in m or re.search(r'\.(md|json|mjs|py|sh|txt|cpp|hpp|html)$', m))}
def expand(t):
    m = re.search(r'\{([^}]*)\}', t)
    if not m: return [t]
    return [x for o in m.group(1).split(',')
              for x in expand(t[:m.start()] + o + t[m.end():])]
pre = ['', 'GECE/log/', 'GECE/', 'GECE/KART/', 'GECE/kurtarma/', 'GECE/probe/',
       'GECE/log/V7-E.png/', 'engine/tests/', 'engine/tools/', 'engine/tools/bugra/',
       'engine/src/', 'engine/wasm/', 'contract/', 'engine/', 'docs/edit/',
       'docs/archive/', 'docs/']
ok, bad = [], []
for t in sorted(toks):
    (ok if all(any(os.path.exists(p + x) for p in pre) for x in expand(t)) else bad).append(t)
print(len(toks), len(ok), len(bad)); [print('  ', b) for b in bad]
EOF
```

Ön ek listesi, Index'in bir liste içinde ön eki tekrarlamayan yazımını
(`` `GECE/log/A.txt` · `B.txt` ``) çözmek içindir; `''` ilk sırada olduğu için tam yol
her zaman kendi başına denenir.
