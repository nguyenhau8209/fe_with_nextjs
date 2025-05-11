import React, { useState, useEffect } from "react";

const defaultSettings = {
  replayKey: "Ctrl",
  playPauseKey: "` (backtick)",
  autoReplay: "No",
  secondsBetweenReplays: "0.5",
  wordSuggestions: "Disabled",
  shortcutKeyTips: "Show",
};

type SettingsType = typeof defaultSettings;

const SETTINGS_KEY = "dictation_settings";

export default function Settings({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleChange = (key: keyof SettingsType, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="text-xl font-bold mb-4 text-white">Settings</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-white">Replay Key</label>
            <select
              className="bg-gray-800 text-white rounded px-2 py-1"
              value={settings.replayKey}
              onChange={(e) => handleChange("replayKey", e.target.value)}
            >
              <option>Ctrl</option>
              <option>Alt</option>
              <option>Shift</option>
              <option>Cmd</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-white">Play/Pause Key</label>
            <select
              className="bg-gray-800 text-white rounded px-2 py-1"
              value={settings.playPauseKey}
              onChange={(e) => handleChange("playPauseKey", e.target.value)}
            >
              <option>(backtick)</option>
              <option>Space</option>
              <option>Tab</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-white">Auto Replay</label>
            <select
              className="bg-gray-800 text-white rounded px-2 py-1"
              value={settings.autoReplay}
              onChange={(e) => handleChange("autoReplay", e.target.value)}
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-white">Seconds between replays</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="bg-gray-800 text-white rounded px-2 py-1 w-20"
              value={settings.secondsBetweenReplays}
              onChange={(e) =>
                handleChange("secondsBetweenReplays", e.target.value)
              }
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-white">
              Word suggestions (for smartphones)
            </label>
            <select
              className="bg-gray-800 text-white rounded px-2 py-1"
              value={settings.wordSuggestions}
              onChange={(e) => handleChange("wordSuggestions", e.target.value)}
            >
              <option>Disabled</option>
              <option>Enabled</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-white">Shortcut Key Tips</label>
            <select
              className="bg-gray-800 text-white rounded px-2 py-1"
              value={settings.shortcutKeyTips}
              onChange={(e) => handleChange("shortcutKeyTips", e.target.value)}
            >
              <option>Show</option>
              <option>Hide</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
