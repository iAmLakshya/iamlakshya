"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout, Segmented, Stage } from "./primitives";

/** One key expires; every in-flight request goes to the database at once. */
export function ThunderingHerd() {
  const [guard, setGuard] = useState<"none" | "lock">("none");
  const [fired, setFired] = useState(false);
  const N = 8;
  const hits = fired ? (guard === "lock" ? 1 : N) : 0;

  return (
    <Figure
      title="Thundering herd"
      caption={
        <>
          A hot key expires. Every request that arrives in the window before it is repopulated
          misses, and each one independently decides to go and recompute it, so the database
          takes the full concurrency of the fleet for a value it is about to produce identically
          many times over. A lock in the cache lets exactly one request through and makes the
          rest wait for its result.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Segmented value={guard} onChange={(g) => { setGuard(g); setFired(false); }}
          options={[{ value: "none", label: "Unprotected" }, { value: "lock", label: "Lock in cache" }] as const} />
        <Btn onClick={() => setFired(true)} tone="danger">Expire the key</Btn>
        <Btn onClick={() => setFired(false)}>Reset</Btn>
      </div>

      <Stage viewBox="0 0 420 160" height={190}>
        {Array.from({ length: N }).map((_, i) => {
          const through = fired && (guard === "none" || i === 0);
          const waiting = fired && guard === "lock" && i !== 0;
          return (
            <g key={i}>
              <circle cx={26} cy={14 + i * 19} r={6}
                fill={waiting ? "#e2e8f0" : fired ? C.write : "#f1f5f9"}
                stroke={waiting ? C.muted : fired ? C.write : C.line} strokeWidth={1.2} />
              <motion.line initial={false}
                animate={{ opacity: through ? 0.85 : waiting ? 0.15 : 0.08 }}
                x1={34} y1={14 + i * 19} x2={196} y2={80}
                stroke={through ? C.write : C.muted} strokeWidth={1.4} />
            </g>
          );
        })}
        <rect x={198} y={58} width={62} height={44} rx={8}
          fill={guard === "lock" ? "#dbeafe" : "#f8fafc"} stroke={guard === "lock" ? C.read : C.line} strokeWidth={1.6} />
        <text x={229} y={78} textAnchor="middle" className="text-[10px] font-bold"
          fill={guard === "lock" ? "#1e40af" : C.idleText}>cache</text>
        <text x={229} y={91} textAnchor="middle" className="text-[8px]"
          fill={guard === "lock" ? "#1e40af" : C.muted}>{guard === "lock" ? "lock held" : "miss"}</text>

        <motion.g animate={{ opacity: fired ? 1 : 0.3 }}>
          {Array.from({ length: hits }).map((_, i) => (
            <line key={i} x1={260} y1={80} x2={330} y2={80} stroke={C.write} strokeWidth={1.2} opacity={0.5} />
          ))}
          <rect x={332} y={58} width={56} height={44} rx={8}
            fill={hits > 1 ? "#fee2e2" : "#f8fafc"} stroke={hits > 1 ? C.write : C.line} strokeWidth={1.8} />
          <text x={360} y={84} textAnchor="middle" className="text-[10px] font-bold"
            fill={hits > 1 ? "#b91c1c" : C.idleText}>db</text>
        </motion.g>
        <text x={26} y={158} className="text-[9px] tracking-wide uppercase" fill={C.muted}>{N} concurrent requests</text>
      </Stage>

      <Readout
        items={[
          { label: "queries reaching the db", value: fired ? hits : 0, tone: hits > 1 ? "bad" : "ok" },
          { label: "requests waiting", value: fired && guard === "lock" ? N - 1 : 0 },
          { label: "wasted recomputation", value: hits > 1 ? `${hits - 1}×` : "none", tone: hits > 1 ? "bad" : "ok" },
        ]}
      />
    </Figure>
  );
}
