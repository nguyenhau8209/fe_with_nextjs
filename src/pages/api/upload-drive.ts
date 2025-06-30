import { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import fetch from "node-fetch";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { audioUrl, publicId } = req.body;
  if (!audioUrl) return res.status(400).json({ error: "Missing audioUrl" });

  try {
    // 1. Tạo stream download từ audioUrl
    const response = await fetch(audioUrl);
    if (!response.ok)
      throw new Error("Không tải được file audio từ URL tạm thời");

    if (!response.body)
      throw new Error("Không có dữ liệu audio để tải lên Cloudinary");

    // 2. Tạo stream upload lên Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video", // Cloudinary dùng 'video' cho audio
        public_id: publicId,
        folder: "youtube-audio",
        overwrite: true,
      },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ url: result?.secure_url, result });
      }
    );

    // 3. Pipe dữ liệu trực tiếp
    response.body.pipe(uploadStream);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
