"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout, Segmented, Stage } from "./primitives";

const MSGS = [
  { id: "m1", slow: false }, { id: "m2", slow: true }, { id: "m3", slow: false },
  { id: "m4", slow: false }, { id: "m5", slow: false }, { id: "m6", slow: false },
];

export function HeadOfLine() {
  const [mode, setMode] = useState<"single" | "partitioned">("single");
  const [tick, setTick] = useState(0);

  // One partition: everything behind the slow message waits. Three: only its own lane stalls.
  const lanes = mode === "single" ? [MSGS] : [[MSGS[0], MSGS[3]], [MSGS[1], MSGS[4]], [MSGS[2], MSGS[5]]];
  // A slow record costs 3 ticks, a normal one costs 1. Delivery is in order, so a lane
  // stops advancing at the first record it has not finished paying for.
  const done = lanes.map((lane) => {
    let count = 0;
    let elapsed = 0;
    for (const m of lane) {
      elapsed += m.slow ? 3 : 1;
      if (tick >= elapsed) count++;
      else break;
    }
    return count;
  });
  const total = lanes.reduce((s, l) => s + l.length, 0);
  const processed = done.reduce((a, b) => a + b, 0);

  return (
    <Figure
      title="Head-of-line blocking"
      caption={
        <>
          Messages in a log are delivered in order, so a single slow record holds up everything
          behind it. Advance the clock and watch the single log stall on <code>m2</code>.
          Partitioning gives each key its own lane: the slow record still blocks its own
          partition, but the others keep draining, which is the only reason throughput survives.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Segmented value={mode} onChange={(m) => { setMode(m); setTick(0); }}
          options={[{ value: "single", label: "One partition" }, { value: "partitioned", label: "Three partitions" }] as const} />
        <Btn onClick={() => setTick((t) => t + 1)} tone="primary">Advance clock</Btn>
        <Btn onClick={() => setTick(0)}>Reset</Btn>
      </div>

      <Stage viewBox="0 0 440 130" height={160}>
        {lanes.map((lane, li) => (
          <g key={li}>
            <text x={0} y={28 + li * 34} className="font-mono text-[9px]" fill={C.muted}>
              {mode === "single" ? "log" : `p${li}`}
            </text>
            {lane.map((m, mi) => {
              const isDone = mi < done[li];
              const isBlocked = mi >= done[li];
              return (
                <g key={m.id}>
                  <motion.rect x={30 + mi * 64} y={12 + li * 34} width={56} height={22} rx={5}
                    animate={{
                      fill: isDone ? "#d1fae5" : m.slow ? "#fee2e2" : "#f1f5f9",
                      stroke: isDone ? C.ok : m.slow ? C.write : C.line,
                      opacity: isBlocked && !m.slow ? 0.5 : 1,
                    }} strokeWidth={1.5} />
                  <text x={58 + mi * 64} y={27 + li * 34} textAnchor="middle"
                    className="font-mono text-[10px] font-semibold"
                    fill={isDone ? "#047857" : m.slow ? "#b91c1c" : C.idleText}>
                    {m.id}{m.slow ? " ⏳" : ""}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </Stage>

      <Readout
        items={[
          { label: "clock", value: tick },
          { label: "processed", value: `${processed} / ${total}`,
            tone: processed === total ? "ok" : mode === "single" ? "bad" : "plain" },
          { label: "blocked by m2", value: mode === "single" ? "everything after it" : "its own partition only",
            tone: mode === "single" ? "bad" : "ok" },
        ]}
      />
    </Figure>
  );
}
