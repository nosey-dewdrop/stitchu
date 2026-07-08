import SwiftUI
import SwiftData

struct ProfileSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \BodyMeasurements.createdAt) private var measurements: [BodyMeasurements]

    @State private var editedValues: [MeasurementField: String] = [:]

    var body: some View {
        NavigationStack {
            ZStack {
                Palette.bg.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        measurementsSection
                        aboutSection
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("done") { saveAll(); dismiss() }
                        .font(Quicksand.semiBold(16))
                }
            }
            .onAppear(perform: load)
        }
    }

    private var measurementsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("my measurements")
                .font(Quicksand.bold(20))
                .foregroundStyle(Palette.ink)
            ForEach(MeasurementField.allCases) { field in
                HStack {
                    Text(field.title)
                        .font(Quicksand.medium(15))
                        .foregroundStyle(Palette.inkSecondary)
                    Spacer()
                    TextField(field.placeholder, text: binding(for: field))
                        .keyboardType(.decimalPad)
                        .font(Quicksand.semiBold(16))
                        .foregroundStyle(Palette.ink)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 70)
                    Text("cm")
                        .font(Quicksand.regular(14))
                        .foregroundStyle(Palette.inkSecondary)
                }
            }
        }
        .padding(18)
        .background(Palette.card, in: RoundedRectangle(cornerRadius: 20))
        .stitchedBorder(cornerRadius: 20)
    }

    private var aboutSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Stitchu 1.0")
                .font(Quicksand.semiBold(15))
                .foregroundStyle(Palette.ink)
            Text("patterns drafted with verified formulas — every rule in the engine traces back to a checked source")
                .font(Quicksand.regular(13))
                .foregroundStyle(Palette.inkSecondary)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Palette.card, in: RoundedRectangle(cornerRadius: 20))
        .stitchedBorder(cornerRadius: 20)
    }

    private func binding(for field: MeasurementField) -> Binding<String> {
        Binding(
            get: { editedValues[field] ?? "" },
            set: { editedValues[field] = $0.replacingOccurrences(of: ",", with: ".") }
        )
    }

    private func load() {
        guard let m = measurements.last else { return }
        editedValues = [
            .bust: String(format: "%.0f", m.bust),
            .waist: String(format: "%.0f", m.waist),
            .hip: String(format: "%.0f", m.hip),
            .shoulder: String(format: "%.0f", m.shoulderWidth),
            .backLength: String(format: "%.0f", m.backLength),
            .arm: String(format: "%.0f", m.armLength),
            .neck: String(format: "%.0f", m.neck),
        ]
    }

    private func saveAll() {
        if let m = measurements.last {
            func value(_ f: MeasurementField, _ current: Double) -> Double {
                guard let v = Double(editedValues[f] ?? ""), f.validRange.contains(v) else { return current }
                return v
            }
            m.bust = value(.bust, m.bust)
            m.waist = value(.waist, m.waist)
            m.hip = value(.hip, m.hip)
            m.shoulderWidth = value(.shoulder, m.shoulderWidth)
            m.backLength = value(.backLength, m.backLength)
            m.armLength = value(.arm, m.armLength)
            m.neck = value(.neck, m.neck)
            m.updatedAt = .now
        }
    }
}
