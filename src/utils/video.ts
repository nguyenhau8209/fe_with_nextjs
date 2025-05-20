import { Subtitle } from "../types/video";

export const checkAnswer = (
  userInput: string,
  correctAnswer: string
): boolean => {
  return normalizeString(userInput) === normalizeString(correctAnswer);
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

export function normalizeString(str: string) {
  return str
    .replace(/[’‘`´]/g, "'") // chuyển các loại nháy về nháy thẳng
    .replace(/[""]/g, '"') // chuyển các loại ngoặc kép về ngoặc kép chuẩn
    .replace(/\s+/g, " ") // chuẩn hóa khoảng trắng
    .normalize("NFC") // chuẩn hóa unicode
    .trim();
}

export function checkWordByWord(userInput: string, correctAnswer: string) {
  const userWords = normalizeString(userInput).split(/\s+/);
  const answerWords = normalizeString(correctAnswer).split(/\s+/);
  let firstWrongIndex = -1;
  const result: ("correct" | "wrong")[] = [];

  for (let i = 0; i < answerWords.length; i++) {
    if (userWords[i] === answerWords[i]) {
      result.push("correct");
    } else {
      if (firstWrongIndex === -1) firstWrongIndex = i;
      result.push("wrong");
    }
  }
  return { firstWrongIndex, result, userWords, answerWords };
}

export function getHintString(
  result: ("correct" | "wrong")[],
  answerWords: string[],
  firstWrongIndex: number
) {
  return answerWords
    .map((word, idx) => {
      if (result[idx] === "correct") return `<b>${word}</b>`;
      if (idx === firstWrongIndex) return `<u>${word}</u>`;
      return "*".repeat(word.length);
    })
    .join(" ");
}
