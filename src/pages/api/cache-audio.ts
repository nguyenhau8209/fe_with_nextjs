import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { audioUrl, fileName } = req.body;
  console.log("audioUrl", audioUrl);
  console.log("fileName", fileName);
  if (!audioUrl || !fileName)
    return res.status(400).json({ error: "Missing params" });

  try {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9-_.]/g, "_");

    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error("Failed to fetch audio file");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const saveDir = "/tmp";
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }
    const savePath = path.join(saveDir, safeFileName);
    fs.writeFileSync(savePath, buffer);

    res.status(200).json({ fileName: safeFileName });
  } catch (err) {
    console.error("Cache audio error:", err);
    res.status(500).json({ error: "Failed to cache audio", details: err });
  }
}
