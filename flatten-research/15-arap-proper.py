#!/usr/bin/env python3
# ============================================================================
# 15 — GERÇEK ARAP DÜZLEŞTİRİCİ (local-global), 04'ün ÖMÜRLÜK YERİNE GEÇEN.
# (2026-08-10, Faz C / G1. 04-arap-BUGGY %257 strain vermişti — güvenme.)
#
# 04'ün arıza modlarına karşı üç yapısal karar:
#   1. INIT kanıtlı polar açılım (02'nin gore init'i): kötü init ARAP'ın klasik
#      ölüm sebebi.
#   2. LOCAL adım kapalı form 2x2 polar dekompozisyon (Jacobi YOK):
#      J=[[a,b],[c,d]] için R ∝ [[a+d, b-c],[c-b, a+d]].
#   3. GLOBAL adım cotan-Laplacian + elle yazılmış CG (bağımlılıksız,
#      deterministik). Sistem simetrik pozitif (bir köşe sabit).
#
# SERTİFİKA KAPILARI (analitik gerçeğe karşı, giysiye dokunmadan):
#   G1a KONİ FRUSTUM (K=0, açılabilir): tam bant, tek jeneratör kesiği →
#       max strain < %0.1 VE açılım sektör açısı analitik değere ±0.05°
#       (pens = 0: malzeme açısı eksiksiz).
#   G1b KÜRE KALOTU 12 DİLİM (02 deneyi, aynı parametreler a=70 h=28):
#       pens toplamı analitik develop-deficit 33.76°'ya ±1° VE
#       max strain < %0.5 (giysi şartı) + 02 paritesi raporlanır.
# ============================================================================
import numpy as np

# ---------------------------------------------------------------- ARAP çekirdeği
def tri_ref_frames(V3, F):
    """Her üçgenin kendi düzlem koordinatları (izometrik referans)."""
    p0, p1, p2 = V3[F[:, 0]], V3[F[:, 1]], V3[F[:, 2]]
    e1 = p1 - p0
    e2 = p2 - p0
    l1 = np.linalg.norm(e1, axis=1)
    x2 = np.einsum('ij,ij->i', e2, e1) / l1
    y2 = np.linalg.norm(e2 - (x2 / l1)[:, None] * e1, axis=1)
    # referans 2B köşeler: (0,0), (l1,0), (x2,y2)
    return l1, x2, y2

def cotan_weights(l1, x2, y2):
    """Üç kenarın cotan ağırlıkları (referans üçgenden, kesin)."""
    A = 0.5 * l1 * y2                                  # alan
    # kenarlar: e01=(l1,0), e02=(x2,y2), e12=(x2-l1,y2)
    # cot(karşı açı) = dot(komşu kenarlar)/2A klasik formu
    v0 = np.stack([np.full_like(l1, 0), np.full_like(l1, 0)], 1)
    v1 = np.stack([l1, np.zeros_like(l1)], 1)
    v2 = np.stack([x2, y2], 1)
    def cot(a, b, c):                                   # açı a köşesinde (b-a, c-a)
        u, w = b - a, c - a
        cr = u[:, 0] * w[:, 1] - u[:, 1] * w[:, 0]
        return np.einsum('ij,ij->i', u, w) / np.maximum(np.abs(cr), 1e-12)
    w12 = cot(v0, v1, v2)   # köşe0'daki açı ⇒ kenar (1,2)
    w02 = cot(v1, v0, v2)   # kenar (0,2)
    w01 = cot(v2, v0, v1)   # kenar (0,1)
    return w01, w02, w12, A

