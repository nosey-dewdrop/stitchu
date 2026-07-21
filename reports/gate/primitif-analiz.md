# PRİMİTİF ANALİZ — Tam-Açılan Tablosu (2026-07-21 FAZ 0b)

Günün sırasını FREKANS değil TAM-AÇILAN belirler. 103 hedef, 4 geçti (23/88/90/82).

## Primitif frekans vs tam-açılan
| primitif | frekans | TAM-açılan | en-iyi ikili |
|----------|---------|------------|--------------|
| tie-bow | 22 | **2** | +6 (other) |
| ruffle-hem | 15 | 0 | +7 |
| lace-up | 15 | 1 | +3 |
| wrap-drape | 13 | 0 | +4 |
| shirred | 12 | 0 | +1 |
| collar | 12 | 0 | +3 |
| peplum | 8 | 1 | +1 (lace-up) |
| boxy | 5 | 1 | +2 |
| plain-sleeve | 4 | 0 | +1 |

**Sezgi kırıldı:** tie-bow frekans şampiyonu (22) ama TAM-açılanı sadece 2 — çoğu başka primitifle kümelenmiş.

## GÜNÜN GERÇEK SIRASI — 9 tek-eksik hedef, ham metinle
Kritik keşif: birçok "tek eksik" YENİ primitif değil, MEVCUT yetenekle açılıyor:

| id | giysi | tek eksik | durum |
|----|-------|-----------|-------|
| **15** | princess tweed dress | "dokulu tweed kumaş" | **BEDAVA** — kumaş dokusu notu, geometri değil. Motor zaten çizer. |
| **29** | scoop princess dress | "gore/panelli flare etek" | **YAKIN** — gore_skirt_dress PİNLİ, gorePanels parçası var |
| **47** | cap-sleeve princess dress | "full circle etek" | **YAKIN** — halfCircle var, full circle uzatması |
| **24** | V-neck dress | "belde bağlanan fiyonk kuşak" | **YAKIN** — tie parçası var (tie-bow) |
| **53** | A-line dress | "arkada bağlanan bağ" | **YAKIN** — tieBack (tie parçası) var |
| **41** | princess peplum top | peplum frill | peplum primitifi (fizik hazır) — FAZ 2 |
| **65** | boxy sleeved tee | boxy drop-shoulder | plainSleeve — FAZ 1 |
| **95** | lace-up crop top | çapraz lace-up | lace-up primitifi — yeni |
| **98** | low-waist belt add-on | belt add-on parça | JUNK ŞÜPHESİ (giysi değil, aksesuar) |

## ÖNERİLEN SIRA (tam-açılan × kolaylık)
1. **id15 tweed** — bedava, kumaş notu (dakikalar). Ama cap-sleeve? kontrol et.
2. **id29 gore dress** — gorePanels dress'e var, spec eşlemesi
3. **id47 circle skirt dress** — full circle etek (halfCircle uzatması)
4. **id24 + id53** — tie/tieBack (mevcut tie parçası)
5. **FAZ 1: plainSleeve** → id65 + 3 hedef
6. **FAZ 2: peplum** → id41 + tam-açılanlar
7. **FAZ 3: collar** (0c: collarShape flat + collar.cpp kalıp ZATEN VAR, sadece köprü)

## Not: "dress" tek-eksikleri (15/29/47/24/53) TOP değil
Bunlar elbise — buildHalf dress yolu (korsaj+etek) zaten emsal çiziyor (tur1'de kanıtlı figür). Eksikleri mevcut parçalar. En hızlı sayaç kazancı BURADA, plainSleeve/peplum'dan ÖNCE.

## Akşam güncellemesi: tahmin vs gerçek (buraya)
- (akşam doldurulacak)
