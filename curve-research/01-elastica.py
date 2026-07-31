#!/usr/bin/env python3
"""
ELASTICA — verilen uc nokta + uc teget + YAY UZUNLUGU ile bukulme enerjisi
minimum egri. Kalip cizmenin dogru egri modeli.

NEDEN: bugunku motor egriyi kubik Bezier ile ciziyor ve kontrol noktalarini
elle secilmis oranlarla koyuyor (bodice.hpp: armholeHollowShareFront=0.34,
armholeShoulderTangentShare=0.26, armholeLowerDropShare=0.78). Bu oranlar tek
kalibin uzerine fit edilmis; Bugra recetesinde ayni sayi 1.07 olmus (kirisin
DISI). Kontrol noktasi sacma yere gidince egri kamburlasiyor -> "SVG cirkin".

Elastica bunu ortadan kaldirir: kontrol noktasi diye bir sey YOK. Egri, sunlarin
cozumu olarak CIKAR:
    min  E = integral kappa^2 ds
    kisit: uc noktalar sabit, uc tegetler sabit, TOPLAM UZUNLUK = L

FORMULASYON (aci uzayi -- bu secim kritik):
Egriyi N esit uzunlukta segmente boluyoruz, her segmentin yonu theta_i.
    l = L/N  (her segment)
    x_{i+1} = x_i + l * (cos theta_i, sin theta_i)
Boylece TOPLAM UZUNLUK = N*l = L, INSAAT GEREGI TAM. Yaklasik degil, tam.
Bezier'de uzunluk ancak sayisal integralle olculur ve hedefe iterasyonla
yaklasilir; burada hata SIFIR.

    Ayrik bukulme enerjisi:  E = sum (theta_{i+1} - theta_i)^2 / l
    Uc teget kisiti:         theta_0, theta_{N-1} sabit
    Kapanma kisiti:          sum l*(cos,sin) = P1 - P0   (2 denklem)

Cozum: Lagrange carpani + Newton. Hessian tridiagonal + rank-2, numpy yeter.
scipy YOK (repo kurali).

DETERMINIZM: Math.random yok, tarih yok. Ayni girdi -> ayni cikti.
"""

import numpy as np

# ----------------------------------------------------------------------------
# Kubik Bezier + adaptif Gauss-Legendre yay uzunlugu.
# core/include/stitchu/geom.hpp:55-72'nin birebir Python karsiligi (ayni 8
# nokta, ayni adaptif bolme, ayni tolerans) -- boylece "uzunluk" ikisinde de
# ayni sey demek.
# ----------------------------------------------------------------------------
GL_NODE = np.array([
    -0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498,
     0.1834346424956498,  0.5255324099163290,  0.7966664774136267,  0.9602898564975363])
GL_WEIGHT = np.array([
    0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620,
    0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763])


