"use client";

import { videoExercises } from "@/data/exercises";
import VideoExercise from "@/components/VideoExercise";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import {
  getLessons,
  getSubtitlesForVideo,
  saveSubtitles,
  clearSubtitlesForVideo,
  clearAllSubtitles,
  getDetailedSubtitlesForLesson,
} from "@/utils/lessonStorage";
import { Subtitle as VideoSubtitle } from "@/types/video";

export default function VideoExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  let exercise = videoExercises.find((ex) => ex.id === id);
  if (!exercise) {
    // Tìm trong localStorage nếu không có trong hệ thống
    const custom = getLessons().find((ex) => ex.id === id);

    if (custom) {
      // Map lại cho phù hợp với props của VideoExercise
      exercise = {
        id: custom.id,
        title: custom.title,
        level: custom.level,
        language: custom.language,
        videoId: extractVideoId(custom.youtubeUrl) || "",
        startTime: 0,
        endTime: 0,
        subtitles: [],
      };
    }
  }

  const [subtitles, setSubtitles] = useState<VideoSubtitle[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtitleSource, setSubtitleSource] = useState<"cache" | "api" | null>(
    null
  );

  // Kiểm tra phụ đề trong localStorage khi component mount
  useEffect(() => {
    if (exercise?.videoId) {
      const cachedSubtitles = getSubtitlesForVideo(exercise.videoId);
      console.log("cachedSubtitles", cachedSubtitles);
      if (cachedSubtitles) {
        setSubtitles(cachedSubtitles);
        setSubtitleSource("cache");
      }
    }
  }, [exercise?.videoId]);

  if (!exercise) {
    notFound();
  }

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      // Kiểm tra xem đã có phụ đề trong localStorage chưa
      const cachedSubtitles = getDetailedSubtitlesForLesson(exercise?.id);
      console.log("cachedSubtitles", cachedSubtitles);
      if (cachedSubtitles) {
        // Nếu có phụ đề trong cache, sử dụng luôn
        setSubtitles(cachedSubtitles);
        setSubtitleSource("cache");
        setLoading(false);
        return;
      }

      // Nếu chưa có, gọi API để lấy phụ đề
      const res = await fetch(
        `/api/youtube-captions?videoId=${exercise.videoId}&lang=${
          exercise.language || "en"
        }`
      );

      if (!res.ok) throw new Error("Không thể tải phụ đề từ YouTube");

      const rawData = await res.json();
      console.log("rawData Youtube", rawData);

      // Chuyển đổi dữ liệu để phù hợp với phát âm thanh
      const formattedData = rawData.map((item) => ({
        ...item,
        startTime: parseFloat(item.start),
        endTime: parseFloat(item.end),
        text: item.text,
      }));
      console.log("formattedData", formattedData);

      // Lưu phụ đề đã được chuyển đổi vào localStorage để sử dụng lần sau
      saveSubtitles(exercise.videoId, formattedData);

      // Đặt phụ đề đã được chuyển đổi cho component sử dụng
      setSubtitles(formattedData);
      setSubtitleSource("api");
    } catch (e: any) {
      setError(e.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    clearSubtitlesForVideo(exercise.videoId);
    setSubtitles(null);
    setSubtitleSource(null);
  };

  const handleClearAllCache = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả cache phụ đề?")) {
      clearAllSubtitles();
      setSubtitles(null);
      setSubtitleSource(null);
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
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Phụ đề đã được tải từ{" "}
                  {subtitleSource === "cache" ? "bộ nhớ cache" : "YouTube"}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearCache}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Xóa cache
                </button>
                <button
                  onClick={handleClearAllCache}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                >
                  Xóa tất cả cache
                </button>
                <button
                  onClick={handleStart}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  disabled={loading}
                >
                  {loading ? "Đang tải..." : "Tải lại phụ đề"}
                </button>
              </div>
            </div>
            <VideoExercise
              title={exercise.title}
              level={exercise.level}
              videoId={exercise.videoId}
              startTime={exercise.startTime}
              endTime={exercise.endTime}
              subtitles={subtitles}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
