import fs from "fs";
import path from "path";
import { Exercise, ScriptData } from "@/data/exercises";

interface VTTCue {
  startTime: number;
  endTime: number;
  text: string;
}

// Chuyển đổi thời gian từ định dạng VTT (00:00:00.000) sang số giây
function parseVTTTime(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const [secs, ms] = seconds.toString().split(".").map(Number);
  return hours * 3600 + minutes * 60 + secs + (ms || 0) / 1000;
}

// Parse file VTT để lấy thời gian và nội dung
export function parseVTT(content: string): VTTCue[] {
  const lines = content.trim().split("\n");
  const cues: VTTCue[] = [];
  let currentCue: Partial<VTTCue> = {};

  // Bỏ qua dòng WEBVTT và các metadata
  let i = 0;
  while (i < lines.length && !lines[i].includes("-->")) {
    i++;
  }

  // Xử lý từng cue
  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.includes("-->")) {
      // Parse thời gian
      const [start, end] = line.split("-->").map((time) => {
        return parseVTTTime(time.trim());
      });
      currentCue = { startTime: start, endTime: end };
    } else if (line && currentCue.startTime !== undefined) {
      // Thêm text vào cue hiện tại
      currentCue.text = line;
      if (
        currentCue.text &&
        currentCue.startTime !== undefined &&
        currentCue.endTime !== undefined
      ) {
        cues.push(currentCue as VTTCue);
        currentCue = {};
      }
    }
    i++;
  }

  return cues;
}

// Parse file script để lấy bản dịch
function parseScript(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("-"));
}

export function loadExercises(): Exercise[] {
  const publicDir = path.join(process.cwd(), "public");
  const audioDir = path.join(publicDir, "audio");
  const scriptsDir = path.join(publicDir, "scripts");
  const subtitlesDir = path.join(publicDir, "subtitles");

  // Đọc danh sách file audio
  const audioFiles = fs
    .readdirSync(audioDir)
    .filter((file) => file.endsWith(".mp3"));

  const exercises: Exercise[] = [];

  audioFiles.forEach((audioFile) => {
    const baseFileName = path.basename(audioFile, ".mp3");
    const scriptFile = path.join(scriptsDir, `${baseFileName}.txt`);
    const vttFile = path.join(subtitlesDir, `${baseFileName}.vtt`);

    // Kiểm tra xem có cả file script và vtt không
    if (fs.existsSync(scriptFile) && fs.existsSync(vttFile)) {
      const scriptContent = fs.readFileSync(scriptFile, "utf-8");
      const vttContent = fs.readFileSync(vttFile, "utf-8");

      // Parse VTT để lấy timing và text
      const vttCues = parseVTT(vttContent);

      // Parse script để lấy bản dịch
      const translations = parseScript(scriptContent);

      // Kết hợp thông tin từ VTT và script
      const script: ScriptData[] = vttCues.map((cue, index) => ({
        text: cue.text,
        translation: translations[index] || undefined,
        startTime: cue.startTime,
        endTime: cue.endTime,
      }));

      // Tạo exercise mới
      const exercise: Exercise = {
        id: baseFileName,
        title: baseFileName.split("-").slice(2).join(" ").replace(/_/g, " "),
        level: "A1", // Tạm thời set cứng là A1, sau này sẽ phân loại theo nội dung
        audioUrl: `/audio/${audioFile}`,
        script,
      };

      exercises.push(exercise);
    }
  });

  return exercises;
}
