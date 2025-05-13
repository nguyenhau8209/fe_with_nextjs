"use client";
import { useState } from "react";
import { extractVideoId, checkSubtitles } from "../utils/youtube";
import { saveLesson } from "../utils/lessonStorage";
import { CreateLessonInput } from "../types/lesson";

async function fetchYoutubeTitle(videoId: string): Promise<string> {
  try {
    const apiKey =
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ||
      (typeof window !== "undefined"
        ? (window as any).env?.NEXT_PUBLIC_YOUTUBE_API_KEY
        : undefined);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.title;
    }
    throw new Error("Không tìm thấy tiêu đề video");
  } catch (error) {
    throw new Error("Không lấy được tiêu đề video");
  }
}

interface CreateLessonFormProps {
  level: string;
  onSuccess?: () => void;
}

export const CreateLessonForm = ({
  level,
  onSuccess,
}: CreateLessonFormProps) => {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      const subtitles = await checkSubtitles(videoId, language);
      if (subtitles.length === 0) {
        throw new Error(
          `No suitable subtitles found (${
            language === "en" ? "English" : "German"
          } required)`
        );
      }

      const title = await fetchYoutubeTitle(videoId);
      const lessonInput: CreateLessonInput & {
        level: string;
        language: string;
      } = {
        title,
        youtubeUrl: url,
        level,
        language,
      };

      saveLesson(lessonInput, subtitles);
      setUrl("");
      setSuccess("Tạo bài học thành công!");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700"
        >
          YouTube URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
      </div>
      <div>
        <label
          htmlFor="language"
          className="block text-sm font-medium text-gray-700"
        >
          Ngôn ngữ phụ đề
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="en">Tiếng Anh</option>
          <option value="de">Tiếng Đức</option>
        </select>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Đang tạo..." : "Tạo bài học"}
      </button>
    </form>
  );
};
