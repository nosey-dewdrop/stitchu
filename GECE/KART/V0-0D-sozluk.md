# KART V0-0D — sözlük dili envanteri

ETİKET: PARALEL · SÜRE TAVANI: 60 dk

## NE
Repodaki her giysi-tanımlayan dosya iki dilden hangisiyle konuşuyor:
MALZEME dili (sürekli parametre: mm, oran, açı, eğrilik — ara değerler
geçerli) mi, MENÜ dili (kapalı enum / sabit isim listesi) mi?

1) Dosya dosya tablo: yol · dil (malzeme / menü / karışık) · KANIT (enum
   tanımının satırı ya da sürekli parametrenin satırı) · o dosya sevk edilen
   hatta mı (web/wasm'a giden) yoksa ölü/araştırma mı.
2) SEVK EDİLEN TARAF HANGİSİ: kullanıcının tarayıcıda gerçekten tetiklediği
   yolda hangi dil hâkim? Çağrı zincirini dosya:satır ile göster.
3) Kapalı enum SAYIMI: her kapalı enum için (a) tanım yolu, (b) repodaki
   REFERANS sayısı (grep, komutu yaz). Bu sayı V2'nin vocab_reference_check
   tabanı olacak — tam ve tekrarlanabilir olsun, komutu çıktına yaz.
4) Ara değer testi (ölçüm, onarım değil): menü dilindeki bir eksende iki
   komşu isim arasında ara değer verilebiliyor mu? Denenen girdi + motorun
   cevabı (hata mı, sessiz ikame mi, çalışıyor mu) yaz.

## GİRDİ DOSYALARI
- ENV.md · RULES.md
- contract/ · engine/src/ · engine/pattern-bridge/ · web/js/ · recipes/
- knowledge/dial-seam-table.json (varsa, salt okunur)

## ÇIKTI
- `GECE/log/V0-0D.enum-refs.txt` — enum referans sayımının ham grep çıktısı
- `GECE/V0-0D.md` — dil tablosu + sevk edilen taraf hükmü + enum referans
  taban sayıları (komutlarıyla) + ara değer testi sonucu
  Kanıt olduğu kapı: V0 kapısı + V2'nin (mutfak reformu) doğrudan girdisi.

## YASAKLAR
- Hiçbir enum'u silme, taşıma, _LEGACY'ye sürme. Söküm V2'nin işi.
- Kod değiştirme. Ara değer testi için geçici dosya kullanacaksan /tmp altında.
- "menü sanırım" gibi kanıtsız hüküm — her satır dosya:satır kanıtı taşır.
- Kart dışı dosyaya yazma.

## RAPOR FORMATI (zorunlu)
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