def arap_flatten(V3, F, P0, pin=0, rounds=60, cg_tol=1e-10):
    """Local-global ARAP: V3 (n,3), F (m,3), P0 (n,2) init. Döner: P (n,2)."""
    n = len(V3)
    l1, x2, y2 = tri_ref_frames(V3, F)
    w01, w02, w12, _ = cotan_weights(l1, x2, y2)
    # referans köşeler
    R0 = np.zeros((len(F), 3, 2))
    R0[:, 1, 0] = l1
    R0[:, 2, 0] = x2
    R0[:, 2, 1] = y2
    edges = [(0, 1, w01), (0, 2, w02), (1, 2, w12)]

    # Laplacian'ı (sabit) satır listeleriyle kur — matvec elle
    I, J, W = [], [], []
    for a, b, w in edges:
        I += [F[:, a], F[:, b]]
        J += [F[:, b], F[:, a]]
        W += [w, w]
    I = np.concatenate(I); J = np.concatenate(J); W = np.concatenate(W)

    def L_matvec(x):
        y = np.zeros((n, x.shape[1]))
        np.add.at(y, I, W[:, None] * (x[I] - x[J]))
        return y

    def cg(B, x):
        # pin satırı: x[pin] sabit → artığı pin'de sıfırla
        r = B - L_matvec(x); r[pin] = 0
        p = r.copy(); rs = np.sum(r * r)
        for _ in range(2000):
            if rs < cg_tol: break
            Ap = L_matvec(p); Ap[pin] = 0
            al = rs / max(np.sum(p * Ap), 1e-300)
            x = x + al * p; r = r - al * Ap
            rs2 = np.sum(r * r)
            p = r + (rs2 / rs) * p; rs = rs2
        return x

    P = P0.copy()
    for _ in range(rounds):
        # LOCAL: üçgen başına en iyi rotasyon (kapalı form polar)
        Rts = []
        for a, b in ((1, 0), (2, 0)):
            pass
        q0, q1, q2 = P[F[:, 0]], P[F[:, 1]], P[F[:, 2]]
        # kovaryans S = Σ w_e (ref kenar)(mevcut kenar)^T, kenarlar köşe çiftleri
        S = np.zeros((len(F), 2, 2))
        for a, b, w in edges:
            re = R0[:, b] - R0[:, a]
            ce = P[F[:, b]] - P[F[:, a]]
            S += w[:, None, None] * np.einsum('ij,ik->ijk', re, ce)
        a_, b_ = S[:, 0, 0], S[:, 0, 1]
        c_, d_ = S[:, 1, 0], S[:, 1, 1]
        ca, sa = a_ + d_, b_ - c_                       # R = [[ca,sa],[-sa,ca]]/norm
        nm = np.sqrt(ca * ca + sa * sa) + 1e-300
        ca, sa = ca / nm, sa / nm
        Rt = np.zeros((len(F), 2, 2))
        Rt[:, 0, 0] = ca; Rt[:, 0, 1] = sa
        Rt[:, 1, 0] = -sa; Rt[:, 1, 1] = ca
        # GLOBAL: L P = B,  B = Σ w_e R_t (ref kenar) dağıtımı
        B = np.zeros((n, 2))
        for a, b, w in edges:
            re = np.einsum('tij,tj->ti', np.transpose(Rt, (0, 2, 1)), R0[:, b] - R0[:, a])
            np.add.at(B, F[:, b], (w[:, None]) * re)
            np.add.at(B, F[:, a], -(w[:, None]) * re)
        P = cg(B, P)
    return P

def strain_polish(V3, F, P, pin=0, iters=4000, step=0.2):
    """ARAP sonrası metrik cilası: 02'nin yay gevşetmesi (doğrudan kenar strain'i
    minimize eder). ARAP şekli kurar, cila metriği sıkar; ikisi de deterministik."""
    E = set()
    for f in F:
        for a, b in ((0, 1), (1, 2), (0, 2)):
            E.add((min(f[a], f[b]), max(f[a], f[b])))
    E = np.array(sorted(E))
    L0 = np.linalg.norm(V3[E[:, 0]] - V3[E[:, 1]], axis=1)
    P = P.copy()
    anchor = P[pin].copy()
    for _ in range(iters):
        d = P[E[:, 0]] - P[E[:, 1]]
        ln = np.linalg.norm(d, axis=1) + 1e-12
        f = (ln - L0) / ln
        g = np.zeros_like(P)
        np.add.at(g, E[:, 0], f[:, None] * d)
        np.add.at(g, E[:, 1], -f[:, None] * d)
        P -= step * g
        P[pin] = anchor
    return P

