// swift-tools-version: 5.9
// DRIVE MIND — iOS native SwiftUI track | Author & Owner: Flenym
import PackageDescription
let package = Package(
    name: "DriveMind",
    platforms: [.iOS(.v17)],
    products: [.library(name: "DriveMind", targets: ["DriveMind"])],
    targets: [
        .target(name: "DriveMind", path: "DriveMind"),
        .testTarget(name: "DriveMindTests", dependencies: ["DriveMind"], path: "DriveMindTests"),
    ]
)
