"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Figure, Readout, Segmented, Stage } from "./primitives";

const STAGES = [
  { value: "input", label: "Input" }, { value: "map", label: "Map" },
  { value: "sort", label: "Sort" }, { value: "shuffle", label: "Shuffle" },
  { value: "reduce", label: "Reduce" },
] as const;
type Stage_ = (typeof STAGES)[number]["value"];

const RAW = [
  [{ k: 3, v: 1 }, { k: 12, v: 1 }],
  [{ k: 6, v: 1 }, { k: 3, v: 1 }],
  [{ k: 8, v: 1 }, { k: 12, v: 1 }],
];
const TINT: Record<number, string> = { 3: "#2563eb", 6: "#059669", 8: "#d97706", 12: "#7c3aed" };

export function MapReduceFlow() {
  const [stage, setStage] = useState<Stage_>("input");
  const si = STAGES.findIndex((s) => s.value === stage);

  const rows =
    si <= 1 ? RAW
    : si === 2 ? RAW.map((r) => [...r].sort((a, b) => a.k - b.k))
    : [3, 6, 8, 12].map((k) => RAW.flat().filter((x) => x.k === k));

  const reduced = si === 4;

  return (
    <Figure
      title="MapReduce stages"
      caption={
        <>
          Step through the stages. Sorting before the shuffle is the trick that keeps
          memory flat: the reducer streams a merge of already-sorted runs instead of
          holding every key at once. Mappers run on the nodes that already hold the
          data, so the input never crosses the network.
        </>
      }
    >
      <div className="mb-4">
        <Segmented value={stage} onChange={setStage} options={STAGES} />
      </div>

      <Stage viewBox="0 0 460 190" height={210}>
        {rows.map((row, ri) => (
          <g key={ri}>
            <text x={8} y={38 + ri * 52} className="text-[10px] font-semibold" fill={C.muted}>
              {si >= 3 ? `R${ri + 1}` : `N${ri + 1}`}
            </text>
            <rect x={34} y={20 + ri * 52} width={412} height={38} rx={7}
              fill="#f8fafc" stroke={C.line} strokeWidth={1} />
            {row.map((cell, ci) => (
              <motion.g key={`${ri}-${ci}-${cell.k}`} layout
                animate={{ x: 46 + ci * 62, y: 28 + ri * 52 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}>
                <rect width={54} height={22} rx={5} fill={si === 0 ? C.idle : TINT[cell.k]} />
                <text x={27} y={15} textAnchor="middle" className="font-mono text-[10px] font-bold"
                  fill={si === 0 ? C.idleText : "#fff"}>
                  {si === 0 ? "obj" : `K${cell.k}:${cell.v}`}
                </text>
              </motion.g>
            ))}
            {reduced && rows[ri].length > 0 && (
              <motion.g initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <rect x={344} y={28 + ri * 52} width={92} height={22} rx={5} fill={C.ink} />
                <text x={390} y={43 + ri * 52} textAnchor="middle" className="font-mono text-[10px] font-bold" fill="#fff">
                  K{rows[ri][0].k} → {rows[ri].length}
                </text>
              </motion.g>
            )}
          </g>
        ))}
      </Stage>

      <Readout
        items={[
          { label: "stage", value: STAGES[si].label },
          { label: "grouping", value: si >= 3 ? "by key, one reducer each" : "by node, data-local" },
          { label: "network", value: si === 3 ? "shuffle — the expensive step" : si === 4 ? "output to HDFS" : "none", tone: si === 3 ? "bad" : "plain" },
        ]}
      />
    </Figure>
  );
}
