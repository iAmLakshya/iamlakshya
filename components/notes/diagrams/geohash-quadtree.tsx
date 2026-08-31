"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout, Stage } from "./primitives";

/** Real geohash cell dimensions at the equator (worst case), per Elastic's table. */
const PRECISION = [
  "5,009 km × 4,993 km",
  "1,252 km × 624 km",
  "156.5 km × 156 km",
  "39.1 km × 19.5 km",
  "4.9 km × 4.9 km",
  "1.2 km × 609 m",
];
const Q = ["A", "B", "C", "D"] as const;

/** Prefix search as a half-open range. Carries when the last character is the final quadrant,
 *  so "ABD" becomes "ABD" ≤ x < "AC" rather than an empty range. */
function rangeScan(path: string[]): string {
  const lo = path.join("");
  const chars = [...path];
  let i = chars.length - 1;
  while (i >= 0 && chars[i] === Q[Q.length - 1]) {
    chars.pop();
    i--;
  }
  if (i < 0) return `"${lo}" ≤ x  (last cell)`;
  chars[i] = Q[Q.indexOf(chars[i] as (typeof Q)[number]) + 1];
  return `"${lo}" ≤ x < "${chars.join("")}"`;
}

export function GeohashQuadTree() {
  const [path, setPath] = useState<string[]>([]);
  const S = 220;

  // Each character quarters the cell: quadrant index -> (col,row)
  const rect = path.reduce(
    (acc, ch) => {
      const i = Q.indexOf(ch as (typeof Q)[number]);
      const half = acc.w / 2;
      return { x: acc.x + (i % 2) * half, y: acc.y + Math.floor(i / 2) * half, w: half };
    },
    { x: 0, y: 0, w: S },
  );

  const depth = path.length;
  const children = depth < 5
    ? Q.map((q, i) => ({
        q,
        x: rect.x + (i % 2) * (rect.w / 2),
        y: rect.y + Math.floor(i / 2) * (rect.w / 2),
        w: rect.w / 2,
      }))
    : [];

  return (
    <Figure
      title="Geohash prefix drilldown"
      caption={
        <>
          Click a quadrant to add a character. Every character quarters the cell, and a
          shared prefix means physical proximity, so a radius search becomes a prefix range
          scan. The cells shrink faster than intuition suggests: three characters is still a{" "}
          <strong>156 km</strong> box, and about 1 km takes six.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">prefix</span>
          <code className="rounded-md bg-gray-900 px-2.5 py-1 font-mono text-sm font-semibold tracking-[0.2em] text-white">
            {path.join("") || "·"}
          </code>
        </div>
        <Btn onClick={() => setPath((p) => p.slice(0, -1))}>Zoom out</Btn>
        <Btn onClick={() => setPath([])}>Reset</Btn>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Stage viewBox={`0 0 ${S} ${S}`} height={230} className="sm:w-1/2">
          <rect x={0} y={0} width={S} height={S} fill="#f8fafc" stroke={C.line} />
          {[...Array(depth + 1)].map((_, lvl) => {
            const step = S / 2 ** lvl;
            return [...Array(2 ** lvl - 1)].map((__, k) => (
              <g key={`${lvl}-${k}`} opacity={0.35 - lvl * 0.05}>
                <line x1={(k + 1) * step} y1={0} x2={(k + 1) * step} y2={S} stroke={C.muted} strokeWidth={0.6} />
                <line x1={0} y1={(k + 1) * step} x2={S} y2={(k + 1) * step} stroke={C.muted} strokeWidth={0.6} />
              </g>
            ));
          })}
          <motion.rect animate={{ x: rect.x, y: rect.y, width: rect.w, height: rect.w }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            fill={C.read} fillOpacity={0.1} stroke={C.read} strokeWidth={2} rx={2} />
          {children.map((c) => (
            <g key={c.q} onClick={() => setPath((p) => [...p, c.q])} className="cursor-pointer">
              <rect x={c.x} y={c.y} width={c.w} height={c.w} fill="transparent" />
              <motion.rect x={c.x + 1} y={c.y + 1} width={c.w - 2} height={c.w - 2}
                fill={C.read} initial={{ fillOpacity: 0 }} whileHover={{ fillOpacity: 0.22 }} rx={2} />
              {c.w > 26 && (
                <text x={c.x + c.w / 2} y={c.y + c.w / 2 + 4} textAnchor="middle"
                  className="font-mono text-[11px] font-bold" fill={C.read} opacity={0.75}>
                  {c.q}
                </text>
              )}
            </g>
          ))}
        </Stage>

        <div className="sm:w-1/2">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-gray-50 text-gray-500">
                <tr><th className="px-2.5 py-1.5 font-semibold">chars</th><th className="px-2.5 py-1.5 font-semibold">cell size</th></tr>
              </thead>
              <tbody>
                {PRECISION.map((p, i) => (
                  <tr key={i} className={i + 1 === depth ? "bg-blue-50 font-semibold text-blue-900" : "text-gray-600"}>
                    <td className="border-t border-gray-100 px-2.5 py-1.5 font-mono">{i + 1}</td>
                    <td className="border-t border-gray-100 px-2.5 py-1.5 font-mono">{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Readout
        items={[
          { label: "characters", value: depth || "0" },
          { label: "cell", value: depth ? PRECISION[depth - 1] : "whole world" },
          { label: "range scan", value: path.length ? rangeScan(path) : "—" },
        ]}
      />
    </Figure>
  );
}
