import {
  Lesson,
  CreateLessonInput,
  Subtitle,
  DetailedSubtitle,
} from "../types/lesson";
import { Subtitle as VideoSubtitle } from "../types/video";

const STORAGE_KEY = "custom_lessons";
const SUBTITLES_STORAGE_KEY = "video_subtitles";

export const getLessons = (): Lesson[] => {
  if (typeof window === "undefined") return [];
  const lessons = localStorage.getItem(STORAGE_KEY);
  return lessons ? JSON.parse(lessons) : [];
};

export const saveLesson = (
  lesson: CreateLessonInput & { level: string; language: string },
  subtitles: Subtitle[],
  detailedSubtitles?: DetailedSubtitle[]
): Lesson => {
  const lessons = getLessons();
  const newLesson: Lesson = {
    id: crypto.randomUUID(),
    ...lesson,
    subtitles,
    detailedSubtitles,
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystemLesson: false,
    language: lesson.language,
  };

  const updatedLessons = [...lessons, newLesson];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLessons));
  return newLesson;
};

export const deleteLesson = (lessonId: string): void => {
  const lessons = getLessons();
  const updatedLessons = lessons.filter((lesson) => lesson.id !== lessonId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLessons));
};

export const updateLesson = (
  lessonId: string,
  updates: Partial<Lesson>
): Lesson | null => {
  const lessons = getLessons();
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);

  if (index === -1) return null;

  const updatedLesson = {
    ...lessons[index],
    ...updates,
    updatedAt: new Date(),
  };

  lessons[index] = updatedLesson;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  return updatedLesson;
};

export const saveSubtitles = (
  videoId: string,
  subtitles: VideoSubtitle[]
): void => {
  if (typeof window === "undefined") return;

  const allSubtitles = getSubtitles();
  allSubtitles[videoId] = {
    subtitles,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem(SUBTITLES_STORAGE_KEY, JSON.stringify(allSubtitles));
};

export const getSubtitles = (): Record<
  string,
  { subtitles: VideoSubtitle[]; timestamp: string }
> => {
  if (typeof window === "undefined") return {};

  const subtitles = localStorage.getItem(SUBTITLES_STORAGE_KEY);
  return subtitles ? JSON.parse(subtitles) : {};
};

export const getSubtitlesForVideo = (
  videoId: string
): VideoSubtitle[] | null => {
  const allSubtitles = getSubtitles();
  return allSubtitles[videoId]?.subtitles || null;
};

export const hasSubtitles = (videoId: string): boolean => {
  const allSubtitles = getSubtitles();
  return !!allSubtitles[videoId];
};

export const clearSubtitlesForVideo = (videoId: string): void => {
  if (typeof window === "undefined") return;

  const allSubtitles = getSubtitles();
  delete allSubtitles[videoId];
  localStorage.setItem(SUBTITLES_STORAGE_KEY, JSON.stringify(allSubtitles));
};

export const clearAllSubtitles = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SUBTITLES_STORAGE_KEY);
};

export const getDetailedSubtitlesForLesson = (
  lessonId: string
): DetailedSubtitle[] | null => {
  const lessons = getLessons();
  const lesson = lessons.find((l) => l.id === lessonId);
  console.log("lesson", lesson);
  return lesson?.detailedSubtitles || null;
};
