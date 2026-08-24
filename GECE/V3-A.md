# V3-A — kabuk → ortografik projeksiyon (flat artık HESAPLANIYOR)

Commit: `8dc47bd` (push edilmedi, şef edecek)

## NE YAPILDI

1. **Kabuk paylaşıldı, KOPYALANMADI.** `GarmentSurf` bildirimi
   `engine/src/surfacepattern.cpp`'nin isimsiz namespace'inden
   `engine/src/surfacepattern.hpp`'ye taşındı; **bütün tanımlar (fromBody,
   profile, section, at, atBody) surfacepattern.cpp'de kaldı**, satır satır aynı.
   İkinci bir kabuk sınıfı yazılmadı.
2. **Yapılandırma da tek yerde.** Ease/skim/hem-sweep/hip-blend kurulumu
   `buildSheathPattern`'in içindeydi; ikinci tüketici onu tekrarlamak zorunda
   kalırdı ve tekrarlanan yapılandırma = ikinci giysi. Aynı ifadeler aynı sırada
   `buildGarmentSurf(body, opt)`'a çıkarıldı; `buildSheathPattern` artık onu
   çağırıyor, `shell-flat` de.
3. **`GarmentSurf::effectiveSection(h, dOut)`** — eski `at()`'in son iki satırı
   hariç tamamı. `at()` = bu + tek `offsetPoint`. Aritmetik değişmedi (kanıt §2).
   Projeksiyon çevreyi ve siluet genişliğini BURADAN okuyor, skim/A-line/hip-blend
   kurallarını yeniden yazmıyor.
4. **`engine/src/shellprojection.hpp` + `.cpp`** — `projectFront` / `projectBack`.
   Tek iddia, dosya başında beyan: −y yönünde ortografik izdüşümde konveks
   kesitin silueti EKSTREM x'idir; ofset kesitte bu, normalin yatay olduğu
   phi=0 noktasıdır ve orada ofset nokta tam `(a + d, 0)`'dır. Yani **siluet
   yarı-genişliği = a + d**. Uydurulan algoritma yok, katsayı yok.
5. **`engine/tools/shell-flat.cpp`** — `shell-flat EU38` → JSON (6 ölçü + ön/arka
   kontur noktaları + her noktanın halka aralığı + fit edilmiş kübikler),
   `--svg` ile 1:1 SVG (`data-scale="1"`, `data-source="GarmentSurf"`,
   `data-size="EU38"`).
6. CMake: `src/shellprojection.cpp` kütüphaneye, `shell-flat` yeni hedef.
   Derleme `-DCMAKE_BUILD_TYPE=Release`.
7. `render-garment-flat.mjs`, `engine/flat-engine/`, `web/` — DOKUNULMADI.

## ÖLÇÜLEN

### Altı ölçü (mm) — komut ve birebir çıktı

```
$ ./engine/build/shell-flat EU38 > /tmp/v3a-eu38.json
$ sed -n '/"measures"/,/],/p' /tmp/v3a-eu38.json
  "measures": [
    {"name": "hem_circumference", "ring": "hem", "mm": 1295.6000},
    {"name": "bust_circumference", "ring": "bust", "mm": 754.7482},
    {"name": "waist_circumference", "ring": "waist", "mm": 725.0000},
    {"name": "body_length", "ring": "shoulder->hem", "mm": 743.5050},
    {"name": "neck_opening_width", "ring": "neck", "mm": 349.8211},
    {"name": "shoulder_width", "ring": "shoulder", "mm": 334.5680}
  ],
```

Çevreler halkanın kesit ÇEVRESİ (Gauss-Legendre, order 24) + Steiner'in tam
`2*pi*d`'si. Siluet genişliği × 2 KULLANILMADI. Genişlikler siluetten
(`2*(a+d)`). Her ölçünün yanında geldiği halkanın adı duruyor.

### İki hat aynı kaynaktan besleniyor — sayı

- Kartın zemini: aynı EU38 belde **flat 700.0mm** (croquis, ease sıfır —
  `contract/flat-convention-v1.json:34` "waistCM 70.0 -> 700 mm"), **kalıp
  724.89mm**. Fark 24.89mm.
