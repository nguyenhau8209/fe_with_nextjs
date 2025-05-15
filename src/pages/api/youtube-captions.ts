import type { NextApiRequest, NextApiResponse } from "next";
import { getSubtitles } from "youtube-caption-extractor";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { videoId, lang = "de" } = req.query;
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });
  try {
    const captions = await getSubtitles({
      videoID: videoId as string,
      lang: lang as string,
    });

    // captions: [{ start, dur, text }]
    const result = captions.map((cap: Record<string, any>) => ({
      text: cap.text,
      startTime: parseFloat(cap.start),
      endTime: parseFloat(cap.start) + parseFloat(cap.dur),
    }));

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch captions", details: e });
  }
}
