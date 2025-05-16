"use client";

import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import Settings from "./Settings";
import { VideoExerciseProps, Settings as SettingsType } from "../types/video";
import { SETTINGS_KEY, YOUTUBE_PLAYER_STATES } from "../constants/video";
import {
  checkAnswer,
  getNextSubtitle,
  getPreviousSubtitle,
} from "../utils/video";

declare global {
  namespace YT {
    interface Player {
      getPlayerState(): number;
      pauseVideo(): void;
      playVideo(): void;
      seekTo(seconds: number): void;
      getCurrentTime(): number;
    }
    interface PlayerEvent {
      target: Player;
    }
    interface OnStateChangeEvent {
      data: number;
    }
  }
}

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
  const [videoSize, setVideoSize] = useState<"normal" | "large">("normal");
  const [showVideo, setShowVideo] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
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

  const handleReady = (event: YT.PlayerEvent) => {
    playerRef.current = event.target;
  };

  const handleStateChange = (event: YT.OnStateChangeEvent) => {
    setIsPlaying(event.data === YOUTUBE_PLAYER_STATES.PLAYING);
  };

  const opts = {
    height: videoSize === "normal" ? "360" : "480",
    width: videoSize === "normal" ? "640" : "854",
    playerVars: {
      start: startTime,
      end: endTime,
      autoplay: 0,
    },
  };

  return (
    <div className="max-w-7xl mx-auto bg-[#181A20] p-4 sm:p-6 md:p-8 rounded-xl shadow-lg">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">
          {title}
        </h1>
        <div className="text-xs sm:text-sm text-gray-400">
          Trình độ: {level}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 w-full">
        <div className={`flex-1 ${!showVideo && "hidden"}`}>
          <div className="relative">
            <YouTube
              videoId={videoId}
              opts={opts}
              onReady={handleReady}
              onStateChange={handleStateChange}
              className="w-full aspect-video rounded-xl overflow-hidden"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() =>
                  setVideoSize(videoSize === "normal" ? "large" : "normal")
                }
                className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs sm:text-sm transition-colors duration-200"
                title={videoSize === "normal" ? "Phóng to" : "Thu nhỏ"}
              >
                {videoSize === "normal" ? "⤢" : "⤡"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 text-sm sm:text-base transition-colors duration-200"
              >
                ←
              </button>
              <span className="text-white text-sm sm:text-lg font-semibold">
                {currentIndex + 1} / {subtitles.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === subtitles.length - 1}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 text-sm sm:text-base transition-colors duration-200"
              >
                →
              </button>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs sm:text-sm transition-colors duration-200"
            >
              Cài đặt
            </button>
          </div>
          {showSettings && <Settings onClose={() => setShowSettings(false)} />}
          <div className="mb-3 sm:mb-4">
            <textarea
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu bạn nghe được..."
              className="w-full h-24 sm:h-32 p-3 sm:p-4 bg-gray-800 text-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm sm:text-base transition-colors duration-200"
            >
              {showTranslation ? "Ẩn bản dịch" : "Xem bản dịch"}
            </button>
            {showTranslation && currentSubtitle?.translation && (
              <div className="mt-2 p-3 sm:p-4 bg-gray-800 rounded-lg text-sm sm:text-base text-white">
                {currentSubtitle.translation}
              </div>
            )}
          </div>
          {showAnswer && currentSubtitle && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-yellow-900/50 rounded-lg">
              <p className="text-sm sm:text-base font-medium mb-1 text-white">
                Đáp án:
              </p>
              <p className="text-sm sm:text-base text-white">
                {currentSubtitle.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