class Cubic:
    def __init__(self, p0, c0, c1, p1):
        self.p0 = np.asarray(p0, float)
        self.c0 = np.asarray(c0, float)
        self.c1 = np.asarray(c1, float)
        self.p1 = np.asarray(p1, float)

    def at(self, t):
        t = np.asarray(t, float)[..., None]
        u = 1 - t
        return (self.p0 * u**3 + self.c0 * 3 * u**2 * t
                + self.c1 * 3 * u * t**2 + self.p1 * t**3)

    def deriv(self, t):
        t = np.asarray(t, float)[..., None]
        u = 1 - t
        return ((self.c0 - self.p0) * 3 * u**2
                + (self.c1 - self.c0) * 6 * u * t
                + (self.p1 - self.c1) * 3 * t**2)

    def deriv2(self, t):
        t = np.asarray(t, float)[..., None]
        u = 1 - t
        return ((self.c1 - 2 * self.c0 + self.p0) * 6 * u
                + (self.p1 - 2 * self.c1 + self.c0) * 6 * t)

    def _gl_panel(self, t0, t1):
        h, m = 0.5 * (t1 - t0), 0.5 * (t0 + t1)
        ts = m + h * GL_NODE
        speeds = np.linalg.norm(self.deriv(ts), axis=-1)
        return float(np.dot(GL_WEIGHT, speeds) * h)

    def arc_length(self, t0=0.0, t1=1.0, tol=1e-10, depth=0):
        whole = self._gl_panel(t0, t1)
        mid = 0.5 * (t0 + t1)
        halves = self._gl_panel(t0, mid) + self._gl_panel(mid, t1)
        if depth >= 20 or abs(halves - whole) <= tol * abs(halves) + 1e-13:
            return halves
        return (self.arc_length(t0, mid, tol, depth + 1)
                + self.arc_length(mid, t1, tol, depth + 1))

    def curvature(self, t):
        """Isaretli egrilik kappa(t) = (x'y'' - y'x'') / |r'|^3."""
        d1 = self.deriv(t)
        d2 = self.deriv2(t)
        num = d1[..., 0] * d2[..., 1] - d1[..., 1] * d2[..., 0]
        den = np.linalg.norm(d1, axis=-1) ** 3
        return np.divide(num, den, out=np.zeros_like(num), where=den > 1e-12)


