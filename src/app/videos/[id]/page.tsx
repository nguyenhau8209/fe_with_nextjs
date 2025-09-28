"use client";

import { videoExercises } from "@/data/exercises";
import VideoExercise from "@/components/VideoExercise";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import {
  getLessons,
  getSubtitlesForVideo,
  getDetailedSubtitlesForLesson,
} from "@/utils/lessonStorage";
import { Subtitle as VideoSubtitle } from "@/types/video";
import { DetailedSubtitle } from "@/types/lesson";

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

  // Kiểm tra phụ đề trong localStorage khi component mount
  useEffect(() => {
    if (exercise?.id) {
      // Ưu tiên tìm trong detailedSubtitles của lesson trước
      const detailedSubtitles = getDetailedSubtitlesForLesson(exercise.id);
      if (detailedSubtitles) {
        // Convert DetailedSubtitle[] to VideoSubtitle[]
        const videoSubtitles: VideoSubtitle[] = detailedSubtitles.map(sub => ({
          text: sub.text,
          startTime: sub.startTime,
          endTime: sub.endTime,
        }));
        setSubtitles(videoSubtitles);
        return;
      }

      // Nếu không có, thử tìm trong cache phụ đề cũ
      if (exercise?.videoId) {
        const cachedSubtitles = getSubtitlesForVideo(exercise.videoId);
        if (cachedSubtitles) {
          setSubtitles(cachedSubtitles);
        }
      }
    }
  }, [exercise?.id, exercise?.videoId]);

  if (!exercise) {
    notFound();
  }

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

        {/* Hiển thị VideoExercise component với tất cả logic */}
        <VideoExercise
          title={exercise.title}
          level={exercise.level}
          videoId={exercise.videoId}
          startTime={exercise.startTime}
          endTime={exercise.endTime}
          subtitles={subtitles || []}
          lessonId={exercise.id}
          language={exercise.language}
        />
      </div>
    </div>
  );
}

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
