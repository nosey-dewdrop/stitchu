# DEVAM — stitchu sunum/çıktı loop (diğer session buradan devam)

Bu dosya sonraki session'ın loop'u. Önce CLAUDE.md 2026-07-16 status'ünü + 
reports/2026-07-16-stitchu-etsy-referans-analizi.md'yi oku.

## AMAÇ (Damla'nın ağzı, 2026-07-16 — EN ÖNEMLİ ÇERÇEVE)
Amaç Etsy creator olmak DEĞİL, onlara SaaS satmak da DEĞİL. Amaç: **bu tasarım-
pattern endüstrisinin EN İYİSİ olmak.** Motor o kadar iyi olacak ki isteyen markasını
büyütür, isteyen Instagram'da butik açar, isteyen evinde diker, isteyen Etsy'de satar.
stitchu = ALTYAPI; Etsy/SaaS/butik sadece kullanım senaryoları. BugraPatterns/StitchLift
= referans (nasıl iyi olunur), hedef DEĞİL. Bu yüzden çıktı kalitesi (pattern gerçekten
birleşip dikiliyor mu) her şeyden önce gelir — hangi kanalda kullanılırsa kullanılsın.

## TEŞHİS (bu oturumda kesinleşti)
Damla Jackie elbisenin A4'ünü çıkarttırdı, gördük: **pattern puzzle gibi
birleşmiyor.** Sayfa sayısı (25) sorun DEĞİL. Kök neden print.js'te 3 katman:

1. **Register zayıf** (KOLAY, yüksek etki, düşük risk) — `sheetSVG` (print.js
   ~199) sadece 6mm kenar-ortası tik + silik gri sayfa kodu çiziyor. Bugra A0'da
   olan YOK: büyük grid kodu, köşe register kareleri, "→ B2'ye devam" geçiş okları,
   görünür A4 çerçevesi.
2. **Paketleme zayıf** (ZOR, golden riski) — `shelfPack` (print.js ~111) rotasyon
   yok, "en uzun önce soldan sağa raf". Uzun-ince etek parçaları arası dev boşluk.
3. **A4 çerçevesi görünmüyor** — parça boşlukta yüzüyor gibi.

FOTO→PATTERN zinciri CANLI+çalışır (worker probe HTTP 200, create.js:260 foto UI
bağlı, PUBLIC_ANALYZE=on). Damla henüz canlıda denemedi — vision accuracy ayrı iş.

## LOOP (sırayla, her blok tek commit+push+deploy, deploy limiti)

### Blok 1 — REGISTER (ilk, en yüksek değer, puzzle birleşir)
print.js `sheetSVG`'e ekle (canlı ürün, /tmp script değil):
- Görünür A4 çerçevesi (ince kesik çizgi, sayfa sınırı belli).
- BÜYÜK grid kodu köşede (A1/A2/B1 = satır harfi + sütun no), okunur boyut.
- Köşe register kareleri (Bugra'daki siyah kareler — 4 köşe, bantlama hizası).
- Kenar hizalama tik'leri GÜÇLENDİR (şu an 6mm silik → daha belirgin + her
  paylaşılan kenarda, sadece orta değil).
- "→ devam" geçiş oku: parça komşu sayfaya taşıyorsa kenarda hangi koda gittiğini yaz.
- ?v bump + gh-pages subtree deploy. Sonra Jackie A4 tekrar çıkar, BİRLEŞİYOR mu doğrula.
- devlog.md + linkedin.md malzeme (Bugra'yı didikleyip register'ı motora kattık).

### Blok 2 — PATTERN CUTTING TABLOSU (veri HAZIR, hızlı kazanç)
Motor zaten name+cutInstruction veriyor (Jackie testinde çıktı). Bugra'nın
"Pattern Cutting" tablosu (Piece | Main Fabric | Lining, numaralı diyagram) =
bu verinin dizilmişi. print.js cover'a numaralı parça tablosu ekle.

### Blok 3 — PAKETLEME (dikkatli, golden riski)
shelfPack'e rotasyon/daha sıkı yerleşim. ÖNCE golden + ctest + web-fuzz doğrula,
kırılırsa GERİ AL. Boş sayfa azalt ama register'ı bozma.

### Sonra (büyük, ayrı oturum): illustre talimat üretici + flat sketch + AI giyilmiş görsel.

## KURAL (bu oturumdan ders)
- Damla KEŞİF modunda: AskUserQuestion DAYATMA, düz konuş. Karar vermeden inşaya girme.
- "Kanıtla iddia etme": her blok bitince canlıda göster (Jackie A4 birleşiyor mu).
- Deploy = ?v bump + git add web/ ALL + `git push origin \`git subtree split --prefix web main\`:gh-pages`.
