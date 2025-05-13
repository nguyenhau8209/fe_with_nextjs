import { Lesson, CreateLessonInput } from "../types/lesson";

const STORAGE_KEY = "custom_lessons";

export const getLessons = (): Lesson[] => {
  if (typeof window === "undefined") return [];
  const lessons = localStorage.getItem(STORAGE_KEY);
  return lessons ? JSON.parse(lessons) : [];
};

export const saveLesson = (
  lesson: CreateLessonInput & { level: string },
  subtitles: any[]
): Lesson => {
  const lessons = getLessons();
  const newLesson: Lesson = {
    id: crypto.randomUUID(),
    ...lesson,
    subtitles,
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystemLesson: false,
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
