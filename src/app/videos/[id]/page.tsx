// src/app/videos/[id]/page.tsx

"use client";

import { videoExercises } from "@/data/exercises";
import VideoExercise from "@/components/VideoExercise";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { Subtitle as VideoSubtitle } from "@/types/video";

// Định nghĩa một kiểu dữ liệu cho bài học để sử dụng nhất quán
interface LessonData {
  _id: string;
  id: string;
  title: string;
  level: string;
  language: string;
  videoId: string;
  startTime?: number;
  endTime?: number;
  subtitles: VideoSubtitle[];
}

export default function VideoExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  const [exercise, setExercise] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadLessonData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Kiểm tra xem có phải là bài học hệ thống không
        const systemExercise = videoExercises.find((ex) => ex.id === id);
        if (systemExercise) {
          // Đối với bài học hệ thống, chúng ta vẫn cần gọi API captions
          const res = await fetch(
            `/api/youtube-captions?videoId=${systemExercise.videoId}&lang=${
              systemExercise.language || "en"
            }`
          );
          if (!res.ok) throw new Error("Không thể tải phụ đề cho bài học hệ thống.");

          const rawData = await res.json();
          const formattedSubs = rawData.map((item: any) => ({
            text: item.text,
            startTime: parseFloat(item.start),
            endTime: parseFloat(item.end),
          }));

          // Đảm bảo thêm trường _id để phù hợp với kiểu LessonData
          setExercise({ ...systemExercise, _id: systemExercise.id, subtitles: formattedSubs });

        } else {
          // Nếu không phải, tải bài học từ database
          const res = await fetch(`/api/lessons/${id}`);
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || `Không tìm thấy bài học với ID: ${id}`);
          }
          const { data } = await res.json();
          
          // Chuyển đổi dữ liệu từ DB để khớp với props của component
          const lessonData: LessonData = {
            _id: data._id,
            id: data._id, // Dùng _id cho nhất quán
            title: data.title,
            level: data.level,
            language: data.language,
            videoId: extractVideoId(data.youtubeUrl) || "",
            subtitles: data.detailedSubtitles,
          };
          setExercise(lessonData);
        }
      } catch (e: any) {
        setError(e.message || "Lỗi không xác định khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-500">Đang tải bài học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Đã xảy ra lỗi!</strong>
          <span className="block sm:inline"> {error}</span>
          <br/>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

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
        
        <VideoExercise
          title={exercise.title}
          level={exercise.level}
          videoId={exercise.videoId}
          startTime={exercise.startTime}
          endTime={exercise.endTime}
          subtitles={exercise.subtitles}
          language={exercise.language}
        />
      </div>
    </div>
  );
}

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}