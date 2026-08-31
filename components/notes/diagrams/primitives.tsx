"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/* Shared shell + controls for the interactive figures.
   The site hides the native cursor globally, so every control needs a strong
   hover/active state to read as interactive. */

export function Figure({
  title,
  caption,
  children,
  className,
}: {
  title?: string;
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "my-8 overflow-hidden rounded-xl border border-gray-200 bg-white",
        className,
      )}
    >
      {title && (
        <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
          <span className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
            {title}
          </span>
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
      {caption && (
        <figcaption className="border-t border-gray-100 bg-gray-50/40 px-4 py-3 text-[13px] leading-relaxed text-gray-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function Controls({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-x-6 gap-y-4">{children}</div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  onChange,
  hint,
  accent = "#0f172a",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  hint?: string;
  accent?: string;
}) {
  return (
    <label className="flex min-w-[8.5rem] flex-1 flex-col gap-1.5">
      <span className="flex items-baseline justify-between text-xs font-medium text-gray-600">
        <span>{label}</span>
        <span
          className="ml-2 font-mono text-sm tabular-nums"
          style={{ color: accent }}
        >
          {value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: accent }}
        className="h-1.5 w-full appearance-none rounded-full bg-gray-200 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-current [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125"
      />
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-medium text-gray-600">{label}</span>
      )}
      <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-[7px] px-3 py-1.5 text-xs font-medium transition-all",
              value === o.value
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                : "text-gray-500 hover:text-gray-900",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Btn({
  children,
  onClick,
  tone = "neutral",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "neutral" | "primary" | "danger";
}) {
  const tones = {
    neutral: "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300",
    primary: "bg-gray-900 text-white ring-gray-900 hover:bg-gray-700 hover:ring-gray-700",
    danger: "bg-white text-rose-600 ring-rose-200 hover:bg-rose-50 hover:ring-rose-300",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-all active:scale-[0.97]",
        tones[tone],
      )}
    >
      {children}
    </button>
  );
}

export function Readout({
  items,
}: {
  items: { label: string; value: ReactNode; tone?: "ok" | "bad" | "plain" }[];
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline gap-2">
          <span className="text-[11px] tracking-wide text-gray-400 uppercase">
            {it.label}
          </span>
          <span
            className={cn(
              "font-mono text-sm tabular-nums",
              it.tone === "ok" && "text-emerald-600",
              it.tone === "bad" && "text-rose-600",
              (!it.tone || it.tone === "plain") && "text-gray-900",
            )}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Consistent node colours across every figure. */
export const C = {
  ink: "#0f172a",
  line: "#cbd5e1",
  muted: "#94a3b8",
  write: "#e11d48",
  read: "#2563eb",
  both: "#7c3aed",
  ok: "#059669",
  warn: "#d97706",
  idle: "#e2e8f0",
  idleText: "#64748b",
} as const;

export function Stage({
  viewBox,
  children,
  className,
  height = 260,
}: {
  viewBox: string;
  children: ReactNode;
  className?: string;
  height?: number;
}) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      style={{ maxHeight: height }}
      className={cn("w-full touch-manipulation overflow-visible select-none", className)}
    >
      {children}
    </svg>
  );
}
