# KART V9-R — ARAŞTIRMA: doküman doğruluğunun yayınlanmış pratiği

ETİKET: **PARALEL** (V9-A ile aynı anda koşar, ondan bir şey okumaz)
SÜRE TAVANI: **35 dk**

## NE
"Docs'ta duran-iddia yazılmaz, sayıyı BASAN aletin ADI yazılır" kuralının
YAYINLANMIŞ emsalini bul; `docs_truth_check` kapısının kalıp listesi ve
eşiği için kaynak taban çıkar. Kod YAZMA.

## GİRDİ DOSYALARI
- `ENV.md` · `RULES.md` (§6 ve §3 bu kartın konusudur)
- Web araması serbest. Repoda başka dosya AÇMA.

## ARANACAK EMSALLER (en az bu dördü, bulunamayan "BULUNAMADI" yazılır)
1. **Executable/testable documentation**: Python `doctest`, Rust `#[doc]`
   doctests, Go `Example` testleri, `mdBook test`, Sphinx `doctest` builder —
   dokümandaki sayının kaynağının derleme/test zamanında doğrulanması pratiği.
2. **Docs-as-code / linter sınıfı**: `vale` (prose lint, yasaklı kalıp
   listeleri), `markdownlint`, `lychee`/`markdown-link-check` (ölü link
   kapısı), Google developer documentation style guide'ın "avoid
   unverifiable superlatives" sınıfı kuralları, Diátaxis çerçevesi.
3. **Provenance/attestation**: dokümandaki metriğin yanına onu üreten
   job/komut adı yazma pratiği (CI badge provenance, SLSA provenance
   sınıfı, benchmark raporlarında "produced by <tool> @ <commit>").
4. **Yasaklı kelime listesi (banned-words gate)** kuran gerçek projeler:
   listeyi nasıl kuruyorlar, yanlış pozitifi nasıl yönetiyorlar
   (allowlist / satır içi `<!-- lint-disable -->` sınıfı kaçış).

## HÜKÜM TABLOSU (çıktının kalbi)
Her emsal için tek satır: kaynak (URL + erişim tarihi) · lisans ·
NE ÖLÇÜYOR · bizim `docs_truth_check`'e ne veriyor (kalıp / eşik / kaçış
mekanizması) · ALINIR mı ALINMAZ mı + tek cümle gerekçe.

Ayrıca AÇIKÇA cevapla:
- Yasaklı kalıp listesine kaçış (escape/allowlist) koymak yayınlanmış
  pratikte VAR MI? Varsa hangi biçimde? (Bu, `docs_truth_check`'in
  yanlış pozitifi nasıl yöneteceğini belirler.)
- "Her sayısal iddianın yanında onu basan aletin adı" şartını MEKANİK
  denetleyen yayınlanmış bir alet VAR MI? Yoksa açıkça
  "yayınlanmış alet YOK, kapı şu ölçümden kuruluyor" yaz.

## ÇIKTI
- `GECE/V9-R.md` — hüküm tablosu + iki soruya cevap + BULUNAMADI listesi.
- Kanıt olduğu kapı: `docs_truth_check` (§5.1 araştırmasız eşik kapıya giremez).

## YASAKLAR
- KOD YAZMA. Test yazma. `docs/`, `README.md`, `engine/`, `contract/`,
  `web/` dosyalarına DOKUNMA. Tek yazılabilir yer `GECE/V9-R.md`.
- Model ağırlığı indirme / API anahtarı / paket kurulumu YASAK (§5.3).
- Kaynaksız cümle kurma: her hüküm satırının yanında URL.
- WebFetch'e PDF özetletme YASAK (önceki koşuda YANLIŞ SAYI üretti).

## RAPOR
yapılan (dosya yolu + commit hash) · bulunan kaynak sayısı ·
yapılamayan (sebep) · kart dışı fark edilen.
İşini KENDİ COMMIT'İNLE bitir (lowercase ingilizce mesaj, co-author YOK).
