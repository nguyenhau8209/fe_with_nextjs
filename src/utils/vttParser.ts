interface VTTCue {
  startTime: number;
  endTime: number;
  text: string;
}

export function parseVTTTime(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const [secs, ms] = seconds.toString().split(".").map(Number);
  return hours * 3600 + minutes * 60 + secs + (ms || 0) / 1000;
}

export function parseVTT(content: string): VTTCue[] {
  const lines = content.trim().split("\n");
  const cues: VTTCue[] = [];
  let currentCue: Partial<VTTCue> = {};
  let isHeaderPassed = false;

  // Bỏ qua dòng WEBVTT
  let i = 1;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Bỏ qua số thứ tự và dòng trống
    if (!line || !isNaN(Number(line))) {
      i++;
      continue;
    }

    // Parse thời gian
    if (line.includes("-->")) {
      const [start, end] = line
        .split("-->")
        .map((time) => parseVTTTime(time.trim()));
      currentCue.startTime = start;
      currentCue.endTime = end;
    }
    // Parse text
    else if (
      currentCue.startTime !== undefined &&
      currentCue.endTime !== undefined
    ) {
      // Bỏ qua 2 cue đầu tiên (title và number)
      if (!isHeaderPassed) {
        if (line === "At home." || line === "One.") {
          currentCue = {};
          if (line === "One.") {
            isHeaderPassed = true;
          }
          i++;
          continue;
        }
      }

      currentCue.text = line;
      cues.push(currentCue as VTTCue);
      currentCue = {};
    }

    i++;
  }

  return cues;
}
