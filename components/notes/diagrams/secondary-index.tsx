"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Figure, Readout, Segmented, Stage } from "./primitives";

/** Local indexes make writes cheap and reads expensive. Global does the opposite. */
export function SecondaryIndex() {
  const [kind, setKind] = useState<"local" | "global">("local");
  const [op, setOp] = useState<"write" | "read">("write");
  const N = 4;
  const x = (i: number) => 60 + i * 100;

  const touched =
    op === "write"
      ? kind === "local" ? [1] : [1, 3]      // row lands on 1; global index entry on 3
      : kind === "local" ? [0, 1, 2, 3] : [2];

  const label =
    op === "write"
      ? kind === "local"
        ? "row and its index entry land on the same partition"
        : "row on one partition, index entry on another — a distributed transaction"
      : kind === "local"
        ? "no partition knows which others match, so all are asked"
        : "the index says exactly where to look";

  return (
    <Figure
      title="Local against global secondary index"
      caption={
        <>
          A local index is stored beside the rows it describes, so a write stays on one
          partition and a read has to ask every partition. A global index is partitioned by the
          indexed value instead, so a read goes straight to one node - and an ordinary insert now
          writes to two partitions at once, which is exactly the distributed transaction worth
          avoiding.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <Segmented value={kind} onChange={setKind}
          options={[{ value: "local", label: "Local index" }, { value: "global", label: "Global index" }] as const} />
        <Segmented value={op} onChange={setOp}
          options={[{ value: "write", label: "Write" }, { value: "read", label: "Read" }] as const} />
      </div>

      <Stage viewBox="0 0 440 150" height={180}>
        <rect x={176} y={6} width={88} height={28} rx={7} fill={C.ink} />
        <text x={220} y={25} textAnchor="middle" className="text-[10px] font-bold" fill="#fff">
          {op === "write" ? "insert" : "query"}
        </text>
        {Array.from({ length: N }).map((_, i) => {
          const on = touched.includes(i);
          const tint = op === "write" ? C.write : C.read;
          return (
            <g key={i}>
              <motion.line x1={220} y1={34} x2={x(i)} y2={78}
                animate={{ opacity: on ? 0.85 : 0.1, stroke: on ? tint : C.line }} strokeWidth={1.8} />
              <motion.rect x={x(i) - 34} y={78} width={68} height={44} rx={8}
                animate={{ fill: on ? (op === "write" ? "#fff1f2" : "#eff6ff") : "#f8fafc",
                           stroke: on ? tint : C.line }} strokeWidth={1.6} />
              <text x={x(i)} y={97} textAnchor="middle" className="font-mono text-[10px] font-semibold"
                fill={on ? tint : C.muted}>p{i}</text>
              <text x={x(i)} y={112} textAnchor="middle" className="text-[8px]" fill={C.muted}>
                {kind === "local" ? "rows + index" : i === 3 ? "index" : "rows"}
              </text>
            </g>
          );
        })}
        <text x={220} y={142} textAnchor="middle" className="text-[10px]" fill={C.idleText}>{label}</text>
      </Stage>

      <Readout
        items={[
          { label: "partitions touched", value: `${touched.length} / ${N}`,
            tone: touched.length === 1 ? "ok" : "bad" },
          { label: "distributed transaction", value: op === "write" && kind === "global" ? "yes" : "no",
            tone: op === "write" && kind === "global" ? "bad" : "ok" },
        ]}
      />
    </Figure>
  );
}
