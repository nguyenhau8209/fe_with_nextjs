export interface Subtitle {
  language: string;
  url: string;
}

export interface DetailedSubtitle {
  text: string;
  startTime: number;
  endTime: number;
}

export interface Lesson {
  id: string;
  title: string;
  youtubeUrl: string;
  userId?: string;
  isSystemLesson: boolean;
  subtitles: Subtitle[];
  detailedSubtitles?: DetailedSubtitle[];
  createdAt: Date;
  updatedAt: Date;
  level: string;
  language: string;
}

export interface CreateLessonInput {
  title: string;
  youtubeUrl: string;
  isSystemLesson?: boolean;
  level: string;
}
