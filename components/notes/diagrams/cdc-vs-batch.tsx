"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Figure, Readout, Segmented, Stage } from "./primitives";

const EVENTS = [
  { t: 18, label: "INSERT", val: "draft" },
  { t: 36, label: "UPDATE", val: "review" },
  { t: 54, label: "UPDATE", val: "live" },
  { t: 72, label: "DELETE", val: "—" },
];

export function CdcVsBatch() {
  const [mode, setMode] = useState<"batch" | "cdc">("batch");
  const px = (p: number) => 40 + (p / 100) * 360;
  const captured = mode === "cdc" ? EVENTS.length : 0;

  return (
    <Figure
      title="Nightly batch against change data capture"
      caption={
        <>
          A row is created, edited twice and deleted between two nightly runs. The batch job
          compares snapshots, so it sees the row absent at both ends and emits nothing at all -
          the entire life of that row is invisible downstream. Change data capture reads the
          log, so every transition arrives, and a derived store can be rebuilt by replaying them.
        </>
      }
    >
      <div className="mb-4">
        <Segmented value={mode} onChange={setMode}
          options={[{ value: "batch", label: "Nightly batch" }, { value: "cdc", label: "CDC stream" }] as const} />
      </div>

      <Stage viewBox="0 0 440 150" height={180}>
        {[0, 100].map((p, i) => (
          <g key={p}>
            <line x1={px(p)} y1={16} x2={px(p)} y2={112} stroke={C.ink} strokeWidth={2} strokeDasharray="4 3" />
            <text x={px(p)} y={12} textAnchor="middle" className="text-[9px] font-bold" fill={C.ink}>
              run {i + 1}
            </text>
          </g>
        ))}
        <line x1={40} y1={88} x2={400} y2={88} stroke={C.line} strokeWidth={1.4} />

        {EVENTS.map((e, i) => (
          <g key={i}>
            <motion.line animate={{ opacity: mode === "cdc" ? 1 : 0.18 }}
              x1={px(e.t)} y1={62} x2={px(e.t)} y2={88}
              stroke={e.label === "DELETE" ? C.write : C.read} strokeWidth={1.6} />
            <motion.circle animate={{ opacity: mode === "cdc" ? 1 : 0.18, r: mode === "cdc" ? 6 : 4 }}
              cx={px(e.t)} cy={88} fill={e.label === "DELETE" ? C.write : C.read} />
            <motion.text animate={{ opacity: mode === "cdc" ? 1 : 0.25 }}
              x={px(e.t)} y={56} textAnchor="middle" className="font-mono text-[8.5px] font-bold"
              fill={e.label === "DELETE" ? C.write : C.read}>{e.label}</motion.text>
            <motion.text animate={{ opacity: mode === "cdc" ? 1 : 0.25 }}
              x={px(e.t)} y={106} textAnchor="middle" className="font-mono text-[8.5px]" fill={C.muted}>{e.val}</motion.text>
          </g>
        ))}

        <text x={40} y={136} className="text-[10px]" fill={mode === "cdc" ? C.ok : C.write}>
          {mode === "cdc"
            ? "downstream sees all four transitions"
            : "row absent in both snapshots — downstream sees nothing"}
        </text>
      </Stage>

      <Readout
        items={[
          { label: "transitions captured", value: `${captured} / 4`, tone: captured === 4 ? "ok" : "bad" },
          { label: "latency", value: mode === "cdc" ? "sub-second" : "up to 24 hours" },
          { label: "replayable", value: mode === "cdc" ? "yes" : "no" },
        ]}
      />
    </Figure>
  );
}
