// DRIVE MIND — Author & Owner: Flenym
import SwiftUI

@main
struct DriveMindApp: App {
    @StateObject private var store = AppStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .preferredColorScheme(.dark)
                .task { await store.bootstrap() }
        }
    }
}