# ----------------------------------------------------------------------------
# ELASTICA COZUCUSU
# ----------------------------------------------------------------------------
def solve_elastica(p0, p1, theta_start, theta_end, length, n=200,
                   max_iter=200, tol=1e-10, theta_init=None, verbose=False):
    """
    Bukulme enerjisi minimum, verilen uzunlukta egri.

    p0, p1        : uc noktalar (mm)
    theta_start   : baslangic teget acisi (rad) -- omuz dikisi yonu
    theta_end     : bitis teget acisi (rad)
    length        : ISTENEN toplam yay uzunlugu (mm). TAM tutturulur.
    n             : segment sayisi
    theta_init    : baslangic aci dizisi (n,). None ise lineer gecis.
                    Iyi bir tohum kritik -- lineer gecisin kapanma hatasi
                    onlarca mm olabilir ve Newton oradan zor toparliyor.

    Doner: (vertices (n+1,2), theta (n,), report dict)
    """
    p0 = np.asarray(p0, float)
    p1 = np.asarray(p1, float)
    l = length / n                      # segment uzunlugu -- sabit
    D = p1 - p0                         # kapanma hedefi

    if theta_init is not None:
        theta = np.asarray(theta_init, float).copy()
        theta[0] = theta_start
        theta[-1] = theta_end
    else:
        theta = np.linspace(theta_start, theta_end, n)

    # theta[0] ve theta[n-1] SABIT (uc teget kisiti) -> serbest: theta[1..n-2]
    free = np.arange(1, n - 1)
    nf = len(free)

    lam = np.zeros(2)                   # kapanma kisiti Lagrange carpanlari

    def closure(th):
        return l * np.array([np.sum(np.cos(th)), np.sum(np.sin(th))]) - D

    def bending_energy(th):
        d = np.diff(th)
        return float(np.sum(d * d) / l)

    report = {"converged": False, "iterations": 0}

    for it in range(max_iter):
        c, s = np.cos(theta), np.sin(theta)

        # --- gradyan: dL/dtheta_j (serbest indisler icin) ----------------------
        # Enerji terimi: d/dtheta_j sum (theta_{i+1}-theta_i)^2 / l
        #              = 2*(2*theta_j - theta_{j-1} - theta_{j+1}) / l
        g_energy = np.zeros(n)
        g_energy[1:-1] = 2.0 * (2 * theta[1:-1] - theta[:-2] - theta[2:]) / l
        # Kisit terimi: lam . d(closure)/dtheta_j = l*(-lam_x*sin + lam_y*cos)
        g_con = l * (-lam[0] * s + lam[1] * c)
        grad = (g_energy + g_con)[free]

        cl = closure(theta)

        resid = max(np.max(np.abs(grad)) if nf else 0.0, np.max(np.abs(cl)))
        if resid < tol:
            report["converged"] = True
            report["iterations"] = it
            break

        # --- Hessian: tridiagonal (enerji) + diagonal (kisit) ------------------
        # d2E/dtheta_j^2 = 4/l ; d2E/dtheta_j dtheta_{j+1} = -2/l
        H = np.zeros((nf, nf))
        np.fill_diagonal(H, 4.0 / l)
        if nf > 1:
            idx = np.arange(nf - 1)
            H[idx, idx + 1] = -2.0 / l
            H[idx + 1, idx] = -2.0 / l
        # kisit katkisi: l*(-lam_x*cos - lam_y*sin)
        H[np.arange(nf), np.arange(nf)] += l * (-lam[0] * c[free] - lam[1] * s[free])

        # --- kisit Jacobian'i: d(closure)/dtheta_j ----------------------------
        J = np.zeros((2, nf))
        J[0, :] = -l * s[free]
        J[1, :] =  l * c[free]

        # --- KKT sistemi:  [H  J^T] [dth ]   [-grad]
        #                   [J   0 ] [dlam] = [-cl  ]
        KKT = np.zeros((nf + 2, nf + 2))
        KKT[:nf, :nf] = H
        KKT[:nf, nf:] = J.T
        KKT[nf:, :nf] = J
        rhs = np.concatenate([-grad, -cl])

        # Tekillige karsi hafif sonumleme (LM ruhu) -- deterministik
        damp = 1e-9
        KKT[np.arange(nf + 2), np.arange(nf + 2)] += damp

        try:
            step = np.linalg.solve(KKT, rhs)
        except np.linalg.LinAlgError:
            KKT[np.arange(nf + 2), np.arange(nf + 2)] += 1e-6
            step = np.linalg.solve(KKT, rhs)

        # --- cizgi aramasi: KKT ARTIK NORMU azalmali --------------------------
        # (enerji+ceza melezi yanlisti: KKT adimi o melez icin inis yonu degil,
        #  cozucu 9.4mm kapanma hatasinda takiliyordu. Dogru olcut artik normu.)
        def kkt_residual_norm(th, lm):
            cc, ss = np.cos(th), np.sin(th)
            ge = np.zeros(n)
            ge[1:-1] = 2.0 * (2 * th[1:-1] - th[:-2] - th[2:]) / l
            gc = l * (-lm[0] * ss + lm[1] * cc)
            g = (ge + gc)[free]
            return float(np.sum(g * g) + np.sum(closure(th) ** 2))

        r0 = kkt_residual_norm(theta, lam)
        alpha = 1.0
        for _ in range(40):
            th_try = theta.copy()
            th_try[free] += alpha * step[:nf]
            lam_try = lam + alpha * step[nf:]
            if kkt_residual_norm(th_try, lam_try) < r0 or alpha < 1e-12:
                break
            alpha *= 0.5

        theta[free] += alpha * step[:nf]
        lam += alpha * step[nf:]
        report["iterations"] = it + 1

        if verbose and it % 20 == 0:
            print(f"  it {it:3d}  |grad|={np.max(np.abs(grad)):.3e}  "
                  f"|closure|={np.max(np.abs(cl)):.3e}  E={bending_energy(theta):.4f}")

    # --- kosumu topla ---------------------------------------------------------
    verts = np.zeros((n + 1, 2))
    verts[0] = p0
    for i in range(n):
        verts[i + 1] = verts[i] + l * np.array([np.cos(theta[i]), np.sin(theta[i])])

    seg_len = np.linalg.norm(np.diff(verts, axis=0), axis=1)
    report.update({
        "length_exact": float(np.sum(seg_len)),      # = length, insaat geregi
        "length_error_mm": float(abs(np.sum(seg_len) - length)),
        "endpoint_error_mm": float(np.linalg.norm(verts[-1] - p1)),
        "bending_energy": bending_energy(theta),
        # ayrik egrilik: donme acisi / segment uzunlugu
        "curvature": np.diff(theta) / l,
    })
    return verts, theta, report


