"use client";

export const runtime = "edge";

import { exercises, videoExercises } from "@/data/exercises";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { CreateLessonForm } from "@/components/CreateLessonForm";
import { getLessons } from "@/utils/lessonStorage";

const levelNames: { [key: string]: string } = {
  a1: "A1 - Cơ bản",
  a2: "A2 - Sơ cấp",
  b1: "B1 - Trung cấp",
  b2: "B2 - Trung cao cấp",
  c1: "C1 - Cao cấp",
  c2: "C2 - Thành thạo",
};

export default function LevelPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = use(params);
  const levelIdLower = levelId.toLowerCase();
  const [showType, setShowType] = useState<"audio" | "video" | null>(null);
  const [customLessons, setCustomLessons] = useState(() =>
    getLessons().filter(
      (lesson) =>
        lesson.level?.toLowerCase() === levelIdLower && !lesson.isSystemLesson
    )
  );
  const [showModal, setShowModal] = useState(false);

  if (!levelNames[levelIdLower]) {
    notFound();
  }

  const levelExercises = exercises.filter(
    (ex) => ex.level.toLowerCase() === levelIdLower
  );
  const levelVideoExercises = videoExercises.filter(
    (ex) => ex.level.toLowerCase() === levelIdLower
  );

  const refreshCustomLessons = () => {
    setCustomLessons(
      getLessons().filter(
        (lesson) =>
          lesson.level?.toLowerCase() === levelIdLower && !lesson.isSystemLesson
      )
    );
  };

  const allVideoLessons = [...levelVideoExercises, ...customLessons];

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
          <h1 className="text-3xl font-bold">{levelNames[levelIdLower]}</h1>
        </div>

        {!showType && (
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
              onClick={() => setShowType("audio")}
            >
              Nghe chép audio
            </button>
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-lg font-semibold"
              onClick={() => setShowType("video")}
            >
              Nghe chép video YouTube
            </button>
          </div>
        )}

        {showType === "audio" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Danh sách bài tập audio</h2>
            <div className="grid gap-4">
              {levelExercises.length === 0 && (
                <p>Chưa có bài tập audio cho trình độ này.</p>
              )}
              {levelExercises.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/exercises/${exercise.id}`}
                  className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold">{exercise.title}</h3>
                </Link>
              ))}
            </div>
            <button
              className="mt-6 text-blue-600 hover:text-blue-800"
              onClick={() => setShowType(null)}
            >
              ← Quay lại lựa chọn
            </button>
          </div>
        )}

        {showType === "video" && (
          <div>
            <button
              className="mb-6 text-blue-600 hover:text-blue-800"
              onClick={() => setShowType(null)}
            >
              ← Quay lại lựa chọn
            </button>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold mb-4">
                Danh sách bài tập video YouTube
              </h2>
              <button
                onClick={refreshCustomLessons}
                className="ml-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Làm mới danh sách
              </button>
            </div>
            <div className="mb-6">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 font-semibold"
              >
                Tạo bài học
              </button>
              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-black"
                      onClick={() => setShowModal(false)}
                    >
                      ×
                    </button>
                    <CreateLessonForm
                      level={levelIdLower}
                      onSuccess={() => {
                        setShowModal(false);
                        refreshCustomLessons();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-4">
              {allVideoLessons.length === 0 && (
                <p>Chưa có bài tập video cho trình độ này.</p>
              )}
              {allVideoLessons.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/videos/${exercise.id}`}
                  className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold">{exercise.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
