// Author: Flenym
import Foundation
import SwiftUI

/// Загрузка базы из бандла (Resources/questions.json) и локальный прогресс.
/// Прогресс хранится в UserDefaults (JSON). Миграция на SQLite — отдельный этап.
@MainActor
final class AppStore: ObservableObject {
    @Published var questions: [Question] = []
    @Published var stats: [String: QuestionStats] = [:]
    @Published var isReady = false
    @Published var loadError: String?
    @Published var contentVersion: Int = 0

    private let statsKey = "dm.stats.v1"

    func bootstrap() async {
        loadContent()
        loadStats()
        isReady = true
    }

    func loadContent() {
        guard let url = Bundle.main.url(forResource: "questions", withExtension: "json") else {
            loadError = "В приложении не найден questions.json. Пересоберите IPA."
            return
        }
        do {
            let data = try Data(contentsOf: url)
            let decoded = try JSONDecoder().decode([Question].self, from: data)
            questions = decoded
            if decoded.isEmpty { loadError = "База пуста." }
        } catch {
            loadError = "Не удалось прочитать базу: \(error.localizedDescription)"
        }
        if let mURL = Bundle.main.url(forResource: "manifest", withExtension: "json"),
           let mData = try? Data(contentsOf: mURL),
           let m = try? JSONDecoder().decode(Manifest.self, from: mData) {
            contentVersion = m.version
        }
    }

    func loadStats() {
        guard let data = UserDefaults.standard.data(forKey: statsKey),
              let decoded = try? JSONDecoder().decode([String: QuestionStats].self, from: data) else { return }
        stats = decoded
    }

    func saveStats() {
        if let data = try? JSONEncoder().encode(stats) { UserDefaults.standard.set(data, forKey: statsKey) }
    }

    func recordAnswer(questionId: String, selected: [String], isCorrect: Bool) {
        let grade = gradeFromCorrect(isCorrect)
        var next = nextState(prev: stats[questionId], grade: grade)
        next.questionId = questionId
        stats[questionId] = next
        saveStats()
    }

    var masteredCount: Int { stats.values.filter { $0.masteryLevel == "mastered" }.count }
    var attemptedCount: Int { stats.values.filter { $0.attempts > 0 }.count }
}
