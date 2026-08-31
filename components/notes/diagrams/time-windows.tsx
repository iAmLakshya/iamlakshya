"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Figure, Readout, Segmented, Stage } from "./primitives";

const EVENTS = [
  { id: "A", t: 0.4 }, { id: "B", t: 1.2 }, { id: "C", t: 1.6 },
  { id: "D", t: 3.3 }, { id: "E", t: 3.5 }, { id: "F", t: 3.8 }, { id: "G", t: 4.4 },
];

export function TimeWindows() {
  const [mode, setMode] = useState<"tumbling" | "hopping" | "sliding">("tumbling");
  const [now, setNow] = useState(3.0);

  const W = 460, minutes = 5, px = (t: number) => 20 + (t / minutes) * (W - 40);

  const windows =
    mode === "tumbling"
      ? [0, 1, 2, 3, 4].map((s) => ({ s, e: s + 1 }))
      : mode === "hopping"
        ? [0, 1, 2, 3].map((s) => ({ s, e: s + 2 }))
        : [{ s: Math.max(0, now - 2), e: now }];

  const inWindow = (t: number, w: { s: number; e: number }) => t >= w.s && t < w.e;
  const captured = mode === "sliding" ? EVENTS.filter((e) => inWindow(e.t, windows[0])) : [];

  return (
    <Figure
      title="Time windows"
      caption={
        <>
          Tumbling windows never overlap, so each event lands in exactly one bucket.
          Hopping windows overlap, so an event is counted more than once. The sliding
          window is a queue: drag the playhead and events fall out of the tail as it
          advances.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Segmented value={mode} onChange={setMode}
          options={[
            { value: "tumbling", label: "Tumbling 1m" },
            { value: "hopping", label: "Hopping 2m" },
            { value: "sliding", label: "Sliding 2m" },
          ] as const} />
        {mode === "sliding" && (
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
            <span className="flex justify-between text-xs font-medium text-gray-600">
              <span>playhead</span>
              <span className="font-mono text-sm" style={{ color: C.read }}>{now.toFixed(1)}m</span>
            </span>
            <input type="range" min={0} max={5} step={0.1} value={now}
              onChange={(e) => setNow(Number(e.target.value))}
              style={{ accentColor: C.read }}
              className="h-1.5 w-full appearance-none rounded-full bg-gray-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-current" />
          </label>
        )}
      </div>

      <Stage viewBox={`0 0 ${W} 130`} height={170}>
        {windows.map((w, i) => (
          <motion.rect key={`${mode}-${i}`}
            initial={{ opacity: 0 }} animate={{ opacity: mode === "hopping" ? 0.16 : 0.2 }}
            x={px(w.s)} y={20 + (mode === "hopping" ? (i % 2) * 9 : 0)}
            width={px(w.e) - px(w.s) - 2}
            height={mode === "hopping" ? 44 : 54}
            rx={6} fill={mode === "sliding" ? C.read : C.both} />
        ))}
        <line x1={20} y1={92} x2={W - 20} y2={92} stroke={C.line} strokeWidth={1.5} />
        {[0, 1, 2, 3, 4, 5].map((m) => (
          <g key={m}>
            <line x1={px(m)} y1={88} x2={px(m)} y2={96} stroke={C.muted} strokeWidth={1.2} />
            <text x={px(m)} y={112} textAnchor="middle" className="font-mono text-[10px]" fill={C.muted}>
              000{m + 1}
            </text>
          </g>
        ))}
        {EVENTS.map((e) => {
          const active = mode === "sliding" ? inWindow(e.t, windows[0]) : true;
          return (
            <motion.g key={e.id} animate={{ opacity: active ? 1 : 0.25 }}>
              <circle cx={px(e.t)} cy={92} r={8} fill={active ? C.ink : C.idle} />
              <text x={px(e.t)} y={96} textAnchor="middle" className="text-[9px] font-bold"
                fill={active ? "#fff" : C.idleText}>{e.id}</text>
            </motion.g>
          );
        })}
        {mode === "sliding" && (
          <motion.line animate={{ x1: px(now), x2: px(now) }} y1={14} y2={104}
            stroke={C.read} strokeWidth={2} strokeDasharray="4 3" />
        )}
      </Stage>

      <Readout
        items={
          mode === "sliding"
            ? [
                { label: "in window", value: captured.map((c) => c.id).join(", ") || "—" },
                { label: "count", value: captured.length },
              ]
            : [
                { label: "windows", value: windows.length },
                { label: "overlap", value: mode === "hopping" ? "yes — events counted twice" : "none",
                  tone: mode === "hopping" ? "bad" : "ok" },
              ]
        }
      />
    </Figure>
  );
}