# ----------------------------------------------------------------------------
# MOTORUN BUGUNKU KOL OYUGU (bodice.cpp armholeCurveFor, front/sleeveless=false/
# setIn=false yolu) -- sabitler bodice.hpp'den BIREBIR.
# ----------------------------------------------------------------------------
HOLLOW_SHARE_FRONT   = 0.34   # bodice.hpp:166
HOLLOW_SHARE_BACK    = 0.24   # bodice.hpp:167
LOWER_DROP_SHARE     = 0.78   # bodice.hpp:172
SHOULDER_TAN_SHARE   = 0.26   # bodice.hpp:177


def bezier_to_theta(cubic, n):
    """
    Bezier'i ESIT YAY UZUNLUGUNDA n segmente bol, segment acilarini dondur.
    Elastica cozucusune tohum: kapanma hatasi bastan ~0 olur, Newton hizli
    yakinsar. (Lineer aci gecisi tohumunda kapanma hatasi 91 mm cikti.)
    """
    # ince ornekleme -> kumulatif yay uzunlugu -> esit araliklara ters interp
    m = 20000
    ts = np.linspace(0.0, 1.0, m + 1)
    pts = cubic.at(ts)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    cum = np.concatenate([[0.0], np.cumsum(seg)])
    total = cum[-1]
    targets = np.linspace(0.0, total, n + 1)
    t_at = np.interp(targets, cum, ts)
    verts = cubic.at(t_at)
    d = np.diff(verts, axis=0)
    return np.arctan2(d[:, 1], d[:, 0])


def engine_armhole(shoulder, armhole_bottom, neck_point, is_front=True):
    """bodice.cpp:145-173'un birebir Python karsiligi."""
    shoulder = np.asarray(shoulder, float)
    armhole_bottom = np.asarray(armhole_bottom, float)
    neck_point = np.asarray(neck_point, float)

    dx = armhole_bottom[0] - shoulder[0]
    dy = armhole_bottom[1] - shoulder[1]
    hollow = (HOLLOW_SHARE_FRONT if is_front else HOLLOW_SHARE_BACK) * dx
    chord = float(np.hypot(dx, dy))

    st = shoulder - neck_point
    slen = float(np.linalg.norm(st))
    st = st / slen if slen > 1e-6 else np.array([1.0, 0.0])

    tan_reach = chord * SHOULDER_TAN_SHARE
    cp1 = shoulder + st * tan_reach
    cp2 = np.array([armhole_bottom[0] - dx * 0.06 - hollow,
                    shoulder[1] + dy * LOWER_DROP_SHARE])
    return Cubic(shoulder, cp1, cp2, armhole_bottom)


