# PLAN — stitchu, tek yol (12 Eylül 2026)

> Bu tek plandır. Önceki bütün düzenler (G1-G4, altı iş, A1-A13, 0509-kosu.md,
> 1209-kosu.md, bu dosyanın 13:47'deki hali) **geçersizdir**.
> Otorite: `HEDEF.md` > bu belge.
>
> **Bu plan bir daha yazılmaz.** Faz kapanınca yanına tek satır ölçülmüş sonuç
> yazılır. Yeni numaralama, yeni faz, yeni kapı kurulmaz.

---

## 0. Neden 3 ay kapanmadı — ölçüm, bahane değil

**0.1 — Kısa yol denendi, hep aynı yerde patladı.**
368 commit / 265.483 satır (2-12 Eyl). Kapanan madde: 0.
Sebep: F1-F2-F3 gidiyor, F4'te ölçüm yapılıyor, temel bozuk çıkıyor, plan
yeniden yazılıyor. Rebirth-rework-remaster.

**0.2 — Asıl kusur bugün ölçüldü (12 Eyl 13:43, pembe elbise).**

| katman | sonuç |
|---|---|
| okuma (`claude -p`) | **DOĞRU** — "boyun dibine oturan, önde fiyonkla bağlanan bant üstünde damla kesimli açıklık, kısa kollu, oturan, mini" |
| çizim | **YANLIŞ** — kol yok, yaka bandı yok, yaka V |

Sebep iki sayı: okuma kolu `shoulderTip*1.05` verdi (görünmez genişlik),
çizici sıfır-alanlı üçgen çizdi ve **şikayet etmedi**. Elle `*1.30` +
`yakaBicim:"kare"` yapıldı → elbise çıktı. **İki satır.**

→ **Kök sebep: okuma ile çizim arasında denetim yok. Sessiz düşme.**
3 ay "flat çirkin" denip çizim güzelleştirildi; kusur bu değildi.

**0.3 — Kod kütlesi yanlış yerde.**

| ne | satır | senin elbiseni çizdi mi |
|---|---|---|
| `engine/src` C++ motor | 37.573 | HAYIR (flat'e hiç girmiyor) |
| `contract/*.json` (29 dosya) | 19.268 | HAYIR |
| `web/lib/siluet-ciz.js` | **472** | **EVET** |

472 satır çiziyor, 56.841 satır çizmiyor. Ağırlık ürünün olmadığı yerde.

**0.4 — Çürütülmüş bahane.**
"MIT lisanslamış, biz yapamayız" **yanlış**. MIT = ticari kullanım serbest,
atıf yeterli. 23 Ağu'da zaten çürütülmüş (`knowledge/TEKNOLOJI-2026-08-23.md`),
yine de bahane olarak kullanıldı.

---

## 1. TECH STACK — kararı verildi, doğrulandı (12 Eyl, GitHub API)

| proje | lisans | yıldız | son push | ticari? | bizde ne olacak |
|---|---|---|---|---|---|
| **GarmentCode / PyGarment** | **MIT** | 424 | 29 Haz 2025 | **EVET** | **KALIP motoru budur.** C++ motorun yerine geçer |
| **ChatGarment** | **Apache-2.0** | 170 | 7 Ağu 2025 | **EVET** | okuma mimarisi (VLM → JSON konfig) referans |
| **FreeSewing** | **MIT** | 484 | 2 Nis 2025 | **EVET** | id'li makro + `rm` geri-alıcı → F7 edit deseni |
| Seamly2D | GPL-3.0 | — | — | **HAYIR** | tek satır alınmaz, sadece fikir okunur |

**Neden GarmentCode:** senin 9. madden (sabit sözlük yok, Edge/Panel/Stitch)
orada zaten çözülmüş ve yayınlanmış:
`Edge` · `EdgeSequence.substitute()` · `Panel.add_dart(shape, edge, offset)` ·
`Interface(panel, edges, ruffle)` · `StitchingRule.isMatching(tol=0.05)` ·
`Edge.subdivide_len(fractions)`.
Biz bunu 37.573 satır C++'ta sıfırdan yazdık ve hâlâ dikilebilirlik kapısı yok.

**Seçilen tek yol (zor olan):**
> **Flat = kalıbın croquis üzerine giydirilmiş izdüşümü. İkisi tek kaynaktan
> çıkar: GarmentCode paneli. Bir daha ayrı çizilmez.**

Bugün flat (`siluet-ciz.js`) ve kalıp (`graf`+`ops`) **iki ayrı hattan**
üretiliyor. Uyumsuzluğun sebebi bu. Tek hat olacak.

**Kullanılmayacaklar ve sebebi:** Flux/diffusion (çıktısı resim, kalıp değil —
senin sattığın kalıp) · 3B drape sim (F9'dan önce gereksiz) · yeni contract
dosyası (29 tane var, yenisi eklenmez).

---

## 2. ANLAM SIRASI — neden bu sıra

Zincir: **fotoğraf → okuma → spec → panel → (kalıp | flat) → paket → canlı.**
Bir halka çalışmadan sonraki halkanın güzelliği ölçülemez. Güzelleştirme
en sonda, çünkü güzelleştirilecek şeyin önce DOĞRU olması gerekir.

**Geri dönüş kuralı:** ileri gidilir. Bir faz önceki fazda hata **bulursa**,
o hatayı *kendi fazında* düzeltir ve devam eder — plan yeniden yazılmaz,
faz yeniden açılmaz. Tek istisna F5 (kör hakem) → F3'e kusur listesi döner.

---

## 3. FAZLAR — her fazda hangi dosya nasıl değişecek

### F1 — SESSİZ DÜŞME BİTER
**Neden ilk:** bugünkü kusurun kök sebebi. Bu olmadan sonraki her ölçüm yalan.

Değişen: `web/lib/siluet-ciz.js` (472 satır)
- satır 445 `default: bilinmeyen öge` → `kirmizi.push()`
- `kolCiz()`: kol alanı < 200 mm² → kırmızı `"kol okundu, çizilemeyecek kadar dar (shoulderTip*1.05)"`
- yeni fonksiyon `denetle(okuma, svg)`: okumadaki her `ogeler[].tip`, `kol`,
  `yakaBicim` çıktıda karşılığı var mı → yoksa kırmızı
- `ciz()` dönüşü: `{svg, imza, kirmizi[]}` — kirmizi doluysa çağıran çizmez

Değişen: `KOSU/servis.mjs` — kırmızı varsa ekrana adıyla basar, flat göstermez.

KANIT: pembe elbise koşulur; kırmızı listesinde `kol` ve `yakaBandi` isimleriyle çıkar.

---

### F2 — TEK HAT: PANEL → HEM KALIP HEM FLAT
**Neden burada:** senin 2. madden ("babydoll giymiş 36 beden"). Flat ve kalıp
ayrı hatlardan çıktığı sürece uyum tesadüftür.

Kurulan: `engine/py/` — GarmentCode (pip `pygarment`), MIT, atıf `NOTICE`'a.
- `spec2panel.py`: okuma JSON → GarmentCode `Component` (Edge/Panel/Interface)
- `panel2pattern.py`: panel → **gercek36** ölçüleriyle değerlenir → kalıp DXF/SVG
- `panel2flat.py`: **aynı panel** → **croquis36** ölçüleriyle değerlenir +
  vücut hacmine giydirme (ringQuarter = kesit yarımı × (1 + bolluk/çevre))
  → flat SVG
- `StitchingRule.isMatching(tol)` → dikilebilirlik kapısı (bugün yok)

Ölen: `engine/src` C++ hattının flat/kalıp üretimi (37.573 satır).
Silinmez, `engine/_eski/` altına alınır; F5 10/10 olunca silinir.

Değişen: `contract/body-v1.json` — croquis36 ve gercek36 sayıları **dolu** olacak
(bugün anahtarları boş döndü). Manken 90-60-90 / 178 / 55kg sabit.

KANIT: tek panelden iki çıktı; babydoll ve skinny aynı croquis'te,
göğüs-bel-kalça çizgileri **aynı y'de** — üst üste bindirme görüntüsü.

---

### F3 — EKSİK PRİMİTİFLER (F1'in bildirdikleri)
Değişen: `web/lib/siluet-ciz.js` + `contract/primitives-v1.json`
- `yakaBandi` (stand/tie collar) — kenar+panel+dikiş olarak, sözlük değil
- `keyhole` (damla açıklık)
- `fiyonk`un banda bağlanması (bugün havada duruyor)
- F1'in kırmızı verdiği her tip

KANIT: pembe elbise sıfır kırmızı; flat fotoğraftaki elbise.

---

### F4 — OKUMA→ÇİZİM KAPISI
Değişen: `KOSU/siluet-oku.mjs`
- Okumanın her sayısı çizilebilir aralıkta mı, çizmeden önce ölçülür
  (kol genişliği, yaka derinliği, etek boyu, oran sınırları)
- Aralık dışıysa okuma **tekrar istenir** — uydurma düzeltme yok
- Sadece ön fotoğraf varsa: arka türetilir ve **ekranda** ilan edilir
  (bugün sadece `kaynak-yolu.txt`'de yazıyor, kullanıcı görmüyor)

KANIT: `shoulderTip*1.05` geldiğinde sistem yakalar, sessizce çizmez.

---

### F5 — 10 FOTOĞRAF, KÖR HAKEM
Girdi: `GIRDI/hedef-fotograflar*` içinden 10 farklı elbise (babydoll, oturan,
klos, uzun kollu, askılı, yakalı dahil).
Her biri koşulur; flat + fotoğraf kör hakeme: "aynı elbise mi?"
**Tek geri dönüş noktası:** kusur listesi F3'e döner, F3 düzeltir, tekrar koşulur.

KANIT: 10/10 tablo, her satırda fotoğraf–flat çifti.

---

### F6 — PAKET
Değişen: `web/lib/pdf-core.js`, `web/lib/rehber-tr.js` (ikisi de var, bağlanacak)
Çıktı zip: `flat.svg` · `flat.pdf` · `kalip-A4.pdf` (1:1, 100 mm kalibrasyon
karesi) · `kalip-A0.pdf` · `rehber.html` (dikiş payı, kesim planı, iğne tipi,
püf noktaları) · `kesim-plani.md`. Tek beden EU36.

KANIT: inen zip + kalibrasyon karesi cetvelle 100 mm.

---

### F7 — CANLI
`claude -p` sunucuda koşmaz. Seçenek **ölçülür** (yerel köprü / kuyruk / API
maliyeti), karar sayıyla verilir, deploy edilir.
Değişen: `web/` landing — bayat veri, eski patch notes silinir.

KANIT: yabancı biri canlı URL'de fotoğraf yükleyip zip indirir. **"Al dene" anı budur.**

---

### F8 — EDİT
FreeSewing deseni (MIT): id'li makro + `rm` geri-alıcı; GarmentCode
`Interface.substitute`. "Şuraya fiyonk ekle", "yakayı uzat", "kolu kısalt".
Değişen: `docs/GRAF-IR.md` 15 op + replay zaten var, doğal dil bağlanır.

KANIT: tek cümleyle değişen flat, önce/sonra.

---

### F9 — KUMAŞ
"Aynı elbise, iki kumaş, iki kalıp." Negatif pay kumaşın esneme/toparlanma
payından hesaplanır, kalıba yansır. `contract/fabric-catalog-v1.json` var.

KANIT: aynı elbise dokuma + örme, iki kalıp, sayı farkı tabloda.

---

### F10 — PROVA
Damla `kalip-A4.pdf`'i basar, ucuz kumaştan diker. 600+ saatte hiç yapılmadı.
Giyilebilirliği ölçen tek kapı.

KANIT: dikilmiş giysinin fotoğrafı.

---

## 4. Kurallar

1. Her faz taze ajan, iş bitince ölür. Çıktı tarafsız hakeme gider.
2. **Damla router değildir.** Faz arası soru hakem ajana sorulur.
3. Sessiz varsayılan yasak — çizilemeyen kırmızı verir.
4. Main'de çalışılır, branch yok. Bir adım = bir commit.
5. Yeni contract dosyası açılmaz (29 tane var).
6. Bu plan yeniden yazılmaz.

## 5. Durum

| faz | durum |
|---|---|
| F1 sessiz düşme biter | AÇIK |
| F2 tek hat: panel → kalıp + flat | açılmadı |
| F3 eksik primitifler | açılmadı |
| F4 okuma→çizim kapısı | açılmadı |
| F5 10 fotoğraf kör hakem | açılmadı |
| F6 paket | açılmadı |
| F7 canlı | açılmadı |
| F8 edit | açılmadı |
| F9 kumaş | açılmadı |
| F10 prova | açılmadı |

Site zincire bağlandı (12 Eyl `f19cb94a`): fotoğraf yüklenince ekranda flat
çıkıyor. Kanıt `KOSU/ciktilar/yerel/A1-kanit.png`.
