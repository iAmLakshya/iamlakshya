"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout } from "./primitives";

/** Dominance means one version saw the other. Neither dominating means a real conflict. */
export function VersionVectors() {
  const [a, setA] = useState([2, 1, 0]);
  const [b, setB] = useState([2, 1, 0]);
  const NODES = ["A", "B", "C"];

  const aDom = a.every((v, i) => v >= b[i]) && a.some((v, i) => v > b[i]);
  const bDom = b.every((v, i) => v >= a[i]) && b.some((v, i) => v > a[i]);
  const equal = a.every((v, i) => v === b[i]);
  const concurrent = !aDom && !bDom && !equal;

  const bump = (which: "a" | "b", i: number) => {
    const set = which === "a" ? setA : setB;
    const cur = which === "a" ? a : b;
    set(cur.map((v, j) => (j === i ? v + 1 : v)));
  };

  const Vec = ({ v, label, tint, which }: { v: number[]; label: string; tint: string; which: "a" | "b" }) => (
    <div className="flex-1">
      <div className="mb-1.5 text-[10px] font-semibold tracking-wider uppercase" style={{ color: tint }}>{label}</div>
      <div className="flex gap-1.5">
        {v.map((n, i) => (
          <button key={i} type="button" onClick={() => bump(which, i)}
            className="flex-1 rounded-lg border border-gray-200 bg-white py-2 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95">
            <div className="font-mono text-[9px] text-gray-400">{NODES[i]}</div>
            <motion.div key={n} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
              className="font-mono text-base font-bold" style={{ color: tint }}>{n}</motion.div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Figure
      title="Version vectors"
      caption={
        <>
          Click a counter to record a write on that node. If one vector is greater than or equal
          to the other at every position, it already contains everything the other saw and the
          older one can be dropped. If each leads somewhere the other does not, neither happened
          first, and the database has to keep both as siblings and let the application decide.
        </>
      }
    >
      <div className="mb-4 flex gap-4">
        <Vec v={a} label="Replica 1" tint={C.read} which="a" />
        <Vec v={b} label="Replica 2" tint={C.both} which="b" />
      </div>
      <Btn onClick={() => { setA([2, 1, 0]); setB([2, 1, 0]); }}>Reset</Btn>

      <Readout
        items={[
          { label: "replica 1", value: `[${a.join(", ")}]` },
          { label: "replica 2", value: `[${b.join(", ")}]` },
          {
            label: "relationship",
            value: equal ? "identical"
              : aDom ? "replica 1 dominates — drop 2"
              : bDom ? "replica 2 dominates — drop 1"
              : "concurrent — keep both",
            tone: concurrent ? "bad" : "ok",
          },
        ]}
      />
    </Figure>
  );
}
