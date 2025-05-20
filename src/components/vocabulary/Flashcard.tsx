import React, { useState } from "react";
import { Vocabulary } from "@/types/vocabulary";

interface FlashcardProps {
  vocabulary: Vocabulary;
  onNext: () => void;
  onMarkAsLearned: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
  vocabulary,
  onNext,
  onMarkAsLearned,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative h-64 cursor-pointer transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={handleFlip}
      >
        {/* Mặt trước */}
        <div
          className={`absolute w-full h-full backface-hidden p-6 bg-white rounded-xl shadow-lg ${
            isFlipped ? "hidden" : "block"
          }`}
        >
          <h2 className="text-3xl font-bold text-center mb-4">
            {vocabulary.german}
          </h2>
          <p className="text-gray-600 text-center mb-2">
            {vocabulary.pronunciation}
          </p>
          <p className="text-sm text-gray-500 text-center">Nhấp để xem nghĩa</p>
        </div>

        {/* Mặt sau */}
        <div
          className={`absolute w-full h-full backface-hidden p-6 bg-white rounded-xl shadow-lg rotate-y-180 ${
            isFlipped ? "block" : "hidden"
          }`}
        >
          <h3 className="text-2xl font-bold text-center mb-4">
            {vocabulary.vietnamese}
          </h3>
          {vocabulary.example && (
            <p className="text-gray-600 text-center mb-4 italic">
              {vocabulary.example}
            </p>
          )}
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsLearned();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Đã học
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
