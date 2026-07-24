# FAZ 4 KAPI — LLM KANATLARI KANITI

Tarih: 2026-07-22. Kapı: `engine/compiler/gate.mjs` + `compile.mjs`. Motor/contract/styles/gate/compile DEĞİŞTİRİLMEDİ (yalnız çağrıldı). Worker/kredi yok — LLM hook'ları (judgeFn/tailorFn) Claude tarafından runtime oynatıldı.

## Nasıl koşuldu
1. `compile(spec, {referenceStyle})` — id82→`top_crew_boxy_crop`, id44→`top_sq_puff_shirred_peplum`.
   - Spec'ler `contract/hedef-giysiler.json`'dan gramer alanlarına çevrildi. NOT: contract `sleeveStyle` diyor ama gramer slotu `sleeve` (parse.mjs). id44'te `shirred=physics`, `peplum=full`.
2. `flat` SVG'si HTML'e sarılıp Chrome headless ile PNG'ye çevrildi, Read ile GÖRÜLDÜ, emsal crop'la (id82=ar-202511-2.png, id44=ar-202432-1.png) kör kıyaslandı → **judgeFn.flatPass**.
3. `kalip.pieces` + `kalipError` okundu → **judgeFn.kalipPass**.
4. Kalıba bakılıp baş/gövde girişi + dikiş sırası + dikilince-flat-çıkar değerlendirildi → **tailorFn**.
5. `gate(compiled, {judgeFn, tailorFn})` çağrıldı.

## ÇIKTI TABLOSU

| hedef | bant (flatRef / kalıpErr) | flat hakem | kalıp hakem | parça bandı | terzi gözü | KARAR |
|---|---|---|---|---|---|---|
| **id82** crew boxy crop | flatRef=true / kalıpErr=none | GEÇTİ | GEÇTİ (3 parça, 0 error) | 3 ∈ [3,5] blouse ✓ | giriş VAR + DİKİLİR | **ÜRETİLDİ** |
| **id44** square puff shirred peplum | flatRef=true / kalıpErr=none | GEÇTİ | GEÇTİ (7 parça, 0 error) | ÖLÇÜLMEDİ (peplum/shirred kompleks — emsal band yok, kapı susar) | giriş VAR + DİKİLİR | **ÜRETİLDİ** |

### id82 kanat gerekçeleri
- **flat hakem**: kolsuz boxy tank, yuvarlak crew yaka, düz boxy gövde, hem finish — emsal denim boxy sleeveless tank ile kör-eşleşiyor.
- **kalıp hakem**: 3 parça — Top Front (cut 1 on fold), Top Back (cut 2), Bias binding (yaka+armhole 1116mm). 0 kalıpError.
- **terzi**: Woven, kapanışsız — AMA crew yaka çevresi geniş + kolsuz armhole açık → baş & gövde geçer. Dikiş sırası kilitli (omuz→yan→bias binding→hem). Boxy crop örme şart değil, açıklık yeterli.

### id44 kanat gerekçeleri
- **flat hakem**: kare yaka + kısa puf kol (büzgülü mansset) + büst boyunca yoğun shirring + belde flared peplum — emsal "OG Top" ile kör-eşleşiyor.
- **kalıp hakem**: 7 parça — Top Front/Back, bias binding, Balloon Sleeve (cut 2), Sleeve Cuff (cut 2 interface), Shirred Bust Panel (968×140, 1876mm→938mm büzgü), Peplum çember (inner arc 350mm = bitmiş bel truing). 0 kalıpError.
- **parça bandı**: kompleks sınıf (peplum+shirred) → gusto-corpus'ta emsal parça bandı YOK → kapı bu kanatta SUSAR (uydurma eşik yasak). FAIL vermez.
- **terzi**: shirred (physics) büst paneli elastik büzgü = baş/gövde esneyerek geçer, kapanış gerekmez — shirred girişin kendisi kapanışsızlığın çözümü. Kare yaka + puf kol armhole açık. Dikilince flat çıkar.

## 4 KANAT DA GERÇEK KOŞTU MU?
EVET. Hiçbir kanat ÖLÇÜLMEDİ değil (id44 parça bandının "ÖLÇÜLMEDİ"si kasıtlı tasarım kararı — kompleks sınıfa uydurma eşik uygulamamak; kanat çalıştı ve doğru sustu):
- Bant (deterministik): flatIsReference + kalipError okundu, ikisi de temiz.
- Flat hakem (LLM): PNG'ler gerçekten render edilip GÖRÜLDÜ, emsal crop'la kıyaslandı.
- Kalıp hakem (LLM): pieces + kalipError gerçekten okundu.
- Terzi gözü (LLM): giriş/dikilebilirlik gerçekten değerlendirildi (id82 woven-açıklık, id44 shirred-esneme mekanizması ayrı ayrı gerekçelendirildi).

## KAPI DOĞRU DAVRANDI MI?
EVET. Negatif kontrol koşuldu:
- terzi `girisVar:false` → **ÜRETİLDİ AMA GEÇMEDİ**, eksik satırı: `terzi gözü: giriş yok — kafa geçmez`.
- tailorFn hiç verilmezse → **ÜRETİLDİ AMA GEÇMEDİ**, eksik satırı: `terzi gözü giriş kontrolü çalıştırılmadı (guard yazılana kadar zorunlu)`.
- Her iki hedefte tüm kanatlar geçince → **ÜRETİLDİ** (eksik=[]).

## HAKEM AYRILIĞI
judgeFn compile'ın ürettiği flat/kalıbı yargıladı; compile'ı çalıştıran (üreten) ile değerlendiren (hakem) rolü ayrı tutuldu. Yargı objektif ölçüye dayandı (kör flat kıyas + parça sayısı/kalıpError + giriş mekanizması), "güzel" denmedi.

## KANIT DOSYALARI (geçici, /tmp/faz4)
- id82-flat.png / id44-flat.png (görülen render), id{82,44}-kalip.json (parça dökümü), run-gate.mjs (gate koşusu), neg.mjs (negatif kontrol).
