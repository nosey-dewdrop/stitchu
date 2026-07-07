import Foundation
import SwiftData

/// All values in centimeters.
@Model
final class BodyMeasurements {
    var bust: Double
    var waist: Double
    var hip: Double
    var shoulderWidth: Double
    var backLength: Double
    var armLength: Double
    var neck: Double
    var createdAt: Date
    var updatedAt: Date

    init(
        bust: Double,
        waist: Double,
        hip: Double,
        shoulderWidth: Double,
        backLength: Double,
        armLength: Double,
        neck: Double
    ) {
        self.bust = bust
        self.waist = waist
        self.hip = hip
        self.shoulderWidth = shoulderWidth
        self.backLength = backLength
        self.armLength = armLength
        self.neck = neck
        self.createdAt = .now
        self.updatedAt = .now
    }
}

/// Bridge from the SwiftData model to the engine's plain snapshot. Lives here
/// (not in the engine) so the engine stays SwiftData-free and compiles
/// standalone for the engine-check validation harness.
extension BodyMeasurementsSnapshot {
    init(from m: BodyMeasurements) {
        self.init(
            bustCM: m.bust, waistCM: m.waist, hipCM: m.hip,
            shoulderCM: m.shoulderWidth, backLengthCM: m.backLength,
            armLengthCM: m.armLength, neckCM: m.neck
        )
    }
}

enum MeasurementField: String, CaseIterable, Identifiable {
    case bust, waist, hip, shoulder, backLength, arm, neck

    var id: String { rawValue }

    var title: String {
        switch self {
        case .bust: "bust circumference"
        case .waist: "waist circumference"
        case .hip: "hip circumference"
        case .shoulder: "shoulder width"
        case .backLength: "back length"
        case .arm: "arm length"
        case .neck: "neck circumference"
        }
    }

    var hint: String {
        switch self {
        case .bust: "measure around the fullest part of your chest"
        case .waist: "measure around your natural waistline"
        case .hip: "measure around the fullest part of your hips"
        case .shoulder: "measure from shoulder tip to shoulder tip"
        case .backLength: "from the nape of your neck down to your waist"
        case .arm: "from shoulder tip down to your wrist"
        case .neck: "measure around the base of your neck"
        }
    }

    var placeholder: String {
        switch self {
        case .bust: "92"
        case .waist: "74"
        case .hip: "98"
        case .shoulder: "38"
        case .backLength: "40"
        case .arm: "58"
        case .neck: "36"
        }
    }

    /// Sanity range in cm used for validation.
    var validRange: ClosedRange<Double> {
        switch self {
        case .bust: 60...180
        case .waist: 45...170
        case .hip: 60...190
        case .shoulder: 28...60
        case .backLength: 28...60
        case .arm: 40...80
        case .neck: 25...55
        }
    }
}
