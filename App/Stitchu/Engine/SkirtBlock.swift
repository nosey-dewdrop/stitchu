import Foundation
import CoreGraphics

/// Parametric skirt block. Follows the verified FreeSewing engine philosophy:
/// direct body measurements + percentage ease, no chest-fraction constants.
/// (knowledge/stitchu.db: drafting_formulas, engine_techniques)
enum SkirtStyle: String, CaseIterable, Identifiable {
    case aLine, straight

    var id: String { rawValue }
    var title: String {
        switch self {
        case .aLine: "A-line"
        case .straight: "straight"
        }
    }
}

enum SkirtLength: String, CaseIterable, Identifiable {
    case mini, midi, maxi

    var id: String { rawValue }
    var millimeters: Double {
        switch self {
        case .mini: 450
        case .midi: 650
        case .maxi: 900
        }
    }
}

struct SkirtBlock {
    /// Wearing ease as fraction of body measurement, FreeSewing Titan defaults.
    static let waistEase = 0.02
    static let hipEase = 0.02
    /// Waist-to-hip drafting depth in mm (standard drafting value; not user-measured in v1).
    static let hipDepth: Double = 200
    /// Side seam can absorb at most this much suppression per quarter (mm).
    static let maxSideTake: Double = 25
    /// Below this dart width the dart is dropped and folded into the side seam,
    /// same guard-clause approach as Bella's back dart.
    static let minDartWidth: Double = 8

    static func draft(measurements m: BodyMeasurementsSnapshot, style: SkirtStyle, length: SkirtLength) -> DraftedPattern {
        let waistQuarter = m.waistMM * (1 + waistEase) / 4
        let hipQuarter = m.hipMM * (1 + hipEase) / 4
        let len = length.millimeters

        let front = draftQuarter(
            name: "Front", waistQuarter: waistQuarter, hipQuarter: hipQuarter,
            length: len, style: style, dartLength: 90
        )
        let back = draftQuarter(
            name: "Back", waistQuarter: waistQuarter, hipQuarter: hipQuarter,
            length: len, style: style, dartLength: 130
        )
        let waistband = waistbandPiece(waistMM: m.waistMM)

        let hemWidth = hipQuarter + flare(for: style)
        let meters = fabricEstimate(pieceLength: len, hemWidth: hemWidth)

        return DraftedPattern(
            garment: "\(style.title) skirt",
            pieces: [front, back, waistband],
            fabricAdviceKey: "skirt",
            fabricMeters140: meters,
            guideSteps: guide(style: style)
        )
    }

    private static func flare(for style: SkirtStyle) -> Double {
        switch style {
        case .aLine: 60
        case .straight: 0
        }
    }

    /// Drafts one quarter (half of front or back, cut on fold).
    private static func draftQuarter(
        name: String,
        waistQuarter: Double,
        hipQuarter: Double,
        length: Double,
        style: SkirtStyle,
        dartLength: Double
    ) -> PatternPiece {
        let suppression = max(0, hipQuarter - waistQuarter)
        var sideTake = min(suppression * 0.6, maxSideTake)
        var dartWidth = suppression - sideTake
        if dartWidth < minDartWidth {
            sideTake = min(suppression, maxSideTake)
            dartWidth = 0
        }

        let waistlineWidth = waistQuarter + dartWidth
        let sideWaistRise: Double = 12
        let flareOut = flare(for: style)
        let hemX = hipQuarter + flareOut
        let hemSideRise: Double = flareOut > 0 ? 18 : 0

        let centerWaist = CGPoint(x: 0, y: 0)
        let sideWaist = CGPoint(x: waistlineWidth, y: -sideWaistRise)
        let hipPoint = CGPoint(x: hipQuarter, y: hipDepth)
        let hemSide = CGPoint(x: hemX, y: length - hemSideRise)
        let hemCenter = CGPoint(x: 0, y: length)

        var commands: [PathCommand] = [
            .move(centerWaist),
            // waistline curves gently up toward the side seam
            .curve(to: sideWaist,
                   cp1: CGPoint(x: waistlineWidth * 0.45, y: 0),
                   cp2: CGPoint(x: waistlineWidth * 0.8, y: -sideWaistRise * 0.8)),
            // side seam: waist to hip is a concave curve, hip to hem straight (with flare)
            .curve(to: hipPoint,
                   cp1: CGPoint(x: waistlineWidth + (hipQuarter - waistlineWidth) * 0.6, y: hipDepth * 0.3 - sideWaistRise),
                   cp2: CGPoint(x: hipQuarter, y: hipDepth * 0.65)),
            .line(hemSide),
            // hem sweeps back to square with the fold line
            .curve(to: hemCenter,
                   cp1: CGPoint(x: hemX * 0.6, y: length),
                   cp2: CGPoint(x: hemX * 0.3, y: length)),
            .line(centerWaist),
            .close,
        ]
        _ = commands // silence mutation warning if markings stay empty

        var markings: [PathCommand] = []
        if dartWidth > 0 {
            // Dart centered on the waistline
            let dartCenterX = waistlineWidth / 2
            let dartTip = CGPoint(x: dartCenterX, y: dartLength)
            let legA = CGPoint(x: dartCenterX - dartWidth / 2, y: -sideWaistRise * Double(dartCenterX / waistlineWidth) * 0.5)
            let legB = CGPoint(x: dartCenterX + dartWidth / 2, y: -sideWaistRise * Double(dartCenterX / waistlineWidth) * 0.5)
            markings.append(.move(legA))
            markings.append(.line(dartTip))
            markings.append(.line(legB))
        }

        return PatternPiece(
            name: name,
            cutInstruction: "cut 1 on fold",
            commands: commands,
            markings: markings,
            grainline: Grainline(from: CGPoint(x: 40, y: hipDepth), to: CGPoint(x: 40, y: length - 60)),
            seamAllowance: 15
        )
    }

