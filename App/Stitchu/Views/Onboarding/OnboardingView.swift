import SwiftUI
import SwiftData

struct OnboardingView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var step = 0
    @State private var values: [MeasurementField: String] = [:]
    @State private var showValidationHint = false
    @FocusState private var inputFocused: Bool

    private let fields = MeasurementField.allCases
    private var totalSteps: Int { fields.count + 2 } // welcome + fields + summary

    var body: some View {
        ZStack {
            Palette.bg.ignoresSafeArea()
            VStack(spacing: 0) {
                progressBar
                TabView(selection: $step) {
                    welcome.tag(0)
                    ForEach(Array(fields.enumerated()), id: \.element) { index, field in
                        measurementSlide(field).tag(index + 1)
                    }
                    summary.tag(totalSteps - 1)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: step)
                controls
            }
        }
        .onChange(of: step) { showValidationHint = false }
    }

    private var progressBar: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Palette.blueLight)
                Capsule()
                    .fill(Palette.blue)
                    .frame(width: geo.size.width * CGFloat(step + 1) / CGFloat(totalSteps))
                    .animation(.spring(duration: 0.4), value: step)
            }
        }
        .frame(height: 5)
        .padding(.horizontal, 32)
        .padding(.top, 16)
    }

    private var welcome: some View {
        VStack(spacing: 20) {
            Spacer()
            DoodlePlaceholder(label: "welcome illustration\n(sewing table doodle)", height: 180)
                .padding(.horizontal, 40)
            Text("Stitchu")
                .font(Quicksand.bold(40))
                .foregroundStyle(Palette.ink)
            Text("show us what you love,\nwe'll make the pattern together")
                .font(Quicksand.medium(18))
                .foregroundStyle(Palette.inkSecondary)
                .multilineTextAlignment(.center)
            Text("first, a few measurements so every pattern fits you — grab a measuring tape, this takes 2 minutes")
                .font(Quicksand.regular(15))
                .foregroundStyle(Palette.inkSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 44)
            Spacer()
            Spacer()
        }
    }

    private func measurementSlide(_ field: MeasurementField) -> some View {
        VStack(spacing: 14) {
            BodySilhouetteView(highlight: field)
                .frame(maxHeight: 300)
                .padding(.top, 8)
            Text(field.title)
                .font(Quicksand.bold(24))
                .foregroundStyle(Palette.ink)
            Text(field.hint)
                .font(Quicksand.regular(15))
                .foregroundStyle(Palette.inkSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            HStack(spacing: 8) {
                TextField(field.placeholder, text: binding(for: field))
                    .keyboardType(.decimalPad)
                    .focused($inputFocused)
                    .font(Quicksand.bold(30))
                    .foregroundStyle(Palette.ink)
                    .multilineTextAlignment(.center)
                    .frame(width: 120)
                    .padding(.vertical, 12)
                    .background(Palette.card, in: RoundedRectangle(cornerRadius: 16))
                    .stitchedBorder(color: Palette.blue, cornerRadius: 16)
                Text("cm")
                    .font(Quicksand.medium(20))
                    .foregroundStyle(Palette.inkSecondary)
            }
            if showValidationHint {
                Text("that doesn't look right — expected \(Int(field.validRange.lowerBound))–\(Int(field.validRange.upperBound)) cm")
                    .font(Quicksand.medium(14))
                    .foregroundStyle(Palette.pink)
            }
            Spacer()
        }
    }

    private var summary: some View {
        VStack(spacing: 16) {
            Text("all set!")
                .font(Quicksand.bold(30))
                .foregroundStyle(Palette.ink)
                .padding(.top, 24)
            VStack(spacing: 10) {
                ForEach(fields) { field in
                    HStack {
                        Text(field.title)
                            .font(Quicksand.medium(16))
                            .foregroundStyle(Palette.inkSecondary)
                        Spacer()
                        Text("\(values[field] ?? "—") cm")
                            .font(Quicksand.bold(16))
                            .foregroundStyle(Palette.ink)
                    }
                }
            }
            .padding(20)
            .background(Palette.card, in: RoundedRectangle(cornerRadius: 20))
            .stitchedBorder(color: Palette.blue)
            .padding(.horizontal, 28)
            Text("you can edit these anytime from your profile")
                .font(Quicksand.regular(14))
                .foregroundStyle(Palette.inkSecondary)
            Spacer()
        }
    }

    private var controls: some View {
        HStack(spacing: 12) {
            if step > 0 {
                Button {
                    inputFocused = false
                    step -= 1
                } label: {
                    Text("back")
                        .font(Quicksand.semiBold(17))
                        .foregroundStyle(Palette.inkSecondary)
                        .padding(.vertical, 15)
                        .padding(.horizontal, 26)
                        .background(Palette.card, in: Capsule())
                        .overlay(Capsule().strokeBorder(Palette.line, lineWidth: 2))
                }
            }
            Button {
                advance()
            } label: {
                Text(step == totalSteps - 1 ? "let's create" : "continue")
                    .font(Quicksand.semiBold(17))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(Palette.blue, in: Capsule())
            }
        }
        .padding(.horizontal, 28)
        .padding(.bottom, 16)
    }

    private func binding(for field: MeasurementField) -> Binding<String> {
        Binding(
            get: { values[field] ?? "" },
            set: { values[field] = $0.replacingOccurrences(of: ",", with: ".") }
        )
    }

    private func currentFieldIsValid() -> Bool {
        guard step >= 1 && step <= fields.count else { return true }
        let field = fields[step - 1]
        guard let value = Double(values[field] ?? ""), field.validRange.contains(value) else { return false }
        return true
    }

    private func advance() {
        if !currentFieldIsValid() {
            showValidationHint = true
            return
        }
        inputFocused = false
        if step < totalSteps - 1 {
            step += 1
        } else {
            save()
        }
    }

    private func save() {
        func value(_ f: MeasurementField) -> Double { Double(values[f] ?? "") ?? 0 }
        let m = BodyMeasurements(
            bust: value(.bust),
            waist: value(.waist),
            hip: value(.hip),
            shoulderWidth: value(.shoulder),
            backLength: value(.backLength),
            armLength: value(.arm),
            neck: value(.neck)
        )
        modelContext.insert(m)
    }
}
