export interface Vocabulary {
  id: string;
  german: string;
  vietnamese: string;
  pronunciation: string;
  example?: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyCategory {
  id: string;
  name: string;
  description?: string;
  level: "beginner" | "intermediate" | "advanced";
}

export interface UserProgress {
  userId: string;
  vocabularyId: string;
  status: "learning" | "mastered" | "difficult";
  lastReviewed: Date;
  reviewCount: number;
  nextReviewDate: Date;
}
