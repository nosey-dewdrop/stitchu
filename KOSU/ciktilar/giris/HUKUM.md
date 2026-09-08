# A3 hukmu (elle, 2026-09-09) — bes fotograf primitif emir listesiyle motordan gecti

Onceki hukum (8 Eyl): "5 ciktinin 4'u bayt ayni; ops[] kayit, program degil; applyOp CLI'si yok". Kok neden
motorda kapatildi (Damla karari, 9 Eyl): motor taban elbiseyi degil taban + primitif emir listesini uygular ve
cizer. Bu dosya OLCUMU ilan eder, kabul komutu `bash engine/tests/0509-vision-kabul.sh` ayni sayilari basar.

## Ne olculdu?

    bash engine/tests/0509-vision-kabul.sh            -> KABUL kirmizi=0
    md5 -q KOSU/ciktilar/giris/*/flat.svg              -> 4 farkli deger (1 = 2)

| # | fotograf | op | grafdogrula (gercek36) | flat md5 = |
|---|---|---|---|---|
| 1 | biba-O1194418-dress | 8 | 0 kirmizi | 2 (ayni giysinin ikinci cekimi, KOSU/0509-a3-secim.md) |
| 2 | biba-O1194418-dress-arka (icerik ON) | 8 | 0 kirmizi | 1 |
| 3 | biba-O120579-dress | 15 | 0 kirmizi | — |
| 4 | mary-quant-O365926-dress | 12 | 0 kirmizi | — |
| 5 | mary-quant-O365926-dress-arka | 8 | 0 kirmizi | — |

- Her teslimde `ops.json` (yalniz {op,args}); `flat.svg` kokunde `data-ops=<op sayisi>`: cizici ops SONRASI cizdi.
- Op'suz cizim KIRMIZI: `grafciz <taban> --ops []` -> exit 2 `ERR_NO_OPS` (kabul komutu `opsuz_cizim_kirmizi` satiri).
- Hicbir flat tabanin op'suz flat'iyle bayt-ayni degil (`N_flat_taban_farki` satirlari).
- **1 = 2 BEKLENIR ve ilanlidir:** iki dosya ayni on yuzun iki cekimi (dosya adi "arka" yanlis; A3 secim notu ve
  karar ajani KARAR 4). Ayni okuma -> ayni emir listesi -> ayni flat. Bu bir kusur degil, olcumdur; farkli iki giysi
  ayni flat verseydi kabul komutu `flat_ayni_a_b` ile KIRMIZI basardi.

## Okumadan motora ne gecti?

Okuma opDemeti = graf-v1 primitifleri (vision-graf-v1 1.1.0, yasa 9): `extendTo, fitLength, reshapeEdge, addPanel(onto),
sew, closure, subdivide, split, merge`. Ceviri katmani ve ad sozlugu YOK; `setNeckline/addPanel(eski)/addClosure/addPatch/
mergeSeam/setWidthTarget` kalkti (setWidthTarget -> `hedefler[]`, cozucu hedefi). Yazilamayan kalemler her okumanin
`eksikPrimitif[]` alaninda GEOMETRIK adiyla (bagimsiz parca = bel bandi; grain yazan op; kavis kontrol noktasi).

Motorda bunun icin eklenen primitifler (giysi adi yok): `sew` (dik), `addPanel` (+onto: yuze dikili parca), `drop`
(panel kaldir), `merge` (panel birlestir; bel pensi ic halka/balik pensi olur, `Panel.darts`), `reshapeEdge kind/finish`
(kat kenarinin bir bolumu serbest kenar = yarik). `contract/graf-v1.json` yasa 11, 19 op.

## Kalan kusurlar (adim adiyla)

- Flat'te arka panellerin omuz dikisinden "acilmis kitap" pozunda durmasi ve kol pozu: cizici gorunum kurali, A4
  (`flat_ayni_insan_check` ilanli).
- Tamlik kosusunda (KOSU/ciktilar/giris/TAMLIK.md) adiyla duran eksikler: slash&spread, resew, kenar birlestirme,
  extendTo oranli, prenses/kup dikisine gomulu supresyonun cozucude olculmesi (A4/A6).