def main():
    # --- EU38 gercekci kol oyugu geometrisi (mm) ---------------------------
    # backLength 400, armholeDepthFactor 0.44 -> ~176 + omuz dususu
    shoulder       = np.array([188.0,  42.0])
    armhole_bottom = np.array([232.0, 218.0])
    neck_point     = np.array([ 62.0,   0.0])

    bez = engine_armhole(shoulder, armhole_bottom, neck_point, is_front=True)
    L = bez.arc_length()

    print("=" * 74)
    print("MOTORUN BUGUNKU KOL OYUGU (kubik Bezier, elle secilmis oranlar)")
    print("=" * 74)
    print(f"  p0 (omuz ucu)     : {bez.p0}")
    print(f"  cp1               : {bez.c0}    <-- oran 0.26 * kiris")
    print(f"  cp2               : {bez.c1}    <-- oran 0.34 * dx")
    print(f"  p1 (koltuk alti)  : {bez.p1}")
    print(f"  yay uzunlugu      : {L:.4f} mm")

    # cp1 kirisin/kutu disina tasiyor mu?
    if bez.c0[0] > max(bez.p0[0], bez.p1[0]):
        print(f"  ** cp1.x = {bez.c0[0]:.2f} > uc noktalarin ikisinden de BUYUK "
              f"({max(bez.p0[0], bez.p1[0]):.2f}) -> disa tasma")

    ts = np.linspace(0, 1, 401)
    k_bez = bez.curvature(ts)
    sign_changes = int(np.sum(np.diff(np.sign(k_bez[np.abs(k_bez) > 1e-9])) != 0))
    print(f"  egrilik araligi   : [{k_bez.min():.5f}, {k_bez.max():.5f}] 1/mm")
    print(f"  egrilik isaret degisimi (donum noktasi) : {sign_changes}")
    print(f"  |egrilik| oynakligi (max/min)           : "
          f"{np.abs(k_bez).max() / max(np.abs(k_bez).min(), 1e-12):.1f}x")

    # --- ayni uc noktalar, ayni uc tegetler, AYNI UZUNLUK -> elastica ------
    d0 = bez.deriv(0.0); d1 = bez.deriv(1.0)
    th0 = float(np.arctan2(d0[1], d0[0]))
    th1 = float(np.arctan2(d1[1], d1[0]))

    print()
    print("=" * 74)
    print("ELASTICA (ayni uclar, ayni tegetler, AYNI UZUNLUK)")
    print("=" * 74)
    N = 200
    seed = bezier_to_theta(bez, N)   # tohum: Bezier'in kendisi (esit yay boyu)
    verts, theta, rep = solve_elastica(bez.p0, bez.p1, th0, th1, L, n=N,
                                       theta_init=seed, verbose=True)

    print(f"  yakinsadi         : {rep['converged']}  ({rep['iterations']} iterasyon)")
    print(f"  UZUNLUK HATASI    : {rep['length_error_mm']:.3e} mm   <-- insaat geregi ~0")
    print(f"  uc nokta hatasi   : {rep['endpoint_error_mm']:.3e} mm")
    print(f"  bukulme enerjisi  : {rep['bending_energy']:.6f}")

    k_ela = rep["curvature"]
    sc_ela = int(np.sum(np.diff(np.sign(k_ela[np.abs(k_ela) > 1e-9])) != 0))
    print(f"  egrilik araligi   : [{k_ela.min():.5f}, {k_ela.max():.5f}] 1/mm")
    print(f"  egrilik isaret degisimi : {sc_ela}")
    print(f"  |egrilik| oynakligi     : "
          f"{np.abs(k_ela).max() / max(np.abs(k_ela).min(), 1e-12):.1f}x")

    # --- Bezier'in kendi uzunluk hatasi: hedefi tutturmak icin ne yapiyor? ---
    print()
    print("=" * 74)
    print("KARSILASTIRMA")
    print("=" * 74)
    print(f"  {'':22s} {'Bezier (bugun)':>18s} {'Elastica':>18s}")
    print(f"  {'uzunluk hatasi (mm)':22s} {'--- (olculur,':>18s} "
          f"{rep['length_error_mm']:>18.2e}")
    print(f"  {'':22s} {'dayatilamaz)':>18s}")
    print(f"  {'donum noktasi':22s} {sign_changes:>18d} {sc_ela:>18d}")
    print(f"  {'egrilik oynakligi':22s} "
          f"{np.abs(k_bez).max()/max(np.abs(k_bez).min(),1e-12):>17.1f}x "
          f"{np.abs(k_ela).max()/max(np.abs(k_ela).min(),1e-12):>17.1f}x")
    print(f"  {'elle secilmis sabit':22s} {'3 (0.26/0.34/0.78)':>18s} {'0':>18s}")

    np.save("/tmp/elastica_verts.npy", verts)
    np.save("/tmp/bezier_pts.npy", bez.at(np.linspace(0, 1, 401)))
    np.save("/tmp/k_bez.npy", k_bez)
    np.save("/tmp/k_ela.npy", k_ela)
    print("\n  -> /tmp/*.npy kaydedildi (render icin)")


if __name__ == "__main__":
    main()
