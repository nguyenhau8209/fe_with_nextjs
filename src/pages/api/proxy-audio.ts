import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url" });
  }

  try {
    // Lấy range header từ request
    const range = req.headers.range;

    // Tạo headers cho fetch request
    const fetchHeaders: HeadersInit = {};
    if (range) {
      fetchHeaders["Range"] = range;
    }

    const response = await fetch(url, {
      headers: fetchHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.status}`);
    }

    // Copy important headers từ response gốc
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const acceptRanges = response.headers.get("accept-ranges");
    const contentRange = response.headers.get("content-range");

    // Set headers cho response
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }
    if (acceptRanges) {
      res.setHeader("Accept-Ranges", acceptRanges);
    }
    if (contentRange) {
      res.setHeader("Content-Range", contentRange);
    }

    // Copy status code (quan trọng cho 206 Partial Content)
    res.status(response.status);

    // Stream response body
    if (response.body) {
      const reader = response.body.getReader();
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              res.write(Buffer.from(value));
            }
          }
          res.end();
        } catch (error) {
          console.error("Streaming error:", error);
          res.end();
        }
      };
      pump();
    } else {
      // Fallback cho trường hợp không có stream
      const buffer = await response.arrayBuffer();
      res.write(Buffer.from(buffer));
      res.end();
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy failed", details: String(error) });
  }
}
