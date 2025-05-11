"use client";

import { exercises } from "@/data/exercises";
import DictationExercise from "@/components/DictationExercise";
import { notFound } from "next/navigation";
import Link from "next/link";

export default function ExercisePage({ params }: { params: { id: string } }) {
  const exercise = exercises.find((ex) => ex.id === params.id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href={`/levels/${exercise.level.toLowerCase()}`}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Quay lại danh sách bài tập
          </Link>
        </div>
        <DictationExercise
          title={exercise.title}
          level={exercise.level}
          audioUrl={exercise.audioUrl}
          script={exercise.script}
        />
      </div>
    </div>
  );
}
