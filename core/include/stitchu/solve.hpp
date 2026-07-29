// stitchu core — kisit cozucu (Levenberg-Marquardt, yogun, deterministik).
//
// NEDEN BU: FreeSewing kol kapagini TEK skalerle ve elle secilmis alti carpanla
// (0.8/0.9/1.3/1.15/0.99/1.008) itiyor, 2mm toleransla, 50 turda pes ediyor ve
// yakinsamadigini kullaniciya SOYLEMIYOR (designs/brian/src/sleevecap.mjs:10).
// Seamly2D hicbir dikis ciftini karsilastirmiyor. GarmentCode'un uzunluk kontrolu
// hic acilmayan bir verbose bayraginin arkasinda olu kod.
//
// Burada: tum serbest parametreler uzerinde gercek bir en-kucuk-kareler cozumu,
// merkezi fark Jacobian'i, LM sonumleme, ve YAKINSAMA RAPORU. Yakinsamadiysa
// yakinsamadi der; sessizce cikmaz.
#pragma once
#include <vector>
#include <functional>
#include <cmath>
#include <cstddef>

namespace stitchu {

struct SolveReport {
    bool converged{false};
    int iterations{0};
    double initialCost{0};   // 0.5 * ||r||^2
    double finalCost{0};
    double maxAbsResidual{0};
};

struct SolveOptions {
    int maxIterations{200};
    double residualTol{1e-9};   // max |r| bu degerin altina inerse yakinsadi
    double stepTol{1e-14};
    double lambda0{1e-3};
    double fdStep{1e-6};        // merkezi fark adimi (parametre olcegine gore)
};

// r = f(x). x boyutu n, r boyutu m (m >= n olmak zorunda DEGIL; LM duzenlilestirir).
class LevenbergMarquardt {
public:
    using ResidualFn = std::function<void(const std::vector<double>&, std::vector<double>&)>;

    LevenbergMarquardt(ResidualFn fn, std::size_t residualCount)
        : fn_(std::move(fn)), m_(residualCount) {}

    SolveReport solve(std::vector<double>& x, const SolveOptions& opt = {}) const {
        const std::size_t n = x.size();
        std::vector<double> r(m_), rTry(m_), J(m_ * n);
        SolveReport rep;

        fn_(x, r);
        double cost = half_sq(r);
        rep.initialCost = cost;
        double lambda = opt.lambda0;

        for (int it = 0; it < opt.maxIterations; ++it) {
            rep.iterations = it + 1;
            if (maxAbs(r) < opt.residualTol) { rep.converged = true; break; }

            // Merkezi fark Jacobian'i — deterministik, adim parametre olcegine gore.
            std::vector<double> xp = x;
            std::vector<double> rp(m_), rm(m_);
            for (std::size_t j = 0; j < n; ++j) {
                const double h = opt.fdStep * (std::fabs(x[j]) + 1.0);
                xp[j] = x[j] + h; fn_(xp, rp);
                xp[j] = x[j] - h; fn_(xp, rm);
                xp[j] = x[j];
                for (std::size_t i = 0; i < m_; ++i) J[i * n + j] = (rp[i] - rm[i]) / (2 * h);
            }

            // Normal denklemler: (J^T J + lambda*diag(J^T J)) dx = -J^T r
            std::vector<double> A(n * n, 0.0), g(n, 0.0);
            for (std::size_t i = 0; i < m_; ++i) {
                for (std::size_t a = 0; a < n; ++a) {
                    const double Jia = J[i * n + a];
                    if (Jia == 0.0) continue;
                    g[a] += Jia * r[i];
                    for (std::size_t b = a; b < n; ++b) A[a * n + b] += Jia * J[i * n + b];
                }
            }
            for (std::size_t a = 0; a < n; ++a)
                for (std::size_t b = 0; b < a; ++b) A[a * n + b] = A[b * n + a];

            bool stepTaken = false;
            for (int trial = 0; trial < 12 && !stepTaken; ++trial) {
                std::vector<double> Ad = A, rhs(n);
                for (std::size_t a = 0; a < n; ++a) {
                    Ad[a * n + a] += lambda * (A[a * n + a] + 1e-12);
                    rhs[a] = -g[a];
                }
                std::vector<double> dx;
                if (!ldlt(Ad, rhs, n, dx)) { lambda *= 10; continue; }

                double stepNorm = 0;
                std::vector<double> xTry(n);
                for (std::size_t a = 0; a < n; ++a) { xTry[a] = x[a] + dx[a]; stepNorm += dx[a] * dx[a]; }
                fn_(xTry, rTry);
                const double costTry = half_sq(rTry);
                if (costTry < cost) {
                    x = xTry; r = rTry; cost = costTry;
                    lambda = std::fmax(lambda * 0.3, 1e-12);
                    stepTaken = true;
                    if (std::sqrt(stepNorm) < opt.stepTol) { rep.converged = maxAbs(r) < opt.residualTol; it = opt.maxIterations; }
                } else {
                    lambda *= 10;
                }
            }
            if (!stepTaken) break;   // sonumleme buyudu, ilerleme yok
        }

        fn_(x, r);
        rep.finalCost = half_sq(r);
        rep.maxAbsResidual = maxAbs(r);
        if (rep.maxAbsResidual < opt.residualTol) rep.converged = true;
        return rep;
    }

private:
    static double half_sq(const std::vector<double>& v) {
        double s = 0; for (double e : v) s += e * e; return 0.5 * s;
    }
    static double maxAbs(const std::vector<double>& v) {
        double s = 0; for (double e : v) s = std::fmax(s, std::fabs(e)); return s;
    }
    // Simetrik LDL^T cozumu (pivotsuz; LM sonumlemesi kosullandirmayi ustleniyor).
    static bool ldlt(std::vector<double> A, const std::vector<double>& b, std::size_t n,
                     std::vector<double>& out) {
        std::vector<double> D(n, 0.0);
        for (std::size_t j = 0; j < n; ++j) {
            double d = A[j * n + j];
            for (std::size_t k = 0; k < j; ++k) d -= A[j * n + k] * A[j * n + k] * D[k];
            if (std::fabs(d) < 1e-300) return false;
            D[j] = d;
            for (std::size_t i = j + 1; i < n; ++i) {
                double s = A[i * n + j];
                for (std::size_t k = 0; k < j; ++k) s -= A[i * n + k] * A[j * n + k] * D[k];
                A[i * n + j] = s / d;
            }
        }
        std::vector<double> y(n);
        for (std::size_t i = 0; i < n; ++i) {
            double s = b[i];
            for (std::size_t k = 0; k < i; ++k) s -= A[i * n + k] * y[k];
            y[i] = s;
        }
        out.assign(n, 0.0);
        for (std::size_t ii = n; ii-- > 0;) {
            double s = y[ii] / D[ii];
            for (std::size_t k = ii + 1; k < n; ++k) s -= A[k * n + ii] * out[k];
            out[ii] = s;
        }
        return true;
    }

    ResidualFn fn_;
    std::size_t m_;
};

}  // namespace stitchu