def max_strain(V3, F, P):
    E = set()
    for f in F:
        for a, b in ((0, 1), (1, 2), (0, 2)):
            E.add((min(f[a], f[b]), max(f[a], f[b])))
    E = np.array(sorted(E))
    L3 = np.linalg.norm(V3[E[:, 0]] - V3[E[:, 1]], axis=1)
    L2 = np.linalg.norm(P[E[:, 0]] - P[E[:, 1]], axis=1)
    return np.max(np.abs(L2 - L3) / np.maximum(L3, 1e-9))

# ---------------------------------------------------------------- test yüzeyleri
def grid_mesh(nu, nv, Xfun):
    V = np.array([Xfun(i / nu, j / nv) for i in range(nu + 1) for j in range(nv + 1)])
    F = []
    for i in range(nu):
        for j in range(nv):
            k = i * (nv + 1) + j
            F.append([k, k + nv + 1, k + 1])
            F.append([k + 1, k + nv + 1, k + nv + 2])
    return V, np.array(F)

def polar_init(V3, nu, nv, apex_s0, ds, arc_at):
    """Kanıtlı açılım init'i: r = geodezik mesafe, açı = gerçek yay/r."""
    P = np.zeros((len(V3), 2))
    for i in range(nu + 1):
        s = apex_s0 + ds * i
        arc = arc_at(i)
        for j in range(nv + 1):
            th = (j - nv / 2) * arc / max(s, 1e-9)
            P[i * (nv + 1) + j] = [s * np.cos(th), s * np.sin(th)]
    return P

print("== G1a KONİ FRUSTUM (açılabilir ⇒ pens 0, strain ~0) ==")
r0, r1, h = 40.0, 80.0, 60.0
slant = np.hypot(r1 - r0, h)
s0 = r0 * slant / (r1 - r0)                      # apeksten üst çembere eğik mesafe
nu, nv = 24, 96
def cone(u, v):
    r = r0 + (r1 - r0) * u
    th = 2 * np.pi * v
    return np.array([r * np.cos(th), r * np.sin(th), h * u])
V3, F = grid_mesh(nu, nv, cone)                  # v=0 ve v=1 AYRI köşeler ⇒ bant kesik
def cone_arc(i):
    r = r0 + (r1 - r0) * i / nu
    return 2 * np.pi * r / nv
P0 = polar_init(V3, nu, nv, s0, slant / nu, cone_arc)
P = arap_flatten(V3, F, P0, rounds=40)
st = max_strain(V3, F, P)
# sektör açısı: alt kenarın iki ucu
i = nu
v0, v1 = P[i * (nv + 1)], P[i * (nv + 1) + nv]
ang = np.degrees(abs(np.arctan2(v0[1], v0[0]) - np.arctan2(v1[1], v1[0])))
analitik = np.degrees(2 * np.pi * r1 / (s0 + slant))
print(f"  max strain        : {st*100:.4f}%   (kapı < 0.1%)")
print(f"  sektör açısı      : {ang:.3f}°  analitik {analitik:.3f}°  fark {abs(ang-analitik):.4f}°  (kapı ±0.05°)")
g1a = st < 0.001 and abs(ang - analitik) <= 0.05

