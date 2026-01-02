import { ReactNode } from "react";
import { HeadingText, MainText } from "@/app/fonts";
import { Highlight, HighlightColor } from "./highlight";

interface SectionProps {
  children?: ReactNode;
  title?: string;
  highlightColor?: HighlightColor;
}

export function Section({ children, title, highlightColor }: SectionProps) {
  return (
    <section className={`${MainText.className} text-gray-600 mb-8 sm:mb-10`}>
      {title && (
        <h3
          className={`${HeadingText.className} text-xl sm:text-2xl text-gray-800 font-medium`}
        >
          {highlightColor ? (
            <Highlight color={highlightColor}>{title}</Highlight>
          ) : (
            title
          )}
        </h3>
      )}
      {children}
    </section>
  );
}
