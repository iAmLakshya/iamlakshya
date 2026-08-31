"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Controls, Figure, Readout, Slider, Stage } from "./primitives";

/**
 * The chapter's central claim, made adjustable: pessimistic control pays on every
 * overlap, optimistic control pays only on a real collision but pays far more.
 */
export function OptimisticPessimistic() {
  const [conflict, setConflict] = useState(20); // % of transactions that truly collide
  const N = 10;
  const WAIT = 1; // a lock wait costs one unit
  const ABORT = 4; // a discarded transaction plus its retry costs four

  // 2PL makes a transaction wait whenever another holds a lock it wants, which tracks
  // overlap rather than collision. SSI only charges the genuine collisions.
  const overlapping = 6;
  const colliding = Math.round((conflict / 100) * N);
  const costLock = overlapping * WAIT;
  const costAbort = colliding * ABORT;
  const winner = costAbort < costLock ? "SSI" : "2PL";

  const bar = (v: number, max: number) => Math.max(3, (v / max) * 250);
  const max = Math.max(costLock, costAbort, 1);

  return (
    <Figure
      title="Optimistic against pessimistic"
      caption={
        <>
          Two-phase locking charges every transaction that merely overlaps in time with another,
          whether or not they would ever have touched the same row. Serialisable snapshot
          isolation charges nothing up front and then throws away completed work when two
          transactions genuinely collide. Drag the collision rate: the crossover is a property of
          your workload, not of either algorithm.
        </>
      }
    >
      <Controls>
        <Slider label="transactions that genuinely collide (%)" value={conflict} min={0} max={100}
          onChange={setConflict} accent={C.write} />
      </Controls>

      <Stage viewBox="0 0 400 120" height={150}>
        {[
          { n: "2PL", sub: `${overlapping} of ${N} wait for a lock`, v: costLock, tint: C.read, y: 14 },
          { n: "SSI", sub: `${colliding} of ${N} abort and retry`, v: costAbort, tint: C.write, y: 66 },
        ].map((r) => (
          <g key={r.n}>
            <text x={0} y={r.y + 14} className="text-[11px] font-bold" fill={r.tint}>{r.n}</text>
            <motion.rect x={40} y={r.y} rx={5} height={22}
              animate={{ width: bar(r.v, max), fill: r.tint }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }} />
            <motion.text animate={{ x: 48 + bar(r.v, max) }} y={r.y + 16}
              className="font-mono text-[11px] font-semibold" fill={C.idleText}>{r.v}</motion.text>
            <text x={40} y={r.y + 36} className="text-[10px]" fill={C.muted}>{r.sub}</text>
          </g>
        ))}
      </Stage>

      <Readout
        items={[
          { label: "cost of waiting", value: costLock },
          { label: "cost of aborting", value: costAbort },
          { label: "better here", value: winner, tone: "ok" },
          { label: "why", value: winner === "SSI" ? "collisions are rarer than overlaps" : "aborts throw away finished work" },
        ]}
      />
    </Figure>
  );
}
