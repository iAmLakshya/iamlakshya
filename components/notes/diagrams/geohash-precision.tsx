"use client";

import { useState } from "react";
import { C, Controls, Figure, Readout, Slider, Stage } from "./primitives";

/** A cell prefix approximates a circle. Both kinds of error are visible at once. */
export function GeohashPrecision() {
  const [r, setR] = useState(58);
  const S = 240, cx = 120, cy = 120, cell = 60;

  // Cells whose area intersects the circle are the ones a prefix scan would return.
  const cells: { x: number; y: number; inside: boolean; corner: boolean }[] = [];
  for (let gx = 0; gx < 4; gx++) {
    for (let gy = 0; gy < 4; gy++) {
      const x = gx * cell, y = gy * cell;
      const nearestX = Math.max(x, Math.min(cx, x + cell));
      const nearestY = Math.max(y, Math.min(cy, y + cell));
      const d = Math.hypot(nearestX - cx, nearestY - cy);
      const corners = [[x, y], [x + cell, y], [x, y + cell], [x + cell, y + cell]];
      const allIn = corners.every(([px, py]) => Math.hypot(px - cx, py - cy) <= r);
      cells.push({ x, y, inside: d <= r, corner: d <= r && !allIn });
    }
  }
  const scanned = cells.filter((c) => c.inside).length;
  const partial = cells.filter((c) => c.corner).length;

  return (
    <Figure
      title="Where the prefix approximation leaks"
      caption={
        <>
          The search is a circle; the index can only answer in cells. Every cell the circle
          touches has to be scanned, and the shaded corners of those cells are points that come
          back from the index but fall outside the radius. That is why the last step is always a
          real distance check on the candidates. Widen the radius and the count of cells to scan
          climbs faster than the area does.
        </>
      }
    >
      <Controls>
        <Slider label="search radius" value={r} min={20} max={110} onChange={setR} accent={C.read} />
      </Controls>

      <Stage viewBox={`0 0 ${S} ${S}`} height={250}>
        {cells.map((c, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y} width={cell} height={cell}
              fill={c.corner ? "#fef3c7" : c.inside ? "#dbeafe" : "#f8fafc"}
              stroke={C.line} strokeWidth={1} />
          </g>
        ))}
        <circle cx={cx} cy={cy} r={r} fill={C.read} fillOpacity={0.12} stroke={C.read} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={4} fill={C.read} />
      </Stage>

      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-100 ring-1 ring-blue-300 ring-inset" /> fully inside — every point qualifies</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-100 ring-1 ring-amber-300 ring-inset" /> partly inside — scanned, then filtered</span>
      </div>

      <Readout
        items={[
          { label: "cells scanned", value: scanned },
          { label: "needing a distance check", value: partial, tone: partial > 6 ? "bad" : "plain" },
          { label: "false positives", value: partial ? "corners of the shaded cells" : "none" },
        ]}
      />
    </Figure>
  );
}
