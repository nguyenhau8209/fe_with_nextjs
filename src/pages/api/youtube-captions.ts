import type { NextApiRequest, NextApiResponse } from "next";

// Hàm parse SRT thành mảng object { text, start, end }
function parseSRT(
  srt: string
): Array<{ text: string; start: number; end: number }> {
  // Regex tách từng block SRT
  const blocks = srt.split(/\n{2,}/);
  const result: Array<{ text: string; start: number; end: number }> = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    if (lines.length < 2) continue;
    // Dòng thời gian: 00:00:03,210 --> 00:00:07,040
    const timeMatch = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );
    if (!timeMatch) continue;
    const start =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;
    const end =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;
    // Text phụ đề (có thể nhiều dòng)
    const text = lines.slice(2).join(" ").replace(/\s+/g, " ").trim();
    if (text) {
      result.push({ text, start, end });
    }
  }
  return result;
}

// Hàm chọn track phụ đề theo ngôn ngữ và ưu tiên standard > asr
function selectSubtitleTrack(tracks: any[], lang: string) {
  // Ưu tiên standard
  let filtered = tracks.filter(
    (t) => t.languageCode === lang && (!t.kind || t.kind === "standard")
  );
  if (filtered.length > 0) return filtered[0];
  // Nếu không có standard, lấy asr
  filtered = tracks.filter((t) => t.languageCode === lang && t.kind === "asr");
  if (filtered.length > 0) return filtered[0];
  // Nếu không có, fallback sang tiếng Anh
  if (lang !== "en") {
    return selectSubtitleTrack(tracks, "en");
  }
  // Không có phụ đề phù hợp
  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { videoId, lang = "de" } = req.query;
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  try {
    // Gọi endpoint mới lấy tất cả track phụ đề
    const response = await fetch(
      `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/download-all/${videoId}?format_subtitle=srt&format_answer=json`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY || "",
          "X-RapidAPI-Host":
            "youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch transcript from Rapid API");
    }

    const tracks = await response.json();
    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new Error("No subtitles found for this video");
    }

    // Lọc track theo ngôn ngữ và ưu tiên standard > asr
    const track = selectSubtitleTrack(tracks, lang as string);
    if (!track) {
      return res.status(404).json({ error: "No suitable subtitles found" });
    }
    console.log("track", track);
    // Parse SRT thành mảng object
    const subtitles = parseSRT(track.subtitle);
    console.log("subtitles", subtitles);
    res.status(200).json(subtitles);
  } catch (e) {
    console.error("Error fetching transcript:", e);
    res.status(500).json({
      error: "Failed to fetch captions",
      details: e instanceof Error ? e.message : "Unknown error",
    });
  }
}
