"use client";

import { exercises } from "@/data/exercises";
import Link from "next/link";

export default function ExercisesPage() {
  // Lấy danh sách các trình độ duy nhất
  const levels = Array.from(new Set(exercises.map((ex) => ex.level)));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Danh sách bài tập</h1>

      <div className="space-y-8">
        {levels.map((level) => (
          <div key={level} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Trình độ {level}</h2>
            <div className="grid gap-4">
              {exercises
                .filter((ex) => ex.level === level)
                .map((exercise) => (
                  <Link
                    key={exercise.id}
                    href={`/exercises/${exercise.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-lg font-medium">{exercise.title}</h3>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
