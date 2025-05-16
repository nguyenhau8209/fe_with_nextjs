"use client";

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
  const [showDevModal, setShowDevModal] = useState(false);

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
    <div className="min-h-screen bg-gray-100 py-4 sm:py-6 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-2 sm:mb-4 inline-block text-sm sm:text-base"
          >
            ← Quay lại danh sách trình độ
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {levelNames[levelIdLower]}
          </h1>
        </div>

        {!showType && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base sm:text-lg font-semibold transition-colors duration-200"
              onClick={() => setShowDevModal(true)}
            >
              Nghe chép audio
            </button>
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-base sm:text-lg font-semibold transition-colors duration-200"
              onClick={() => setShowType("video")}
            >
              Nghe chép video YouTube
            </button>
          </div>
        )}

        {showDevModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                onClick={() => setShowDevModal(false)}
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-4">
                Tính năng đang phát triển
              </h3>
              <p className="text-gray-600 mb-4">
                Tính năng nghe chép audio đang trong quá trình phát triển. Chúng
                tôi sẽ thông báo khi tính năng này sẵn sàng.
              </p>
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                onClick={() => setShowDevModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {showType === "video" && (
          <div>
            <button
              className="mb-4 sm:mb-6 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
              onClick={() => setShowType(null)}
            >
              ← Quay lại lựa chọn
            </button>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Danh sách bài tập video YouTube
              </h2>
              <button
                onClick={refreshCustomLessons}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm transition-colors duration-200"
              >
                Làm mới danh sách
              </button>
            </div>
            <div className="my-4 sm:my-6">
              <button
                onClick={() => setShowModal(true)}
                className="px-3 sm:px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 font-semibold text-sm sm:text-base transition-colors duration-200"
              >
                Tạo bài học
              </button>
              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-lg relative">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
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
            <div className="grid gap-3 sm:gap-4">
              {allVideoLessons.length === 0 && (
                <p className="text-gray-600">
                  Chưa có bài tập video cho trình độ này.
                </p>
              )}
              {allVideoLessons.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/videos/${exercise.id}`}
                  className="block bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {exercise.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
