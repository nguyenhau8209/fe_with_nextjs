"use client";

import React, { useState, useEffect } from "react";
import Flashcard from "@/components/vocabulary/Flashcard";
import { sampleVocabulary } from "@/data/sample-vocabulary";
import { Vocabulary } from "@/types/vocabulary";

export default function LearnVocabularyPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [remainingWords, setRemainingWords] = useState<Vocabulary[]>([]);

  useEffect(() => {
    // Khởi tạo danh sách từ vựng cần học
    setRemainingWords(sampleVocabulary);
  }, []);

  const handleNext = () => {
    if (currentIndex < remainingWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMarkAsLearned = () => {
    const currentWord = remainingWords[currentIndex];
    setLearnedWords([...learnedWords, currentWord.id]);

    // Xóa từ đã học khỏi danh sách còn lại
    const newRemainingWords = remainingWords.filter(
      (word) => word.id !== currentWord.id
    );
    setRemainingWords(newRemainingWords);

    // Nếu đã học hết từ, reset về từ đầu
    if (currentIndex >= newRemainingWords.length - 1) {
      setCurrentIndex(0);
    }
  };

  if (remainingWords.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Chúc mừng!</h1>
        <p className="text-xl mb-8">
          Bạn đã hoàn thành học tất cả từ vựng trong danh sách.
        </p>
        <button
          onClick={() => {
            setRemainingWords(sampleVocabulary);
            setCurrentIndex(0);
            setLearnedWords([]);
          }}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Học lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Học Từ Vựng</h1>
        <p className="text-gray-600">
          Đã học: {learnedWords.length} / {sampleVocabulary.length} từ
        </p>
      </div>

      <Flashcard
        vocabulary={remainingWords[currentIndex]}
        onNext={handleNext}
        onMarkAsLearned={handleMarkAsLearned}
      />

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Từ {currentIndex + 1} / {remainingWords.length}
        </p>
      </div>
    </div>
  );
}
