# stitchu — a-line dress, short straight sleeve — EU38

kumaş: pamuklu lawn — %100 pamuk (87 gsm) · dikiş payı 15 mm (kesim çizgisine dahil) · 6 parça · 2 m @ 140 cm

## pakette ne var

| dosya | ne |
|---|---|
| `rehber.html` | dikiş rehberi — her cümle ya bu çizimin ölçtüğü bir sayıdan ya kayıtlı bir kaynaktan; altında hangisi olduğu yazılı |
| `rehber-onizleme.png` | aynı rehberin okunabilir görüntüsü |
| `kalip-A4.pdf` | 1:1 kalıp, A4 sayfalarda, 100 mm kalibrasyon karesiyle |
| `kalip-A0.pdf` | aynı kalıp, tek A0 sayfada (matbaa) |
| `kalip-A4-EU34.pdf` | beden serisi: EU34 (göğüs 80 / bel 62 / kalça 86 cm) |
| `kalip-A4-EU36.pdf` | beden serisi: EU36 (göğüs 84 / bel 66 / kalça 90 cm) |
| `kalip-A4-EU38.pdf` | beden serisi: EU38 (göğüs 88 / bel 70 / kalça 94 cm) ← seçilen beden |
| `kalip-A4-EU40.pdf` | beden serisi: EU40 (göğüs 92 / bel 74 / kalça 98 cm) |
| `kalip-A4-EU42.pdf` | beden serisi: EU42 (göğüs 96 / bel 78 / kalça 102 cm) |
| `kalip-A4-EU44.pdf` | beden serisi: EU44 (göğüs 100 / bel 82 / kalça 106 cm) |
| `flat.svg` / `flat-onizleme.png` | teknik çizim (ön + arka), kalıbın izdüşümü |
| `kesim-plani.md` | parça parça kesim talimatı, motorun kendi sözleriyle |
| `beden-serisi.json` | beden serisinin ölçüleri, makine okunur |
| `rehber-viscose-crepe.html` | aynı kalıbın krep — %100 viskon (140 gsm) için rehberi — iğne/dikiş/tela/zor noktalar o kumaşa göre değişir |
| `rehber-cotton-modal-jersey.html` | aynı kalıbın jarse — pamuk/modal/%5 elastan örme (200 gsm) için rehberi — iğne/dikiş/tela/zor noktalar o kumaşa göre değişir |
| `rehber-viscose-challis.html` | aynı kalıbın viskon — %100 viskon challis (110 gsm) için rehberi — iğne/dikiş/tela/zor noktalar o kumaşa göre değişir |
| `rehber-cotton-lawn.html` | aynı kalıbın pamuklu lawn — %100 pamuk (87 gsm) için rehberi — iğne/dikiş/tela/zor noktalar o kumaşa göre değişir |
| `rehber-cotton-velveteen.html` | aynı kalıbın kadife — %100 pamuk velveteen (230 gsm) için rehberi — iğne/dikiş/tela/zor noktalar o kumaşa göre değişir |

## beden serisi

seçilen beden **EU38**, yanında ±3 komşu (alt uç 1 beden kırpıldı (çizelge EU34'te başlıyor)). Hepsi aynı çizimden, motorun kendi `gradeJSON`'undan.

| beden | göğüs | bel | kalça | parça | kumaş |
|---|---|---|---|---|---|
| EU34 | 80 | 62 | 86 | 6 | 2 m |
| EU36 | 84 | 66 | 90 | 6 | 2 m |
| EU38 ★ | 88 | 70 | 94 | 6 | 2 m |
| EU40 | 92 | 74 | 98 | 6 | 2 m |
| EU42 | 96 | 78 | 102 | 6 | 2 m |
| EU44 | 100 | 82 | 106 | 6 | 2 m |

## nasıl üretildi

`node engine/tests/rehber_kaynak_check.mjs` (PAKET_DIR=KOSU/ciktilar/paket-02). Sıfır API çağrısı:
kalıp sevk edilen wasm motorundan, rehber cümleleri motorun kendi `rehber` alanından,
sayıların kaynağı `contract/guide-sources.json`. Kapı bu paketi ÜRETİR ve yargılar —
yani buradaki her dosya, yeşil bir kapının kendi çıktısıdır.