"""⭐ İŞ 0 — CEVAP ANAHTARI MÜHRÜ (GECE7 / F3, K19'un kapatılması).

NEDEN VAR — bu bir teori değil, hakemin ÖLÇTÜĞÜ bir kaçış yüzeyi (K19, HM8):

    vision/eval/labels-hakem.json'da `01`'in `shaping` yargısı `deger`den
    silinip `goremedim` dizisine taşındı — TEK SATIR, tersine çevrilebilir:

        H2  %95.2 (40/42)  ->  %97.6 (40/41)
        hedef_kosu EXIT 0 · pytest 23 passed · indir_check EXIT 0
        ------------------------------------------------ SIFIR KIRMIZI

Yani H2'yi yükseltmenin en ucuz yolu hattı düzeltmek değil, CEVAP ANAHTARINI
küçültmekti; ve hiçbir kapı yanmıyordu. §0B'nin reward-hacking maddesinin bu
koşuda YENİ DOĞMUŞ bir yüzeyi. Bu dosya o yüzeyi kapatır.

MÜHÜR NEREDE — burada DEĞİL, tabanda:

    contract/hedef-kosu-taban.json -> `_cevap_anahtari_MUHRU`

Kapı kendi beklentisini kendisi YAZMAZ; tabandan OKUR. Taban §3.8 md.1 gereği
yalnız hakemindir, faz ajanı ona dokunamaz. Beklenen sayıyı bu dosyanın içine
sabit yazmak, ajanın kendi kapısını kendi ayarlaması olurdu — kapı olmazdı.

ÜÇ KAÇIŞ YÖNÜNÜN ÜÇÜ DE TUTULUR (kartın şartı):

  1. `deger` -> `goremedim`   payda küçültme  -> `test_deger_hucre_sayimi` +
                                                 `test_goremedim_sayimi`
  2. `deger` -> `null`        payda küçültme  -> `test_deger_hucre_sayimi`
                                                 (enum düşer, null yükselir)
  3. bir yargının DEĞERİNİN değişmesi (hat neyse ona uydurma)
                              -> `test_dosya_sha256` (sayımlar kımıldamaz,
                                 bayt kımıldar)

Ayrıca `gorunurluk` bloğu da mühürlüdür: H10a/H10b/H10x/H10e'nin tamamı o
bloktan türüyor, yani orada bir hücre çevirmek §0B tavanını dolaylı gevşetir.

MÜHÜR YANLIŞSA NE OLUR — bu kapı DÜZELTMEZ. `labels-hakem.json` bir cevap
anahtarıdır; içeriğine faz ajanı dokunmaz (§3.8 md.2). Bir yargı gerçekten
yanlışsa faz kartına yazılır, düzelten hakemdir, ve mührü de hakem tazeler.
"""
import hashlib
import json
import os
import re

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__)))))
KEY = os.path.join(ROOT, "vision", "eval", "labels-hakem.json")
TABAN = os.path.join(ROOT, "contract", "hedef-kosu-taban.json")
MUHUR_ADI = "_cevap_anahtari_MUHRU"


def _load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _ara(node, ad):
    """Mührü ADIYLA arar, sabit bir yoldan değil.

    Taban hakemindir (§3.8 md.1) ve hakem bloklarını yeniden düzenleyebilir;
    mühür bugün `_hakem_dokunusu_2` altında duruyor ama yarın başka bir bloğa
    taşınabilir. Kapıyı sabit bir yola bağlamak, bir yeniden düzenlemede
    kapının SESSİZCE konusuz kalması demekti. Adıyla aranınca mühür kaybolursa
    kapı kırmızı yanar — sessizce geçmez.
    """
    if isinstance(node, dict):
        if ad in node:
            return node[ad]
        for v in node.values():
            bulunan = _ara(v, ad)
            if bulunan is not None:
                return bulunan
    return None


