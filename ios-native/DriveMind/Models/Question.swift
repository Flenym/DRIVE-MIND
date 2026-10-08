// Author: Flenym
import Foundation

struct Question: Codable, Identifiable, Hashable {
    let id: String
    let ticketId: String
    let questionNumber: Int
    let category: String
    let text: String
    let imagePath: String?
    let extraImages: [String]?
    let answers: [Answer]
    let correctAnswerIds: [String]
    let explanation: String?
    let topicIds: [String]
    let source: Source
    let version: Int

    struct Answer: Codable, Hashable {
        let id: String
        let text: String
    }
    struct Source: Codable, Hashable {
        let name: String
        let url: String?
    }
}

struct Manifest: Codable {
    let version: Int
    let releasedAt: String
    let categories: [String]
    let files: [FileEntry]
    let minAppVersion: String
    let source: Question.Source
    struct FileEntry: Codable { let path: String; let sha256: String; let count: Int }
}

struct ExamConfig: Codable {
    let category: String
    let totalQuestions: Int
    let timeMinutes: Int
    let maxErrors: Int
    let extraBlockSize: Int
    let extraTimeMinutes: Int
    let passRequiresAllExtraCorrect: Bool
    let verifiedAt: String
    let source: String
}

enum MasteryLevel: String, Codable { case new_, new; case learning, review, mastered, archived }

struct QuestionStats: Codable {
    var questionId: String
    var attempts: Int = 0
    var correct: Int = 0
    var incorrect: Int = 0
    var streak: Int = 0
    var lastAnswerCorrect: Bool?
    var lastAnsweredAt: Date?
    var masteryLevel: String = "new"
    var dueAt: Date?
    var stability: Double?
    var difficulty: Double?
    var intervalDays: Double = 0
}
