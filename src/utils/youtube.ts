import { Subtitle } from "../types/lesson";

export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const checkSubtitles = async (
  videoId: string,
  language: string
): Promise<Subtitle[]> => {
  try {
    const apiKey =
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ||
      (typeof window !== "undefined"
        ? (window as any).env?.NEXT_PUBLIC_YOUTUBE_API_KEY
        : undefined);
    console.log("apiKey ", apiKey);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${apiKey}`
    );
    const data = await response.json();
    const subtitles: Subtitle[] = [];
    console.log("data ", data);
    if (data.items) {
      data.items.forEach((item: any) => {
        if (item.snippet.language === language) {
          subtitles.push({
            language: item.snippet.language,
            url:
              item.snippet.trackKind === "ASR"
                ? "auto"
                : item.snippet.trackKind,
          });
        }
      });
    }
    console.log("subtitles ", subtitles);
    return subtitles;
  } catch (error) {
    console.error("Error checking subtitles:", error);
    return [];
  }
};
