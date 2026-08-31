"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, Figure, Readout } from "./primitives";

/** A log broker keeps an ordered, replayable log; each consumer owns an offset. */
export function LogBroker() {
  const MSGS = ["M1", "M2", "M3", "M4", "M5", "M6"];
  const [a, setA] = useState(4);
  const [b, setB] = useState(2);

  return (
    <Figure
      title="Log-based broker"
      caption="Messages are appended to disk in order and never deleted on read. Each consumer holds its own offset, so a slow consumer falls behind rather than blocking the others, and rewinding an offset replays history."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Btn onClick={() => setA((n) => Math.min(MSGS.length, n + 1))} tone="primary">A consumes</Btn>
        <Btn onClick={() => setB((n) => Math.min(MSGS.length, n + 1))}>B consumes</Btn>
        <Btn onClick={() => setB(0)} tone="danger">Rewind B</Btn>
      </div>

      <svg viewBox="0 0 420 150" className="w-full select-none" style={{ maxHeight: 180 }}>
        {MSGS.map((m, i) => (
          <g key={m}>
            <rect x={20 + i * 60} y={54} width={54} height={38} rx={6}
              fill={i < Math.max(a, b) ? "#f1f5f9" : "#fff"} stroke="#cbd5e1" strokeWidth={1.4} />
            <text x={47 + i * 60} y={78} textAnchor="middle" className="font-mono text-[12px] font-semibold" fill="#334155">{m}</text>
            <text x={47 + i * 60} y={106} textAnchor="middle" className="font-mono text-[9px]" fill="#cbd5e1">{i}</text>
          </g>
        ))}
        <text x={20} y={44} className="text-[9.5px] tracking-wide uppercase" fill="#94a3b8">
          append-only log, sequential writes on disk
        </text>
        <motion.g animate={{ x: 20 + a * 60 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
          <line y1={30} y2={52} stroke="#2563eb" strokeWidth={2.5} />
          <text y={24} textAnchor="middle" className="text-[10px] font-bold" fill="#2563eb">A</text>
        </motion.g>
        <motion.g animate={{ x: 20 + b * 60 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
          <line y1={94} y2={116} stroke="#059669" strokeWidth={2.5} />
          <text y={132} textAnchor="middle" className="text-[10px] font-bold" fill="#059669">B</text>
        </motion.g>
      </svg>

      <Readout
        items={[
          { label: "consumer A offset", value: a },
          { label: "consumer B offset", value: b },
          { label: "lag", value: Math.abs(a - b), tone: Math.abs(a - b) > 2 ? "bad" : "ok" },
        ]}
      />
    </Figure>
  );
}