def muhur():
    """Tabandaki mühür bloğu. Blok yoksa kapı KIRMIZI — sessizce atlanmaz."""
    blok = _ara(_load(TABAN), MUHUR_ADI)
    assert blok is not None, (
        f"contract/hedef-kosu-taban.json içinde `{MUHUR_ADI}` YOK. "
        "Mührü silmek, cevap anahtarını korumasız bırakmanın en kısa yoludur "
        "(K19); mühürsüz geçmek bir GEÇME değildir.")
    return blok


def sayimlar():
    """Mühürdeki insan-okur sayım cümlelerinden beklenen sayıları çıkarır.

    Mühür metni hakemin yazdığı hâliyle durur; kapı onu YENİDEN YAZMAZ, okur.
    Cümledeki her sayı ayrı ayrı çekilir ki biri kayarsa hangisi olduğu hata
    mesajında adıyla görünsün.
    """
    blok = muhur()
    d = re.search(
        r"(\d+)\s*enum.*?(\d+)\s*null.*?(\d+)\s*goremedim\s*=\s*(\d+)\s*h",
        blok["deger_sayimi"])
    assert d, f"mühürdeki `deger_sayimi` okunamadı: {blok['deger_sayimi']!r}"
    g = re.search(
        r"(\d+)\s*x\s*(\d+)\s*=\s*(\d+)\D+?(\d+)'i dolu\D+?(\d+) g\D+?(\d+) g",
        blok["gorunurluk_sayimi"])
    assert g, (
        "mühürdeki `gorunurluk_sayimi` okunamadı: "
        f"{blok['gorunurluk_sayimi']!r}")
    return {
        "enum": int(d.group(1)), "null": int(d.group(2)),
        "goremedim": int(d.group(3)), "deger_toplam": int(d.group(4)),
        "foto": int(g.group(1)), "eksen": int(g.group(2)),
        "gor_hucre": int(g.group(3)), "gor_dolu": int(g.group(4)),
        "gorunur": int(g.group(5)), "gorunemez": int(g.group(6)),
        "sha256": blok["sha256"],
    }


def satirlar():
    return {k: v for k, v in _load(KEY).items() if not k.startswith("_")}


def olc():
    """Cevap anahtarını hücre hücre sayar. Mühürden BAĞIMSIZ."""
    rows = satirlar()
    o = dict(enum=0, null=0, goremedim=0, gor_hucre=0, gorunur=0,
             gorunemez=0, gor_dolu=0)
    eksenler = set()
    for r in rows.values():
        for v in r["deger"].values():
            o["null" if v is None else "enum"] += 1
        o["goremedim"] += len(r["goremedim"])
        for eksen, v in r["gorunurluk"].items():
            eksenler.add(eksen)
            o["gor_hucre"] += 1
            if v is True:
                o["gorunur"] += 1
                o["gor_dolu"] += 1
            elif v is False:
                o["gorunemez"] += 1
                o["gor_dolu"] += 1
    o["foto"] = len(rows)
    o["eksen"] = len(eksenler)
    o["deger_toplam"] = o["enum"] + o["null"] + o["goremedim"]
    return o


# --------------------------------------------------------------------------
# 1 + 2. KAÇIŞ: PAYDA KÜÇÜLTME  (`deger` -> `goremedim`, `deger` -> `null`)
# --------------------------------------------------------------------------

def test_deger_hucre_sayimi():
    """H2'nin PAYDASI. Bir enum yargısını `null` ya da `goremedim` yapmak
    paydayı düşürür ve H2'yi bedavaya şişirir (K19/HM8). Üç sayı da ayrı
    tutulur: toplam sabit kalıp içeride kayma olması da bir kaçıştır."""
    m, o = sayimlar(), olc()
    for ad in ("enum", "null", "goremedim", "deger_toplam"):
        assert o[ad] == m[ad], (
            f"CEVAP ANAHTARI OYNAMIŞ — `deger` bloğu `{ad}`: "
            f"mühür {m[ad]} · şimdi {o[ad]}. "
            "Bir yargıyı `deger`den `goremedim`/`null`'a taşımak H2'nin "
            "paydasını küçültür (K19). Anahtar düzeltilmez, karta yazılır "
            "(§3.8 md.2); mührü hakem tazeler.")


