"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Controls, Figure, Readout, Slider, Stage } from "./primitives";

/** Commit-wait: hold the transaction open for ε so the timestamp is safely in the past. */
export function CommitWait() {
  const [eps, setEps] = useState(4);
  const [wait, setWait] = useState(true);

  const px = (ms: number) => 46 + ms * 11;
  const w1 = { start: 6 };
  const t1 = w1.start + eps;                    // earliest safe commit for W1
  const w2Start = wait ? t1 + 2 : w1.start + 2;  // W2 begins after W1 commits
  const t2 = w2Start + eps;
  const ordered = wait && t2 > t1;

  return (
    <Figure
      title="Commit-wait"
      caption={
        <>
          Each write gets an interval rather than an instant, because the clock is only known to
          within ε. Waiting out ε before committing guarantees the assigned timestamp is already
          in the past everywhere, so a later dependent write cannot be given an earlier one. Turn
          the wait off and the two intervals overlap, which is a causally reversed pair. This is
          affordable only because ε is single-digit milliseconds.
        </>
      }
    >
      <Controls>
        <Slider label="ε — clock uncertainty (ms)" value={eps} min={1} max={14} onChange={setEps} accent={C.warn} />
        <button
          type="button"
          onClick={() => setWait((w) => !w)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-all active:scale-[0.97] ${
            wait
              ? "bg-gray-900 text-white ring-gray-900 hover:bg-gray-700"
              : "bg-white text-rose-600 ring-rose-200 hover:bg-rose-50"
          }`}
        >
          commit-wait {wait ? "on" : "off"}
        </button>
      </Controls>

      <Stage viewBox="0 0 440 150" height={180}>
        <line x1={40} y1={124} x2={430} y2={124} stroke={C.line} strokeWidth={1.4} />
        {[0, 5, 10, 15, 20, 25, 30].map((m) => (
          <g key={m}>
            <line x1={px(m)} y1={120} x2={px(m)} y2={128} stroke={C.muted} strokeWidth={1} />
            <text x={px(m)} y={142} textAnchor="middle" className="font-mono text-[9px]" fill={C.muted}>{m}</text>
          </g>
        ))}

        {[
          { y: 34, s: w1.start, t: t1, label: "W1", tint: C.read },
          { y: 76, s: w2Start, t: t2, label: "W2 (depends on W1)", tint: C.both },
        ].map((w) => (
          <g key={w.label}>
            <text x={0} y={w.y - 8} className="text-[9.5px] font-semibold" fill={w.tint}>{w.label}</text>
            <motion.rect animate={{ x: px(w.s), width: Math.max(2, px(w.t) - px(w.s)) }}
              y={w.y} height={22} rx={4} fill={w.tint} opacity={0.18}
              transition={{ type: "spring", stiffness: 240, damping: 26 }} />
            <motion.line animate={{ x1: px(w.s), x2: px(w.s) }} y1={w.y} y2={w.y + 22} stroke={w.tint} strokeWidth={2} />
            <motion.line animate={{ x1: px(w.t), x2: px(w.t) }} y1={w.y - 4} y2={w.y + 26} stroke={w.tint} strokeWidth={2.5} />
            <motion.text animate={{ x: px(w.t) }} y={w.y + 38} textAnchor="middle"
              className="font-mono text-[9px] font-bold" fill={w.tint}>
              {w.label.startsWith("W1") ? "T1" : "T2"}
            </motion.text>
            <motion.text animate={{ x: (px(w.s) + px(w.t)) / 2 }} y={w.y + 15} textAnchor="middle"
              className="text-[9px]" fill={w.tint}>ε</motion.text>
          </g>
        ))}
      </Stage>

      <Readout
        items={[
          { label: "ε", value: `${eps} ms` },
          { label: "T1", value: t1 },
          { label: "T2", value: t2 },
          { label: "causal order", value: ordered ? "T2 > T1, preserved" : "intervals overlap", tone: ordered ? "ok" : "bad" },
        ]}
      />
    </Figure>
  );
}
