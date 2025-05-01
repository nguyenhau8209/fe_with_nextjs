"use client";

import React, { useState, useRef, useEffect } from "react";
import "react-h5-audio-player/lib/styles.css";
import { ScriptData } from "@/data/exercises";

interface DictationExerciseProps {
  title: string;
  level: string;
  audioUrl: string;
  script: ScriptData[];
}

// Hàm format thời gian từ giây sang định dạng HH:MM:SS.mmm
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
}

export default function DictationExercise({
  title,
  level,
  audioUrl,
  script,
}: DictationExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showTranslation, setShowTranslation] = useState(true);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  console.log("script: ", script);
  // Lấy câu hiện tại
  const currentSentence = script[currentIndex];

  // Xử lý khi audio được tải
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsAudioLoaded(true);
      setAudioError(null);
    };

    const handleError = (e: Event) => {
      setAudioError("Không thể tải file audio. Vui lòng thử lại sau.");
      console.error("Audio error:", e);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // Xử lý khi audio kết thúc câu hiện tại
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAudioLoaded) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      if (currentSentence && currentTime >= currentSentence.endTime) {
        audio.pause();
        setIsPlaying(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [currentSentence, isAudioLoaded]);

  const setAudioTime = (time: number) => {
    const audio = audioRef.current;
    if (!audio || !isAudioLoaded || !Number.isFinite(time)) return;

    try {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration));
    } catch (error) {
      console.error("Error setting audio time:", error);
      setAudioError("Không thể điều chỉnh thời gian audio. Vui lòng thử lại.");
    }
  };

  const handleNext = () => {
    if (currentIndex < script.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      const nextSentence = script[currentIndex + 1];
      if (nextSentence) {
        setAudioTime(nextSentence.startTime);
        audioRef.current?.play().catch(console.error);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserInput("");
      const prevSentence = script[currentIndex - 1];
      if (prevSentence) {
        setAudioTime(prevSentence.startTime);
        audioRef.current?.play().catch(console.error);
      }
    }
  };

  const playCurrentSentence = () => {
    if (!currentSentence) return;
    setAudioTime(currentSentence.startTime);
    audioRef.current?.play().catch(console.error);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <div className="text-sm text-gray-600">Cấp độ: {level}</div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            ← Trước
          </button>
          <span className="text-sm font-medium">
            Câu {currentIndex + 1} / {script.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === script.length - 1}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Tiếp →
          </button>
        </div>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showTranslation ? "Ẩn bản dịch" : "Hiện bản dịch"}
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        {audioError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {audioError}
          </div>
        )}

        <div className="mb-4">
          <audio ref={audioRef} controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Trình duyệt của bạn không hỗ trợ phát audio.
          </audio>
        </div>

        <div className="relative">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Gõ những gì bạn nghe được..."
            className="w-full h-32 p-4 bg-gray-800 text-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={playCurrentSentence}
            disabled={!isAudioLoaded || isPlaying}
            className="absolute bottom-4 right-4 text-gray-400 hover:text-white disabled:opacity-50"
            title="Phát lại câu hiện tại"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>
      </div>

      {showTranslation && currentSentence && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-white">{currentSentence.text}</div>
        </div>
      )}
    </div>
  );
}
