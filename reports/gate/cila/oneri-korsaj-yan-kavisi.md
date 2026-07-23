# CİLA ÖNERİSİ — korsaj yan kavisi (peterpan_puff + lace_vneck) + boat_princess koltukaltı

**Tarih:** 2026-07-23 gece maratonu, D1 (artık zaman)
**DURUM: SADECE ÖNERİ — UYGULANMADI. Karar Damla'da (pinli stiller, re-pin YOK).**
Damla emri: peterpan_puff + lace_vneck pinleri KALIYOR. Bu kart sadece öneri-diff üretir; dokunulmadı.

## GÖZLEM (render, 940×680 referans kalem)
### 1. Korsaj yan kavisi (peterpan_puff, lace_vneck_70s)
Bust apex altından bele inen YAN dikiş, bust hizasında hafif DIŞA dolgun okunuyor — yan çizgi bust apex'te (yB2 civarı) underarm'dan bir miktar dışarı çıkıp bele giriyor. Silüet figürlü ama yan kavis bust'ta "dolgun bir S" yerine daha yumuşak bir eğri olabilir.
- İlgili kod: `_engine-full.mjs` buildHalf, shoulder-top bust→bel segmenti:
  `g.push(seg([uaX,uaY],[uaX+(bustX-uaX)*0.85,...],[bustX,yB2-...],[bustX,yB2]))` +
  `g.push(seg([bustX,yB2],[bustX,...],[eX+(bustX-eX)*nip,...],[eX,yEmp2]))`
- Öneri (UYGULANMADI): bust→bel geçişinde ikinci segmentin ilk kontrol noktası (`[bustX, yB2+(yEmp2-yB2)*0.44]`) x'ini bustX'ten HAFİF içeri (`bustX-(bustX-eX)*0.08`) çekmek → yan kavis bust'ta daha az balon, bele daha akıcı. bustProject'e dokunmadan sadece yan-segment kontrol noktası.
- RİSK: pinli stiller (peterpan/lace_vneck) bu segmenti kullanıyor → byte-identical BOZULUR → re-pin gerekir (Damla: re-pin YOK). Bu yüzden ÖNERİ olarak bırakıldı.

### 2. boat_princess koltukaltı kavisi (top_boat_princess)
Boat yaka geniş → omuz ucu (stX) neredeyse underarm'a (uaX) yakın; armhole kavisi (a1→a2→uaX) kısa/dik okunuyor. Koltukaltı geçişi biraz keskin.
- İlgili kod: armhole cubic `g.push(seg([stX,stY],...,a1)); g.push(seg(a1,...,a2)); g.push(seg(a2,...,[uaX,uaY]))`
- Öneri (UYGULANMADI): boat için `armholeHollow` 0.10 → 0.12 (a1 x'i içeri) VEYA a2→uaX son segmentin kontrol noktasını yumuşatmak → koltukaltı daha akıcı yay.
- RİSK: top_boat_princess PİNLİ değil (id23 GEÇTİ ama pin STYLE-PIN'de değil) — bu daha düşük risk. Yine de id23 hakem-geçti; değişiklik yeni hakem turu gerektirir.

## KARAR (Damla'da)
- (a) Uygula + re-pin (Damla onayı + STstyle-PIN güncelleme) — peterpan/lace_vneck için re-pin YOK dediği için bu yol KAPALI.
- (b) Sadece boat_princess'i cilala (pinli değil, düşük risk, yeni hakem turu) — mümkün.
- (c) Park et (mevcut hali kabul, figürlü zaten okunuyor — kusur minör).

## NOT
Bu bir KUSUR değil, CİLA — mevcut siluetler figürlü ve hakem-geçti. Yan kavis/koltukaltı "daha akıcı olabilir" seviyesinde estetik ince ayar. Damla'nın zevki karar verir.
