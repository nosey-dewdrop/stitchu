# Düğüm Primitif Ölçümü — 91 ÜRETİLEMEZ hedefin gerçek borcu

> NEREDEYIZ "sonraki oturumun İLK işi": her ÜRETİLEMEZ hedefin beyondEngine'ini
> açıp gerçek primitif sayısını ölç. Bu rapor o ölçüm. Motor/pin/golden'a
> DOKUNULMADI (salt ölçüm). Kaynak: contract/hedef-giysiler.json beyondEngine
> alanları → kanonik primitife normalize. Script: /tmp/primitif-olc2.mjs.

## YÖNTEM
- 231 ham serbest-metin beyondEngine maddesi → 42 kanonik primitife indirgendi
  (eş-anlam birleştirme: "full circle klos" = "full/circle klos" = flareSkirt_circle).
- `fabricPrint` (gingham/plaid/örme) BLOCKER SAYILMADI — kumaş seçimi kalıbı engellemez.
- Kalan 4 UNMAPPED gerçek özel durum (örme kazak, romper garment yok, dügmeli split, asimetrik kanatlar).

## DÜĞÜM BORÇ DAĞILIMI (91 hedef)
| Borç (blocker primitif) | Düğüm sayısı |
|---|---|
| 1 primitif | 7 |
| 2 primitif | 33 |
| 3 primitif | 41 |
| 4 primitif | 10 |

"Tek varyant → tek hedef" modeli neden bitti: sadece 7 düğüm tek-borçlu, 51 düğüm 3+.

## PRIMITIF FREKANSI (kaç düğümde partner) — yatırım çarpanı
| Primitif | Düğüm | Not |
|---|---|---|
| shirrPanel | 18 | fizik-shirred VAR; kalanı square/başka partnerle kümeli |
| tieBow | 13 | tie primitifi VAR (tieBack); bel/yan/omuz bağı varyantı eksik |
| sleeveVariant | 11 | balloon/bishop/bell-cuff/batwing/dolman — plainSleeve+puff VAR, kalanı eksik |
| asymHem | 10 | high-low / handkerchief / crossover |
| wrapDrape | 10 | surplice çapraz gövde (spec.wrap taslak w1 VAR, üretime bağlanmadı) |
| corsetPanel | 10 | overbust bustier / boning kanalları |
| flareSkirt_circle | 9 | **renderer'da flat dili KISMEN VAR** (flare=2.2), gramer PARK, draft eksik |
| surfaceDecor | 9 | çoğu listing notu (topstitch/boncuk) — düşük öncelik |
| tieStrap | 9 | omuzda bağlanan/spaghetti askı |
| ruffle 8, babydollSkirt 8, draped 7, yoke 7, laceUp 6, halter 6, collar 6, pocket 6 | | |

## TEK-BORÇLU DÜĞÜMLER (7 — en temiz giriş)
| id | tek borç | durum |
|---|---|---|
| **47** | flareSkirt_circle | square✓ princess✓ cap-sleeve=straight✓ → **tek engel circle etek** |
| 12 | sleeveVariant (bishop cuff) | sadece kol detayı flat |
| 14 | sleeveVariant (bishop cuff) | sadece kol detayı flat |
| 24 | tieBow (bel fiyonk kuşak) | V-neck+gathered skirt çizilir |
| 95 | laceUp (yan çapraz bağlama) | crew crop çizilir |
| 98 | yoke (bel bandı add-on, giysi değil) | özel: parça, giysi değil |
| 81 | doubleBreasted | çift sıra düğme |

## SEÇİM — ilk düğüm: full-circle etek (flareSkirt_circle)
GEREKÇE:
1. **Çarpan 9** — kurulunca id47 açılır + id2/21/27/54/79 bir adım yaklaşır.
2. **En temiz tek-borç**: id47 diğer primitifleri (square/princess/plainSleeve) BİTMİŞ.
3. **Motorda flat dili kısmen hazır**: render-garment-flat.mjs:145 `flare=2.2` circle biliyor,
   :570 `full` sweep var; gramer'de `full-circle` PARK'ta (henüz kanıtsız). Draft ayağı eksik.
4. Risk düşük: gore etek zaten panel-flare çiziyor, circle = tek-panel radyal flare (kardeş sınıf).

SIRADAKI PRIMITIFLER (çarpan sırası, ayrı tur): tieBow varyantı (13) → sleeveVariant (11) → asymHem (10).

## KURAL HATIRLATMA
İkame YASAK → primitif yoksa ÜRETİLEMEZ. Her primitif: merkezî kaleme tek fonksiyon,
determinizm md5, tam denetim, gramer aynı turda, 3 deneme kuralı, golden byte-identical
ya da beyanlı re-pin. flareSkirt_circle draft'ı motor C++ ise GOLDEN YASASI devreye girer.
