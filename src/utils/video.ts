import { Subtitle } from "../types/video";

export const checkAnswer = (
  userInput: string,
  correctAnswer: string
): boolean => {
  // Loại bỏ dấu câu khỏi cả hai chuỗi trước khi so sánh
  const normalizedUserInput = removePunctuation(normalizeString(userInput));
  const normalizedCorrectAnswer = removePunctuation(normalizeString(correctAnswer));
  return normalizedUserInput === normalizedCorrectAnswer;
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
    .replace(/[''`´]/g, "'") // chuyển các loại nháy về nháy thẳng
    .replace(/[""]/g, '"') // chuyển các loại ngoặc kép về ngoặc kép chuẩn
    .replace(/\s+/g, " ") // chuẩn hóa khoảng trắng
    .normalize("NFC") // chuẩn hóa unicode
    .trim();
}

// Hàm loại bỏ tất cả dấu câu khỏi chuỗi để so sánh
export function removePunctuation(str: string) {
  return str.replace(/[.,!?;:()[\]{}'"]/g, "").trim();
}

// Hàm tự động điền dấu câu vào userInput dựa trên correctAnswer
export function addPunctuationToInput(userInput: string, correctAnswer: string): string {
  const userWords = normalizeString(userInput).split(/\s+/);
  const answerWords = normalizeString(correctAnswer).split(/\s+/);
  
  // Nếu số từ không khớp, trả về input gốc
  if (userWords.length !== answerWords.length) {
    return userInput;
  }
  
  // Tạo mảng kết quả với dấu câu từ answerWords
  const result: string[] = [];
  
  for (let i = 0; i < answerWords.length; i++) {
    const userWord = removePunctuation(userWords[i] || "");
    const answerWord = removePunctuation(answerWords[i] || "");
    
    // Nếu từ khớp, sử dụng từ gốc với dấu câu từ answer
    if (userWord === answerWord) {
      result.push(answerWords[i]);
    } else {
      // Nếu từ không khớp, giữ nguyên từ của user
      result.push(userWords[i]);
    }
  }
  
  return result.join(" ");
}

export function checkWordByWord(userInput: string, correctAnswer: string) {
  const userWords = normalizeString(userInput).split(/\s+/);
  const answerWords = normalizeString(correctAnswer).split(/\s+/);
  let firstWrongIndex = -1;
  const result: ("correct" | "wrong")[] = [];

  for (let i = 0; i < answerWords.length; i++) {
    // Loại bỏ dấu câu khỏi từng từ trước khi so sánh
    const userWord = removePunctuation(userWords[i] || "");
    const answerWord = removePunctuation(answerWords[i] || "");
    
    if (userWord === answerWord) {
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
