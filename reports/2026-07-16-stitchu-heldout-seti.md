# stitchu — HELD-OUT SINAV SETI (heldout-30) KURULDU

**Tarih:** 2026-07-16
**Agent:** held-out kurator (bagimsiz, veri dali)
**Bolge:** dataset/ (lokal, gitignore) + reports/. web/engine/vision-student DOKUNULMADI.
**Teslimat:** `dataset/heldout/manifest.json` (30 foto, gitignore'lu) + bu rapor (commit).

---

## 1. NE YAPILDI

Havuzdan (28.246 foto: 27.854 open-set + 392 marka) **dokunulmamis, ETIKETSIZ** 30
fotoluk bir sinav seti secildi. Bu set hicbir iyilestirmede kullanilmaz; sadece donem
sonu uctan uca sinavinda olculur. Manifest lokal/gitignore'lu kalir (benchmark-58 ile
ayni rejim); sadece bu rapor commit'lenir.

### Secim yontemi (deterministik, seed=20260716)
- **Dislama:** `dataset/labels/` altinda hash'i olan HER foto atlandi (913 etiketli hash).
  Kalan aday = diskte var + etiketsiz + kategorisi bilinen.
- **Katmanlama:** kaynak × kaba giysi tipi dengeli, kaynak icinde kategoriler arasi
  round-robin cekim.
- **Bakirlik dogrulamasi:** secilen 30 hash'in HICBIRI `dataset/labels/`'ta yok
  (kesisim = 0), hepsi diskte mevcut (dosya yolu tek tek dogrulandi), 30 benzersiz hash.

---

## 2. 30 FOTONUN DAGILIMI

### Kaynak
| kaynak | adet |
|---|---|
| deepfashion-inshop (open-set) | 13 |
| princesspolly (open-set) | 9 |
| handm (marka) | 7 |
| uniqlo (marka) | 1 |
| **toplam** | **30** |

> **uniqlo neden sadece 1:** uniqlo diskteki 122 fotonun 121'i zaten etiketli
> (madenlenmis) — geriye tek bakir foto kaldi. Bakir bir sinav seti kurulunca uniqlo
> katkisi zorunlu olarak 1'de kaliyor; eksik pay deepfashion/princesspolly'ye kaydirildi.
> Ders: bir kaynagi tam madenlemek onu held-out havuzu olarak tuketir.

### Kaba giysi tipi
| tip | adet |
|---|---|
| dress | 11 |
| skirt | 8 |
| top | 8 |
| onepiece-other (romper/tulum) | 3 |
| **toplam** | **30** |

### Ham kategori (cesitlilik)
dresses 7, dress 4, skirts 6, skirt 2, blouses 3, tops 3, top 2, rompers 3.
Hem open-set taksonomisi (dresses/blouses/rompers) hem marka etiketleri (dress/top/skirt)
temsil edildi -> vision hem "akademik benchmark" hem "e-ticaret urun" dagilimini gorur.

---

## 3. MANIFEST + KURAL BLOGU

`dataset/heldout/manifest.json` yazildi. Icindeki **KURAL blogu** (aynen):

```json
"RULE": {
  "neverForImprovement": "This set is NEVER used in any prompt tuning, vocabulary mining, teacher labeling, or student training. It does not enter dataset/labels/, mine-vocab.mjs sampling, or any dataloader.",
  "measureOnly": "Measured ONLY at term-boundary exams (donem sonu sinavi).",
  "reportEveryMeasurement": "Every measurement against this set is written to a dated report in reports/. No silent runs.",
  "regime": "Same local-only regime as benchmark-58 and all dataset/: gitignored, never pushed, never shown on site/content."
}
```

Ayrica `selectionCriteria` (dislama kurali, seed, dagilimlar) ve `relationToBenchmark58`
alanlari manifest'te.

---

## 4. OTOMATIK DISLAMA — DIFF ONERISI (UYGULANMADI)

> Paralel agent'lar mine-vocab.mjs / vision-student'ta calisiyor. Asagidaki degisiklikler
> **onerilir, uygulanmadi.** Orkestrator uygulatir.

### 4a. `engine/tools/mine-vocab.mjs` (ASIL RISK BURADA)

**Neden burasi:** mine-vocab bir foto secip ona ETIKET URETIR. Held-out bir foto burada
secilirse `dataset/labels/<hash>.json` olusur -> hem V vitrinine hem ogrenciye sizar.
Dislama tam olarak burada olmali. (Ogrenci dataloader'i sadece `labels/` uzerinden
donuyor; etiket yoksa ogrenciye zaten giremez — asagi bak 4b.)

**En kucuk degisiklik:** manifest'i bir kez yukle, hash setini cikar, iki filtreye ekle.

`const LABELS = join(DATASET, 'labels');` satirindan sonra (satir ~39):

