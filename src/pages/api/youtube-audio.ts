import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { videoId } = req.query;
  if (!videoId || typeof videoId !== "string") {
    return res.status(400).json({ error: "Missing videoId" });
  }
  try {
    const response = await fetch(
      `https://youtube-video-fast-downloader-24-7.p.rapidapi.com/download_audio/${videoId}?quality=251`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY || "",
          "X-RapidAPI-Host":
            "youtube-video-fast-downloader-24-7.p.rapidapi.com",
        },
      }
    );
    const data = await response.json();
    console.log("data", data);
    if (!data.file) throw new Error("No audio url found");
    res.status(200).json({ audioUrl: data.file });
  } catch (e) {
    res.status(500).json({ error: "Failed to get audio url" });
  }
}
