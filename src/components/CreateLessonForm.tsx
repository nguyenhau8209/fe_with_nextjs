"use client";
import { useState } from "react";
import { extractVideoId, checkSubtitles } from "../utils/youtube";
import { saveLesson } from "../utils/lessonStorage";
import { CreateLessonInput } from "../types/lesson";
import SubtitleEditor, { EditableSubtitle } from "./SubtitleEditor";
import VideoSubtitleEditor from "./VideoSubtitleEditor";

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
    throw new Error("Video title not found");
  } catch (error) {
    throw new Error("Failed to fetch video title");
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
  const [subtitlesForTiming, setSubtitlesForTiming] = useState<
    EditableSubtitle[] | null
  >(null);

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

      const rawRes = await fetch(
        `/api/youtube-captions?videoId=${videoId}&lang=${language}`
      );
      if (!rawRes.ok)
        throw new Error("Failed to fetch raw subtitles from YouTube");
      const rawData = await rawRes.json();
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

  const handleConfirmSubtitles = async (
    editedSubtitles: EditableSubtitle[]
  ) => {
    setLoading(true);
    setError("");

    try {
      const processRes = await fetch("/api/process-subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtitles: editedSubtitles }),
      });
      const processedData = await processRes.json();
      if (!processRes.ok || !processedData.subtitles) {
        throw new Error(processedData.error || "Subtitle processing failed");
      }
      const processedSubtitles = processedData.subtitles;

      setSubtitlesForTiming(processedSubtitles);
      setShowModal(false);
    } catch (err) {
      console.error("Error processing subtitles:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSave = async (finalSubtitles: EditableSubtitle[]) => {
    if (!pendingLesson) return;
    setLoading(true);
    setError("");
    try {
      const finalLessonInput = { ...pendingLesson.lessonInput };
      saveLesson(finalLessonInput, [], finalSubtitles);

      setSuccess("Lesson created successfully!");
      setSubtitlesForTiming(null);
      setUrl("");
      setPendingLesson(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const videoId = extractVideoId(url);

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
            Subtitle Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="de">German</option>
            <option value="en">English</option>
          </select>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Create Lesson"}
        </button>
      </form>

      {showModal && pendingLesson && rawSubtitles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 w-screen h-screen p-0 m-0">
          <div className="bg-white w-full h-full max-w-full max-h-full rounded-none shadow-lg p-8 relative flex flex-col justify-center">
            <button
              className="absolute top-4 right-6 text-gray-500 hover:text-red-500 text-3xl z-10"
              onClick={() => setShowModal(false)}
              title="Close"
            >
              ×
            </button>
            <div className="flex-1 flex flex-col justify-center">
              <SubtitleEditor
                initialSubtitles={pendingLesson.subtitles}
                rawSubtitles={rawSubtitles}
                onSave={handleConfirmSubtitles}
              />
            </div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                <span className="text-indigo-600 font-semibold">
                  Processing subtitles...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {subtitlesForTiming && videoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 w-screen h-screen p-0 m-0">
          <div className="bg-white w-full h-full max-w-full max-h-full rounded-none shadow-lg p-8 relative flex flex-col justify-center">
            <button
              className="absolute top-4 right-6 text-gray-500 hover:text-red-500 text-3xl z-10"
              onClick={() => setSubtitlesForTiming(null)}
              title="Close"
            >
              ×
            </button>
            <VideoSubtitleEditor
              youtubeVideoId={videoId}
              subtitles={subtitlesForTiming}
              onSubtitlesChange={handleFinalSave}
            />
          </div>
        </div>
      )}

      {loading && !showModal && !subtitlesForTiming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 w-screen h-screen p-0 m-0">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 text-center flex flex-col items-center">
            <span className="text-indigo-600 text-lg font-semibold mb-2">
              Processing...
            </span>
            <span className="text-gray-500 text-sm">Please wait.</span>
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      )}
    </>
  );
};
