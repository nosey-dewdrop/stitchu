# F-L — ölçüm nasıl alındı (kirli ağaçta ÖLÇÜLMEZ)

Ana ağaç bu vardiyada **paylaşımlıydı**: `engine/src/collar.cpp` + `engine/src/bodice.cpp`
üstünde paralel bir ajan çalışıyordu ve değişiklikleri commit'siz duruyordu. O halde
alınan tam ctest **25 kırmızı** gösterdi ve `sewable_census` 82980 draftın
**18810'unda `kink`, 3206'sında `selfintersect`** bastı. **Bunların hiçbiri HEAD'de yok**
(HEAD: kink 0, selfintersect 0) — hepsi commit'lenmemiş paralel işten geliyordu.
Bu yüzden bu kartın önce/sonra sayıları ana ağaçta değil, **HEAD'in iki ayrı
worktree'sinde** ölçüldü:

- `before` = `git worktree add HEAD --detach` + Release build, dokunulmamış.
- `after`  = aynı worktree + yalnız bu kartın `bodice.cpp` değişikliği + yeniden
  derlenmiş wasm ikilisi.

Gitignore'lu üretim artefaktları (`engine/dist/`, `core/third_party/`,
`engine/pattern-bridge/.venv`) ana ağaçtan worktree'ye bağlandı; bağlanmadan alınan
ilk koşu 14 sahte kırmızı üretiyordu (modül bulunamadı).

## Worktree'de KALAN sahte kırmızılar (ana ağaçta yok)
`bugra_bridge_check` — `patterns_real/geometry/` ana ağaçta **takipsiz**, worktree'ye gelmiyor.
`dxf_check` · `nest_marker_check` · `tech_pack_check` — `engine/.venv-dxf` (ezdxf) gitignore'lu.
Dördü de before ve after listesinde AYNI şekilde duruyor, yani kıyası bozmuyorlar.

## Sonuç
`before` (HEAD `168902f`, dokunulmamış): **14 kırmızı / 102**.
`after` (rebase sonrası `origin/main` = `71af764` + bu commit, wasm ikilisi bu
kaynaktan yeniden derlendi): **11 kırmızı / 103**. **Yeni kırmızı ad: 0.**
Kapanan: `engine_check`, `sewable_census`, `bundle_fresh_check`.

⚠ `after` koşusu paralel ajanın `collar.cpp` işini de İÇERİYOR (`eaa378a`,
`71af764`) — rebase sonrası ölçüldü, yani tek koşu bugünkü ağacın tamamını
yargılıyor. Yukarıdaki dört sahte kırmızı hariç **gerçek kırmızı 7**:
`contract_check` · `sizechart_source_check` · `style_check` (üçü ilan edilmiş,
dokunulmadı) · `golden_check` + `recipe_dress_check` (Damla pin kararı,
`DAMLA-KUYRUK.md` K-FL-1/K-FL-2) · `garment_armhole_check` (K3 yaka, paralel
vardiya) · `preview_truth_check` (devralınan, teşhisi `GECE/IKI-KIRMIZI-TESHIS.md`).

---

## ⛔ REBASE SIRASINDA ÇIKAN İKİ GERÇEK — İKİSİ DE BENİM İŞİM DEĞİL, İKİSİ DE SÖYLENMELİ

**1. `origin/main` bugün TEMİZ BİR KLONDAN DERLENMİYOR.** `0cb5d23` (F-F, scye
genişlik çizgisi) `engine/src/bodice.hpp`'ye `#include "fabricease.hpp"` koydu ama
**`engine/src/fabricease.hpp` hiç commit edilmedi** — dosya ana ağaçta `??`
(takipsiz) duruyor. Aynı dosya ayrıca `FabricAxis` tipini kullanıyor ve o tip de
commit'lenmemiş `measurements.hpp` değişikliğinde. Yani commit'lenmiş kaynaktan
`cmake --build` **fatal error** veriyor. F-F'in kendi yeşil ctest'i ana ağaçta
koştuğu için (dosya orada, takipsiz de olsa) bunu göremedi.
Dosya BAŞKA BİR VARDİYANIN elinde olduğu için **ben commit etmedim**.

**2. Bu yüzden bu commit'in wasm ikilisi `71af764 + bu commit`ten derlendi.**
`0cb5d23`'ün scye değişikliği **shipped byte'ların içinde DEĞİL** — derlenemediği
için konulamadı. `bundle_fresh_check` commit TARİHİ okuduğu için yine de yeşil
görünecek: kapının kör noktası tam burası ve bu satır onu kapatmak için değil,
**görünür kılmak** için yazıldı. `fabricease.hpp` commit'lenir commit'lenmez
`bash engine/build-wasm.sh` yeniden koşmalı.

**3. Bu kartın önce/sonra ctest'i `168902f` (before) ve `71af764 + bu commit`
(after) üstünde ölçüldü.** `0cb5d23` sonrası tekrar koşulamadı (derlenmiyor).
