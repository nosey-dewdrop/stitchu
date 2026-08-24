# G5 — omuz/kol oyuğu/yaka yüzeye iner (sonraki oturumun icra planı)

> Durum: TASARIM HAZIR, KOD YOK. Bu oturum (12 Ağu gece) strapless kılıfı
> 8 bedende iki hakemden yeşil geçirdi; elbiseyi "satılır" yapan son eksik bu.
>
> ★ **24 Ağu (V3) — G5'in açıklığı artık bir KAPI tarafından her koşuda sayılıyor.**
> `node engine/tests/flat_pattern_agree_check.mjs` altı ölçüyü kıyaslıyor; kalıp tarafı
> STRAPLESS olduğu için `bust_circumference`, `neck_opening_width`, `shoulder_width`
> ölçülecek kenar bulamıyor ve sebebiyle `null` dönüyor (`engine/tools/pattern-measure.mjs`).
> Kapı bu sayıyı 3'te ratchet'liyor: G5 kod olarak indikçe yalnız düşebilir. Aynı boşluk
> `body_length` farkının ayrıştırılamayan kısmının da kaynağı (kabuğun yayı OMUZ halkasından,
> kalıbınki strapless üst serbest kenardan başlıyor — `GECE/V3-D.md` §3, ayrıştırılmadı).
> Bu oturumda 2. maddedeki "GarmentSurf'e 4. halka" işi YAPILMADI; `GarmentSurf` yalnızca
> `engine/src/surfacepattern.hpp`'ye yayınlandı, halka sayısı değişmedi.

## Mekanizma (mevcut motora eklemeler, ölçüldü/denendi değil — plan)
1. **Pürtüklü üst sınır (ragged grid):** `buildGrid`'e kolon başına tepe
   yüksekliği `hTop[j]`; satır i yüksekliği kolon başına ölçeklenir
   (bel satırı DEĞİŞMEZ — tek halka kanunu aynen). Mevcut kontur/koşu/pens
   makineleri olduğu gibi çalışır; `farEdges` armhole/omuz/yaka koşularına
   bölünür (waistRuns gibi `farRuns` + kırılım kolonları).
2. **Omuz halkası:** GarmentSurf'e 4. halka: yükseklik = napeZ − omuz düşüşü;
   genişlik yarı-ekseni `a_sh = boyun_yarı_genişliği + omuz_boyu·cos(13°)`
   (omuz boyu ölçüsü charttan: 12.25cm EU38; 13° FORMULAS.md varsayımı,
   Buğra'yla sınanacak); derinlik b vücut spline'ından.
3. **Dikiş planı:** omuz koşusu ön↔arka stitch (Shoulder türü); armhole +
   yaka SERBEST kenar (stitch yok); prenses/yan/bel aynen.

## SAYI KURALI (07-sleeve çöpünün dersi — tahmin YASAK)
- armscye DEPTH 21.0cm (EU38, knowledge/drafting-math-eu38.md, dikey düşüş).
- armhole ÇEVRE kapısı: 40-44cm bandı (MED sanity çapası, `knowledge/drafting-math-eu38.md`).
- ön/arka: **ÖN oyuk daha EĞRİ, ARKA yay daha UZUN.** 8/8 bedende ölçüldü
  (`knowledge/armscye-on-arka-2026-08-17.md`). ⚠ 17.08'e kadar burada *"ÖN eğri arkadan
  uzun/derin"* yazıyordu — kaynaksız bir çıkarımdı, `knowledge/`'dan silindi.
- Yaka/armhole EĞRİSİNİN ŞEKLİ uydurulmaz: Buğra Locket-38 landmark'larından
  (patterns_real/geometry/geometry-full.json; ön oyuk 726→937, omuz 937→1001,
  arka omuz 0→65, oyuk 65→287) mm-parite ile kalibre edilir — G5'in tanımı bu.

## Kapılar
1. omuz dikişi çifti ≤0.79375mm (yapıdan ~0 beklenir).
2. armhole toplamı 40-44cm bandında. **Ön/arka İŞARET şartı** (düzeltildi 17.08 —
   önceki hali *"ön>arka"* ÇÜRÜK, gerekçe `knowledge/armscye-on-arka-2026-08-17.md`):
   - `ön_oyuk_yay ≤ arka_oyuk_yay` (kesim çizgisinde)
   - `ön_oyuk_yay/kiriş > arka_oyuk_yay/kiriş`
   **BÜYÜKLÜK ŞART DEĞİL, REPORTED.** Fark 8 bedende −13.83 → −1.50mm, yani **9 kat**
   daralıyor: bu bir kanun değil, ölçülen giysinin grade'i. Sayıyı şart yapmak referansı
   kural yapmaktır (Damla 28 Tem: *"Buğra bir REFERANS, kural değil"*).
   ⚠ **Tanık sayısı 1** (`locket_top`); `corset_bustier` strapless, oyuğu yok.
3. Buğra landmark mm paritesi (rapor: parça-parça fark tablosu).
4. Tüm mevcut kapılar (halka, sınır, walk 8 beden) YEŞİL KALIR.
