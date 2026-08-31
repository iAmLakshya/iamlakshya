import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/** A labelled left-to-right pipeline. Static: nothing here rewards interaction. */
export function Flow({
  steps,
  note,
  tone = "neutral",
}: {
  steps: { label: string; sub?: string; tint?: "ink" | "muted" | "accent" }[];
  note?: ReactNode;
  tone?: "neutral" | "tight";
}) {
  const tints = {
    ink: "bg-gray-900 text-white border-gray-900",
    muted: "bg-white text-gray-500 border-gray-200",
    accent: "bg-blue-50 text-blue-900 border-blue-200",
  } as const;
  return (
    <figure className="my-6">
      <div className={cn("flex flex-wrap items-stretch gap-1.5", tone === "tight" && "gap-1")}>
        {steps.map((s, i) => (
          <div key={s.label} className="flex min-w-0 flex-1 items-center gap-1.5">
            <div
              className={cn(
                "min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-center",
                tints[s.tint ?? "muted"],
              )}
            >
              <div className="truncate text-[12px] font-semibold">{s.label}</div>
              {s.sub && (
                <div
                  className={cn(
                    "mt-0.5 text-[10px] leading-tight",
                    s.tint === "ink" ? "text-gray-300" : "text-gray-400",
                  )}
                >
                  {s.sub}
                </div>
              )}
            </div>
            {i < steps.length - 1 && (
              <span className="shrink-0 text-gray-300" aria-hidden>
                →
              </span>
            )}
          </div>
        ))}
      </div>
      {note && (
        <figcaption className="mt-2 text-[12px] text-gray-500">{note}</figcaption>
      )}
    </figure>
  );
}
