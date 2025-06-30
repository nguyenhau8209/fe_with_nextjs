import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { file } = req.query;
  console.log("file", file);
  if (!file) return res.status(400).send("Missing file param");
  const filePath = path.join("/tmp", file as string);
  console.log("filePath", filePath);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");
  res.setHeader("Content-Type", "audio/webm");
  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    console.error("Audio proxy stream error:", err);
    res.status(500).send("Error reading audio file");
  });
  stream.pipe(res);
}
