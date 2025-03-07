import type { Metadata } from "next";
import "./globals.css";
import { ptSerif } from './fonts';

export const metadata: Metadata = {
  title: "Lakshya Singh Panwar",
  description: "Full Stack Developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ptSerif.className}>
      <body>
        {children}
      </body>
    </html>
  );
}
