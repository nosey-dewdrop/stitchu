import SwiftUI
import SwiftData

@main
struct StitchuApp: App {
    var body: some Scene {
        WindowGroup {
            AppRootView()
        }
        .modelContainer(for: [BodyMeasurements.self, SavedPattern.self])
    }
}

struct AppRootView: View {
    @Query(sort: \BodyMeasurements.createdAt) private var measurements: [BodyMeasurements]

    var body: some View {
        if measurements.isEmpty {
            OnboardingView()
        } else {
            RootView()
        }
    }
}
