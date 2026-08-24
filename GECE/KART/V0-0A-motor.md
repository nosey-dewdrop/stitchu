# KART V0-0A — motor envanteri

ETİKET: PARALEL · SÜRE TAVANI: 60 dk

## NE
Motorun bugünkü hâlini ÖLÇ. Hiçbir şeyi onarma, hiçbir testi değiştirme,
hiçbir pin yenileme. Dört madde:

1) ctest TAM koşusu. Kaç test koştu, kaç kırmızı, İSİM İSİM. Log dosyaya.
   Build gerekirse `-DCMAKE_BUILD_TYPE=Release` ZORUNLU (Debug rebuild
   engine_check'i 19s→2684s yapıyor).
2) Her kırmızı için HAM VERİ topla: (a) o testin çıktı bloğu, (b) testin
   karşılaştırdığı pin/altın dosyanın yolu ve o dosyayı en son değiştiren
   commit (`git log -1 --format=%h\ %ad\ %s -- <yol>`). SINIFLAMA YAPMA
   (gerileme / bayat pin / kaynak eksiği) — sınıfı hakem koyar, sen ham
   veriyi diz.
3) Operatör sicili: `contract/garment-spec-v2.json` içindeki operatörleri
   say, her birinin statüsünü (shipped/flagged/absent) dosyadan oku. Sonra
   `ANAYASA.md` içindeki damar/giysi detaylarını çıkar ve hangilerinin
   sicilde İSİM olarak bile bulunmadığını listele.
4) DAMAR yüzdeleri: `GECE/arsiv/v5-kosusu/F0-A.md` §3.1'de yazılı YÖNTEMİ
   oku (yalnız yöntem — o dosyanın SAYILARINI kopyalama, hepsi geçersiz) ve
   aynı yöntemle bugün yeniden ölç. Yöntemi çıktına aynen yaz ki V11 tekrar
   koşabilsin. Yöntem okunamıyorsa "yöntem bulunamadı" yaz ve kendi
   yöntemini ADIM ADIM tarif ederek ölç.

## GİRDİ DOSYALARI
- ENV.md · RULES.md
- engine/ (CMakeLists.txt, build/, tests/)
- contract/garment-spec-v2.json
- ANAYASA.md
- GECE/arsiv/v5-kosusu/F0-A.md  (SADECE §3.1 yöntemi için; sayıları geçersiz)

## ÇIKTI
- `GECE/log/V0-0A.ctest.txt` — ctest tam çıktısı
- `GECE/log/V0-0A.red-names.txt` — kırmızı test adları, satır satır
- `GECE/V0-0A.md` — dört maddenin tablosu; her sayının yanında onu basan komut
  Kanıt olduğu kapı: V0 kapısı (her maddede dosya yolu/komut çıktısı var mı) +
  V1'in girdisi (kırmızı sınıflaması) + V2'nin girdisi (sicil).

## YASAKLAR
- ONARIM YOK: kod, test, pin, tolerans, contract dosyası DEĞİŞMEZ.
- "muhtemelen / görünüşe göre / baktım" yasak (RULES 3).
- v6 §1'deki sayıları (7 kırmızı, 404.26mm vb.) doğru varsayma — hepsi hipotez.
- Kart dışı dosyaya yazma.

## RAPOR FORMATI (zorunlu)
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
