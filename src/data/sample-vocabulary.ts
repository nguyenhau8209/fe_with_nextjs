import { Vocabulary, VocabularyCategory } from "../types/vocabulary";

export const sampleCategories: VocabularyCategory[] = [
  {
    id: "1",
    name: "Giao tiếp cơ bản",
    description: "Các từ vựng cơ bản cho giao tiếp hàng ngày",
    level: "beginner",
  },
  {
    id: "2",
    name: "Du lịch",
    description: "Từ vựng liên quan đến du lịch và phương tiện giao thông",
    level: "intermediate",
  },
];

export const sampleVocabulary: Vocabulary[] = [
  {
    id: "1",
    german: "Hallo",
    vietnamese: "Xin chào",
    pronunciation: "ha-lô",
    example: "Hallo, wie geht es dir?",
    category: "1",
    difficulty: "beginner",
    tags: ["chào hỏi", "cơ bản"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    german: "Danke",
    vietnamese: "Cảm ơn",
    pronunciation: "đan-kơ",
    example: "Danke schön!",
    category: "1",
    difficulty: "beginner",
    tags: ["lịch sự", "cơ bản"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    german: "Reise",
    vietnamese: "Du lịch",
    pronunciation: "rai-zơ",
    example: "Ich plane eine Reise nach Deutschland.",
    category: "2",
    difficulty: "intermediate",
    tags: ["du lịch", "hành trình"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