- Yeni hat: **shell-flat bel 725.0000mm**. Croquis'ye göre **+25.00mm**.
- Kalıp hattının bastığı sayı (`./engine/build/surface-pattern EU38`, stderr):
  `ring 724.9232mm | bodice waist 724.8961mm | skirt waist 724.9232mm |
  diff -0.0272mm | worst fit 0.1261mm`
  → shell-flat 725.0000 ile kalıbın halkası 724.9232 arasında **0.0768mm** var.
  Bu bir modelleme farkı DEĞİL, kareleme farkı: kalıp halkası 128 örnekli
  POLİGON, shell-flat kesit integralinin kendisi. 725mm'lik bir çevrede
  128-gen'in beklenen eksiği ≈ `725*pi^2/(6*128^2)` = **0.073mm**; ölçülen
  0.077mm. **Düzeltme katsayısı EKLENMEDİ** — iki sayı da olduğu gibi duruyor.
- `hem_circumference` 1295.6000mm = EU38 kalça çevresi 940.0 + kaynaklı
  `hemSweepOverHipMM` 355.6. Yani A-line etek ucu kabuktan aynen çıkıyor.

### Kontur, halka aralığı başına (aynı JSON)

```
$ python3 -c "import json;d=json.load(open('/tmp/v3a-eu38.json'));v=d['views'][0];
  print(v['view'],'pts',len(v['outline']),'segs',len(v['segs']));
  [print('   ',s['name'],s['segCount'],round(s['polyLenMM'],4),round(s['fitLenMM'],4)) for s in v['spans']]"
front pts 192 segs 4
    shoulder->bust 1 198.0449 198.0449
    bust->waist 1 142.6793 142.6793
    waist->hip 1 211.291 211.291
    hip->hem 1 206.1376 206.1376
```

Dört halka aralığının dördü de TEK kübiğe oturuyor ve fit edilmiş uzunluk
örneklenen poligonla 0.0001mm içinde aynı. Sebebi ölçülebilir: skim gövde bir
KONİ, A-line etek de belden düz açılıyor — siluetin bu dört parçası zaten doğru.
`curvefit.hpp`'nin mevcut Schneider fiti kullanıldı (tolerans 0.15mm, kalıp
spec'inin kullandığı aynı tolerans); yeni eğri yumuşatma yazılmadı.

⚠ Kontur ŞU AN OMUZ HALKASINDAN başlıyor, boyun halkasından değil: omzun
üstünde giysi yok, kumaşın gerçekten nerede bittiği üst sınır (TopProfile) —
bir kesit değil, bir KESİM. Boyun halkası yine de ölçü olarak raporlanıyor.

### Ön ve arka silueti AYNI (ve bu bir kusur değil, izdüşümün tanımı)

Tek konveks kabuğun ortografik izdüşümü önden ve arkadan aynı siluettir; ön/arka
teknik çizimin farkı İÇERİDEDİR (yaka derinliği, dikişler, kapama) ve bu kartın
işi değil. `projectBack` aynı eğriyi x'te aynalıyor, uydurulmuş bir fark yok.
JSON'daki iki `views` girdisi bunu açıkça gösteriyor (aynı span uzunlukları).

### Görsel kanıt (RULES 3)

```
$ ./engine/build/shell-flat EU38 --svg > /tmp/v3a-eu38.svg
$ node ... @resvg/resvg-js ... 1600px genişlik
PNG /Users/damummyphus/damla_projects_2026/stitchu/Logs/v3a-2026-08-24/v3a-eu38.png 37883 bytes
    sha256=f0635b7588a7894f17f0ce19c9912f12fa967e3cde4dc861da4c55bc6e6e0287
```

