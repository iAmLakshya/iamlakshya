import { cn } from "@/lib/cn";
import { ReactNode } from "react";

export type HighlightColor =
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "cyan";

interface HighlightProps {
  children: ReactNode;
  color?: HighlightColor;
  className?: string;
}

const colorMap: Record<HighlightColor, string> = {
  orange: "before:bg-orange-300",
  yellow: "before:bg-yellow-300",
  green: "before:bg-green-300",
  blue: "before:bg-blue-300",
  purple: "before:bg-purple-300",
  pink: "before:bg-pink-300",
  red: "before:bg-red-300",
  cyan: "before:bg-cyan-300",
};

export function Highlight({
  children,
  color = "yellow",
  className,
}: HighlightProps) {
  return (
    <span
      className={cn(
        "relative inline-block",
        "before:absolute before:inset-x-0 before:bottom-0 before:h-[40%] before:-z-10",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}
