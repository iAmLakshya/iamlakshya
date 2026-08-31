"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Figure, Readout, Segmented, Stage } from "./primitives";

/** A query that cannot be answered by one shard has to ask all of them and merge. */
export function ShardFanout() {
  const [mode, setMode] = useState<"routed" | "fanout">("routed");
  const N = 5;
  const x = (i: number) => 52 + i * 76;
  const hit = mode === "routed" ? [2] : [0, 1, 2, 3, 4];

  return (
    <Figure
      title="Routed query against a fan-out"
      caption={
        <>
          Partitioning documents by a key the query already carries - a chat id, a tenant - lets
          the coordinator send the request to one shard and return its answer directly. A query
          with no such key has to go to every shard, wait for the slowest, then merge and re-rank
          the partial results centrally. The work grows with the shard count, and so does the
          tail latency.
        </>
      }
    >
      <div className="mb-4">
        <Segmented value={mode} onChange={setMode}
          options={[{ value: "routed", label: "Partitioned by chatId" }, { value: "fanout", label: "Free-text query" }] as const} />
      </div>

      <Stage viewBox="0 0 440 170" height={200}>
        <rect x={168} y={8} width={104} height={30} rx={8} fill={C.ink} />
        <text x={220} y={28} textAnchor="middle" className="text-[11px] font-bold" fill="#fff">Coordinator</text>

        {Array.from({ length: N }).map((_, i) => {
          const on = hit.includes(i);
          return (
            <g key={i}>
              <motion.line x1={220} y1={38} x2={x(i)} y2={92}
                animate={{ opacity: on ? 0.85 : 0.12, stroke: on ? C.read : C.line }} strokeWidth={1.8} />
              {mode === "fanout" && (
                <motion.line initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                  x1={x(i)} y1={124} x2={220} y2={150} stroke={C.warn} strokeWidth={1.4} strokeDasharray="3 3" />
              )}
              <motion.rect x={x(i) - 30} y={92} width={60} height={32} rx={7}
                animate={{ fill: on ? "#eff6ff" : "#f8fafc", stroke: on ? C.read : C.line }} strokeWidth={1.6} />
              <text x={x(i)} y={112} textAnchor="middle" className="font-mono text-[10px] font-semibold"
                fill={on ? C.read : C.muted}>s{i}</text>
            </g>
          );
        })}
        {mode === "fanout" && (
          <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            x={220} y={164} textAnchor="middle" className="text-[10px] font-semibold" fill={C.warn}>
            merge and re-rank 5 partial results
          </motion.text>
        )}
      </Stage>

      <Readout
        items={[
          { label: "shards queried", value: `${hit.length} / ${N}`, tone: mode === "routed" ? "ok" : "bad" },
          { label: "latency bound by", value: mode === "routed" ? "one shard" : "the slowest shard" },
          { label: "merge step", value: mode === "routed" ? "none" : "required", tone: mode === "routed" ? "ok" : "bad" },
        ]}
      />
    </Figure>
  );
}
