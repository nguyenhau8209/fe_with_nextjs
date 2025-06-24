"use client";
import { useState } from "react";
import { extractVideoId, checkSubtitles } from "../utils/youtube";
import { saveLesson } from "../utils/lessonStorage";
import { CreateLessonInput } from "../types/lesson";
import SubtitleEditor, { EditableSubtitle } from "./SubtitleEditor";

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
  const [language, setLanguage] = useState("de");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pendingLesson, setPendingLesson] = useState<{
    lessonInput: CreateLessonInput & { level: string; language: string };
    subtitles: EditableSubtitle[];
  } | null>(null);
  const [rawSubtitles, setRawSubtitles] = useState<EditableSubtitle[] | null>(
    null
  );

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

      // Lấy phụ đề gốc (raw captions)
      const rawRes = await fetch(
        `/api/youtube-captions?videoId=${videoId}&lang=${language}`
      );
      if (!rawRes.ok) throw new Error("Không lấy được phụ đề gốc từ YouTube");
      const rawData = await rawRes.json();
      // Chuyển đổi sang EditableSubtitle
      const rawSubs: EditableSubtitle[] = rawData.map((s: any) => ({
        text: s.text,
        startTime: s.start ?? s.startTime ?? 0,
        endTime: s.end ?? s.endTime ?? 0,
      }));
      setRawSubtitles(rawSubs);

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

      setPendingLesson({
        lessonInput,
        subtitles: subtitles.map((s: any) => ({
          text: s.text,
          startTime: s.startTime ?? s.start ?? 0,
          endTime: s.endTime ?? s.end ?? 0,
        })),
      });
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubtitles = async (editedSubtitles: EditableSubtitle[]) => {
    if (!pendingLesson || !rawSubtitles) return;
    setLoading(true);
    setError("");
    try {
      // Đảm bảo tất cả phụ đề đều được bao gồm
      // Nếu có phụ đề nào bị thiếu, lấy từ rawSubtitles
      const completeSubtitles = editedSubtitles.map((edited, index) => {
        if (edited && edited.text && edited.text.trim() !== "") {
          return edited;
        } else {
          // Nếu phụ đề này bị trống hoặc không tồn tại, lấy từ rawSubtitles
          return (
            rawSubtitles[index] || {
              text: "",
              startTime: 0,
              endTime: 0,
            }
          );
        }
      });

      // Lọc bỏ các phần tử null/undefined và đảm bảo có đủ phụ đề
      const filteredSubtitles = completeSubtitles.filter(Boolean);

      console.log("Complete subtitles to process:", filteredSubtitles);

      // Gửi phụ đề đã chỉnh sửa lên API để xử lý tự động
      const res = await fetch("/api/process-subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtitles: filteredSubtitles }),
      });
      const data = await res.json();
      console.log("data process-subtitles", data);
      if (!res.ok) throw new Error(data.error || "Xử lý phụ đề thất bại");

      // Lưu kết quả đã xử lý vào database/localStorage
      saveLesson(pendingLesson.lessonInput, [], data.subtitles);
      setSuccess("Tạo bài học thành công!");
      setShowModal(false);
      setUrl("");
      setPendingLesson(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            <option value="de">Tiếng Đức</option>
            <option value="en">Tiếng Anh</option>
          </select>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Tạo bài học"}
        </button>
      </form>

      {showModal && pendingLesson && rawSubtitles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 w-screen h-screen p-0 m-0">
          <div className="bg-white w-full h-full max-w-full max-h-full rounded-none shadow-lg p-8 relative flex flex-col justify-center">
            <button
              className="absolute top-4 right-6 text-gray-500 hover:text-red-500 text-3xl z-10"
              onClick={() => setShowModal(false)}
              title="Đóng"
            >
              ×
            </button>
            <div className="flex-1 flex flex-col justify-center">
              <SubtitleEditor
                initialSubtitles={pendingLesson.subtitles}
                rawSubtitles={rawSubtitles}
                onSave={handleSaveSubtitles}
              />
            </div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                <span className="text-indigo-600 font-semibold">
                  Đang xử lý phụ đề...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
