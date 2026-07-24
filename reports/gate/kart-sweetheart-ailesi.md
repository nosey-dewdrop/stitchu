# KART — sweetheart ailesi: primitif kuruldu, id54 emsal-uyumsuz, id101 tek-eksik

**Açılış:** 2026-07-23 (sweetheart turu)
**Mühür/karar:** Damla'da (id101 spaghetti tie-strap eklemesi = sıradaki tur kararı).

## SWEETHEART PRİMİTİFİ — BİTTİ + DOĞRU (şekil-teyitli)
- Motor `Neckline::Sweetheart` zaten çiziyordu (bodice.cpp); eksik olan FLAT idi.
- Flat: `buildHalf` sweetheart dalı (2026-07-23) = CF sığ merkez çentik + iki dolgun bust cup (kalbin yarısı), SADECE ön; arka roundNeck scoop. crew/v/square ikamesi DEĞİL.
- ŞEKİL TEYİDİ: id101 emsali (ar-202455-6, net floral sweetheart corset dress) ile kıyas — çizilen kalp yaka şekli (CF çentik + iki cup) emsale sadık. Primitif doğru.
- styleKey `dress_sweetheart_princess_circle` (sweetheart + princess + halfCircle + kolsuz + bel bow). Kalıp 7 parça: princess bodice (4 panel) + bias binding + quarter-circle skirt + Front Waist Bow. Deterministik (md5 eşit), suite 49/49, golden byte-identical, contract+preview-truth GREEN.

## id54 — GEÇTİ-ADAYI, hakem-teyitli GEÇTİ DEĞİL (EMSAL-UYUMSUZ)
- id54 label = "sweetheart wide-strap princess fit-and-flare mini heart dress", spec = sweetheart+princess+halfCircle+wide strap+kolsuz. Flat+kalıp bu spec'e SADIK (referans kalemden, pipeline GEÇTİ).
- **SORUN: id54 crop (ar-202547-1) hedefle UYUMSUZ** — crop bir "Handkerchief Skirt" ürünü (sivri uçlu etek), sweetheart dress değil. Kardeş crop'lar da farklı (ar-202547-3 Orla babydoll V-neck, -5 evening gown) — hiçbiri "sweetheart wide-strap princess heart dress" değil.
- Damla ölçütü hakem için emsal-kıyası şart; id54'ün kendi emsali uyumsuz olduğundan FLAT kanadı id54'e karşı KOŞULAMAZ → **GEÇTİ yazılmadı** (dürüst). GEÇTİ-ADAYI kaldı.
- KARAR (Damla): id54 spec'i doğru mu (confidence 0.85), crop mu yanlış eşlenmiş? Doğru sweetheart emsali başka crop'ta mı? Emsal düzeltilirse id54 hakeme sokulabilir.

## id101 — HAKEM-TEYİTLİ GEÇTİ (2026-07-23, sayaç 21→22)
- id101 (ar-202455-6, NET sweetheart emsal) = sweetheart + spaghetti tie-strap + halfCircle + princess + frontNeckBow.
- FLAT spaghetti tie-strap primitifi EKLENDİ: `st.spaghettiStrap` bayrağı → shoulder-top omuz-noktasından yukarı ince askı + omuzda bağ ucu (band-top strapShape'ten ayrı). styleKey `dress_sweetheart_spag_circle` (parts.tie=true → ön boyun bow).
- **Motor 8 parça** — princess bodice (4 panel) + bias + quarter-circle skirt + Neck/Front Tie + Spaghetti Strap.
- ÇİFT KANAT GEÇTİ: FLAT emsal ar-202455-6'ya sadık (sweetheart yaka + spaghetti tie-strap + on bow + fit-and-flare circle), KALIP 8 parça. Suite 49/49, golden byte-identical, determinizm md5 eşit, preview-truth GREEN (28 stil).
- (print uyarısı: halfCircle bodice panel 4040mm > 3000mm tiling cap = mevcut circle-etek uyarısı, sweetheart/strap ile ilgisiz.)

## id10 / id70 — dürüst ÜRETİLEMEZ (kümeli)
- id10: garment çelişki (corset bodice + dress = iki garment, dürüst red).
- id70: ruched cup + ruffled strap + corset panel (çok-primitif, köprü eşleşmedi).

## SIRADAKİ (sweetheart ailesini kapatmak için)
1. FLAT shoulder-top spaghetti tie-strap primitifi → id101 tam açılır (net emsal, motor hazır).
2. id54 emsal düzeltmesi (Damla: crop mu yanlış).
