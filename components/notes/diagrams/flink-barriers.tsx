"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, Figure, Readout } from "./primitives";

/** Barrier alignment: C3 snapshots only once a barrier has arrived on every input. */
export function FlinkBarriers() {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const aligned = c1 && c2;

  return (
    <Figure
      title="Barrier alignment"
      caption="A barrier flows through the topology behind the records it separates. An operator with more than one input waits until the barrier has arrived on all of them before snapshotting, which is what makes the checkpoint a consistent cut rather than a set of unrelated saves."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Btn onClick={() => setC1(true)} tone={c1 ? "neutral" : "primary"}>Barrier reaches C1</Btn>
        <Btn onClick={() => setC2(true)} tone={c2 ? "neutral" : "primary"}>Barrier reaches C2</Btn>
        <Btn onClick={() => { setC1(false); setC2(false); }}>Reset</Btn>
      </div>

      <svg viewBox="0 0 400 160" className="w-full select-none" style={{ maxHeight: 190 }}>
        <rect x={10} y={62} width={54} height={36} rx={8} fill="#0f172a" />
        <text x={37} y={85} textAnchor="middle" className="text-[11px] font-bold" fill="#fff">Source</text>

        {[{ y: 20, on: c1, n: "C1" }, { y: 104, on: c2, n: "C2" }].map((c) => (
          <g key={c.n}>
            <path d={`M 64 80 C 96 80 96 ${c.y + 18} 128 ${c.y + 18}`} fill="none" stroke="#cbd5e1" strokeWidth={1.6} />
            <motion.circle r={6} animate={{ cx: c.on ? 128 : 84, cy: c.on ? c.y + 18 : 80, fill: c.on ? "#d97706" : "#fbbf24" }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }} />
            <motion.rect x={130} y={c.y} width={56} height={36} rx={8}
              animate={{ fill: c.on ? "#fef3c7" : "#fff", stroke: c.on ? "#d97706" : "#cbd5e1" }} strokeWidth={1.6} />
            <text x={158} y={c.y + 23} textAnchor="middle" className="text-[11px] font-bold"
              fill={c.on ? "#92400e" : "#64748b"}>{c.n}</text>
            <path d={`M 186 ${c.y + 18} C 218 ${c.y + 18} 218 80 250 80`} fill="none" stroke="#cbd5e1" strokeWidth={1.6} />
          </g>
        ))}

        <motion.rect x={252} y={62} width={56} height={36} rx={8}
          animate={{ fill: aligned ? "#d1fae5" : "#fff", stroke: aligned ? "#059669" : "#cbd5e1" }} strokeWidth={1.8} />
        <text x={280} y={85} textAnchor="middle" className="text-[11px] font-bold"
          fill={aligned ? "#047857" : "#64748b"}>C3</text>

        <motion.g animate={{ opacity: aligned ? 1 : 0.25 }}>
          <line x1={308} y1={80} x2={340} y2={80} stroke={aligned ? "#059669" : "#cbd5e1"} strokeWidth={1.8} />
          <rect x={342} y={62} width={50} height={36} rx={8} fill="none" stroke={aligned ? "#059669" : "#cbd5e1"} strokeWidth={1.6} strokeDasharray="4 3" />
          <text x={367} y={78} textAnchor="middle" className="text-[9px] font-semibold" fill={aligned ? "#047857" : "#94a3b8"}>snapshot</text>
          <text x={367} y={90} textAnchor="middle" className="text-[9px]" fill="#94a3b8">to S3</text>
        </motion.g>
      </svg>

      <Readout
        items={[
          { label: "barriers received", value: `${Number(c1) + Number(c2)} / 2` },
          { label: "C3 state", value: aligned ? "aligned — checkpoint taken" : "waiting", tone: aligned ? "ok" : "plain" },
        ]}
      />
    </Figure>
  );
}
