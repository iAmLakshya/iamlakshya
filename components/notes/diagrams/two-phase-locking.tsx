"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout, Stage } from "./primitives";

type Step = { t: "T1" | "T2"; act: "lock" | "unlock"; row: string; label: string };

/** Growing phase, shrinking phase, and the deadlock that two-phase locking makes possible. */
const SCRIPT: Step[] = [
  { t: "T1", act: "lock", row: "A", label: "T1 locks row A" },
  { t: "T2", act: "lock", row: "B", label: "T2 locks row B" },
  { t: "T1", act: "lock", row: "B", label: "T1 wants row B, which T2 holds. It waits." },
  { t: "T2", act: "lock", row: "A", label: "T2 wants row A, which T1 holds. Neither can move." },
];

export function TwoPhaseLocking() {
  const [n, setN] = useState(0);
  const [avoid, setAvoid] = useState(false);

  // Ordering acquisitions consistently is the standard way out.
  const script: Step[] = avoid
    ? [
        { t: "T1", act: "lock", row: "A", label: "T1 locks row A" },
        { t: "T1", act: "lock", row: "B", label: "T1 locks row B. T2 wants A and waits." },
        { t: "T1", act: "unlock", row: "A", label: "T1 commits and releases. Shrinking phase." },
        { t: "T1", act: "unlock", row: "B", label: "T2 can now take both, in the same order." },
      ]
    : SCRIPT;

  const done = script.slice(0, n);
  const holds = (t: string, row: string) =>
    done.some((s) => s.t === t && s.row === row && s.act === "lock") &&
    !done.some((s) => s.t === t && s.row === row && s.act === "unlock");
  const blocked = (t: string) =>
    done.some(
      (s) => s.t === t && s.act === "lock" && !holds(t, s.row) && holds(t === "T1" ? "T2" : "T1", s.row),
    );
  const deadlocked = !avoid && n >= 4;

  return (
    <Figure
      title="Two-phase locking"
      caption={
        <>
          Locks are taken during the growing phase and only released once the transaction commits,
          which is what makes the schedule equivalent to a serial one. It is also what allows a
          cycle: each transaction holds what the other needs next. Nothing here is a bug, and no
          amount of waiting resolves it. The database has to detect the cycle and abort somebody.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Btn onClick={() => setN((x) => Math.min(script.length, x + 1))} tone="primary">
          Step
        </Btn>
        <Btn onClick={() => { setAvoid((a) => !a); setN(0); }}>
          {avoid ? "Show the deadlock" : "Order the locks consistently"}
        </Btn>
        <Btn onClick={() => setN(0)}>Reset</Btn>
      </div>

      <Stage viewBox="0 0 420 150" height={180}>
        {["T1", "T2"].map((t, i) => (
          <g key={t}>
            <text x={0} y={40 + i * 62} className="text-[11px] font-bold"
              fill={i ? C.both : C.read}>{t}</text>
            <rect x={32} y={20 + i * 62} width={370} height={44} rx={9}
              fill={deadlocked ? "#fff1f2" : "#f8fafc"}
              stroke={deadlocked ? C.write : C.line} strokeWidth={1.4} />
            {["A", "B"].map((row, j) => {
              const on = holds(t, row);
              return (
                <g key={row}>
                  <motion.rect x={52 + j * 92} y={30 + i * 62} width={78} height={24} rx={6}
                    animate={{
                      fill: on ? (i ? C.both : C.read) : "#fff",
                      stroke: on ? (i ? C.both : C.read) : C.line,
                    }} strokeWidth={1.4} />
                  <text x={91 + j * 92} y={46 + i * 62} textAnchor="middle"
                    className="font-mono text-[10px] font-semibold"
                    fill={on ? "#fff" : C.muted}>row {row}</text>
                </g>
              );
            })}
            {blocked(t) && (
              <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                x={250} y={47 + i * 62} className="text-[10px] font-semibold" fill={C.warn}>
                waiting
              </motion.text>
            )}
          </g>
        ))}
        {deadlocked && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <path d="M 300 42 C 340 42 340 104 300 104" fill="none" stroke={C.write}
              strokeWidth={2} strokeDasharray="4 3" />
            <path d="M 300 104 C 260 104 260 42 300 42" fill="none" stroke={C.write}
              strokeWidth={2} strokeDasharray="4 3" />
            <text x={340} y={77} className="text-[10px] font-bold" fill={C.write}>cycle</text>
          </motion.g>
        )}
        <text x={32} y={140} className="text-[11px]" fill={C.idleText}>
          {n === 0 ? "Step through to watch the locks accumulate." : script[n - 1].label}
        </text>
      </Stage>

      <Readout
        items={[
          { label: "phase", value: done.some((s) => s.act === "unlock") ? "shrinking" : "growing" },
          { label: "locks held", value: done.filter((s) => s.act === "lock").length - done.filter((s) => s.act === "unlock").length },
          { label: "state", value: deadlocked ? "deadlocked, one must abort" : blocked("T1") || blocked("T2") ? "one transaction waiting" : "progressing",
            tone: deadlocked ? "bad" : "ok" },
        ]}
      />
    </Figure>
  );
}
