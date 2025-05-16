import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

// Hàm làm sạch text phụ đề
function cleanSubtitleText(text: string): string {
  // Giải mã các entity HTML phổ biến
  const htmlDecoded = text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
  // Loại bỏ các ký tự đặc biệt (giữ lại chữ cái, số, khoảng trắng, dấu hỏi, dấu chấm than, dấu phẩy)
  return htmlDecoded.replace(/[.,\[\]{}()"'""''!?:;<>/\\]/g, "").trim();
}

// Khởi tạo Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Cache TTL: 24 giờ
const CACHE_TTL = 60 * 60 * 24;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { videoId, lang = "de" } = req.query;
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  try {
    // Tạo cache key dựa trên videoId và ngôn ngữ
    const cacheKey = `transcript:${videoId}:${lang}`;

    // Kiểm tra cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Gọi Rapid API với ngôn ngữ được chỉ định
    const response = await fetch(
      `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/download-json/${videoId}?language=${lang}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY || "",
          "X-RapidAPI-Host":
            "youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      // Nếu không tìm thấy phụ đề với ngôn ngữ được chỉ định, thử lấy phụ đề tiếng Anh
      if (response.status === 404 && lang !== "en") {
        const fallbackResponse = await fetch(
          `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/download-json/${videoId}?language=${lang}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPID_API_KEY || "",
              "X-RapidAPI-Host":
                "youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com",
            },
          }
        );

        if (!fallbackResponse.ok) {
          throw new Error("Failed to fetch transcript from Rapid API");
        }

        const fallbackData = await fallbackResponse.json();
        console.log("fallbackData ", fallbackData);

        // Chuyển đổi dữ liệu từ Rapid API sang định dạng phù hợp với ứng dụng
        const formattedSubtitles = fallbackData.map((item: any) => ({
          text: cleanSubtitleText(item.text),
          startTime: parseFloat(item.start),
          endTime: parseFloat(item.start) + parseFloat(item.dur),
        }));

        console.log("formattedSubtitles ", formattedSubtitles);
        // Cache kết quả
        await redis.set(cacheKey, formattedSubtitles, { ex: CACHE_TTL });
        return res.status(200).json(formattedSubtitles);
      }
      throw new Error("Failed to fetch transcript from Rapid API");
    }
    console.log("response ", response);
    const data = await response.json();
    console.log("data ", data);

    // Chuyển đổi dữ liệu từ Rapid API sang định dạng phù hợp với ứng dụng
    const formattedSubtitles = data.map((item: any) => ({
      text: cleanSubtitleText(item.text),
      startTime: parseFloat(item.start),
      endTime: parseFloat(item.start) + parseFloat(item.dur),
    }));

    console.log("formattedSubtitles ", formattedSubtitles);
    // Cache kết quả
    await redis.set(cacheKey, formattedSubtitles, { ex: CACHE_TTL });

    res.status(200).json(formattedSubtitles);
  } catch (e) {
    console.error("Error fetching transcript:", e);
    res.status(500).json({
      error: "Failed to fetch captions",
      details: e instanceof Error ? e.message : "Unknown error",
    });
  }
}
