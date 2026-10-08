// Author: Flenym
import Foundation
import SwiftData

@MainActor
class AppStore: ObservableObject {
    @Published var questions: [Question] = []
    @Published var stats: [String: QuestionStats] = [:]
    @Published var isReady = false

    func bootstrap() async {
        // Load demo bundle if store empty
        if let url = Bundle.main.url(forResource: "questions", withExtension: "json", subdirectory: "demo") ?? Bundle.main.url(forResource: "questions", withExtension: "json") {
            if let data = try? Data(contentsOf: url), let decoded = try? JSONDecoder().decode([Question].self, from: data) {
                questions = decoded
            }
        }
        // Fallback: bundled demo path
        if questions.isEmpty, let url = Bundle.main.url(forResource: "questions", withExtension: "json") {
            if let data = try? Data(contentsOf: url), let decoded = try? JSONDecoder().decode([Question].self, from: data) { questions = decoded }
        }
        // Load stats from UserDefaults (simple; replace with SwiftData/SQLite for prod)
        if let data = UserDefaults.standard.data(forKey: "stats"), let decoded = try? JSONDecoder().decode([String: QuestionStats].self, from: data) {
            stats = decoded
        }
        isReady = true
    }

    func saveStats() {
        if let data = try? JSONEncoder().encode(stats) { UserDefaults.standard.set(data, forKey: "stats") }
    }

    func recordAnswer(questionId: String, selected: [String], isCorrect: Bool) {
        var s = stats[questionId] ?? QuestionStats(questionId: questionId)
        s.questionId = questionId
        let grade = gradeFromCorrect(isCorrect)
        let next = nextState(prev: stats[questionId], grade: grade)
        var n = next; n.questionId = questionId
        stats[questionId] = n
        saveStats()
    }
}
