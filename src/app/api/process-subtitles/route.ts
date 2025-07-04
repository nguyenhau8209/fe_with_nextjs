import { NextResponse } from "next/server";
import { GermanSubtitleProcessor } from "@/utils/subtitleProcessor";

// API này nhận phụ đề đã chỉnh sửa từ client (POST),
// xử lý tự động bằng GermanSubtitleProcessor và trả về phụ đề đã xử lý.
export async function POST(request: Request) {
  try {
    const { subtitles } = await request.json();
    console.log("Received subtitles:", subtitles);
    console.log("Subtitles length:", subtitles?.length);

    if (!subtitles || !Array.isArray(subtitles)) {
      console.log("Invalid subtitles data:", subtitles);
      return NextResponse.json(
        { error: "Invalid subtitles data" },
        { status: 400 }
      );
    }

    // Validate từng subtitle (phải có text, startTime, endTime)
    const valid = subtitles.every(
      (s: any) =>
        s &&
        typeof s.text === "string" &&
        (typeof s.startTime === "number" || typeof s.start === "number") &&
        (typeof s.endTime === "number" || typeof s.end === "number")
    );
    if (!valid) {
      console.log("Invalid subtitle format found");
      return NextResponse.json(
        { error: "Each subtitle must have text, startTime/start, endTime/end" },
        { status: 400 }
      );
    }

    console.log("Validation passed, processing subtitles...");
    // Xử lý bằng pipeline mới, trả về cả bản gốc và bản đã xử lý
    const { rawSubtitles, processedSubtitles } = await import(
      "@/utils/subtitleProcessor"
    ).then((module) => module.processSubtitlesWithMapping(subtitles));
    console.log("Processed subtitles result:", processedSubtitles);
    console.log("Processed subtitles length:", processedSubtitles.length);

    return NextResponse.json({ rawSubtitles, subtitles: processedSubtitles });
  } catch (error) {
    console.error("Error processing subtitles:", error);
    return NextResponse.json(
      { error: "Failed to process subtitles" },
      { status: 500 }
    );
  }
}
