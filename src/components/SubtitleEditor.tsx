import React, { useState, useEffect } from "react";

export interface EditableSubtitle {
  text: string;
  startTime: number;
  endTime: number;
}

interface SubtitleEditorProps {
  initialSubtitles: EditableSubtitle[];
  onSave: (subtitles: EditableSubtitle[]) => void;
  rawSubtitles: EditableSubtitle[];
}

const SubtitleEditor: React.FC<SubtitleEditorProps> = ({
  initialSubtitles,
  onSave,
  rawSubtitles,
}) => {
  const [subtitles, setSubtitles] = useState<EditableSubtitle[]>(() => {
    return rawSubtitles.map((raw, index) => {
      const initial = initialSubtitles[index];
      return {
        text: initial?.text || raw.text,
        startTime: initial?.startTime || raw.startTime,
        endTime: initial?.endTime || raw.endTime,
      };
    });
  });
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!subtitles[selectedIdx] || !subtitles[selectedIdx].text) {
      const updated = [...subtitles];
      updated[selectedIdx] = {
        text: rawSubtitles[selectedIdx]?.text || "",
        startTime: rawSubtitles[selectedIdx]?.startTime || 0,
        endTime: rawSubtitles[selectedIdx]?.endTime || 0,
      };
      setSubtitles(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx]);

  const isEdited = (idx: number) => {
    const s = subtitles[idx];
    const r = rawSubtitles[idx];
    if (!s || !r) return false;
    return (
      s.text !== r.text ||
      s.startTime !== r.startTime ||
      s.endTime !== r.endTime
    );
  };

  const handleChange = (field: keyof EditableSubtitle, value: string) => {
    const updated = [...subtitles];
    if (field === "startTime" || field === "endTime") {
      updated[selectedIdx][field] = parseFloat(value);
    } else {
      updated[selectedIdx][field] = value;
    }
    setSubtitles(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleSave = () => {
    onSave(subtitles);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">Chỉnh sửa phụ đề</h2>
      <div className="text-sm text-gray-600 mb-2">
        <b>Hướng dẫn:</b> Bấm vào một dòng phụ đề gốc bên trái để chỉnh sửa nội
        dung, dấu câu, thời gian... ở bên phải. Sau khi chỉnh sửa xong các dòng
        mong muốn, nhấn "Lưu phụ đề".
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-semibold mb-1">
            Phụ đề gốc (bấm để chọn dòng)
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-2 bg-gray-50">
            {rawSubtitles.map((sub, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-xs cursor-pointer rounded px-1 py-0.5 
                  ${selectedIdx === idx ? "bg-indigo-100 font-semibold" : ""}
                  ${
                    isEdited(idx)
                      ? "border-l-4 border-green-500 bg-green-50"
                      : ""
                  }`}
                onClick={() => setSelectedIdx(idx)}
                tabIndex={0}
                style={{
                  outline: selectedIdx === idx ? "2px solid #6366f1" : "none",
                }}
              >
                <span className="w-16 text-gray-400">
                  {sub.startTime.toFixed(2)} - {sub.endTime.toFixed(2)}
                </span>
                <span>{sub.text}</span>
                {isEdited(idx) && (
                  <span className="ml-1 text-green-600">✔</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-1">
            Phụ đề chỉnh sửa (dòng đang chọn)
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-4 bg-white">
            {subtitles[selectedIdx] && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="w-28 text-gray-500">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={subtitles[selectedIdx].startTime}
                    onChange={(e) => handleChange("startTime", e.target.value)}
                    className="w-32 border rounded px-2 py-0.5"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-28 text-gray-500">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={subtitles[selectedIdx].endTime}
                    onChange={(e) => handleChange("endTime", e.target.value)}
                    className="w-32 border rounded px-2 py-0.5"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-28 text-gray-500">Nội dung</label>
                  <textarea
                    value={subtitles[selectedIdx].text}
                    onChange={(e) => handleChange("text", e.target.value)}
                    className="flex-1 border rounded px-2 py-1 min-h-[60px] max-h-40 resize-y"
                    rows={3}
                  />
                </div>
                {saved && (
                  <div className="text-green-600 text-xs mt-1">Đã lưu tạm!</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Lưu phụ đề
      </button>
    </div>
  );
};

export default SubtitleEditor;
