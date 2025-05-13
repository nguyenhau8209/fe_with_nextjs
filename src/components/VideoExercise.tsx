"use client";

import { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import Settings from "./Settings";
import { VideoExerciseProps, Settings as SettingsType } from "../types/video";
import { SETTINGS_KEY, YOUTUBE_PLAYER_STATES } from "../constants/video";
import {
  checkAnswer,
  getNextSubtitle,
  getPreviousSubtitle,
} from "../utils/video";

export default function VideoExercise({
  title,
  level,
  videoId,
  startTime = 0,
  endTime,
  subtitles,
}: VideoExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const playerRef = useRef<any>(null);
  const currentSubtitle = subtitles[currentIndex];

  // Reset input and hide answer when changing subtitle
  useEffect(() => {
    setUserInput("");
    setShowAnswer(false);
  }, [currentIndex]);

  // Load settings
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, [showSettings]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!settings) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
        if (playerRef.current) {
          playCurrentSubtitle();
        }
      }

      // Play/Pause Key
      if (
        (settings.playPauseKey === "` (backtick)" && e.key === "`") ||
        (settings.playPauseKey === "Space" && e.code === "Space") ||
        (settings.playPauseKey === "Tab" && e.key === "Tab")
      ) {
        e.preventDefault();
        const videoPlayer = playerRef.current;
        if (!videoPlayer) return;

        const playerState = videoPlayer.getPlayerState();
        if (playerState === YOUTUBE_PLAYER_STATES.PLAYING) {
          videoPlayer.pauseVideo();
        } else {
          videoPlayer.playVideo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settings, currentIndex, subtitles]);

  // Auto pause when subtitle ends
  useEffect(() => {
    if (!playerRef.current) return;
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player || !isPlaying) return;
      const t = player.getCurrentTime();
      if (t >= currentSubtitle.endTime) {
        player.pauseVideo();
        setIsPlaying(false);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying, currentSubtitle]);

  const playCurrentSubtitle = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(currentSubtitle.startTime);
    playerRef.current.playVideo();
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserInput("");
      const prevSentence = getPreviousSubtitle(currentIndex, subtitles);
      if (prevSentence) {
        playerRef.current?.seekTo(prevSentence.startTime);
        playerRef.current?.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < subtitles.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      const nextSentence = getNextSubtitle(currentIndex, subtitles);
      if (nextSentence) {
        playerRef.current?.seekTo(nextSentence.startTime);
        playerRef.current?.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleSubmit = () => {
    if (checkAnswer(userInput, currentSubtitle.text)) {
      handleNext();
    } else {
      setShowAnswer(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    setShowAnswer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReady = (event: any) => {
    playerRef.current = event.target;
  };

  const handleStateChange = (event: any) => {
    setIsPlaying(event.data === YOUTUBE_PLAYER_STATES.PLAYING);
  };

  const opts = {
    height: "360",
    width: "640",
    playerVars: {
      start: startTime,
      end: endTime,
      autoplay: 0,
    },
  };

  return (
    <div className="max-w-7xl mx-auto bg-[#181A20] p-8 rounded-xl shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-white">{title}</h1>
        <div className="text-sm text-gray-400">Trình độ: {level}</div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="flex-1">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={handleReady}
            onStateChange={handleStateChange}
            className="w-full aspect-video rounded-xl overflow-hidden"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50"
              >
                ←
              </button>
              <span className="text-white text-lg font-semibold">
                {currentIndex + 1} / {subtitles.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === subtitles.length - 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50"
              >
                →
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-sm text-blue-400 hover:text-blue-200"
              >
                {showTranslation ? "Ẩn bản dịch" : "Hiện bản dịch"}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                title="Cài đặt"
              >
                ⚙
              </button>
            </div>
          </div>
          {showSettings && <Settings onClose={() => setShowSettings(false)} />}
          <div className="bg-[#23272F] rounded-xl p-6 mb-6 flex-1 flex flex-col">
            <div className="relative flex-1">
              <textarea
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Gõ những gì bạn nghe được..."
                className="w-full h-32 p-4 bg-[#181A20] text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-base"
              />
              <button
                onClick={playCurrentSubtitle}
                disabled={isPlaying}
                className="absolute bottom-4 right-4 text-gray-400 hover:text-white disabled:opacity-50 text-2xl"
                title="Phát lại câu hiện tại"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-semibold"
            >
              Kiểm tra
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === subtitles.length - 1}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-base font-semibold disabled:opacity-50"
            >
              Bỏ qua
            </button>
          </div>
          {showAnswer && currentSubtitle && (
            <div className="mt-2 p-4 bg-red-900/50 rounded-xl">
              <div className="text-white">
                <p className="font-bold mb-2">Đáp án đúng:</p>
                <p>{currentSubtitle.text}</p>
              </div>
            </div>
          )}
          {showTranslation && currentSubtitle && (
            <div className="bg-gray-800 rounded-xl p-6 mt-2">
              <div className="text-white">
                {currentSubtitle.translation || currentSubtitle.text}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