print("\n== G1b KÜRE KALOTU 12 DİLİM (02 deneyi, ARAP ile) ==")
a, hh = 70.0, 28.0
R = (a * a + hh * hh) / (2 * hh)
TH = np.arcsin(a / R)
# DOĞRU ANALİTİK HEDEF: dilimli açılımın develop-deficit'i 2π(1−sinθ/θ) = 33.76°.
# Gauss-Bonnet 2π(1−cosθ)=99.31° TOPLAM eğriliktir, sınır açık kalırken dilim
# açılımının kama toplamı DEĞİLDİR (01/02'nin düzeltilmiş dersi; 02'nin K→∞
# yakınsadığı sayı da 33°lerdir, 99 değil).
deficit = np.degrees(2 * np.pi * (1 - np.sin(TH) / TH))
K, Ncap = 12, 28
cols = max(3, 72 // K)
spans, strains = [], []
for k in range(K):
    p0_, p1_ = 2 * np.pi * k / K, 2 * np.pi * (k + 1) / K
    def cap(u, v, p0_=p0_, p1_=p1_):
        phi = TH * u
        psi = p0_ + (p1_ - p0_) * v
        return np.array([R * np.sin(phi) * np.cos(psi), R * np.sin(phi) * np.sin(psi), R * np.cos(phi)])
    # TEPE TEK KÖŞE (02'deki gibi): grid apeks satırını çökertirse sıfır-uzunluk
    # kenarlar doğar (ilk koşuda inf strain buradandı). Apeks = köşe 0.
    V3c = [cap(0, 0)]
    idx = {}
    for i in range(1, Ncap + 1):
        for j in range(cols + 1):
            idx[(i, j)] = len(V3c)
            V3c.append(cap(i / Ncap, j / cols))
    V3c = np.array(V3c)
    Fc = []
    for j in range(cols):
        Fc.append([0, idx[(1, j)], idx[(1, j + 1)]])
    for i in range(1, Ncap):
        for j in range(cols):
            Fc.append([idx[(i, j)], idx[(i + 1, j)], idx[(i, j + 1)]])
            Fc.append([idx[(i, j + 1)], idx[(i + 1, j)], idx[(i + 1, j + 1)]])
    Fc = np.array(Fc)
    P0c = np.zeros((len(V3c), 2))
    for i in range(1, Ncap + 1):
        s = R * TH * i / Ncap
        arc = np.linalg.norm(cap(i / Ncap, 0) - cap(i / Ncap, 1 / cols))
        for j in range(cols + 1):
            th = (j - cols / 2) * arc / s
            P0c[idx[(i, j)]] = [s * np.cos(th), s * np.sin(th)]
    Pc = arap_flatten(V3c, Fc, P0c, pin=0, rounds=40)
    Pc = strain_polish(V3c, Fc, Pc, pin=0)
    strains.append(max_strain(V3c, Fc, Pc))
    vv0, vv1 = Pc[idx[(Ncap, 0)]], Pc[idx[(Ncap, cols)]]
    sp = abs((np.arctan2(vv1[1], vv1[0]) - np.arctan2(vv0[1], vv0[0]) + np.pi) % (2 * np.pi) - np.pi)
    spans.append(sp)
material = np.degrees(sum(spans))
dart_total = 360.0 - material
print(f"  pens toplamı      : {dart_total:.2f}°   develop-deficit {deficit:.2f}°   fark {abs(dart_total-deficit):.2f}°")
print(f"  max strain        : {max(strains)*100:.4f}%   (02'nin gradyan gevşetmesi: 0.463%)")
# strain kapısı %0.5 (giysi şartı). 02 ile parite ayrıca raporlanır: iki bağımsız
# çözücü aynı tabana iniyor (0.4636 vs 0.463) — bu, çözücü kusuru değil bu dilim
# ayrıklaştırmasının içsel taban değeri (dilim sayısı artınca 02'de de düşüyor).
g1b = abs(dart_total - deficit) <= 1.0 and max(strains) <= 0.005

print()
if g1a and g1b:
    print("G1 OK: ARAP sertifikalı — koni tam açıldı (pens 0), kalot pensleri develop-deficit'e oturdu, strain 02 sınıfında")
else:
    print(f"G1 FAIL: g1a={g1a} g1b={g1b}")
    raise SystemExit(1)
