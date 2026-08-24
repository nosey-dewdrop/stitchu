# V3-B — ÖLÇÜM ALETİ: kalıp tarafının altı ölçüsü

Alet: `engine/tools/pattern-measure.mjs` (tek yeni dosya).
Çağrı: `node engine/tools/pattern-measure.mjs <pattern.json> [--size EU38]`, exit 0.

Girdi şu iki komutla üretildi:

```
./engine/build/surface-pattern EU38 > /tmp/surface-EU38.json
node engine/tools/pattern-measure.mjs /tmp/surface-EU38.json
```

`surface-pattern` stderr'i (bilgi, hüküm değil):
`ring 724.9232mm | bodice waist 724.8961mm | skirt waist 724.9232mm | diff -0.0272mm | worst fit 0.1261mm`

## ALTI SAYI — birebir stdout

```json
{
  "source": "/tmp/surface-EU38.json",
  "size": "EU38",
  "measures": [
    {
      "name": "hem_circumference",
      "mm": 1295.4506,
      "how": "sum of the 12 skirt-panel edges that no stitch mentions (the free lower boundary), each cubic integrated by sampling at step <= 0.05mm; source coords are cm, multiplied by 10",
      "reason": null
    },
    {
      "name": "bust_circumference",
      "mm": null,
      "how": "not attempted from the panels",
      "reason": "the flat panels carry no bust edge. A bust ring is a horizontal section of the 3D shell; in the developed pattern it is an interior curve with no vertex, no edge and no stitch, so nothing in this file locates it. Finding it would need the 3D->2D map, which the spec does not carry. Deriving it from the waist or the top ring is forbidden, so it stays null."
    },
    {
      "name": "waist_circumference",
      "mm": 724.8907,
      "how": "sum of the torso-side edges of all 14 torso<->skirt stitches (the bodice waist ring, h3b-rings' A side); skirt side of the same stitches measures 724.9086mm",
      "reason": null
    },
    {
      "name": "body_length",
      "mm": 728.787,
      "how": "arc along the centre-front line: front-torso centre seam 312.0783mm (top free edge down to waist, 2 edges) + front-skirt centre seam 416.7086mm (waist down to hem, 1 edges). This is a length ALONG the cloth, not a vertical height difference",
      "reason": null
    },
    {
      "name": "neck_opening_width",
      "mm": null,
      "how": "not attempted from the panels",
      "reason": "this pattern has no neckline: every torso panel's free upper boundary is one continuous top ring (60 edges, 1439.7211mm total arc) with no neck cut in it — the garment is strapless. And a width is a projected 3D quantity; a flat panel can give an arc, not a projected width. Two different quantities, so no number is printed."
    },
    {
      "name": "shoulder_width",
      "mm": null,
      "how": "not attempted from the panels",
      "reason": "this pattern has no shoulder: the torso panels stop at the top ring, there is no shoulder seam and no armhole in the stitch graph. Nothing to measure."
    }
  ]
}
```

## HER `null` İÇİN SEBEP (kısa)

- **bust_circumference** — kalıpta büst kenarı YOK. Büst halkası 3B kabuğun yatay
  kesiti; açılmış panelde köşesi/kenarı/dikişi olmayan bir İÇ eğri. Yerini bulmak
  3B→2B haritasını ister, spec onu taşımıyor. Bel ya da üst halkadan türetmek
  kartın 3. kuralına girer → null.
- **neck_opening_width** — bu kalıpta yaka YOK. Gövde panellerinin serbest üst
  sınırı tek sürekli halka (60 kenar, toplam yay **1439.7211mm**), içine yaka
  kesilmemiş; giysi strapless. Ayrıca "width" bir izdüşüm ölçüsü, düz panel yay
  verir. İki ayrı nicelik → null.
- **shoulder_width** — bu kalıpta omuz YOK. Dikiş grafiğinde omuz dikişi de kol
  oyuğu da yok; gövde üst halkada bitiyor. Ölçülecek şey yok.

