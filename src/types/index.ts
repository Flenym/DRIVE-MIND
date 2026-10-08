export type MasteryLevel = 'new' | 'learning' | 'review' | 'mastered' | 'archived';

export interface Question {
  id: string;
  ticketId: string;
  questionNumber: number;
  category: string;
  text: string;
  imagePath: string | null;
  extraImages: string[] | null;
  answers: Answer[];
  correctAnswerIds: string[];
  explanation: string | null;
  topicIds: string[];
  source: { name: string; url: string | null };
  version: number;
}

export interface Answer {
  id: string;
  text: string;
  sortOrder: number;
}

export interface QuestionStats {
  questionId: string;
  attempts: number;
  correct: number;
  incorrect: number;
  streak: number;
  lastAnswerCorrect: boolean | null;
  lastAnsweredAt: string | null;
  masteryLevel: MasteryLevel;
  dueAt: string | null;
  stability: number | null;
  difficulty: number | null;
  intervalDays: number;
}

export interface Attempt {
  id: string;
  questionId: string;
  ticketId: string | null;
  selectedAnswerIds: string[];
  isCorrect: boolean;
  mode: string;
  createdAt: string;
}

export interface Session {
  id: string;
  mode: string;
  ticketId: string | null;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, string[]>;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Manifest {
  version: number;
  releasedAt: string;
  categories: string[];
  files: { path: string; sha256: string; count: number }[];
  minAppVersion: string;
  source: { name: string; url: string | null };
}

export interface ExamConfig {
  category: string;
  totalQuestions: number;
  timeMinutes: number;
  maxErrors: number;
  extraBlockSize: number;
  extraTimeMinutes: number;
  passRequiresAllExtraCorrect: boolean;
  verifiedAt: string;
  source: string;
}

export type ProgressSummary = {
  total: number;
  newCount: number;
  learning: number;
  review: number;
  mastered: number;
  accuracy: number | null;
};