    private static func waistbandPiece(waistMM: Double) -> PatternPiece {
        let bandLength = waistMM * (1 + waistEase) / 2 + 30 // half band (cut 2) + button stand
        let bandHeight: Double = 80 // folds to 4cm
        let rect: [PathCommand] = [
            .move(.zero),
            .line(CGPoint(x: bandLength, y: 0)),
            .line(CGPoint(x: bandLength, y: bandHeight)),
            .line(CGPoint(x: 0, y: bandHeight)),
            .close,
        ]
        let fold: [PathCommand] = [
            .move(CGPoint(x: 0, y: bandHeight / 2)),
            .line(CGPoint(x: bandLength, y: bandHeight / 2)),
        ]
        return PatternPiece(
            name: "Waistband",
            cutInstruction: "cut 2, interface 1",
            commands: rect,
            markings: fold,
            grainline: Grainline(from: CGPoint(x: 30, y: bandHeight / 2), to: CGPoint(x: bandLength - 30, y: bandHeight / 2)),
            seamAllowance: 10
        )
    }

    /// Rough fabric estimate for 140cm-wide fabric: front + back stacked lengthwise
    /// plus waistband and 10% cutting margin.
    private static func fabricEstimate(pieceLength: Double, hemWidth: Double) -> Double {
        let halfWidth: Double = 700
        let piecesPerWidth = hemWidth * 2 < halfWidth ? 2.0 : 1.0
        let lengthNeeded = (pieceLength * 2) / piecesPerWidth + 120
        return ((lengthNeeded * 1.10) / 1000).rounded(toPlaces: 1)
    }

    private static func guide(style: SkirtStyle) -> [String] {
        [
            "Print the pattern and check the 3 cm calibration square with a ruler before cutting anything.",
            "Fold your fabric and cut the front and back on the fold. Cut 2 waistband pieces, interface 1.",
            "Sew any darts first, pressing them toward the center.",
            "Stitch the side seams (1.5 cm seam allowance), leaving the top 20 cm of the left seam open for the zipper.",
            "Insert an invisible zipper in the left seam: install the zipper BEFORE closing the seam below it, then close the seam.",
            "Attach the interfaced waistband, right sides together, then fold and topstitch or hand-finish the inside.",
            "Try it on. Adjust side seams if needed, then finish the hem with a 2 cm double-fold.",
        ]
    }
}

/// Plain value snapshot of measurements so the engine never touches SwiftData directly.
struct BodyMeasurementsSnapshot {
    var bustCM: Double
    var waistCM: Double
    var hipCM: Double
    var shoulderCM: Double
    var backLengthCM: Double
    var armLengthCM: Double
    var neckCM: Double

    var bustMM: Double { bustCM * 10 }
    var waistMM: Double { waistCM * 10 }
    var hipMM: Double { hipCM * 10 }
    var backLengthMM: Double { backLengthCM * 10 }
    var neckMM: Double { neckCM * 10 }

    init(bustCM: Double, waistCM: Double, hipCM: Double, shoulderCM: Double, backLengthCM: Double, armLengthCM: Double, neckCM: Double) {
        self.bustCM = bustCM; self.waistCM = waistCM; self.hipCM = hipCM
        self.shoulderCM = shoulderCM; self.backLengthCM = backLengthCM
        self.armLengthCM = armLengthCM; self.neckCM = neckCM
    }

    init(from m: BodyMeasurements) {
        bustCM = m.bust; waistCM = m.waist; hipCM = m.hip
        shoulderCM = m.shoulderWidth; backLengthCM = m.backLength
        armLengthCM = m.armLength; neckCM = m.neck
    }
}

extension Double {
    func rounded(toPlaces places: Int) -> Double {
        let factor = pow(10.0, Double(places))
        return (self * factor).rounded() / factor
    }
}
