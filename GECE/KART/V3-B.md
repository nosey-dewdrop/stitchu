# KART V3-B — ÖLÇÜM ALETİ: kalıp tarafının altı ölçüsü

ETİKET: PARALEL (V3-C ile birlikte; dosya kümesi kesişmiyor)
SÜRE TAVANI: 60 dk

## NE
Kalıp panellerinden (2B, açılmış) altı ölçüyü basan bir alet yaz. Flat tarafını
`shell-flat` zaten basıyor; bu kart kalıp tarafını basar ki iki hat
KARŞILAŞTIRILABİLSİN.

## GİRDİ DOSYALARI
- `engine/tools/surface-pattern.cpp` (çıktı biçimini oradan oku)
- `./engine/build/surface-pattern EU38` çıktısı (GarmentCode biçimi JSON,
  8 panel, kenarlar `cubic` parametreleriyle)
- `engine/src/shellprojection.hpp` (SADECE ölçü adlarını ve birimini görmek
  için; koduna dokunma)
- `engine/tools/` içinde ZATEN kenar uzunluğu / panel ölçen alet var mı:
  **önce grep** (§7.5) — `engine-check/harness/h3b-rings.py` bel halkasını
  ölçüyor, emsal olarak oku, tekerleği yeniden icat etme.

## ÇIKTI
`engine/tools/pattern-measure.mjs` — TEK yeni dosya.

Çağrı: `node engine/tools/pattern-measure.mjs <pattern.json>`
stdout: JSON, ŞU SÖZLEŞMEYE BİREBİR uyacak (V3-C bunu tüketiyor):
```
{"source":"<yol>","size":"EU38","measures":[
  {"name":"hem_circumference",  "mm":<sayı|null>,"how":"<tek cümle>","reason":"<null ise>"},
  {"name":"bust_circumference", "mm":...},
  {"name":"waist_circumference","mm":...},
  {"name":"body_length",        "mm":...},
  {"name":"neck_opening_width", "mm":...},
  {"name":"shoulder_width",     "mm":...}]}
```
Altı ad AYNEN bu sırayla ve bu yazımla. Birim **mm** (kaynak cm ise çevir ve
`how` alanında söyle).

## KURALLAR — bu kartın belkemiği
1. **Çevre ölçüleri panel kenarlarının GERÇEK YAY UZUNLUKLARININ TOPLAMIDIR.**
   Kübik kenarlar yeterince ince örneklenir (adım ≤0.25mm) ya da analitik
   yay uzunluğu kullanılır; hangi yöntem seçildiyse `how` alanında yazılır.
2. **ÖLÇEMEDİĞİNE `null` + `reason` YAZ.** Uydurma, tahmin etme, başka
   ölçüden türetme YASAK. `null` dürüst bir cevaptır ve kapı onu kaldırır.
3. **Sabit çarpan / düzeltme katsayısı / kalibrasyon sayısı YASAK.** Bu kartın
   tek kırmızı çizgisi budur. `shell-flat`'in sayısına bakıp ona yaklaştırmak
   fazı düşürür. Ne çıkarsa o yazılır.
4. Alet DETERMİNİSTİK olacak: aynı girdi → bayt bayt aynı stdout. İki koşuyu
   `diff` ile kanıtla.
5. Alet exit 0 döner (hüküm basmaz — hüküm V3-C'nin kapısının işi).

## RAPOR → `GECE/V3-B.md`
- Altı sayı, birebir stdout satırıyla.
- Her `null` için sebep.
- Determinizm kanıtı (iki koşu + `diff` çıktısı).
- `shell-flat EU38` sayılarıyla YAN YANA tablo + fark (mm ve %). Bu tabloda
  hüküm VERME, sadece bas.
- Commit at (lowercase ingilizce). Push ETME.

## YASAKLAR
- `engine/src/` altına, `engine/CMakeLists.txt`'e, `engine/tests/` altına
  DOKUNMA (V3-C oralarda çalışıyor).
- `render-garment-flat.mjs`, `engine/flat-engine/`, `web/`, `patterns_real/` — DOKUNMA.
- Mevcut testleri değiştirme.
- "Baktım / doğru görünüyor" yasak.
