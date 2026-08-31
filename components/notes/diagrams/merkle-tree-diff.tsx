"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout, Stage } from "./primitives";

/** Anti-entropy: change one row and watch the mismatch climb to the root. */
const h = (s: string) => {
  let x = 7;
  for (const ch of s) x = (x * 31 + ch.charCodeAt(0)) % 1000;
  return x;
};
const pair = (a: number, b: number) => (a * 31 + b) % 1000;

export function MerkleTreeDiff() {
  const base = ["a1", "b6", "c3", "d4"];
  const [right, setRight] = useState([...base]);

  const tree = (rows: string[]) => {
    const leaves = rows.map(h);
    const mid = [pair(leaves[0], leaves[1]), pair(leaves[2], leaves[3])];
    return { leaves, mid, root: pair(mid[0], mid[1]) };
  };
  const L = tree(base);
  const R = tree(right);

  const bump = (i: number) => {
    const next = [...right];
    const n = Number(next[i][1]);
    next[i] = next[i][0] + String((n + 1) % 10);
    setRight(next);
  };

  const leafBad = base.map((v, i) => v !== right[i]);
  const midBad = [leafBad[0] || leafBad[1], leafBad[2] || leafBad[3]];
  const rootBad = midBad[0] || midBad[1];
  // Root, then only the subtrees whose hash disagreed.
  const visited = rootBad ? 1 + 2 + midBad.filter(Boolean).length * 2 : 1;

  const Node = ({ x, y, v, bad }: { x: number; y: number; v: number; bad: boolean }) => (
    <g>
      <motion.circle
        cx={x} cy={y} r={19}
        animate={{ fill: bad ? "#fee2e2" : "#d1fae5", stroke: bad ? C.write : C.ok }}
        strokeWidth={1.8}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
      <text x={x} y={y + 4} textAnchor="middle" className="font-mono text-[11px] font-semibold"
        fill={bad ? "#b91c1c" : "#047857"}>{v}</text>
    </g>
  );

  const Tree = ({ t, ox, editable }: { t: ReturnType<typeof tree>; ox: number; editable?: boolean }) => (
    <g transform={`translate(${ox},0)`}>
      {[[0, 1], [2, 3]].map(([a, b], m) => (
        <g key={m}>
          <line x1={40 + a * 56} y1={112} x2={68 + m * 112} y2={72} stroke={C.line} strokeWidth={1.4} />
          <line x1={40 + b * 56} y1={112} x2={68 + m * 112} y2={72} stroke={C.line} strokeWidth={1.4} />
          <line x1={68 + m * 112} y1={54} x2={124} y2={32} stroke={C.line} strokeWidth={1.4} />
        </g>
      ))}
      <Node x={124} y={26} v={t.root} bad={rootBad} />
      {t.mid.map((v, i) => <Node key={i} x={68 + i * 112} y={66} v={v} bad={midBad[i]} />)}
      {t.leaves.map((v, i) => (
        <g key={i}
          onClick={editable ? () => bump(i) : undefined}
          className={editable ? "cursor-pointer" : undefined}>
          <Node x={40 + i * 56} y={118} v={v} bad={leafBad[i]} />
          <text x={40 + i * 56} y={152} textAnchor="middle"
            className={`font-mono text-[11px] ${editable ? "font-semibold" : ""}`}
            fill={editable ? C.ink : C.muted}>
            {(editable ? right : base)[i]}
          </text>
          {editable && (
            <text x={40 + i * 56} y={167} textAnchor="middle" className="text-[9px] tracking-wide uppercase" fill={C.muted}>
              edit
            </text>
          )}
        </g>
      ))}
    </g>
  );

  return (
    <Figure
      title="Merkle tree comparison"
      caption={
        <>
          Click any leaf on replica B to change that row. Only the hashes on the path
          back to the root go red, so the two replicas find the divergent row by
          walking down the mismatch instead of shipping every row to each other.
          Hashes here are a toy function, not the real one.
        </>
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-8 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          <span className="pl-6">Replica A</span>
          <span className="pl-40">Replica B</span>
        </div>
        <Btn onClick={() => setRight([...base])} tone="neutral">Reset</Btn>
      </div>
      <Stage viewBox="0 0 540 180" height={240}>
        <Tree t={L} ox={0} />
        <line x1={272} y1={10} x2={272} y2={172} stroke={C.line} strokeDasharray="3 4" />
        <Tree t={R} ox={290} editable />
      </Stage>
      <Readout
        items={[
          { label: "root match", value: rootBad ? "no" : "yes", tone: rootBad ? "bad" : "ok" },
          { label: "rows differing", value: leafBad.filter(Boolean).length },
          { label: "nodes compared", value: visited },
          { label: "rows shipped naively", value: 4 },
        ]}
      />
    </Figure>
  );
}