## DETERMİNİZM KANITI

```
$ node engine/tools/pattern-measure.mjs /tmp/surface-EU38.json > /tmp/pm-a.json
$ node engine/tools/pattern-measure.mjs /tmp/surface-EU38.json > /tmp/pm-b.json
$ diff /tmp/pm-a.json /tmp/pm-b.json ; echo "diff exit=$?"
diff exit=0
$ shasum -a 256 /tmp/pm-a.json /tmp/pm-b.json
0b90c36013ef69c4fa30f29761388d1538f253c17fccb4ad5c9ddd86e1c4da90  /tmp/pm-a.json
0b90c36013ef69c4fa30f29761388d1538f253c17fccb4ad5c9ddd86e1c4da90  /tmp/pm-b.json
```

Örnekleme adımının sayıyı taşımadığı ayrıca ölçüldü (aletin kopyası `/tmp`'de
`MAX_STEP_MM` değiştirilerek koşuldu, repodaki dosya 0.05mm'de):

```
step=0.25  hem=1295.4506 bust=null waist=724.8907 body=728.787 neck=null shoulder=null
step=0.05  hem=1295.4506 bust=null waist=724.8907 body=728.787 neck=null shoulder=null
step=0.01  hem=1295.4506 bust=null waist=724.8907 body=728.787 neck=null shoulder=null
```

Üç adımda da dört basamak birebir aynı → yay uzunlukları yakınsamış, sayı
cetvelin değil eğrinin sayısı.

## YAN YANA — `shell-flat EU38` vs `pattern-measure EU38`

`./engine/build/shell-flat EU38` çıktısından okundu. **Bu tabloda hüküm yok.**

| ölçü | shell-flat (mm) | pattern-measure (mm) | fark (mm) | fark (%) |
|---|---|---|---|---|
| hem_circumference   | 1295.6000 | 1295.4506 |  −0.1494 | −0.0115% |
| bust_circumference  |  754.7482 | null      | —        | —        |
| waist_circumference |  725.0000 |  724.8907 |  −0.1093 | −0.0151% |
| body_length         |  743.5050 |  728.7870 | −14.7180 | −1.9795% |
| neck_opening_width  |  349.8211 | null      | —        | —        |
| shoulder_width      |  334.5680 | null      | —        | —        |

★ `body_length` satırındaki iki sayı AYNI NİCELİK DEĞİL, tabloya bu notla
konuyor: shell-flat'inki bir YÜKSEKLİK FARKI (`topZMM 1378.3050` −
`bottomZMM 634.8000` = 743.5050), pattern-measure'ınki kumaş üstünde bir YAY
(ön orta hat). Eğri bir hat düşey mesafesinden kısa olamayacağı için −14.7mm'nin
işareti tek başına bir tutarsızlık değil, iki tanımın farkı. Hangisinin
"doğru body_length" olduğu bu kartın işi değil.

## KART DIŞI, ÖLÇÜLDÜ (bilgi)

- Gövde panellerinin serbest ÜST halkası: **1439.7211mm** (60 kenar).
- Bel halkası iki yakası: gövde **724.8907mm**, etek **724.9086mm**, fark
  **−0.0179mm** (aletin kendi ölçümü; `surface-pattern` stderr'i aynı ikiliyi
  724.8961 / 724.9232 diye basıyor — o motorun iç sayısı, bu spec kenarlarından).
- Arka orta hat (fermuarlı) aynı yöntemle **772.2352mm** (gövde 362.9747 + etek
  409.2605); ön orta hat 728.7870. Ön/arka farkı **+43.4482mm**. Rapora ölçü
  olarak KONMADI, çünkü sözleşme tek `body_length` istiyor ve ön orta hat seçildi.
- Panel envanteri: 8 panel (4 gövde × 22 kenar, 2 ön etek × 8, 2 arka etek × 10),
  26 dikiş, **pens YOK** (aynı panele bağlanan tek bir dikiş bile yok).
