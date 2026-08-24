# KART V0-0E — wasm paritesi ve performans TABANI (v6 §4.1 emri)

ETİKET: PARALEL · SÜRE TAVANI: 60 dk

## NE
v6 §4.1: "sevk edilen motor wasm'dır, native yeşil tarayıcıda hiçbir şey
kanıtlamaz". Sonraki her fazın kapısı bu kartın bastığı TABAN sayılara
bakacak. Üç ölçüm:

1) WASM PARİTESİ: aynı spec + aynı beden ile üretim, hem native hem node
   üzerinden wasm modülüyle koşulur. Çıktılar aynı mı? Fark varsa büyüklüğü
   ve nerede olduğu. Paket tazeliği de ölçülür: sevk edilen wasm'ı üreten
   kaynak commit'i ile HEAD arasındaki fark (bundle_fresh sınıfı iddia
   DOĞRULANIR, kabul edilmez).
2) TEK ÜRETİM SÜRESİ: tek kalıp üretimi kaç ms (node zamanlaması, N tekrarın
   medyanı + min/max). Ölçüm komutunu çıktına yaz.
3) HEAP: N tekrarlı üretimde wasm heap büyümesi (kaba sızıntı kontrolü) —
   başlangıç, N sonrası, delta.
4) ANA İPLİK: motor bugün main thread'de mi worker'da mı çağrılıyor? Cevabı
   web/js altındaki çağrı satırıyla göster (dosya:satır).

## GİRDİ DOSYALARI
- ENV.md · RULES.md
- engine/build-wasm.sh · engine/dist/ (varsa) · web/js/
- engine/tools/ (önce grep — §7.5: yüzü aşkın alet var, yenisini yazmadan ara)

## ÇIKTI
- `GECE/log/V0-0E.wasm.txt` — parite + süre + heap ham çıktıları
- `GECE/V0-0E.md` — dört maddenin sayıları, her birinin yanında komut;
  wasm koşulamadıysa SEBEP (emsdk yok vb.) ve o maddenin "ÖLÇÜLMEDİ" damgası
  Kanıt olduğu kapı: 4.1 makine kapısının TABANI (sonraki fazlar bu bandı
  sessizce aşamaz) + ana-iplik kararı (Web Worker kart mı kapı mı).

## YASAKLAR
- Playwright sınıfı yeni test altyapısı KURMA (§4.1 açık yasak) — ölçüm node
  zamanlaması + basit smoke ile yapılır.
- Sabit eşik uydurma (50ms vb.). Sen TABAN basarsın, eşik koymazsın.
- Motoru optimize etme, worker refaktörü yapma. V0 onarmaz.
- Yeni bağımlılık kurma. emsdk yoksa "ölçülemedi" yaz, kurma.
- En fazla 1 yeni ölçüm aleti; önce engine/tools altında grep'le ara.

## RAPOR FORMATI (zorunlu)
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
