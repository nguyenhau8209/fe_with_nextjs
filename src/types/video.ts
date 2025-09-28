export interface Subtitle {
  text: string;
  translation?: string;
  startTime: number;
  endTime: number;
}

export interface VideoExerciseProps {
  title: string;
  level: string;
  videoId: string;
  startTime?: number;
  endTime?: number;
  subtitles: Subtitle[];
  autoStart?: boolean;
  lessonId?: string;
  language?: string;
}

export interface Settings {
  replayKey: "Ctrl" | "Alt" | "Shift" | "Cmd";
  playPauseKey: "` (backtick)" | "Space" | "Tab";
}
