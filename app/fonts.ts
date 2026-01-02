import { Coming_Soon, Open_Sans } from "next/font/google";

export const HeadingText = Coming_Soon({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  display: "swap",
});

export const MainText = Open_Sans({
  subsets: ["latin"],
  weight: ["300"],
  style: ["normal", "italic"],
  display: "swap",
});
