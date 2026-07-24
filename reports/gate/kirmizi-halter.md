# KIRMIZI — halter yaka (3 iterasyon, V-dip mirror artefaktı çözülmedi)

**Tarih:** 2026-07-23 gece maratonu, Primitif turu
**Durum:** KIRMIZI — geri alındı, commit edilmedi. Eksik yetenek kaydı.

## NE DENENDİ
Motor `Neckline::Halter` zaten çiziyor (bodice.cpp: nape strap + front frame shifted). Eksik olan FLAT idi. buildHalf'a halter dalı eklendi:
- `k.halter=true` bayrağı → sonraki omuz+armhole g.push'ları atlanır (halter kendi üstünü çizer).
- ÖN: CF derin V + nape bandı (boyna çıkan) + açık armhole (omuz yok).
- ARKA: round scoop + açık sırt.
- styleKey `dress_halter_princess_circle` (id21: halter + halfCircle + kolsuz).

## 3 İTERASYON
1. nape 0.34 içeride → V çok dar/keskin, arka omuz gibi.
2. nape 0.50 + nape genişliği 6 + princessSeam kapatıldı → halter TOPOLOJİSİ ÇALIŞTI (derin V + nape bantları + açık armhole + flare circle, emsale ar-202439-2 yaklaştı).
3. V-dip yukarı (0.02) → hâlâ **V-dip mirror artefaktı**: ön parçanın iki iç kenarı (front half + mirror) CF'de birleşince keskin bir yarık + V dip'ten aşağı dikey iz kalıyor. Emsalde yok.

## KÖK NEDEN (eksik yetenek)
Halter ön-orta TOPOLOJİSİ: iki nape bandı bust üstünde V yapar, V dip'te ön parça kumaşı DEVAM eder (kapalı, yarık değil). Mevcut mirror mekanizması (front half → CF mirror) V iç kenarını CF'de keskin birleştiriyor = yarık artefaktı. Doğru çözüm: V dip'te iç kenarın CF'de YATAY tangent ile kapanması (yarık yerine yumuşak dip) VEYA ön parçanın V-altı gövdesinin ayrı ele alınması. Bu, sweetheart'ın (sadece yaka kenarı) aksine gövde-topoloji değişikliği — 3 iterasyonda yaka geometrisine odaklanıldı, mirror-dip artefaktı 3. iterasyonda tespit edildi, 4. deneme kuralca yok.

## SONUÇ
- Halter topolojisi (nape bandı + açık armhole + k.halter atlama mekanizması) DOĞRU ÇALIŞIYOR — değerli ilerleme.
- Kalan: V-dip CF birleşimi (mirror yarık artefaktı) — tek fix noktası, gelecek turda İLK iş.
- id21 ÜRETİLEMEZ kalır (halter flat kusurlu, ikame yok).
- Motor hazır, emsal net (ar-202439-2). Sadece flat V-dip düzeltmesi eksik.

## SONRAKI TUR İÇİN
buildHalf halter dalında V-dip'i CF'de yatay-tangent ile kapat (yarık → yumuşak dip) VEYA `enforceC1(g, flatStart=true)` benzeri bir CF-flat başlangıç kullan. Tek fix, sonra determinizm+suite+çift kanat.