Yanında SVG ve JSON: `Logs/v3a-2026-08-24/v3a-eu38.svg`,
`Logs/v3a-2026-08-24/v3a-eu38.json`. (`Logs/` gitignore'da, dosyalar diskte.)

### Kalıp hattı BAYT BAYT DEĞİŞMEDİ

Refactor'ın davranışı taşımadığının kanıtı, iddia değil ölçüm — aynı ağaçta
değişiklikler stash'lenip binary yeniden derlendi:

```
$ ./build/surface-pattern EU38 > /tmp/spec-after.json
$ git stash push src/surfacepattern.cpp src/surfacepattern.hpp
$ cmake --build build -j8 --target surface-pattern && ./build/surface-pattern EU38 > /tmp/spec-before.json
$ shasum -a 256 /tmp/spec-before.json /tmp/spec-after.json
44e5c38a1b9fb1ffc21aae671f42c356b9538e9dbd02e5bae155e4e98792dc43  /tmp/spec-before.json
44e5c38a1b9fb1ffc21aae671f42c356b9538e9dbd02e5bae155e4e98792dc43  /tmp/spec-after.json
```

### ctest — kırmızı KÜME büyümedi

```
$ ctest --test-dir build -j4
96% tests passed, 4 tests failed out of 108
The following tests FAILED:
	  8 - style_check (Failed)
	 15 - sizechart_source_check (Failed)
	 86 - contract_check (Failed)
	 91 - figure_check (Failed)
Total Test time (real) =  99.13 sec
```

`GECE/log/V3.ctest.before.txt` (bu koşudan ÖNCE alınmış) aynı dört adı
listeliyor: 8, 15, 86, 91 — `4 tests failed out of 108`. **Yeni kırmızı ad yok.**
(`style_check` C++ dosyalarına bakmıyor; STYLE-PIN onayı istiyor, çıktısıyla
doğrulandı.)

## YAPILAMAYAN

- **Kolları, yakayı, kol oyuğunu HİÇBİRİ bu konturda yok.** Bu kart kabuğun dış
  siluetini istedi ve o çıktı; PNG'de görünen şey bir elbise çizimi değil, bir
  KABUK silueti. Flat'in satılabilir olması için üst sınırın (yaka/omuz/oyuk)
  aynı kabuktan projeksiyonu gerekiyor — ayrı kart.
- Sekiz bedenin hepsi koşulmadı; kart EU38 istedi, EU38 ölçüldü.
- `render-garment-flat.mjs` hâlâ eski croquis hattı; kart "eski hat silinmez"
  dediği için dokunulmadı. İki hat şu an YAN YANA duruyor ve 25.00mm ayrılar.

## KART DIŞI FARK EDİLEN (dokunulmadı)

1. **`GarmentSurf::at()`'in skim dalı omuz halkasının ÜSTÜNDE ekstrapole
   ediyor.** `skimTopH` = omuz halkası yüksekliği, ama `u = (h-waistH)/(topH-waistH)`
   h > topH için 1'i aşıyor ve koni yukarı doğru uzatılıyor. Boyun halkası
   ölçüsü (`neck_opening_width` 349.8211mm) bu ekstrapolasyondan geliyor —
   vücudun boyun kesitinden DEĞİL. 349.82mm'lik bir "yaka açıklığı" bir
   giysinin yaka açıklığı değildir; bu sayı kabuğun o yükseklikteki genişliğidir,
   ve raporda öyle etiketlendi. Bir sonraki kartın gerçek yakası TopProfile'dan
   gelmeli.
2. **`shoulder_width` 334.5680mm = chart'ın omuz ölçüsü.** CLAUDE.md'nin kendi
   notu (sizechart.hpp TUR 18B) bu sütunun kaynaksız olduğunu ve "shoulder"ın
   her drafting standardında 11-14cm'lik TEK DİKİŞ olduğunu söylüyor. Yani
   flat'in omuz genişliği, kaynağı olmayan bir sütuna bağlı. Dokunulmadı.
3. `Section::convex()` kapısı `shellprojection.cpp`'de Steiner'den ÖNCE koşuyor
   (konveks olmayan kesitte çevre kimliği geçersiz) ve EU38'de hiç ateşlemedi.
   Diğer 7 bedende sınanmadı.
4. Yeni `shell-flat` bir KAPI değil, ctest'te yok. Kapı olması ayrı karar:
   hangi sayının hangi bandı tutması gerektiğini bu kart söylemiyor.
