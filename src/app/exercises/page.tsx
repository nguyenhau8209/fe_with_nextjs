"use client";

import { exercises } from "@/data/exercises";
import Link from "next/link";

export default function ExercisesPage() {
  // Lấy danh sách các trình độ duy nhất
  const levels = Array.from(new Set(exercises.map((ex) => ex.level)));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">
        Danh sách bài tập
      </h1>

      <div className="space-y-4 sm:space-y-8">
        {levels.map((level) => (
          <div key={level} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              Trình độ {level}
            </h2>
            <div className="grid gap-3 sm:gap-4">
              {exercises
                .filter((ex) => ex.level === level)
                .map((exercise) => (
                  <Link
                    key={exercise.id}
                    href={`/exercises/${exercise.id}`}
                    className="block p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1"
                  >
                    <h3 className="text-base sm:text-lg font-medium text-gray-800">
                      {exercise.title}
                    </h3>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
