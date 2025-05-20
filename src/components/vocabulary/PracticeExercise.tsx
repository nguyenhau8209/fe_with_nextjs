import React, { useState, useEffect } from "react";
import { Vocabulary } from "@/types/vocabulary";
import { sampleVocabulary } from "@/data/sample-vocabulary";

interface PracticeExerciseProps {
  vocabulary: Vocabulary;
  onAnswer: (isCorrect: boolean) => void;
}

type ExerciseType = "multiple-choice" | "fill-in-blank";

const PracticeExercise: React.FC<PracticeExerciseProps> = ({
  vocabulary,
  onAnswer,
}) => {
  const [exerciseType, setExerciseType] =
    useState<ExerciseType>("multiple-choice");
  const [options, setOptions] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (!vocabulary) return;

    // Tạo các lựa chọn cho bài tập trắc nghiệm
    if (exerciseType === "multiple-choice") {
      const allOptions = [vocabulary.vietnamese];
      // Thêm 3 đáp án ngẫu nhiên khác
      const otherWords = sampleVocabulary
        .filter((word) => word.id !== vocabulary.id)
        .map((word) => word.vietnamese);
      const shuffled = otherWords.sort(() => 0.5 - Math.random());
      allOptions.push(...shuffled.slice(0, 3));
      setOptions(allOptions.sort(() => 0.5 - Math.random()));
    }
  }, [vocabulary, exerciseType]);

  const handleSubmit = () => {
    if (!userAnswer || !vocabulary) return;

    const isCorrect = userAnswer === vocabulary.vietnamese;
    setIsAnswered(true);
    onAnswer(isCorrect);

    // Reset sau 1.5 giây
    setTimeout(() => {
      setUserAnswer("");
      setIsAnswered(false);
      setExerciseType(
        Math.random() > 0.5 ? "multiple-choice" : "fill-in-blank"
      );
    }, 1500);
  };

  if (!vocabulary) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{vocabulary.german}</h3>
        <p className="text-gray-600">{vocabulary.pronunciation}</p>
      </div>

      {exerciseType === "multiple-choice" ? (
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setUserAnswer(option)}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                userAnswer === option
                  ? "bg-blue-100 border-blue-500"
                  : "hover:bg-gray-50"
              } ${
                isAnswered
                  ? option === vocabulary.vietnamese
                    ? "bg-green-100 border-green-500"
                    : userAnswer === option
                    ? "bg-red-100 border-red-500"
                    : ""
                  : ""
              }`}
              disabled={isAnswered}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Nhập nghĩa tiếng Việt..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAnswered}
          />
          {vocabulary.example && (
            <p className="text-sm text-gray-600 italic">
              Gợi ý: {vocabulary.example}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!userAnswer || isAnswered}
        className={`mt-6 w-full py-3 rounded-lg text-white font-medium ${
          !userAnswer || isAnswered
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isAnswered ? "Đang chuyển..." : "Kiểm tra"}
      </button>
    </div>
  );
};

export default PracticeExercise;
