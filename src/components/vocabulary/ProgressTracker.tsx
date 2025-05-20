/** @jsxImportSource react */
import React from "react";
import { UserProgress } from "@/types/vocabulary";

interface ProgressTrackerProps {
  progress: UserProgress[];
  totalWords: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  totalWords,
}) => {
  const masteredWords = progress.filter((p) => p.status === "mastered").length;
  const learningWords = progress.filter((p) => p.status === "learning").length;
  const difficultWords = progress.filter(
    (p) => p.status === "difficult"
  ).length;

  const getProgressPercentage = (count: number) => {
    return ((count / totalWords) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Tiến độ học tập</h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Đã học thuộc</span>
            <span className="font-medium">{masteredWords} từ</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${getProgressPercentage(masteredWords)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Đang học</span>
            <span className="font-medium">{learningWords} từ</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${getProgressPercentage(learningWords)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Từ khó</span>
            <span className="font-medium">{difficultWords} từ</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: `${getProgressPercentage(difficultWords)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tổng tiến độ</span>
          <span className="text-xl font-bold">
            {getProgressPercentage(masteredWords + learningWords)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
