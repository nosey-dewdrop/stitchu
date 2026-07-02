import Foundation
import CoreGraphics

/// Parametric bodice block. Every constant below traces to a verified source in
/// knowledge/stitchu.db (drafting_formulas). Where the app doesn't collect a
/// measurement Bella uses, the approximation is marked ASSUMPTION and the
/// sewing guide tells the user to sew a test muslin first.
///
/// Verified formulas used (FreeSewing Bella + Muller & Sohn, all 3-0):
/// - back armhole depth = hpsToWaistBack * 44% + shoulder drop
/// - chest ease 11%, waist ease 5% (percent of body, not fixed cm)
/// - back waist dart = (backWidth - waistWidth) * 0.825, 35% of the
///   reduction taken at the center-back seam; dart omitted if <= 0
/// - back neck width = neck * 0.197, front neck width = neck * 0.17,
///   back neck cutout = neck * 6%
/// - front/back balance: front waist length = back waist length + 40mm (M&S chart)

enum Neckline: String, CaseIterable, Identifiable {
    case crew, scoop, vNeck, square, boat

    var id: String { rawValue }
    var title: String {
        switch self {
        case .crew: "crew"
        case .scoop: "scoop"
        case .vNeck: "v-neck"
        case .square: "square"
        case .boat: "boat"
        }
    }
}

struct BodiceDraft {
    var back: PatternPiece
    var front: PatternPiece
    var backWaistHalf: Double
    var frontWaistHalf: Double
    var frontLength: Double
    var backLength: Double
    /// One arm's armhole sewing-line length (front half + back half), mm.
    var armholeLength: Double
    var armholeDepth: Double
}

struct BodiceBlock {
    static let chestEase = 0.11        // Bella default
    static let waistEase = 0.05        // Bella default
    static let armholeDepthFactor = 0.44
    static let backNeckWidthFactor = 0.197
    static let frontNeckWidthFactor = 0.17
    static let backNeckCutoutFactor = 0.06
    static let centerBackReduction = 0.35
    /// ASSUMPTION: underbust not measured; standard B/C-cup offset.
    static let underbustOffset: Double = 70
    /// ASSUMPTION: shoulder slope not measured; ~13 deg drop over the half shoulder.
    static let shoulderDropFactor = 0.23
    /// Verified M&S balance: front waist length II = back waist length + 4cm.
    static let frontBalanceDrop: Double = 40
    /// ASSUMPTION: waist splits ~48% back / 52% front of full circumference.
    static let backWaistShare = 0.48

    static func draft(measurements m: BodyMeasurementsSnapshot, neckline: Neckline = .crew) -> BodiceDraft {
        let neck = m.neckMM
        let backLength = m.backLengthMM
        let shoulderHalf = m.shoulderCM * 10 / 2
        let underbust = max(m.bustMM - underbustOffset, m.waistMM)

        let shoulderDrop = shoulderHalf * shoulderDropFactor
        let armholeY = backLength * armholeDepthFactor + shoulderDrop

        // Boat necks widen on both front and back.
        let widthMultiplier = neckline == .boat ? 1.35 : 1.0

        // ---- BACK (cut 2, center back seam carries part of the suppression) ----
        let backNeckW = neck * backNeckWidthFactor * widthMultiplier
        let backCutout = neck * backNeckCutoutFactor
        let backWidth = (underbust / 4) * (1 + chestEase)
        let backWaistTarget = (m.waistMM * backWaistShare / 2) * (1 + waistEase)
        let backReduction = max(0, backWidth - backWaistTarget)
        var backDart = backReduction * (1 - centerBackReduction * 0.5)
        let cbTakeIn = backReduction * centerBackReduction * 0.5
        if backDart <= 0 { backDart = 0 }
        let backWaistlineWidth = backWaistTarget + backDart

        let (back, backArmholeLen) = piece(
            name: "Bodice Back",
            cutInstruction: "cut 2",
            neckline: .crew, // back neckline stays a shallow curve for every style
            neckW: backNeckW,
            neckCutout: backCutout,
            shoulderHalf: shoulderHalf,
            shoulderDrop: shoulderDrop,
            chestWidth: backWidth,
            armholeY: armholeY,
            waistY: backLength,
            waistlineWidth: backWaistlineWidth,
            dartWidth: backDart,
            dartLength: backLength - armholeY + 40,
            centerTakeIn: cbTakeIn
        )

        // ---- FRONT (cut 1 on fold, all suppression in the waist dart) ----
        let frontNeckW = neck * frontNeckWidthFactor * widthMultiplier
        let frontCutout = frontNeckDepth(neckline: neckline, neckW: frontNeckW)
        let frontLength = backLength + frontBalanceDrop
        let frontWidth = (m.bustMM / 4) * (1 + chestEase)
        let frontWaistTarget = (m.waistMM * (1 - backWaistShare) / 2) * (1 + waistEase)
        let frontReduction = max(0, frontWidth - frontWaistTarget)
        let sideTake = min(frontReduction, 15.0)
        let frontDart = frontReduction - sideTake
        let frontWaistlineWidth = frontWaistTarget + frontDart

        let (front, frontArmholeLen) = piece(
            name: "Bodice Front",
            cutInstruction: "cut 1 on fold",
            neckline: neckline,
            neckW: frontNeckW,
            neckCutout: frontCutout,
            shoulderHalf: shoulderHalf,
            shoulderDrop: shoulderDrop,
            chestWidth: frontWidth - sideTake,
            armholeY: armholeY,
            waistY: frontLength,
            waistlineWidth: frontWaistlineWidth,
            dartWidth: frontDart,
            dartLength: frontLength - armholeY - 40,
            centerTakeIn: 0
        )

        return BodiceDraft(
            back: back,
            front: front,
            backWaistHalf: backWaistTarget,
            frontWaistHalf: frontWaistTarget,
            frontLength: frontLength,
            backLength: backLength,
            armholeLength: backArmholeLen + frontArmholeLen,
            armholeDepth: armholeY - shoulderDrop
        )
    }

