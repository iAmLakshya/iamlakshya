"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Controls, Figure, Readout, Segmented, Slider, Stage } from "./primitives";

/** Direct connections grow quadratically; a broker keeps it linear. */
export function BrokerFanout() {
  const [n, setN] = useState(4);
  const [mode, setMode] = useState<"direct" | "broker">("direct");

  const direct = n * n;
  const broker = n + n;
  const py = (i: number) => 24 + i * (150 / Math.max(1, n - 1 || 1));

  return (
    <Figure
      title="Direct connections against a broker"
      caption={
        <>
          Every producer talking to every consumer is <code>O(n²)</code> connections.
          Putting a broker in the middle makes it <code>O(n)</code>, which is the
          entire architectural argument for one. Raise <code>n</code> and watch the
          left-hand side fill in.
        </>
      }
    >
      <Controls>
        <Slider label="producers / consumers" value={n} min={2} max={7} onChange={setN} accent={C.ink} />
        <Segmented value={mode} onChange={setMode}
          options={[{ value: "direct", label: "Direct TCP" }, { value: "broker", label: "Via broker" }] as const} />
      </Controls>

      <Stage viewBox="0 0 300 200" height={220}>
        {mode === "direct"
          ? Array.from({ length: n }).flatMap((_, i) =>
              Array.from({ length: n }).map((_, j) => (
                <motion.line key={`${i}-${j}`} initial={{ opacity: 0 }} animate={{ opacity: 0.28 }}
                  transition={{ delay: (i * n + j) * 0.012 }}
                  x1={62} y1={py(i)} x2={238} y2={py(j)} stroke={C.write} strokeWidth={1} />
              )),
            )
          : Array.from({ length: n }).flatMap((_, i) => [
              <motion.line key={`p${i}`} initial={{ opacity: 0 }} animate={{ opacity: 0.45 }}
                x1={62} y1={py(i)} x2={135} y2={100} stroke={C.read} strokeWidth={1.4} />,
              <motion.line key={`c${i}`} initial={{ opacity: 0 }} animate={{ opacity: 0.45 }}
                x1={165} y1={100} x2={238} y2={py(i)} stroke={C.read} strokeWidth={1.4} />,
            ])}

        {mode === "broker" && (
          <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <rect x={133} y={78} width={34} height={44} rx={8} fill={C.ink} />
            <text x={150} y={104} textAnchor="middle" className="text-[9px] font-bold" fill="#fff">LOG</text>
          </motion.g>
        )}

        {Array.from({ length: n }).map((_, i) => (
          <g key={`P${i}`}>
            <circle cx={50} cy={py(i)} r={11} fill="#fff" stroke={C.ink} strokeWidth={1.6} />
            <text x={50} y={py(i) + 4} textAnchor="middle" className="font-mono text-[10px] font-semibold" fill={C.ink}>P</text>
          </g>
        ))}
        {Array.from({ length: n }).map((_, i) => (
          <g key={`C${i}`}>
            <circle cx={250} cy={py(i)} r={11} fill="#fff" stroke={C.muted} strokeWidth={1.6} />
            <text x={250} y={py(i) + 4} textAnchor="middle" className="font-mono text-[10px] font-semibold" fill={C.idleText}>C</text>
          </g>
        ))}
      </Stage>

      <Readout
        items={[
          { label: "direct", value: `${n}² = ${direct}`, tone: mode === "direct" ? "bad" : "plain" },
          { label: "via broker", value: `2 × ${n} = ${broker}`, tone: mode === "broker" ? "ok" : "plain" },
          { label: "saved", value: `${direct - broker} connections` },
        ]}
      />
    </Figure>
  );
}
