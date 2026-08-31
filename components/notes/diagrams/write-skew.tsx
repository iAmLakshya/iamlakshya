"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout, Stage } from "./primitives";

/**
 * Two transactions each read the same rows, each individually satisfies the invariant,
 * and together they break it. Snapshot isolation permits this.
 */
export function WriteSkew() {
  const [step, setStep] = useState(0);
  // Two doctors on call. Either may go off call, provided at least one remains.
  const aOff = step >= 3;
  const bOff = step >= 4;
  const onCall = 2 - (aOff ? 1 : 0) - (bOff ? 1 : 0);
  const broken = onCall === 0;

  const STEPS = [
    "Both transactions begin. Two doctors are on call.",
    "T1 reads: 2 on call. Its check passes, so it may release doctor A.",
    "T2 reads the same snapshot: 2 on call. Its check passes too.",
    "T1 writes: doctor A goes off call. Still legal from T1's view.",
    "T2 writes: doctor B goes off call. Nobody is on call. The invariant is gone.",
  ];

  return (
    <Figure
      title="Write skew"
      caption={
        <>
          Each transaction reads the same rows, checks the same condition, and then writes a
          different row. Neither one writes what the other read, so there is no write-write
          conflict to detect, and snapshot isolation lets both commit. The invariant only breaks
          in the combination. Locking the rows that were read, or materialising the conflict,
          is what closes it.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Btn onClick={() => setStep((s) => Math.min(4, s + 1))} tone="primary">Next step</Btn>
        <Btn onClick={() => setStep(0)}>Reset</Btn>
      </div>

      <Stage viewBox="0 0 440 128" height={160}>
        {[{ y: 22, n: "T1", tint: C.read, act: 3 }, { y: 74, n: "T2", tint: C.both, act: 4 }].map((t, i) => (
          <g key={t.n}>
            <text x={0} y={t.y + 14} className="text-[11px] font-bold" fill={t.tint}>{t.n}</text>
            <line x1={30} y1={t.y + 10} x2={425} y2={t.y + 10} stroke={C.line} strokeWidth={1.3} />
            {/* read */}
            <motion.g animate={{ opacity: step >= i + 1 ? 1 : 0.2 }}>
              <circle cx={130 + i * 44} cy={t.y + 10} r={6} fill={t.tint} />
              <text x={130 + i * 44} y={t.y - 2} textAnchor="middle" className="text-[9px] font-semibold" fill={t.tint}>
                read: 2 on call
              </text>
            </motion.g>
            {/* write */}
            <motion.g animate={{ opacity: step >= t.act ? 1 : 0.2 }}>
              <circle cx={300 + i * 44} cy={t.y + 10} r={6} fill={step >= t.act ? C.write : C.idle} />
              <text x={300 + i * 44} y={t.y - 2} textAnchor="middle" className="text-[9px] font-semibold" fill={C.write}>
                write: {i === 0 ? "A" : "B"} off call
              </text>
            </motion.g>
          </g>
        ))}
        <motion.text x={220} y={124} textAnchor="middle" className="text-[10px] font-semibold"
          animate={{ fill: broken ? C.write : C.ok }}>
          {broken ? "invariant violated — nobody on call" : `${onCall} doctor${onCall === 1 ? "" : "s"} on call`}
        </motion.text>
      </Stage>

      <p className="mt-3 min-h-[2.5rem] text-[13px] leading-relaxed text-gray-600">{STEPS[step]}</p>

      <Readout
        items={[
          { label: "on call", value: onCall, tone: broken ? "bad" : "ok" },
          { label: "write-write conflict", value: "none — different rows" },
          { label: "snapshot isolation", value: broken ? "permits this" : "holding", tone: broken ? "bad" : "plain" },
        ]}
      />
    </Figure>
  );
}
