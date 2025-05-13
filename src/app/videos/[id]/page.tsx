"use client";

import { videoExercises } from "@/data/exercises";
import VideoExercise from "@/components/VideoExercise";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState } from "react";
import YouTube from "react-youtube";

export default function VideoExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const exercise = videoExercises.find((ex) => ex.id === id);
  const [subtitles, setSubtitles] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!exercise) {
    notFound();
  }

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/youtube-captions?videoId=${exercise.videoId}&lang=en`
      );
      if (!res.ok) throw new Error("Không thể tải phụ đề từ YouTube");
      const data = await res.json();
      setSubtitles(data);
    } catch (e: any) {
      setError(e.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-8xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href={`/levels/${exercise.level.toLowerCase()}`}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Quay lại danh sách bài tập
          </Link>
        </div>
        {!subtitles && (
          <div className="flex flex-col items-center">
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? "Đang tải phụ đề..." : "Bắt đầu làm bài"}
            </button>
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>
        )}
        {subtitles && (
          <VideoExercise
            title={exercise.title}
            level={exercise.level}
            videoId={exercise.videoId}
            startTime={exercise.startTime}
            endTime={exercise.endTime}
            subtitles={subtitles}
          />
        )}
      </div>
    </div>
  );
}