    private static func frontNeckDepth(neckline: Neckline, neckW: Double) -> Double {
        switch neckline {
        case .crew: neckW + 15
        case .scoop: neckW + 50
        case .vNeck: neckW + 75
        case .square: neckW + 40
        case .boat: 28
        }
    }

    /// Neck segment from the center-neck point up to the shoulder-neck point.
    private static func neckCommands(neckline: Neckline, centerNeck: CGPoint, neckPoint: CGPoint) -> [PathCommand] {
        let w = neckPoint.x
        let d = centerNeck.y
        switch neckline {
        case .vNeck:
            return [.line(neckPoint)]
        case .square:
            return [.line(CGPoint(x: w, y: d)), .line(neckPoint)]
        case .boat:
            return [.curve(to: neckPoint,
                           cp1: CGPoint(x: w * 0.5, y: d),
                           cp2: CGPoint(x: w * 0.85, y: d * 0.5))]
        case .crew, .scoop:
            return [.curve(to: neckPoint,
                           cp1: CGPoint(x: w * 0.55, y: d),
                           cp2: CGPoint(x: w * 0.9, y: d * 0.35))]
        }
    }

    /// Shared half-bodice outline: center edge at x=0, waist at y=waistY.
    /// Returns the piece and its armhole curve length (sewing line, mm).
    private static func piece(
        name: String,
        cutInstruction: String,
        neckline: Neckline,
        neckW: Double,
        neckCutout: Double,
        shoulderHalf: Double,
        shoulderDrop: Double,
        chestWidth: Double,
        armholeY: Double,
        waistY: Double,
        waistlineWidth: Double,
        dartWidth: Double,
        dartLength: Double,
        centerTakeIn: Double
    ) -> (PatternPiece, Double) {
        let centerNeck = CGPoint(x: 0, y: neckCutout)
        let neckPoint = CGPoint(x: neckW, y: 0)
        let shoulderTip = CGPoint(x: shoulderHalf, y: shoulderDrop)
        let armholeBottom = CGPoint(x: chestWidth, y: armholeY)
        let sideWaist = CGPoint(x: waistlineWidth, y: waistY - 8)
        let centerWaist = CGPoint(x: centerTakeIn, y: waistY)

        let armholeCurve = PathCommand.curve(
            to: armholeBottom,
            cp1: CGPoint(x: shoulderHalf + (chestWidth - shoulderHalf) * 0.25, y: shoulderDrop + (armholeY - shoulderDrop) * 0.55),
            cp2: CGPoint(x: chestWidth - (chestWidth - shoulderHalf) * 0.45, y: armholeY - (armholeY - shoulderDrop) * 0.12)
        )
        let armholeLen = pathLength(of: [.move(shoulderTip), armholeCurve])

        var commands: [PathCommand] = [.move(centerNeck)]
        commands += neckCommands(neckline: neckline, centerNeck: centerNeck, neckPoint: neckPoint)
        commands += [
            .line(shoulderTip),
            armholeCurve,
            .line(sideWaist),
            .curve(to: centerWaist,
                   cp1: CGPoint(x: waistlineWidth * 0.6, y: waistY),
                   cp2: CGPoint(x: waistlineWidth * 0.25, y: waistY)),
            .curve(to: centerNeck,
                   cp1: CGPoint(x: centerTakeIn * 0.6, y: waistY * 0.6),
                   cp2: CGPoint(x: 0, y: waistY * 0.3)),
            .close,
        ]

        var markings: [PathCommand] = []
        if dartWidth > 0 {
            let dartCenterX = waistlineWidth * 0.5
            let apex = CGPoint(x: dartCenterX, y: waistY - dartLength)
            markings.append(.move(CGPoint(x: dartCenterX - dartWidth / 2, y: waistY - 4)))
            markings.append(.line(apex))
            markings.append(.line(CGPoint(x: dartCenterX + dartWidth / 2, y: waistY - 4)))
        }

        let piece = PatternPiece(
            name: name,
            cutInstruction: cutInstruction,
            commands: commands,
            markings: markings,
            grainline: Grainline(
                from: CGPoint(x: max(centerTakeIn, 20) + 20, y: armholeY),
                to: CGPoint(x: max(centerTakeIn, 20) + 20, y: waistY - 30)
            ),
            seamAllowance: 15
        )
        return (piece, armholeLen)
    }
}
