"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Figure, Readout, Segmented, Stage } from "./primitives";

type Topo = "circle" | "star" | "all";

export function ReplicationTopology() {
  const [topo, setTopo] = useState<Topo>("circle");
  const [down, setDown] = useState<number | null>(null);

  const cx = 150, cy = 105, R = 68;
  const N = 4;
  const pos = Array.from({ length: N }).map((_, i) => {
    const a = ((i / N) * 2 * Math.PI) - Math.PI / 2;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as const;
  });

  const edges: [number, number][] =
    topo === "circle" ? [[0, 1], [1, 2], [2, 3], [3, 0]]
    : topo === "star" ? [[0, 1], [0, 2], [0, 3]]
    : [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

  // Can a write starting at node 1 still reach every other node with `down` removed?
  const reachable = (() => {
    const live = [...Array(N).keys()].filter((i) => i !== down);
    if (!live.length) return 0;
    const adj = new Map(live.map((i) => [i, [] as number[]]));
    for (const [a, b] of edges) {
      if (a === down || b === down) continue;
      adj.get(a)?.push(b); adj.get(b)?.push(a);
    }
    const start = live[0]; const seen = new Set([start]); const q = [start];
    while (q.length) for (const nb of adj.get(q.pop()!) ?? []) if (!seen.has(nb)) { seen.add(nb); q.push(nb); }
    return seen.size;
  })();
  const live = N - (down === null ? 0 : 1);
  const partitioned = reachable < live;

  return (
    <Figure
      title="Multi-leader topologies"
      caption={
        <>
          Every node here accepts writes. Click a node to take it offline. The star
          has a single point of failure at its hub, the circle breaks into two halves,
          and all-to-all survives, which is why it is the default despite the message
          cost.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Segmented value={topo} onChange={(t) => { setTopo(t); setDown(null); }}
          options={[{ value: "circle", label: "Circle" }, { value: "star", label: "Star" }, { value: "all", label: "All to all" }] as const} />
        <span className="text-[11px] text-gray-400">click a node to fail it</span>
      </div>

      <Stage viewBox="0 0 300 210" height={230}>
        {edges.map(([a, b], i) => {
          const dead = a === down || b === down;
          return (
            <motion.line key={i} x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]}
              animate={{ opacity: dead ? 0.15 : 0.75, stroke: dead ? C.muted : C.both }}
              strokeWidth={2} strokeDasharray={dead ? "4 4" : undefined} />
          );
        })}
        {pos.map(([x, y], i) => {
          const dead = i === down;
          return (
            <g key={i} onClick={() => setDown(dead ? null : i)} className="cursor-pointer">
              <motion.circle cx={x} cy={y} r={22}
                animate={{ fill: dead ? "#fee2e2" : C.both, stroke: dead ? C.write : C.both }}
                strokeWidth={2} whileHover={{ scale: 1.08 }} />
              <text x={x} y={y + 5} textAnchor="middle" className="font-mono text-[12px] font-bold"
                fill={dead ? "#b91c1c" : "#fff"}>{dead ? "✕" : `L${i + 1}`}</text>
            </g>
          );
        })}
      </Stage>

      <Readout
        items={[
          { label: "links", value: edges.length },
          { label: "live nodes", value: live },
          { label: "reachable", value: `${reachable} / ${live}`, tone: partitioned ? "bad" : "ok" },
          { label: "state", value: partitioned ? "partitioned" : "all nodes converge", tone: partitioned ? "bad" : "ok" },
        ]}
      />
    </Figure>
  );
}
