/** @jsxImportSource react */
"use client";

import React, { useState, useEffect } from "react";
import PracticeExercise from "@/components/vocabulary/PracticeExercise";
import { sampleVocabulary } from "@/data/sample-vocabulary";
import { Vocabulary } from "@/types/vocabulary";

export default function PracticeVocabularyPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [practiceWords, setPracticeWords] = useState<Vocabulary[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Khởi tạo danh sách từ vựng để luyện tập
    const shuffled = [...sampleVocabulary].sort(() => 0.5 - Math.random());
    setPracticeWords(shuffled.slice(0, 10)); // Luyện tập với 10 từ
    setTotalQuestions(10);
  }, []);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentIndex < practiceWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    const shuffled = [...sampleVocabulary].sort(() => 0.5 - Math.random());
    setPracticeWords(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setScore(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Kết quả luyện tập</h1>
        <div className="mb-8">
          <p className="text-xl mb-2">
            Số câu đúng: {score} / {totalQuestions}
          </p>
          <p className="text-lg text-gray-600">
            Tỷ lệ đúng: {((score / totalQuestions) * 100).toFixed(1)}%
          </p>
        </div>
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Luyện tập lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Luyện Tập Từ Vựng</h1>
        <div className="flex justify-center gap-4 text-gray-600">
          <p>
            Câu hỏi: {currentIndex + 1} / {totalQuestions}
          </p>
          <p>Điểm: {score}</p>
        </div>
      </div>

      <PracticeExercise
        vocabulary={practiceWords[currentIndex]}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
