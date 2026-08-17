# garment-spec v2 — malzeme dili sözleşmesi (TASLAK, kod bağlanmadı)

> Durum: TASLAK. Tek amaç: v2'nin NE olduğu üzerine anlaşmak — kod, şema dosyası
> ve eşleme bundan SONRA gelir (tek ikili kaynak kanunu: önce sözleşme).
> Kaynaklar: 29 Tem teşhisi (dağarcık yemek değil malzeme), DERSLER.md'nin
> kanıtlanmış 9 malzeme kategorisi, `knowledge/dial-seam-table.json` (68 kadranın
> 62'si ölü yön), ve bugünkü tek-yüzey motoru (`engine/src/surfacepattern.*`).

## Neden v2?

v1 (45 alan) iki ayrı şeyi tek enum yığınına karıştırıyor:
- **TOPOLOJİ** — hangi paneller var, dikiş grafiği ne, kesikler nerede.
  Ayrıktır; süreklileştirilemez (DERSLER: flat vs shirt yaka iki topolojik
  sınıftır, kadran ucu değil).
- **NİCELİK** — o topoloji üstünde sürekli kadranlar. Sınırsız editability
  buradan gelir: "little black dress" = bir topoloji + bir kadran vektörü;
  kadran uzayı sürekli olduğu için istek uzayı sınırsızdır. LLM'in rolü
  DEĞİŞMEZ: kapalı şemaya JSON yazar; motor derler.

v1'in ölçülmüş kusuru: 68 sürekli kadranın 6'sı bir dikişi oynatıyor —
parametre uzayının %91'i ölü. Sebep: kadranlar malzemeye değil yemeğe
(hazır tarif alanlarına) bağlı.

## v2 — iki katman

### 1. Topoloji (ayrık, ~6 eksen)

Tek-yüzey motorunun diliyle: giysi = vücut halkalarına oturan yüzey +
yüzeyde KESİM GRAFİĞİ. Topoloji alanları:

| eksen | değerler (ilk küme) | motor karşılığı |
|---|---|---|
| `bands` | hangi halkalar arası yüzey var: bust–waist, waist–hip, hip–hem, bust–shoulder… | GarmentSurf ring listesi + panel farH |
| `cuts` | yüzeydeki dikey kesimler: side, princess, centre-front/back (sayı+konum sınıfı) | cutFracs |
| `closure` | none, centre-back-zip, button-front… | kesim grafiğine bir kenar ekler |
| `suppression` | dart / seam-only / gather / pleat (halka başına) | Slit vs cut vs büzgü oranı |
| `edge-finish sınıfı` | hem, band, facing (topolojik: panel ekler mi?) | ek panel üretimi |
| `attachment` | kol/yaka gibi ek yüzey parçaları var mı (G5+ sonrası) | ayrı yüzey yamaları |

### 2. Nicelik (sürekli kadranlar — 9 malzeme kategorisi, DERSLER'den)

| kategori | kadran örneği | motor karşılığı (bugün var mı?) |
|---|---|---|
| girth | halka çevreleri | beden tablosu / body kontratı ✓ |
| ease | halka başına ek çevre (mm) | Steiner d=ease/2π (`garmentshell`) ✓ — yüzey hattına d(t,φ) olarak bağlanacak (AÇIK) |
| suppression miktarı | pens payı dağılımı | develop-deficit'ten ÖLÇÜLÜYOR ✓ (yerleşim kadran, toplam kanun) |
| fullness/gather | büzgü oranı | walk büzgü tanıma ✓ / yüzeyde eklenecek |
| sweep | etek ucu genişlemesi | hemDrop + alt halka yarıçapı (kısmen) |
| spring | kenarın yay açılımı | flatten'da kendiliğinden (sınır eğriliği) ✓ |
| stand & fall | yaka duruşu | G5+ (yüzeye omuz gelince) |
| roll line | devrik hattı | G5+ |
| contouring | çukura girme payı | regle yüzey ↔ vücut yüzeyi arası karışım kadranı (kavramsal olarak hazır: bugünkü "kumaş köprüler" kararının sürekli hali) |

+ kumaş davranışı (gramaj/dökümlülük) ayrı bir malzeme kadranı olarak rezerve
(K3 fizik hakemi bağlanınca anlam kazanır).

## Geriye uyumluluk

- v1'in 45 alanı v2'ye EŞLENİR (her v1 spec'i v2 uzayında bir nokta).
  35 stil kaydı (`styles.json`, DONMUŞ) = 35 kalibrasyon noktası; eşleme
  tablosu üretilirken bu 35 nokta regresyon seti olur: v1→v2→çizim, v1→çizim
  ile bayt bayt aynı olmak zorunda (golden/style_check zaten var).
- Kalem (`_engine-full.mjs`) ve flat dili DEĞİŞMEZ. v2 kalıbın türediği yerin
  dili; flat arayüz kanunu (M0) aynen durur.

## Sıradaki somut adım (bu taslak onaylanırsa)

1. `contract/garment-spec-v2.schema.json` — yukarıdaki iki katmanın makine hali.
2. `engine/tools/gen-v1v2-map.mjs` — 45 alan → v2 eşleme tablosu + 35 stilin
   izdüşümü (rapor olarak; kod yolu değişmeden).
3. Tek-yüzey motoruna `suppression`/`cuts`/`bands`'ı v2'den okutan ince köprü —
   sheath bugün zaten bu üç eksenin özel bir noktası.
