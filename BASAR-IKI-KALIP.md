# BAŞAR: İKİ KALIP (Damla emri, 2026-07-27 akşam)

**Tek görev: satın alınan 2 Buğra kalıbını motor bire bir yapana kadar BAŞKA STITCHU İŞİ YOK.**
"Sadece o iki kalıpta kal. Yapmayı dene, gerçekten öyle mi oldu bak, öğren. Sadece 2."
Yer gerçeği = A0 vektör PDF'ler (700 TL, gerçek mm). Sayaç yok; ölçü = parça parça
Buğra-36 halkasıyla örtüşme (IoU + W/H/perim) ve Damla'nın gözü.

## Araçlar (hepsi repoda)
- Geometri: `patterns_real/geometry/geometry-full.json` (104 halka: corset 6x8, locket 7x8;
  renk→beden haritalı, kalibrasyon 4cm bar = 40.00mm)
- Çıkarıcı: `patterns_real/tools/bugra-extract-full.py`; overlay/kıyas: `tools/overlay.mjs`,
  `tools/motor-dump.mjs`. Kontak sayfaları: ~/Desktop/bugra-{corset,locket}-yuzlesme.png
- Beden: Buğra 36 = bust 880 / bel 680 / kalça 940 mm (EU38 gövdesi)

## ÖLÇÜLMÜŞ BOŞLUK LİSTESİ (27 Tem yüzleşmesi; öncelik sırası)

### Corset (Buğra 6 parça, motor 9 çizdi — 3'ü fazla)
1. **ARKA SINIF YANLIŞ (en ağır):** motor omuz-kalça tank arkası çiziyor (240x613, cut 2);
   Buğra korse arkası kürek altında biten kısa panel (94x328, CUT-ON-FOLD 1 parça). IoU 0.26.
2. **ASKI YOK:** Buğra askıyı parçanın İÇİNDEN kesiyor (cut-on strap: Upper Cup önde,
   Back Body arkada, kol oyuğuyla); motor straplez sanıyor.
3. **BANT SEVİYELERİ KAYMIŞ:** Buğra cup→ALTBÜST hilali (~96mm) → altbüstten etek;
   motor cup→BEL bandı (189mm) → belden etek.
4. **CUP FAZLA BÖLÜNMÜŞ:** Buğra cup TEK parça; motor center/side diye 4'e bölüyor
   ("elli parça olamaz" itirazının ölçümü). Doğru olan: tek geniş cup.
5. **ASTAR KATMANI YOK:** Buğra tam astarlı (18 kesim = 11 ana + 7 astar); motor bias şerit basıyor.
6. **DOĞRU OLAN:** ön orta panel genişliği BİREBİR (160 vs 161mm) — princess gövde bloğu sağlam.
7. **KABLO:** `backend/spec-core.js` engineSpec cupSeam'i TAŞIMIYOR (API yolunda sessiz düşüyor) — onar.

### Locket Top (6'ya 6 parça ama türler kaymış)
1. **İKİ PARÇALI KOL YOK:** Buğra Upper (fırfırlı, 489x261) + Lower (310x209); motor tek
   Puff Sleeve (473x372). Toplam boy tutuyor (377 vs 372) — bölme dikişi + fırfır kesimi eksik.
2. **BOY/SİLUET:** motor top'u kalça boyu kutu çiziyor (+138/+161mm); Locket bel boyu oturan.
   Top için boy kontrolü yok (skirtLengthMM sadece dress).
3. **YAKA KURULUŞU:** Buğra derin hilal yaka (287x149) + AYRI küçük astar (183x165) + tela
   çizimi; motor tek, neredeyse düz bant (235x94) ve peterPan==flat BİREBİR aynı geometri
   (yaka ailesi tek şekle çökmüş).
4. **ARKA:** Buğra 1 katlı cut-on-fold + bel pensesi; motor cut 2 CB dikişli.
5. **MOTOR FAZLASI:** ön+arka yaka pervazı Buğra'da yok.

## Defter düzeltmeleri (onay bekliyor, dosyaya İŞLENMEDİ)
BUGRA-DEFTER.md'de 3 korse parça adı yanlış çıktı (foy IoU eşleşmesiyle kanıtlı) ve Locket'te
7. küme (gerçek Collar hilali) deftere hiç girmemiş. Detay: yüzleşme raporu JSON'ları /tmp/bugra-yuzlesme/.

## Çalışma kuralı
Her düzeltme: motor değişikliği → ctest+golden → overlay.mjs ile Buğra-36'ya karşı YENİDEN ölç →
IoU/mm iyileşmesini yaz → push. Kanıtsız "yaklaştı" yok. Sıra: önce corset 1-4, sonra locket 1-3.
