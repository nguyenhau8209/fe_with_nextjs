import { Subtitle } from "../types/video";

export const checkAnswer = (
  userInput: string,
  correctAnswer: string
): boolean => {
  const normalizedInput = userInput.trim().toLowerCase();
  const normalizedAnswer = correctAnswer.trim().toLowerCase();
  return normalizedInput === normalizedAnswer;
};

export const getNextSubtitle = (
  currentIndex: number,
  subtitles: Subtitle[]
): Subtitle | undefined => {
  return subtitles[currentIndex + 1];
};

export const getPreviousSubtitle = (
  currentIndex: number,
  subtitles: Subtitle[]
): Subtitle | undefined => {
  return subtitles[currentIndex - 1];
};
