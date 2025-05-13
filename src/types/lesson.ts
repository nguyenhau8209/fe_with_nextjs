export interface Subtitle {
  language: string;
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  youtubeUrl: string;
  userId?: string;
  isSystemLesson: boolean;
  subtitles: Subtitle[];
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
