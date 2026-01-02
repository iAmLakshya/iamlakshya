import type { Metadata } from "next";
import "./globals.css";
import { MainText } from "./fonts";
import { CursorProvider } from "@/components/cursor-provider";

export const metadata: Metadata = {
  title: "Lakshya Singh Panwar",
  description: "Full Stack Developer",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={MainText.className}>
      <body>
        <CursorProvider>{children}</CursorProvider>
      </body>
    </html>
  );
}