def test_goremedim_sayimi():
    """Kaçışın en ucuz yönü ayrıca ve adıyla tutulur: `goremedim` YÜKSELİYORSA
    biri fotoğraftan okunabilir bir alanı okunamaz ilan etmiştir."""
    m, o = sayimlar(), olc()
    assert o["goremedim"] <= m["goremedim"], (
        f"`goremedim` BÜYÜDÜ: mühür {m['goremedim']} -> şimdi {o['goremedim']}. "
        "Görülebilir bir alanı 'göremedim' ilan etmek, H2'yi ölçümü "
        "küçülterek yükseltmektir.")


def test_havuz_boyu_dusmedi():
    """Bir satırı komple silmek de bir payda küçültmesidir."""
    m, o = sayimlar(), olc()
    assert o["foto"] == m["foto"], (
        f"anahtar satır sayısı {m['foto']} -> {o['foto']}: "
        "fotoğraf seti mühürlü (§3.8 md.2), ajan ekleyemez/çıkaramaz.")


# --------------------------------------------------------------------------
# `gorunurluk` — H10a/H10b/H10x/H10e'nin tamamı buradan türüyor
# --------------------------------------------------------------------------

def test_gorunurluk_sayimi():
    """§0B tavanı H10b'de işliyor ve H10b bu bloktan çıkıyor. Bir hücreyi
    `true` -> `false` çevirmek 'görünen ama alınamayan'ı 'görünemez'e taşır,
    yani tavanın altından geçer."""
    m, o = sayimlar(), olc()
    for ad in ("eksen", "gor_hucre", "gor_dolu", "gorunur", "gorunemez"):
        assert o[ad] == m[ad], (
            f"GÖRÜNÜRLÜK BLOĞU OYNAMIŞ — `{ad}`: mühür {m[ad]} · şimdi {o[ad]}. "
            "H10a/H10b/H10x/H10e bu bloktan türüyor; bir hücre çevirmek §0B "
            "tavanını dolaylı gevşetir.")


# --------------------------------------------------------------------------
# 3. KAÇIŞ: BİR YARGININ DEĞERİNİN DEĞİŞMESİ (sayımlar kımıldamaz)
# --------------------------------------------------------------------------

def test_dosya_sha256():
    """Sayım korunarak değer değiştirmek mümkündür: `neckline: 'crew'` ->
    `'scoop'` üç sayının hiçbirini kımıldatmaz ama hattın hatasını cevaba
    çevirir. O yüzden dosyanın kendisi bayt bayt mühürlüdür."""
    m = sayimlar()
    with open(KEY, "rb") as fh:
        now = hashlib.sha256(fh.read()).hexdigest()
    assert now == m["sha256"], (
        f"CEVAP ANAHTARI DEĞİŞTİ\n  mühür: {m['sha256']}\n  şimdi: {now}\n"
        "Sayımlar tutsa bile bir YARGININ DEĞERİ değişmiş olabilir (hat neyse "
        "ona uydurma). `labels-hakem.json` faz ajanına kapalıdır (§3.8 md.2): "
        "yanlış bulduysan karta yaz, düzelten ve mührü tazeleyen hakemdir.")


# --------------------------------------------------------------------------
# Mührün kendisi de bir yüzeydir
# --------------------------------------------------------------------------

@pytest.mark.parametrize("alan", ["dosya", "sha256", "deger_sayimi",
                                  "gorunurluk_sayimi"])
def test_muhur_alanlari_duruyor(alan):
    """Mührü boşaltmak = kapıyı sessizce kapatmak. Boş alan kırmızıdır."""
    blok = muhur()
    val = (blok.get(alan) or "").strip()
    assert val, f"`{MUHUR_ADI}.{alan}` boş — mühürsüz geçme yoktur"


def test_muhur_dogru_dosyayi_muhurluyor():
    """Mührü başka bir dosyaya çevirip bu kapıyı boşa düşürmek de bir kaçıştır."""
    assert muhur()["dosya"] == "vision/eval/labels-hakem.json", (
        "mühür artık cevap anahtarını göstermiyor — kapı konusuz kaldı")
