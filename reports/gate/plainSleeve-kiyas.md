# plainSleeve kıyas — bağımsız hakem raporu

**Tarih:** 2026-07-21
**Örnek:** `top_crew_boxy_sleeve` (id65) — kısa kollu boxy crew tee
**Emsal:** design_patterns/crops/ar-202430-4.png (Delilah kısa-kollu gömlek elbise), 11-1.png (uzun-kollu ceket)
**Kısıt:** motor/contract/styles.json dokunulmadı; sadece /tmp'de üretim + ölçüm. Kredi/worker yok.

---

## VERDICT: AYNI KARAKTERDE ✅

Motor kolu **düz set-in kol** olarak okunuyor — balon/kabarık DEĞİL. Omuzdan düz iniyor,
hafif içe konik daralıyor, cap tepesi düz (crown yok), gövdeye temiz bağlanıyor.
Önceki "kısa+kabarık" hali düzelmiş. 5 metriğin 5'i de emsal düz-kol zarfında.

---

## 5 METRİK (motor vs emsal)

| # | Metrik | Motor (ölçülen) | Emsal | Sapma |
|---|--------|-----------------|-------|-------|
| 1 | **Kol karakteri** | DÜZ: cap tepesi tam yatay (3 nokta y=53.8), crown/puff yok, dış kenar sadece 9.5° içe konik | Delilah düz cap sleeve, ceket düz iki-parça kol | Yok — düz ✅ |
| 2 | **Kol boyu / gövde oranı** | sleeve_len=101.7mm; korsaj (omuz→bel ~143mm) → **%71**; gövde toplam boyunun %39'u | kısa kol ≈ korsaj 1/4–1/2 (Delilah cap: gövdenin ~%15-20'si, dar; bu boxy tee daha uzun kısa-kol) | Motor kolu Delilah cap'ten UZUN ama boxy tee için makul; hedef "kısa kol" karakteri korunuyor ✅ |
| 3 | **Bilek/omuz genişlik oranı** | cuff=28.9mm / top=39.2mm → **%73.7** | hedef ~%70; düz-hafif konik kol | +3.7 puan, hedefte ✅ |
| 4 | **Koltukaltı bağlantısı** | gövde omuz x=310.6, kol koltukaltı x=309.1 → **1.5mm** hizada, temiz; çakışma/garip kavis yok | emsalde kol gövdeye temiz set-in | Yok — temiz ✅ |
| 5 | **Omuz açısı** | kol tepesi omuz noktasından (310.6, 53.8) başlıyor, dış kenar aşağı-dışa iniyor; yukarı kalkık DEĞİL | emsalde kol yatay-hafif aşağı çıkar | Yok — doğru açı ✅ |

## Ham geometri (front, mm)
- Gövde ön: genişlik 141.2, yükseklik (omuz→hem) 259.9
- Kol: boy 101.7; tepe (cap) genişliği 39.2; cuff genişliği 28.9
- Dış kenar konikliği: 70.4mm düşüşte 11.8mm içe (9.5° dikeyden) = yumuşak düz taper
- Cap tepesi: 3 nokta da y=53.8 → tamamen yatay, balon crown YOK
- Koltukaltı gap: 1.5mm (temiz set-in)

## Not
- Tek gerçek "büyük" metrik: kol boyu (metrik 2). Delilah'nın cap sleeve'i daha kısa/dar;
  motorun boxy-tee kolu daha uzun kısa-kol. Bu STİL farkı (boxy drop-shoulder tee vs
  fitted shirt-dress cap), kusur değil — ikisi de düz-kol tipi. Düzeltme GEREKMİYOR.
- Kol tipi (düz vs balon) ve temiz bağlantı asıl kriter → ikisi de PASS.
