"use client";

import { cn } from "@/lib/cn";
import { useState } from "react";
import { Figure, Readout, Segmented } from "./primitives";

const COLS = ["id", "user", "region", "amount", "ts"];
const ROWS = 8;

/** An analytical query touches two columns; the layout decides how much disk it drags in. */
export function RowVsColumn() {
  const [layout, setLayout] = useState<"row" | "column">("row");
  const wanted = new Set(["region", "amount"]);

  const read = layout === "row" ? ROWS * COLS.length : ROWS * wanted.size;
  const total = ROWS * COLS.length;

  return (
    <Figure
      title="Row against column layout"
      caption={
        <>
          The query is <code>SELECT region, SUM(amount) … GROUP BY region</code>: two columns out
          of five. Row layout interleaves every column on disk, so reading the two you want drags
          in the three you do not. Column layout stores each one contiguously, and the same query
          touches only what it asked for. The cost lands on writes, where a single row now has to
          be written to five separate places.
        </>
      }
    >
      <div className="mb-4">
        <Segmented value={layout} onChange={setLayout}
          options={[{ value: "row", label: "Row-oriented" }, { value: "column", label: "Column-oriented" }] as const} />
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-[3px]">
          {layout === "row"
            ? Array.from({ length: ROWS }).map((_, r) => (
                <div key={r} className="flex gap-[3px]">
                  {COLS.map((c) => (
                    <div key={c}
                      className={cn(
                        "h-5 w-[62px] rounded-[3px] text-center font-mono text-[9px] leading-5",
                        wanted.has(c)
                          ? "bg-blue-500 text-white"
                          : "bg-rose-100 text-rose-500",
                      )}>
                      {r === 0 ? c : ""}
                    </div>
                  ))}
                </div>
              ))
            : (
              <div className="flex gap-[3px]">
                {COLS.map((c) => (
                  <div key={c} className="flex flex-col gap-[3px]">
                    <div className="mb-0.5 text-center font-mono text-[9px] text-gray-500">{c}</div>
                    {Array.from({ length: ROWS }).map((_, r) => (
                      <div key={r}
                        className={cn(
                          "h-5 w-[62px] rounded-[3px]",
                          wanted.has(c) ? "bg-blue-500" : "bg-gray-100",
                        )} />
                    ))}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      <div className="mt-3 flex gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> read and used</span>
        <span className="flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 rounded-sm", layout === "row" ? "bg-rose-100" : "bg-gray-100")} />
          {layout === "row" ? "read and thrown away" : "never touched"}
        </span>
      </div>

      <Readout
        items={[
          { label: "blocks read", value: `${read} / ${total}`, tone: layout === "row" ? "bad" : "ok" },
          { label: "wasted", value: `${Math.round(((read - ROWS * wanted.size) / total) * 100)}%`, tone: layout === "row" ? "bad" : "ok" },
          { label: "write cost", value: layout === "row" ? "one place" : "one place per column" },
        ]}
      />
    </Figure>
  );
}
