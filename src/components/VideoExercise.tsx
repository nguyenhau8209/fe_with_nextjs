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
  checkWordByWord,
  getHintString,
} from "../utils/video";
import { useRouter } from "next/navigation";

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
  language = "de",
}: VideoExerciseProps & { language?: string }) {
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
  const [hint, setHint] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [note, setNote] = useState<string>("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [translation, setTranslation] = useState<string>("");
  const [wordModal, setWordModal] = useState<{
    word: string;
    position: { x: number; y: number };
    show: boolean;
  } | null>(null);
  const [wordInfo, setWordInfo] = useState<{
    ipaUK?: string;
    ipaUS?: string;
    meaning?: string;
  }>({});
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

      const currentTime = player.getCurrentTime();
      const playerState = player.getPlayerState();

      // Chỉ kiểm tra khi video đang phát
      if (playerState === YOUTUBE_PLAYER_STATES.PLAYING && currentSubtitle) {
        // Chỉ log khi gần đến thời điểm kết thúc
        if (currentTime >= currentSubtitle.endTime - 0.5) {
          console.log(
            `Current time: ${currentTime.toFixed(
              1
            )}s, subtitle ends at: ${currentSubtitle.endTime.toFixed(1)}s`
          );
        }

        if (currentTime >= currentSubtitle.endTime) {
          console.log(
            `Auto-pausing at ${currentTime.toFixed(
              1
            )}s, subtitle ends at ${currentSubtitle.endTime.toFixed(1)}s`
          );
          player.pauseVideo();
          setIsPlaying(false);
        }
      }
    }, 100); // Kiểm tra thường xuyên hơn

    return () => clearInterval(interval);
  }, [isPlaying, currentSubtitle]);

  const playCurrentSubtitle = () => {
    if (!playerRef.current || !currentSubtitle) {
      console.log("Cannot play: no player or subtitle");
      return;
    }

    console.log(
      `Playing subtitle ${currentIndex + 1}: ${currentSubtitle.startTime}s - ${
        currentSubtitle.endTime
      }s`
    );

    // Seek đến thời điểm bắt đầu của subtitle
    playerRef.current.seekTo(currentSubtitle.startTime);

    // Đợi một chút để seek hoàn thành rồi mới play
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }, 100);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserInput("");
      const prevSentence = getPreviousSubtitle(currentIndex, subtitles);
      if (prevSentence && playerRef.current) {
        console.log(
          `Moving to previous subtitle: ${prevSentence.startTime}s - ${prevSentence.endTime}s`
        );
        playerRef.current.seekTo(prevSentence.startTime);
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.playVideo();
            setIsPlaying(true);
          }
        }, 100);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < subtitles.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      const nextSentence = getNextSubtitle(currentIndex, subtitles);
      if (nextSentence && playerRef.current) {
        console.log(
          `Moving to next subtitle: ${nextSentence.startTime}s - ${nextSentence.endTime}s`
        );
        playerRef.current.seekTo(nextSentence.startTime);
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.playVideo();
            setIsPlaying(true);
          }
        }, 100);
      }
    }
  };

  const [finalConfirmCount, setFinalConfirmCount] = useState(0);

  // Sửa handleSubmit để xử lý xác nhận Enter lần 2 ở câu cuối
  const handleSubmit = () => {
    // Nếu đang ở câu cuối cùng và đã đúng
    if (currentIndex === subtitles.length - 1 && isCorrect) {
      setFinalConfirmCount((c) => c + 1);
      return;
    }
    if (isCorrect) {
      handleNext();
      setIsCorrect(false);
      setShowTranslation(false);
      setUserInput("");
      return;
    }
    if (checkAnswer(userInput, currentSubtitle.text)) {
      setIsCorrect(true);
      setShowAnswer(false);
      setShowTranslation(true);
    } else {
      // Tạo gợi ý
      const { firstWrongIndex, result, answerWords } = checkWordByWord(
        userInput,
        currentSubtitle.text
      );
      setHint(getHintString(result, answerWords, firstWrongIndex));
      setShowAnswer(true);

      // Đặt lại vị trí con trỏ về từ sai (nếu có)
      if (firstWrongIndex !== -1) {
        const userWords = userInput.trim().split(/\s+/);
        let pos = 0;
        for (let i = 0; i <= firstWrongIndex; i++) {
          pos += userWords[i]?.length || 0;
          if (i < firstWrongIndex) pos += 1; // cộng thêm khoảng trắng giữa các từ
        }
        setTimeout(() => {
          const textarea = document.querySelector("textarea");
          if (textarea)
            (textarea as HTMLTextAreaElement).setSelectionRange(pos, pos);
        }, 0);
      }
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

  const speakWord = (word: string, langCode?: string) => {
    let lang = "en-US";
    if (language === "de") lang = "de-DE";
    if (langCode) lang = langCode;
    const utter = new window.SpeechSynthesisUtterance(word);
    utter.lang = lang;
    window.speechSynthesis.speak(utter);
  };

  const translateSentence = async (text: string) => {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(
        text
      )}`
    );
    const data = await res.json();
    setTranslation(data[0].map((d: any) => d[0]).join(""));
  };

  // Reset lại isCorrect khi chuyển câu
  useEffect(() => {
    setIsCorrect(false);
    setNote("");
    setShowNoteInput(false);
    setTranslation("");
  }, [currentIndex]);

  useEffect(() => {
    if (isCorrect) {
      translateSentence(currentSubtitle.text);
    }
  }, [isCorrect, currentSubtitle]);

  const handleWordClick = async (e: React.MouseEvent, word: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setWordModal({
      word,
      position: {
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY,
      },
      show: true,
    });
    try {
      if (language === "en") {
        const res = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );
        const data = await res.json();
        const ipaUK =
          data[0]?.phonetics?.find(
            (p: any) => p.audio && p.audio.includes("uk")
          )?.text || data[0]?.phonetics?.[0]?.text;
        const ipaUS =
          data[0]?.phonetics?.find(
            (p: any) => p.audio && p.audio.includes("us")
          )?.text || data[0]?.phonetics?.[1]?.text;
        const resTrans = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(
            word
          )}`
        );
        const dataTrans = await resTrans.json();
        setWordInfo({
          ipaUK,
          ipaUS,
          meaning: dataTrans[0][0][0],
        });
      } else if (language === "de") {
        // Chỉ lấy nghĩa qua Google Translate
        const resTrans = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=vi&dt=t&q=${encodeURIComponent(
            word
          )}`
        );
        const dataTrans = await resTrans.json();
        setWordInfo({
          ipaUK: "",
          ipaUS: "",
          meaning: dataTrans[0][0][0],
        });
      }
    } catch {
      setWordInfo({ ipaUK: "", ipaUS: "", meaning: "..." });
    }
  };

  // Debug: kiểm tra currentSubtitle
  useEffect(() => {
    if (currentSubtitle) {
      console.log(`Current subtitle ${currentIndex + 1}:`, {
        text: currentSubtitle.text.substring(0, 50) + "...",
        startTime: currentSubtitle.startTime,
        endTime: currentSubtitle.endTime,
        duration: currentSubtitle.endTime - currentSubtitle.startTime,
      });
    } else {
      console.log(`No subtitle found at index ${currentIndex}`);
    }
  }, [currentIndex, currentSubtitle]);

  const router = useRouter();
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Cập nhật lại useEffect kiểm tra hoàn thành bài tập
  useEffect(() => {
    if (
      currentIndex === subtitles.length - 1 &&
      isCorrect &&
      finalConfirmCount >= 2
    ) {
      setTimeout(() => setShowCompletionModal(true), 300);
    }
  }, [currentIndex, isCorrect, finalConfirmCount, subtitles.length]);

  // Reset lại finalConfirmCount khi chuyển sang câu khác hoặc làm lại
  useEffect(() => {
    setFinalConfirmCount(0);
  }, [currentIndex]);

  // Hàm reset lại toàn bộ trạng thái để làm lại
  const handleRetry = () => {
    setCurrentIndex(0);
    setUserInput("");
    setShowTranslation(false);
    setShowAnswer(false);
    setIsPlaying(false);
    setShowSettings(false);
    setVideoSize("normal");
    setShowVideo(false);
    setHint("");
    setIsCorrect(false);
    setNote("");
    setShowNoteInput(false);
    setTranslation("");
    setWordModal(null);
    setWordInfo({});
    setShowCompletionModal(false);
    setFinalConfirmCount(0);
    if (playerRef.current) {
      playerRef.current.seekTo(subtitles[0].startTime);
      playerRef.current.pauseVideo();
    }
  };
  // Hàm chuyển sang bài tiếp theo
  const handleNextExercise = () => {
    setShowCompletionModal(false);
    // Giả sử có prop nextVideoId hoặc tự động tăng id (nếu là số)
    // Hoặc chuyển về trang danh sách nếu không có bài tiếp theo
    // Ở đây sẽ gọi callback hoặc router push
    // Ví dụ: router.push(`/videos/${nextVideoId}`)
    // Tạm thời: chuyển về trang danh sách level
    router.push(`/levels/${level.toLowerCase()}`);
  };

  return (
    <div className="max-w-7xl mx-auto bg-[#181A20] p-4 sm:p-8 rounded-xl shadow-lg relative">
      {/* Modal hoàn thành bài tập */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 animate-popIn min-w-[320px] max-w-[90vw]">
            <div className="flex flex-col items-center gap-2">
              <div className="text-green-500 text-6xl animate-bounce">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800">Hoàn thành!</h2>
              <p className="text-gray-600 text-center">
                Bạn đã hoàn thành tất cả các câu của bài tập này.
              </p>
            </div>
            <div className="flex gap-4 mt-2">
              <button
                onClick={handleNextExercise}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition-all duration-200"
              >
                Bài tiếp theo
              </button>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-lg shadow hover:bg-gray-300 transition-all duration-200"
              >
                Làm lại
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-white">
          {title}
        </h1>
        <div className="text-sm text-gray-400">Trình độ: {level}</div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
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
              <button
                onClick={playCurrentSubtitle}
                disabled={isPlaying}
                className="border border-white rounded-full p-1 bg-amber-50 w-8 h-8 flex items-center justify-center"
                title="Phát lại câu hiện tại"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                onClick={() => {
                  console.log("Test button clicked");
                  console.log("Current subtitle:", currentSubtitle);
                  console.log("Player ref:", playerRef.current);
                  console.log("Is playing:", isPlaying);
                }}
                className="border border-white rounded-full p-1 bg-blue-50 w-8 h-8 flex items-center justify-center text-xs"
                title="Test debug"
              >
                🐛
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm sm:text-base transition-colors duration-200"
              >
                {showVideo ? "Ẩn video" : "Hiện video"}
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
          <div className="mb-3 sm:mb-4">
            <textarea
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu bạn nghe được..."
              className="w-full h-24 sm:h-32 p-3 sm:p-4 bg-gray-800 text-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
            />
          </div>
          {isCorrect && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-500 text-2xl">✔</span>
              <span className="text-green-500 font-bold text-lg">
                You are correct!
              </span>
            </div>
          )}
          {isCorrect && translation && (
            <div className=" mb-3 mt-2 p-3 sm:p-4 bg-gray-800 rounded-lg text-sm sm:text-base text-white">
              {translation}
            </div>
          )}
          {isCorrect && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-yellow-900/50 rounded-lg">
              <p className="text-sm sm:text-base font-medium mb-1 text-white">
                Phát âm:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentSubtitle.text.split(/\s+/).map((word, idx) => (
                  <button
                    key={idx}
                    onClick={(e) =>
                      handleWordClick(e, word.replace(/[.,!?]/g, ""))
                    }
                    className="underline text-white hover:text-blue-400 transition"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
              {/* Modal phát âm từ */}
              {wordModal?.show && (
                <div
                  style={{
                    position: "absolute",
                    left: wordModal.position.x,
                    top: wordModal.position.y + 8,
                    zIndex: 1000,
                    background: "#23272f",
                    color: "white",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    padding: 16,
                    minWidth: 220,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="font-bold mb-2">{wordModal.word}</div>
                  <div className="flex gap-2 mb-2">
                    {language === "en" ? (
                      <>
                        <button
                          onClick={() => speakWord(wordModal.word, "en-GB")}
                          className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          UK 🔊
                        </button>
                        <button
                          onClick={() => speakWord(wordModal.word, "en-US")}
                          className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          US 🔊
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => speakWord(wordModal.word, "de-DE")}
                        className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        DE 🔊
                      </button>
                    )}
                  </div>
                  {language === "en" && (
                    <div className="mb-2 text-sm">
                      <div>IPA UK: {wordInfo.ipaUK || "..."}</div>
                      <div>IPA US: {wordInfo.ipaUS || "..."}</div>
                    </div>
                  )}
                  <div className="text-sm">
                    <div>Translation: {wordInfo.meaning || "..."}</div>
                  </div>
                  <button
                    className="absolute top-1 right-2 text-gray-400 hover:text-white"
                    onClick={() => setWordModal(null)}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          {!isCorrect && showAnswer && currentSubtitle && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-yellow-900/50 rounded-lg">
              <p className="text-sm sm:text-base font-medium mb-1 text-white">
                Đáp án:
              </p>
              <p
                className="text-sm sm:text-base text-white"
                dangerouslySetInnerHTML={{
                  __html: hint || currentSubtitle.text,
                }}
              />
            </div>
          )}
          <div className="mb-3 sm:mb-4 flex gap-2">
            {!isCorrect ? (
              <>
                <button
                  onClick={handleSubmit}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 text-sm sm:text-base transition-colors duration-200"
                >
                  Check
                </button>
                <button
                  onClick={handleNext}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 text-sm sm:text-base transition-colors duration-200"
                >
                  Bỏ qua
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm sm:text-base transition-colors duration-200"
                >
                  + note
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 text-sm sm:text-base transition-colors duration-200"
                >
                  Next
                </button>
              </>
            )}
          </div>
          {showNoteInput && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú của bạn..."
              className="w-full mt-2 p-2 rounded bg-gray-800 text-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
