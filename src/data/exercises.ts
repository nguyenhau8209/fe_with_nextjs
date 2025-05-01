import { loadExercises } from "@/utils/exerciseLoader";

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

// Tự động tải danh sách bài tập từ thư mục public
export const exercises: Exercise[] = loadExercises();

// Dữ liệu mẫu
export const sampleExercises: Exercise[] = [
  {
    id: "english-conversations-0001",
    title: "At Home",
    level: "A1",
    audioUrl: "/audio/english-conversations-0001.mp3",
    script: [
      {
        text: "Where is Jane?",
        translation: "Jane ở đâu?",
        startTime: 0,
        endTime: 2,
      },
      {
        text: "She is in the living room.",
        translation: "Cô ấy đang ở phòng khách.",
        startTime: 2,
        endTime: 4,
      },
      {
        text: "What is she doing?",
        translation: "Cô ấy đang làm gì?",
        startTime: 4,
        endTime: 6,
      },
      {
        text: "She is playing the piano.",
        translation: "Cô ấy đang chơi đàn piano.",
        startTime: 6,
        endTime: 8,
      },
      {
        text: "Where is the car?",
        translation: "Xe ô tô ở đâu?",
        startTime: 8,
        endTime: 10,
      },
      {
        text: "It is in the garage.",
        translation: "Nó đang ở trong ga-ra.",
        startTime: 10,
        endTime: 12,
      },
      {
        text: "Where is the dog?",
        translation: "Con chó ở đâu?",
        startTime: 12,
        endTime: 14,
      },
      {
        text: "The dog is in front of the door.",
        translation: "Con chó đang ở trước cửa.",
        startTime: 14,
        endTime: 16,
      },
      {
        text: "What is the dog doing?",
        translation: "Con chó đang làm gì?",
        startTime: 16,
        endTime: 18,
      },
      {
        text: "The dog is eating.",
        translation: "Con chó đang ăn.",
        startTime: 18,
        endTime: 20,
      },
    ],
  },
];
