"use client";

import React, { useState, useRef, useEffect } from "react";
import "react-h5-audio-player/lib/styles.css";
import { ScriptData } from "@/data/exercises";
import Settings from "./Settings";

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

const SETTINGS_KEY = "dictation_settings";

export default function DictationExercise({
  title,
  level,
  audioUrl,
  script,
}: DictationExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<any>(null);

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
    const currentSentence = script[currentIndex];
    if (!currentSentence) return;
    const audio = audioRef.current;
    if (audio) {
      // Đặt thời gian về startTime của câu hiện tại
      audio.currentTime = currentSentence.startTime;

      // Phát audio
      audio.play().catch(console.error);

      // Tự động dừng khi đến endTime
      const checkEndTime = () => {
        if (audio.currentTime >= currentSentence.endTime) {
          audio.pause();
          audio.removeEventListener("timeupdate", checkEndTime);
        }
      };

      audio.addEventListener("timeupdate", checkEndTime);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (currentSentence) {
        const isCorrect =
          userInput.trim().toLowerCase() === currentSentence.text.toLowerCase();
        if (isCorrect) {
          handleNext();
        } else {
          setShowAnswer(true);
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    setShowAnswer(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) setSettings(JSON.parse(saved));
  }, [showSettings]);

  useEffect(() => {
    if (!settings) return;
    const handleKeyUp = (e: KeyboardEvent) => {
      // Replay Key
      if (
        (settings.replayKey === "Ctrl" &&
          e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey) ||
        (settings.replayKey === "Alt" &&
          e.altKey &&
          !e.ctrlKey &&
          !e.shiftKey) ||
        (settings.replayKey === "Shift" &&
          e.shiftKey &&
          !e.ctrlKey &&
          !e.altKey) ||
        (settings.replayKey === "Cmd" && (e.metaKey || e.key === "Meta"))
      ) {
        e.preventDefault();
        playCurrentSentence();
      }

      // Play/Pause Key
      if (
        (settings.playPauseKey === "` (backtick)" && e.key === "`") ||
        (settings.playPauseKey === "Space" && e.code === "Space") ||
        (settings.playPauseKey === "Tab" && e.key === "Tab")
      ) {
        e.preventDefault();
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [settings, isAudioLoaded, currentIndex, script]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-2">
        <button
          className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm sm:text-base transition-colors duration-200"
          onClick={() => setShowSettings(true)}
        >
          Cài đặt
        </button>
      </div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{title}</h1>
        <div className="text-xs sm:text-sm text-gray-600">Cấp độ: {level}</div>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm sm:text-base transition-colors duration-200"
          >
            ←
          </button>
          <button
            onClick={playCurrentSentence}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base transition-colors duration-200"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === script.length - 1}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm sm:text-base transition-colors duration-200"
          >
            →
          </button>
        </div>
        <div className="text-sm sm:text-base text-gray-600">
          Câu {currentIndex + 1}/{script.length}
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <textarea
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu bạn nghe được..."
          className="w-full h-24 sm:h-32 p-3 sm:p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none"
        />
      </div>

      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm sm:text-base transition-colors duration-200"
        >
          {showTranslation ? "Ẩn bản dịch" : "Xem bản dịch"}
        </button>
        {showTranslation && currentSentence?.translation && (
          <div className="mt-2 p-3 sm:p-4 bg-gray-100 rounded-lg text-sm sm:text-base">
            {currentSentence.translation}
          </div>
        )}
      </div>

      {showAnswer && currentSentence && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-100 rounded-lg">
          <p className="text-sm sm:text-base font-medium mb-1">Đáp án:</p>
          <p className="text-sm sm:text-base">{currentSentence.text}</p>
        </div>
      )}

      <audio ref={audioRef} src={audioUrl} className="hidden" />
      {audioError && (
        <div className="text-red-600 text-sm sm:text-base mb-4">
          {audioError}
        </div>
      )}
    </div>
  );
}
