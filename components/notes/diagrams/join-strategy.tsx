"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout } from "./primitives";

/** Walk the three questions that pick a batch join. */
export function JoinStrategy() {
  const [sorted, setSorted] = useState<boolean | null>(null);
  const [small, setSmall] = useState<boolean | null>(null);
  const [coPart, setCoPart] = useState<boolean | null>(null);

  const answer =
    sorted === true
      ? { name: "Join on disk directly", cost: "no shuffle, no sort", tone: "ok" as const,
          why: "Both sides are already partitioned and sorted on the join key, so the reducer merges two streams and nothing crosses the network that would not have anyway." }
      : small === true
      ? { name: "Broadcast hash join", cost: "ship the small side to every partition", tone: "ok" as const,
          why: "Build a hash table of the small side in memory, then scan the big side once with O(1) lookups. The big dataset is never sorted and never moves." }
      : coPart === true
      ? { name: "Partitioned hash join", cost: "ship matching partitions only", tone: "ok" as const,
          why: "Neither side fits in memory whole, but partition i of one side only ever joins partition i of the other, so each pair is small enough to hash locally." }
      : sorted === false && small === false && coPart === false
      ? { name: "Sort merge join", cost: "sort both sides, shuffle at least one whole dataset", tone: "bad" as const,
          why: "The fallback that always works. Repartition by join key, sort, merge on disk with no memory ceiling - and pay for all of it." }
      : null;

  const Q = ({ q, v, set }: { q: string; v: boolean | null; set: (b: boolean) => void }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 px-3.5 py-2.5">
      <span className="text-[13px] text-gray-700">{q}</span>
      <span className="inline-flex rounded-lg bg-gray-100 p-0.5">
        {[true, false].map((b) => (
          <button key={String(b)} type="button" onClick={() => set(b)}
            className={`rounded-[7px] px-3 py-1 text-xs font-medium transition-all ${
              v === b ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-900"
            }`}>
            {b ? "Yes" : "No"}
          </button>
        ))}
      </span>
    </div>
  );

  return (
    <Figure
      title="Choosing a batch join"
      caption="Three questions, asked in this order, because each one avoids strictly more network traffic than the next. Sort merge join is last for a reason: it is the only one that always works, and the only one that pays full price every time."
    >
      <div className="space-y-2">
        <Q q="Are both sides already partitioned and sorted on the join key?" v={sorted} set={(b) => { setSorted(b); if (b) { setSmall(null); setCoPart(null); } }} />
        {sorted === false && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            <Q q="Does one side fit in memory?" v={small} set={(b) => { setSmall(b); if (b) setCoPart(null); }} />
          </motion.div>
        )}
        {sorted === false && small === false && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            <Q q="Are both sides partitioned the same way on the join key?" v={coPart} set={setCoPart} />
          </motion.div>
        )}
      </div>

      {answer && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border p-4"
          style={{ borderColor: answer.tone === "ok" ? "#a7f3d0" : "#fecdd3",
                   background: answer.tone === "ok" ? "#ecfdf5" : "#fff1f2" }}>
          <div className="text-sm font-semibold" style={{ color: answer.tone === "ok" ? "#047857" : "#be123c" }}>
            {answer.name}
          </div>
          <div className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{answer.why}</div>
        </motion.div>
      )}

      <div className="mt-4">
        <Btn onClick={() => { setSorted(null); setSmall(null); setCoPart(null); }}>Start over</Btn>
      </div>

      <Readout items={[{ label: "network cost", value: answer ? answer.cost : "—", tone: answer?.tone ?? "plain" }]} />
    </Figure>
  );
}
