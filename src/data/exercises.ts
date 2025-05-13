export interface ScriptData {
  text: string;
  translation?: string;
  startTime: number; // thời gian bắt đầu (giây)
  endTime: number; // thời gian kết thúc (giây)
}

export interface Exercise {
  id: string;
  title: string;
  level: string;
  audioUrl: string;
  script: ScriptData[];
}

export interface VideoExercise {
  id: string;
  title: string;
  level: string;
  videoId: string; // ID của video YouTube
  startTime?: number; // thời gian bắt đầu (giây)
  endTime?: number; // thời gian kết thúc (giây)
  subtitles: {
    text: string;
    translation?: string;
    startTime: number;
    endTime: number;
  }[];
}

// Danh sách bài tập
export const exercises: Exercise[] = [
  {
    id: "a1-1",
    title: "Bài tập 1 - Chào hỏi",
    level: "A1",
    audioUrl: "/audio/english-conversations-0001-1-at-home-1.mp3",
    script: [
      {
        text: "Guten Tag!",
        startTime: 0,
        endTime: 1.5,
      },
      {
        text: "Wie geht es Ihnen?",
        startTime: 2,
        endTime: 4,
      },
    ],
  },
  {
    id: "a1-2",
    title: "Bài tập 2 - Giới thiệu bản thân",
    level: "A1",
    audioUrl: "/audio/a1-2.mp3",
    script: [
      {
        text: "Ich heiße Anna.",
        startTime: 0,
        endTime: 2,
      },
      {
        text: "Ich komme aus Deutschland.",
        startTime: 3,
        endTime: 5,
      },
    ],
  },
  {
    id: "a2-1",
    title: "Bài tập 1 - Mua sắm",
    level: "A2",
    audioUrl: "/audio/a2-1.mp3",
    script: [
      {
        text: "Wie viel kostet das?",
        startTime: 0,
        endTime: 2,
      },
      {
        text: "Das kostet 10 Euro.",
        startTime: 3,
        endTime: 5,
      },
    ],
  },
];

// Danh sách bài tập video
export const videoExercises: VideoExercise[] = [
  {
    id: "video-a1-1",
    title: "Bài tập video 1 - Chào hỏi",
    level: "A1",
    videoId: "wtMUy_3NGl4",
    startTime: 0,
    endTime: 60,
    subtitles: [
      {
        text: "Guten Tag!",
        translation: "Xin chào!",
        startTime: 0,
        endTime: 2,
      },
      {
        text: "Wie geht es Ihnen?",
        translation: "Bạn khỏe không?",
        startTime: 2,
        endTime: 4,
      },
    ],
  },
];
