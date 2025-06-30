import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { YouTubePlayer } from "react-youtube";

interface Subtitle {
  text: string;
  startTime: number;
  endTime: number;
}

interface Props {
  youtubeVideoId: string;
  subtitles: Subtitle[];
  onSubtitlesChange?: (subs: Subtitle[]) => void;
}

const VideoSubtitleEditor: React.FC<Props> = ({
  youtubeVideoId,
  subtitles,
  onSubtitlesChange,
}) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [subs, setSubs] = useState<Subtitle[]>(subtitles);
  const [saved, setSaved] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setSubs(subtitles);
  }, [subtitles]);

  const seekToTime = (timeInSeconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(timeInSeconds, true);
    }
  };

  const handlePlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
  };

  const startPlaybackTracker = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const newTime = playerRef.current.getCurrentTime();
        setCurrentTime(newTime);

        if (selectedIdx !== null) {
          const { endTime } = subs[selectedIdx];
          if (newTime >= endTime) {
            playerRef.current.pauseVideo();
          }
        }
      }
    }, 100);
  };

  const stopPlaybackTracker = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handlePlayerStateChange = (event: { data: number }) => {
    // 1 = playing
    if (event.data === 1) {
      startPlaybackTracker();
    } else {
      stopPlaybackTracker();
    }
  };

  const handleSelectSubtitle = (idx: number) => {
    setSelectedIdx(idx);
    const { startTime } = subs[idx];

    if (
      playerRef.current &&
      typeof startTime === "number" &&
      !isNaN(startTime)
    ) {
      seekToTime(startTime);
      playerRef.current.playVideo();
    }
  };

  const handleTimestampChange = (
    idx: number,
    field: "startTime" | "endTime",
    value: number
  ) => {
    const newSubs = subs.map((s, i) =>
      i === idx ? { ...s, [field]: value } : s
    );
    setSubs(newSubs);
  };

  const handleTextChange = (idx: number, value: string) => {
    const newSubs = subs.map((s, i) => (i === idx ? { ...s, text: value } : s));
    setSubs(newSubs);
  };

  const setCurrentTimeToField = (field: "startTime" | "endTime") => {
    if (selectedIdx === null) return;
    handleTimestampChange(selectedIdx, field, currentTime);
  };

  const handleSave = () => {
    const hasChanges = subs.some((s, i) => {
      const orig = subtitles[i];
      return (
        s.text !== orig.text ||
        s.startTime !== orig.startTime ||
        s.endTime !== orig.endTime
      );
    });

    if (hasChanges && onSubtitlesChange) {
      onSubtitlesChange([...subs]);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } else if (!hasChanges) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const opts = {
    height: "390",
    width: "100%",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      {/* Left side: Video player */}
      <div className="md:w-1/2 w-full">
        <div className="sticky top-4">
          <YouTube
            videoId={youtubeVideoId}
            opts={opts}
            onReady={handlePlayerReady}
            onStateChange={handlePlayerStateChange}
          />
        </div>
      </div>

      {/* Right side: Subtitle list */}
      <div className="md:w-1/2 w-full">
        <div className="mb-2 text-sm font-medium text-gray-700">
          Edit subtitles and timings
        </div>
        <ul className="space-y-3 max-h-[70vh] overflow-y-auto border rounded p-3 bg-gray-50">
          {subs.map((sub, idx) => (
            <li
              key={idx}
              className={`flex flex-col gap-2 rounded p-3 cursor-pointer border ${
                idx === selectedIdx
                  ? "bg-indigo-100 border-indigo-300"
                  : "bg-white border-gray-200"
              }`}
              onClick={() => handleSelectSubtitle(idx)}
            >
              {/* Timing */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Time:</span>
                <input
                  type="number"
                  step="0.01"
                  value={sub.startTime.toFixed(2)}
                  onChange={(e) =>
                    handleTimestampChange(
                      idx,
                      "startTime",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-20 border rounded px-2 py-1 text-xs"
                  onClick={(e) => e.stopPropagation()}
                />
                <span>-</span>
                <input
                  type="number"
                  step="0.01"
                  value={sub.endTime.toFixed(2)}
                  onChange={(e) =>
                    handleTimestampChange(
                      idx,
                      "endTime",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-20 border rounded px-2 py-1 text-xs"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Subtitle Text */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Content:</span>
                <textarea
                  value={sub.text}
                  onChange={(e) => handleTextChange(idx, e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm resize-none"
                  rows={2}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Enter subtitle content..."
                />
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Save Subtitles
        </button>
        {saved && (
          <div className="text-green-600 text-sm mt-2 font-medium">
            ✓ Subtitles saved!
          </div>
        )}

        {/* Current Time Info */}
        <div className="mt-4 text-xs text-gray-500">
          <div>Current Time: {currentTime.toFixed(2)}s</div>
          <div>Duration: {duration.toFixed(2)}s</div>

          {/* Set Time Buttons */}
          {selectedIdx !== null && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentTimeToField("startTime")}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Set Start
              </button>
              <button
                type="button"
                onClick={() => setCurrentTimeToField("endTime")}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                Set End
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSubtitleEditor;
