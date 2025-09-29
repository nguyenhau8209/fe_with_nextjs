import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import type { Viewport } from "next";
const inter = Inter({ subsets: ["latin"] });
import { SpeedInsights } from '@vercel/speed-insights/next';
export const metadata: Metadata = {
  title: "Daily Deutsch Dictation",
  description: "Luyện nghe chép tiếng Đức mỗi ngày",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
            <SpeedInsights />
          </div>
        </main>
      </body>
    </html>
  );
}
