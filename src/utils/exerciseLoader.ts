import fs from "fs";
import path from "path";
import { Exercise } from "@/data/exercises";

interface ScriptData {
  text: string;
  translation?: string;
}

function parseScriptFile(content: string): ScriptData[] {
  // Tách nội dung thành các dòng
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0); // Loại bỏ dòng trống

  const scriptData: ScriptData[] = [];

  // Xử lý từng cặp câu (câu hỏi và câu trả lời)
  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      scriptData.push({
        text: lines[i],
        translation: lines[i + 1],
      });
    }
  }

  return scriptData;
}

export function loadExercises(): Exercise[] {
  const publicDir = path.join(process.cwd(), "public");
  const audioDir = path.join(publicDir, "audio");
  const scriptsDir = path.join(publicDir, "scripts");

  // Đọc danh sách file audio
  const audioFiles = fs
    .readdirSync(audioDir)
    .filter((file) => file.endsWith(".mp3"));

  const exercises: Exercise[] = [];

  audioFiles.forEach((audioFile) => {
    const baseFileName = path.basename(audioFile, ".mp3");
    const scriptFile = path.join(scriptsDir, `${baseFileName}.txt`);

    // Kiểm tra xem có file script tương ứng không
    if (fs.existsSync(scriptFile)) {
      const scriptContent = fs.readFileSync(scriptFile, "utf-8");
      const scriptData = parseScriptFile(scriptContent);

      // Xác định level từ tên file (giả sử tên file có dạng: level_name.mp3)
      const levelMatch = baseFileName.match(/^([A-C][1-2])/i);
      const level = levelMatch ? levelMatch[1].toUpperCase() : "A1";

      // Tạo exercise mới
      const exercise: Exercise = {
        id: baseFileName,
        title: baseFileName
          .replace(/_/g, " ")
          .replace(/^[A-C][1-2]/i, "")
          .trim(),
        level,
        audioUrl: `/audio/${audioFile}`,
        script: scriptData,
      };

      exercises.push(exercise);
    }
  });

  return exercises;
}
