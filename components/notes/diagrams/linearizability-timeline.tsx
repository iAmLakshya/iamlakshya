"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Figure, Readout, Stage } from "./primitives";

/**
 * The window between a write being acknowledged and replication landing is exactly
 * where linearizability is lost. Drag the read into it.
 */
export function LinearizabilityTimeline() {
  const [read, setRead] = useState(52);
  const ACK = 34;   // leader acknowledges the write
  const LAND = 72;  // replication reaches replica B

  const stale = read > ACK && read < LAND;
  const t = (pct: number) => 40 + (pct / 100) * 380;

  return (
    <Figure
      title="Where linearizability breaks"
      caption={
        <>
          Drag the read. Once the write is acknowledged, every later read must return it -
          that is the whole promise. In the shaded window the write is already durable and
          confirmed, but replica B has not seen it, so a read there returns the old value.
          Ordering the two events afterwards, by version vector or Lamport clock, records what
          happened but cannot un-tell the client.
        </>
      }
    >
      <div className="mb-4">
        <label className="flex max-w-sm flex-col gap-1.5">
          <span className="flex justify-between text-xs font-medium text-gray-600">
            <span>read time</span>
            <span className="font-mono text-sm" style={{ color: stale ? C.write : C.ok }}>
              {stale ? "stale read" : read <= ACK ? "before the write" : "consistent"}
            </span>
          </span>
          <input
            type="range" min={4} max={96} value={read}
            onChange={(e) => setRead(Number(e.target.value))}
            style={{ accentColor: stale ? C.write : C.ok }}
            className="h-1.5 w-full appearance-none rounded-full bg-gray-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-current"
          />
        </label>
      </div>

      <Stage viewBox="0 0 440 180" height={210}>
        <rect x={t(ACK)} y={16} width={t(LAND) - t(ACK)} height={132} fill={C.write} opacity={0.07} />
        <text x={(t(ACK) + t(LAND)) / 2} y={28} textAnchor="middle"
          className="text-[9px] font-semibold tracking-wide uppercase" fill={C.write}>
          danger window
        </text>

        {[
          { y: 56, label: "Client", tint: C.ink },
          { y: 96, label: "Replica A", tint: C.ink },
          { y: 136, label: "Replica B", tint: C.muted },
        ].map((r) => (
          <g key={r.label}>
            <text x={0} y={r.y + 4} className="text-[10px] font-semibold" fill={r.tint}>{r.label}</text>
            <line x1={40} y1={r.y} x2={425} y2={r.y} stroke={C.line} strokeWidth={1.2} />
          </g>
        ))}

        {/* the write */}
        <line x1={t(14)} y1={56} x2={t(ACK)} y2={96} stroke={C.write} strokeWidth={1.8} />
        <circle cx={t(14)} cy={56} r={4.5} fill={C.write} />
        <text x={t(14)} y={46} textAnchor="middle" className="text-[9px] font-semibold" fill={C.write}>write x=1</text>
        <circle cx={t(ACK)} cy={96} r={5} fill={C.write} />
        <text x={t(ACK)} y={88} textAnchor="middle" className="text-[9px] font-semibold" fill={C.write}>acked</text>

        {/* replication */}
        <line x1={t(ACK)} y1={96} x2={t(LAND)} y2={136} stroke={C.muted} strokeWidth={1.6} strokeDasharray="4 3" />
        <circle cx={t(LAND)} cy={136} r={5} fill={C.ok} />
        <text x={t(LAND)} y={156} textAnchor="middle" className="text-[9px]" fill={C.ok}>replicated</text>

        {/* the read */}
        <motion.g animate={{ x: t(read) - t(read) }}>
          <motion.line animate={{ x1: t(read), x2: t(read) }} y1={10} y2={152}
            stroke={stale ? C.write : C.ok} strokeWidth={2} strokeDasharray="3 3" />
          <motion.circle animate={{ cx: t(read) }} cy={136} r={5} fill={stale ? C.write : C.ok} />
          <motion.text animate={{ x: t(read) }} y={172} textAnchor="middle"
            className="text-[9px] font-bold" fill={stale ? C.write : C.ok}>
            read → {stale ? "x=0" : read <= ACK ? "x=0" : "x=1"}
          </motion.text>
        </motion.g>
      </Stage>

      <Readout
        items={[
          { label: "write acknowledged", value: read > ACK ? "yes" : "not yet" },
          { label: "replica B has it", value: read >= LAND ? "yes" : "no" },
          {
            label: "linearizable",
            value: stale ? "violated" : "holds",
            tone: stale ? "bad" : "ok",
          },
        ]}
      />
    </Figure>
  );
}
