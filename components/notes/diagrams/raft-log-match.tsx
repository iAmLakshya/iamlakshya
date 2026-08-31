"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout, Stage } from "./primitives";

type E = { term: number; cmd: string };
const LEADER: E[] = [
  { term: 1, cmd: "x=1" }, { term: 1, cmd: "y=2" }, { term: 2, cmd: "x=3" },
  { term: 3, cmd: "z=9" }, { term: 3, cmd: "y=7" },
];
const START: E[] = [{ term: 1, cmd: "x=1" }, { term: 1, cmd: "y=2" }, { term: 2, cmd: "q=0" }];

export function RaftLogMatch() {
  const [follower, setFollower] = useState<E[]>(START);
  const [probe, setProbe] = useState(LEADER.length);

  // Log Matching: same index + same term implies identical history before it.
  const match = (() => {
    let i = 0;
    while (i < Math.min(LEADER.length, follower.length)
      && LEADER[i].term === follower[i].term && LEADER[i].cmd === follower[i].cmd) i++;
    return i;
  })();

  const stepBack = () => setProbe((p) => Math.max(match, p - 1));
  const append = () => { setFollower(LEADER.slice(0, Math.max(match, probe) + 1)); setProbe(LEADER.length); };

  const Slot = ({ e, i, on, tone }: { e?: E; i: number; on: boolean; tone: "l" | "f" }) => (
    <motion.g animate={{ opacity: on ? 1 : 0.25 }}>
      <motion.rect x={i * 66} width={58} height={40} rx={7}
        animate={{
          fill: !e ? "#f1f5f9" : i < match ? "#d1fae5" : tone === "l" ? "#e0e7ff" : "#fee2e2",
          stroke: !e ? C.line : i < match ? C.ok : tone === "l" ? "#6366f1" : C.write,
        }}
        strokeWidth={1.6} />
      {e && (
        <>
          <text x={i * 66 + 29} y={17} textAnchor="middle" className="font-mono text-[9px] font-bold" fill={C.idleText}>
            term {e.term}
          </text>
          <text x={i * 66 + 29} y={31} textAnchor="middle" className="font-mono text-[11px] font-semibold" fill={C.ink}>
            {e.cmd}
          </text>
        </>
      )}
    </motion.g>
  );

  return (
    <Figure
      title="Raft log backfill"
      caption={
        <>
          The leader walks its probe back until the follower agrees on an index and
          term, then ships only the suffix after it. Raft calls the counter a{" "}
          <strong>term</strong>, not an epoch. Matching index and term guarantees every
          earlier entry is identical, so the leader never has to compare the whole log.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Btn onClick={stepBack}>Step probe back</Btn>
        <Btn onClick={append} tone="primary">Append suffix</Btn>
        <Btn onClick={() => { setFollower(START); setProbe(LEADER.length); }}>Reset</Btn>
      </div>

      <Stage viewBox="0 0 350 150" height={180}>
        <text x={0} y={12} className="text-[10px] font-semibold tracking-wider uppercase" fill={C.muted}>Leader</text>
        <g transform="translate(0,20)">{LEADER.map((e, i) => <Slot key={i} e={e} i={i} on tone="l" />)}</g>
        <motion.g animate={{ x: probe * 66 + 29 }}>
          <line y1={62} y2={80} stroke={C.warn} strokeWidth={2} strokeDasharray="3 2" />
          <text y={94} textAnchor="middle" className="text-[9px] font-bold" fill={C.warn}>probe</text>
        </motion.g>
        <text x={0} y={112} className="text-[10px] font-semibold tracking-wider uppercase" fill={C.muted}>Follower</text>
        <g transform="translate(0,118)">
          {LEADER.map((_, i) => <Slot key={i} e={follower[i]} i={i} on={i < follower.length} tone="f" />)}
        </g>
        {match > 0 && (
          <motion.line initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            x1={0} y1={104} x2={match * 66 - 8} y2={104} stroke={C.ok} strokeWidth={2.5} strokeLinecap="round" />
        )}
      </Stage>

      <Readout
        items={[
          { label: "matching prefix", value: `${match} entries`, tone: "ok" },
          { label: "probe at index", value: probe },
          { label: "suffix to send", value: Math.max(0, LEADER.length - Math.max(match, 0)) },
          { label: "logs identical", value: follower.length === LEADER.length && match === LEADER.length ? "yes" : "no",
            tone: match === LEADER.length ? "ok" : "bad" },
        ]}
      />
    </Figure>
  );
}
