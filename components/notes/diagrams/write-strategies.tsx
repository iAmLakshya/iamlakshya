"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Figure, Readout, Segmented, Stage } from "./primitives";

type S = "around" | "through" | "back";

/** Where a write lands first, and what is lost if the cache dies before the flush. */
export function WriteStrategies() {
  const [s, setS] = useState<S>("around");

  const spec = {
    around: { cache: false, db: true, ackAt: "database", risk: "none, the database has it",
      miss: "guaranteed on the next read of that key", latency: "database write" },
    through: { cache: true, db: true, ackAt: "both",
      risk: "none, unless the two writes are not atomic", miss: "none, the cache is warm",
      latency: "database write, plus the cache write" },
    back: { cache: true, db: false, ackAt: "cache",
      risk: "everything acknowledged but not yet flushed", miss: "none",
      latency: "memory write" },
  }[s];

  return (
    <Figure
      title="Where the write lands"
      caption={
        <>
          The three strategies differ in one thing: which store the client's write reaches before
          it is told the write succeeded. Everything else follows from that. Write around keeps
          the database authoritative and pays a miss immediately afterwards. Write back
          acknowledges from memory, which is why it is fast and why a node failure takes
          everything not yet flushed with it.
        </>
      }
    >
      <div className="mb-4">
        <Segmented value={s} onChange={setS}
          options={[
            { value: "around", label: "Write around" },
            { value: "through", label: "Write through" },
            { value: "back", label: "Write back" },
          ] as const} />
      </div>

      <Stage viewBox="0 0 420 140" height={170}>
        <circle cx={20} cy={62} r={13} fill="#fff" stroke={C.ink} strokeWidth={1.8} />
        <text x={20} y={66} textAnchor="middle" className="text-[10px] font-bold" fill={C.ink}>C</text>

        {/* client -> cache */}
        <motion.line x1={36} y1={56} x2={170} y2={32}
          animate={{ opacity: spec.cache ? 1 : 0.12 }} stroke={C.write} strokeWidth={2} />
        {/* client -> db */}
        <motion.line x1={36} y1={70} x2={170} y2={104}
          animate={{ opacity: spec.db ? 1 : 0.12 }} stroke={C.write} strokeWidth={2} />

        <motion.rect x={172} y={14} width={92} height={38} rx={8}
          animate={{ fill: spec.cache ? "#dbeafe" : "#f8fafc", stroke: spec.cache ? C.read : C.line }}
          strokeWidth={1.8} />
        <text x={218} y={38} textAnchor="middle" className="text-[11px] font-bold"
          fill={spec.cache ? "#1e40af" : C.muted}>cache</text>

        <motion.rect x={172} y={86} width={92} height={38} rx={8}
          animate={{ fill: spec.db ? "#0f172a" : "#f8fafc", stroke: spec.db ? C.ink : C.line }}
          strokeWidth={1.8} />
        <text x={218} y={110} textAnchor="middle" className="text-[11px] font-bold"
          fill={spec.db ? "#fff" : C.muted}>database</text>

        {/* async flush, write-back only */}
        <motion.g animate={{ opacity: s === "back" ? 1 : 0 }}>
          <path d="M 218 52 L 218 86" stroke={C.warn} strokeWidth={2} strokeDasharray="4 3" />
          <text x={226} y={73} className="text-[9px] font-semibold" fill={C.warn}>async flush</text>
        </motion.g>

        <motion.g animate={{ y: spec.ackAt === "database" ? 42 : spec.ackAt === "cache" ? -30 : 6 }}>
          <line x1={276} y1={62} x2={318} y2={62} stroke={C.ok} strokeWidth={2} />
          <text x={322} y={66} className="text-[10px] font-semibold" fill={C.ok}>
            acknowledged
          </text>
        </motion.g>
      </Stage>

      <Readout
        items={[
          { label: "acknowledged from", value: spec.ackAt },
          { label: "write latency", value: spec.latency },
          { label: "next read", value: spec.miss, tone: s === "around" ? "bad" : "ok" },
          { label: "lost if the cache dies", value: spec.risk, tone: s === "back" ? "bad" : "ok" },
        ]}
      />
    </Figure>
  );
}