```diff
 const LABELS = join(DATASET, 'labels');
+// HELD-OUT GUARD: never mine (=never label) a photo reserved for the term-end exam.
+// dataset/heldout/manifest.json is the single source of the reserved hash set.
+const HELDOUT_MAN = join(DATASET, 'heldout', 'manifest.json');
+const HELDOUT = existsSync(HELDOUT_MAN)
+  ? new Set((JSON.parse(readFileSync(HELDOUT_MAN, 'utf8')).photos || []).map((p) => p.hash))
+  : new Set();
```

OPENSET filtresi (satir 264):

```diff
-    const unl = manifest.filter((m) => !existsSync(join(LABELS, `${m.hash}.json`)));
+    const unl = manifest.filter((m) => !HELDOUT.has(m.hash) && !existsSync(join(LABELS, `${m.hash}.json`)));
```

BRAND filtresi (satir 292):

```diff
-    queue = manifest.filter((m) => !existsSync(join(LABELS, `${m.hash}.json`))).slice(0, limit);
+    queue = manifest.filter((m) => !HELDOUT.has(m.hash) && !existsSync(join(LABELS, `${m.hash}.json`))).slice(0, limit);
```

Bedava (dosya zaten I/O yapiyor), davranisi tek yonde daraltir, riski sifir.

### 4b. `vision-student/dataset.py` (KEMER-VE-ASKI, dusuk oncelik)

**Bulgu:** dataloader SADECE `dataset/labels/*.json` uzerinden iterate ediyor
(satir 120-124). Held-out fotolar ETIKETSIZ oldugu icin **su an bile ogrenciye giremezler**
— yapisal olarak guvenli. 4a uygulanirsa asla etiket de almazlar. Yani bu ikinci guard
zorunlu degil; sadece "biri elle held-out'a etiket koyarsa" senaryosuna karsi acik
savunma. Istenirse:

`NecklineDataset.__init__` icinde, `suspect-batches.json` skip'inden hemen sonra
(satir ~122):

```diff
         label_files = [f for f in label_files if f.name != "suspect-batches.json"]
+        # HELD-OUT GUARD (belt-and-suspenders): drop any label whose hash is in the
+        # reserved term-end exam set, even if one leaked into labels/.
+        heldout = set()
+        hf = self.root / "heldout" / "manifest.json"
+        if hf.exists():
+            try:
+                heldout = {p["hash"] for p in json.loads(hf.read_text()).get("photos", [])}
+            except Exception:
+                heldout = set()
```

ve `key` cozuldukten sonra (satir ~134, suspect kontrolunden once):

```diff
                 key, pool, fields, conf, batch, suspect = _extract(label)
+                if key in heldout:
+                    self.stats.setdefault("heldout", 0)
+                    self.stats["heldout"] += 1
+                    continue
```

**Oneri:** 4a KESIN uygulansin (asil sizinti noktasi). 4b opsiyonel savunma.

---

## 5. 58-SET ILE ILISKI (netlestirme)

Iki ayri olcum araci, iki ayri amac — karistirilmamali:

| | **benchmark-58** | **heldout-30** |
|---|---|---|
| ne | insan-etiketli CIPA | etiketsiz, bakir sinav |
| etiket | Damla'nin/insanin ground-truth'u var | YOK (kasten) |
| olctugu | **vision alan dogrulugu** (neckline/shaping... ground-truth'a karsi) | **uctan uca FULL pipeline** (vision+kopru+motor) tek kalip cikiyor mu |
| granularite | alan bazinda (vision-accuracy metrigi) | foto bazinda (tam kalip / degil) |
| kullanim | her loop olculebilir (vision pusulasi) | SADECE donem sonu, her olcum raporlanir |
| risk | ciparak optimize edilir (amaci bu) | ASLA optimize edilmez (bozulursa deger sifir) |

**Kisaca:** 58-set = "vision alanlari dogru mu okuyor?" cetveli (surekli). heldout-30 =
"tum sistem hic gormedigi bir fotoda kalip cikarabiliyor mu?" bitirme sinavi (nadir,
bakir). 58-set alan hatasini yakalar; heldout-30 ezberlemeye/asiri-uydurmaya karsi
durustluk sigortasidir.

---

## 6. OZET

- 30 foto secildi: deepfashion 13 / princesspolly 9 / handm 7 / uniqlo 1;
  dress 11 / skirt 8 / top 8 / onepiece-other 3. Hicbiri etiketli degil, hepsi diskte.
- `dataset/heldout/manifest.json` yazildi (KURAL blogu + secim kriteri + iliski notu),
  gitignore'lu kalir.
- Dislama diff'i onerildi: **asil guard mine-vocab.mjs (4a)** — held-out hash'e etiket
  URETMEYI engeller; ogrenci dataloader zaten etiketsiz fotoyu alamaz (4b opsiyonel kemer).
- 58-set = insan-etiketli vision cipasi (surekli); heldout-30 = etiketsiz uctan uca
  bitirme sinavi (donem sonu, her olcum raporlu).
