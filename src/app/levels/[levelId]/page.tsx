"use client";

import { exercises } from "@/data/exercises";
import Link from "next/link";
import { notFound } from "next/navigation";

const levelNames: { [key: string]: string } = {
  a1: "A1 - Cơ bản",
  a2: "A2 - Sơ cấp",
  b1: "B1 - Trung cấp",
  b2: "B2 - Trung cao cấp",
  c1: "C1 - Cao cấp",
  c2: "C2 - Thành thạo",
};

export default function LevelPage({ params }: { params: { levelId: string } }) {
  const levelId = params.levelId.toLowerCase();

  if (!levelNames[levelId]) {
    notFound();
  }

  const levelExercises = exercises.filter(
    (ex) => ex.level.toLowerCase() === levelId
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Quay lại danh sách trình độ
          </Link>
          <h1 className="text-3xl font-bold">{levelNames[levelId]}</h1>
        </div>

        <div className="grid gap-4">
          {levelExercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/exercises/${exercise.id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold">{exercise.title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
