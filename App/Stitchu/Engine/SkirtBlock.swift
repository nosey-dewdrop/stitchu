import Foundation
import CoreGraphics

/// Parametric skirt block. Follows the verified FreeSewing engine philosophy:
/// direct body measurements + percentage ease, no chest-fraction constants.
/// (knowledge/stitchu.db: drafting_formulas, engine_techniques)
enum SkirtStyle: String, CaseIterable, Identifiable {
    case aLine, straight, gathered, halfCircle

    var id: String { rawValue }
    var title: String {
        switch self {
        case .aLine: "A-line"
        case .straight: "straight"
        case .gathered: "gathered"
        case .halfCircle: "half circle"
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
    /// Gather ratio for gathered skirts (fabric = waist * ratio).
    static let gatherRatio = 1.9

    static func draft(measurements m: BodyMeasurementsSnapshot, style: SkirtStyle, length: SkirtLength) -> DraftedPattern {
        let pieces = pieces(measurements: m, style: style, length: length, includeWaistband: true)
        return DraftedPattern(
            garment: "\(style.title) skirt",
            pieces: pieces,
            fabricAdviceKey: "skirt",
            fabricMeters140: fabricEstimate(measurements: m, style: style, length: length),
            guideSteps: guide(style: style)
        )
    }

    /// Skirt pieces alone, reusable by the dress block (waistband optional).
    static func pieces(measurements m: BodyMeasurementsSnapshot, style: SkirtStyle, length: SkirtLength, includeWaistband: Bool) -> [PatternPiece] {
        let waistQuarter = m.waistMM * (1 + waistEase) / 4
        let hipQuarter = m.hipMM * (1 + hipEase) / 4
        let len = length.millimeters

        var result: [PatternPiece]
        switch style {
        case .aLine, .straight:
            result = [
                draftQuarter(name: "Front", waistQuarter: waistQuarter, hipQuarter: hipQuarter, length: len, style: style, dartLength: 90),
                draftQuarter(name: "Back", waistQuarter: waistQuarter, hipQuarter: hipQuarter, length: len, style: style, dartLength: 130),
            ]
        case .gathered:
            let panel = gatheredPanel(waistQuarter: waistQuarter, length: len)
            var back = panel
            back.name = "Back"
            back.id = UUID()
            result = [panel, back]
        case .halfCircle:
            result = [halfCirclePanel(waistMM: m.waistMM, length: len)]
        }
        if includeWaistband {
            result.append(waistbandPiece(waistMM: m.waistMM))
        }
        return result
    }

    private static func flare(for style: SkirtStyle) -> Double {
        switch style {
        case .aLine: 60
        case .straight, .gathered, .halfCircle: 0
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

        let commands: [PathCommand] = [
            .move(centerWaist),
            .curve(to: sideWaist,
                   cp1: CGPoint(x: waistlineWidth * 0.45, y: 0),
                   cp2: CGPoint(x: waistlineWidth * 0.8, y: -sideWaistRise * 0.8)),
            .curve(to: hipPoint,
                   cp1: CGPoint(x: waistlineWidth + (hipQuarter - waistlineWidth) * 0.6, y: hipDepth * 0.3 - sideWaistRise),
                   cp2: CGPoint(x: hipQuarter, y: hipDepth * 0.65)),
            .line(hemSide),
            .curve(to: hemCenter,
                   cp1: CGPoint(x: hemX * 0.6, y: length),
                   cp2: CGPoint(x: hemX * 0.3, y: length)),
            .line(centerWaist),
            .close,
        ]

        var markings: [PathCommand] = []
        if dartWidth > 0 {
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

    /// Gathered skirt: a simple rectangle, fabric = waist * gather ratio.
    private static func gatheredPanel(waistQuarter: Double, length: Double) -> PatternPiece {
        let width = waistQuarter * gatherRatio
        let commands: [PathCommand] = [
            .move(.zero),
            .line(CGPoint(x: width, y: 0)),
            .line(CGPoint(x: width, y: length)),
            .line(CGPoint(x: 0, y: length)),
            .close,
        ]
        return PatternPiece(
            name: "Front",
            cutInstruction: "cut 1 on fold",
            commands: commands,
            markings: [.move(CGPoint(x: 0, y: 18)), .line(CGPoint(x: width, y: 18))],
            grainline: Grainline(from: CGPoint(x: 50, y: 80), to: CGPoint(x: 50, y: length - 80)),
            seamAllowance: 15
        )
    }

    /// Half-circle skirt: two quarter-circle panels (this piece cut twice on fold).
    /// Waist radius r = eased waist / pi (half-circle geometry).
    private static func halfCirclePanel(waistMM: Double, length: Double) -> PatternPiece {
        let r = waistMM * (1 + waistEase) / Double.pi
        let R = r + length
        let k = 0.5523 // circle-to-bezier kappa

        let commands: [PathCommand] = [
            .move(CGPoint(x: r, y: 0)),
            // waist arc (quarter circle)
            .curve(to: CGPoint(x: 0, y: r),
                   cp1: CGPoint(x: r, y: r * k),
                   cp2: CGPoint(x: r * k, y: r)),
            // fold edge out to hem
            .line(CGPoint(x: 0, y: R)),
            // hem arc back
            .curve(to: CGPoint(x: R, y: 0),
                   cp1: CGPoint(x: R * k, y: R),
                   cp2: CGPoint(x: R, y: R * k)),
            .close,
        ]
        return PatternPiece(
            name: "Skirt Panel (quarter circle)",
            cutInstruction: "cut 2 on fold",
            commands: commands,
            markings: [],
            grainline: Grainline(from: CGPoint(x: r * 0.8, y: r * 0.8), to: CGPoint(x: R * 0.62, y: R * 0.62)),
            seamAllowance: 15
        )
    }

    static func waistbandPiece(waistMM: Double) -> PatternPiece {
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

    /// Rough estimate for 140cm-wide fabric, 10% cutting margin.
    static func fabricEstimate(measurements m: BodyMeasurementsSnapshot, style: SkirtStyle, length: SkirtLength) -> Double {
        let len = length.millimeters
        let meters: Double
        switch style {
        case .aLine, .straight:
            let hemWidth = m.hipMM * (1 + hipEase) / 4 + flare(for: style)
            let piecesPerWidth = hemWidth * 2 < 700 ? 2.0 : 1.0
            meters = ((len * 2) / piecesPerWidth + 120) * 1.10 / 1000
        case .gathered:
            let panelWidth = m.waistMM * (1 + waistEase) / 4 * gatherRatio * 2
            let piecesPerWidth = panelWidth < 700 ? 2.0 : 1.0
            meters = ((len * 2) / piecesPerWidth + 120) * 1.10 / 1000
        case .halfCircle:
            let R = m.waistMM * (1 + waistEase) / Double.pi + len
            meters = (R * 2 + 120) * 1.10 / 1000
        }
        return meters.rounded(toPlaces: 1)
    }

    private static func guide(style: SkirtStyle) -> [String] {
        var steps = [
            "Print the pattern and check the 3 cm calibration square with a ruler before cutting anything.",
        ]
        switch style {
        case .aLine, .straight:
            steps += [
                "Fold your fabric and cut the front and back on the fold. Cut 2 waistband pieces, interface 1.",
                "Sew any darts first, pressing them toward the center.",
                "Stitch the side seams (1.5 cm seam allowance), leaving the top 20 cm of the left seam open for the zipper.",
                "Insert an invisible zipper in the left seam: install the zipper BEFORE closing the seam below it, then close the seam.",
                "Attach the interfaced waistband, right sides together, then fold and topstitch or hand-finish the inside.",
                "Try it on. Adjust side seams if needed, then finish the hem with a 2 cm double-fold.",
            ]
        case .gathered:
            steps += [
                "Cut front and back panels on the fold. Cut 2 waistband pieces, interface 1.",
                "Sew the side seams, leaving the top 20 cm of the left seam open for the zipper.",
                "Run two rows of long gathering stitches along the marked line at the top edge.",
                "Pull the bobbin threads and gather each panel until it matches the waistband length, distributing gathers evenly.",
                "Insert an invisible zipper in the left seam BEFORE closing the seam below it.",
                "Attach the interfaced waistband over the gathers, then finish the inside.",
                "Hem with a 2 cm double-fold.",
            ]
        case .halfCircle:
            steps += [
                "Cut 2 quarter-circle panels on the fold. Cut 2 waistband pieces, interface 1.",
                "Stitch the two side seams, leaving the top 20 cm of the left seam open for the zipper.",
                "Staystitch the curved waist edge so it doesn't stretch while you work.",
                "Insert an invisible zipper in the left seam BEFORE closing the seam below it.",
                "Attach the interfaced waistband.",
                "IMPORTANT: let the skirt hang for 24 hours before hemming — bias-cut areas drop, then trim the hem even and finish with a narrow 1 cm hem.",
            ]
        }
        return steps
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
