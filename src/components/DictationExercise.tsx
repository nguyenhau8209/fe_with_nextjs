"use client";

import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { ScriptData } from "@/data/exercises";

interface DictationExerciseProps {
  title: string;
  level: string;
  audioUrl: string;
  script: ScriptData[];
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
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentScript = script[currentIndex];
  const totalSentences = script.length;

  // Xử lý khi audio kết thúc đoạn hiện tại
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= currentScript.endTime) {
        audio.pause();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [currentScript]);

  const handleNext = () => {
    if (currentIndex < totalSentences - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      if (audioRef.current) {
        audioRef.current.currentTime = script[currentIndex + 1].startTime;
        audioRef.current.play();
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserInput("");
      if (audioRef.current) {
        audioRef.current.currentTime = script[currentIndex - 1].startTime;
        audioRef.current.play();
      }
    }
  };

  const playCurrentSentence = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentScript.startTime;
      audioRef.current.play();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <div className="text-sm text-gray-600">Vocab level: {level}</div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            ←
          </button>
          <span className="text-sm">
            {currentIndex + 1} / {totalSentences}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === totalSentences - 1}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            →
          </button>
        </div>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showTranslation ? "Hide Translation" : "Show Translation"}
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <audio ref={audioRef} controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className="relative">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type what you hear..."
            className="w-full h-32 p-4 bg-gray-800 text-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={playCurrentSentence}
            className="absolute bottom-4 right-4 text-gray-400 hover:text-white"
          >
            🎤
          </button>
        </div>
      </div>

      {showTranslation && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-2 text-gray-400">Translation</div>
          <div className="text-white">{currentScript.translation}</div>
        </div>
      )}
    </div>
  );
}
