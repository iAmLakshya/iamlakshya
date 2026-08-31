"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Controls, Figure, Readout, Slider, Stage } from "./primitives";

/** Every level rewrites the data on its way down, and the costs add rather than average. */
export function WriteAmplification() {
  const [levels, setLevels] = useState(5);
  const [fanout, setFanout] = useState(10);

  // memtable flush = 1, L0 to L1 = 2, each deeper level = fanout
  const costs = Array.from({ length: levels }, (_, i) => (i === 0 ? 1 : i === 1 ? 2 : fanout));
  const total = costs.reduce((a, b) => a + b, 0);
  const W = 420;
  const max = Math.max(...costs);

  return (
    <Figure
      title="Write amplification in levelled compaction"
      caption={
        <>
          One byte from the application is not one byte on disk. The memtable flush writes it once,
          the merge into the first level rewrites it again, and every level below that rewrites it
          roughly once per fan-out step. RocksDB puts the usual figure at "often larger than 10",
          and its own five-level worked example at 10x fan-out comes to
          <code className="mx-1 rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[0.85em]">1 + 2 + 10 + 10 + 10 = 33</code>.
          This is the bill for accepting writes quickly.
        </>
      }
    >
      <Controls>
        <Slider label="levels" value={levels} min={2} max={7} onChange={setLevels} accent={C.ink} />
        <Slider label="fan-out" value={fanout} min={2} max={12} onChange={setFanout} accent={C.warn} />
      </Controls>

      <Stage viewBox={`0 0 ${W} ${levels * 26 + 34}`} height={levels * 26 + 60}>
        {costs.map((c, i) => (
          <g key={i}>
            <text x={0} y={18 + i * 26} className="font-mono text-[10px]" fill={C.muted}>
              {i === 0 ? "flush" : `L${i - 1}→L${i}`}
            </text>
            <motion.rect x={56} y={6 + i * 26} rx={4} height={16}
              animate={{ width: Math.max(4, (c / max) * (W - 130)) }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              fill={i < 2 ? C.read : C.warn} opacity={0.85} />
            <motion.text animate={{ x: 64 + Math.max(4, (c / max) * (W - 130)) }} y={19 + i * 26}
              className="font-mono text-[10px] font-semibold" fill={C.idleText}>
              ×{c}
            </motion.text>
          </g>
        ))}
        <line x1={56} y1={levels * 26 + 4} x2={W - 60} y2={levels * 26 + 4} stroke={C.line} />
        <text x={56} y={levels * 26 + 22} className="font-mono text-[11px] font-bold" fill={C.ink}>
          {costs.join(" + ")} = {total}
        </text>
      </Stage>

      <Readout
        items={[
          { label: "bytes written per byte", value: `×${total}`, tone: total > 20 ? "bad" : "plain" },
          { label: "levels", value: levels },
          { label: "fan-out", value: `×${fanout}` },
        ]}
      />
    </Figure>
  );
}
