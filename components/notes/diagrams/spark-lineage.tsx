"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, Figure, Readout, Segmented } from "./primitives";

/** Narrow dependencies recompute one partition; wide ones can force a full re-run. */
export function SparkLineage() {
  const [kind, setKind] = useState<"narrow" | "wide">("narrow");
  const [lost, setLost] = useState<number | null>(null);
  const rows = [0, 1, 2];
  const cols = [0, 1, 2];
  const X = (c: number) => 60 + c * 110;
  const Y = (r: number) => 30 + r * 46;

  // With a narrow dependency only the same row upstream is needed; wide needs every row.
  const affected = lost === null ? [] : kind === "narrow" ? [lost] : rows;

  return (
    <Figure
      title="RDD lineage and recovery"
      caption="Spark keeps the lineage rather than the data. A narrow dependency recomputes just the lost partition and can do it in parallel. A wide dependency crosses partitions, so one lost node can force ancestors on every node to be recomputed, which is why checkpointing pays for long lineage chains."
    >
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Segmented value={kind} onChange={(k) => { setKind(k); setLost(null); }}
          options={[{ value: "narrow", label: "Narrow dependency" }, { value: "wide", label: "Wide dependency" }] as const} />
        <Btn onClick={() => setLost(lost === null ? 1 : null)} tone={lost === null ? "danger" : "neutral"}>
          {lost === null ? "Lose a partition" : "Restore"}
        </Btn>
      </div>

      <svg viewBox="0 0 400 170" className="w-full select-none" style={{ maxHeight: 200 }}>
        {rows.map((r) =>
          cols.slice(0, -1).map((c) =>
            (kind === "narrow" ? [r] : rows).map((tr) => (
              <line key={`${r}-${c}-${tr}`} x1={X(c) + 20} y1={Y(r) + 12} x2={X(c + 1) - 20} y2={Y(tr) + 12}
                stroke={affected.includes(tr) && c === cols.length - 2 ? "#e11d48" : "#e2e8f0"} strokeWidth={1.3} />
            )),
          ),
        )}
        {rows.map((r) =>
          cols.map((c) => {
            const isLost = lost === r && c === cols.length - 1;
            const recomputed = affected.includes(r) && c < cols.length - 1 && lost !== null;
            return (
              <g key={`${r}${c}`}>
                <motion.circle cx={X(c)} cy={Y(r) + 12} r={15}
                  animate={{
                    fill: isLost ? "#fee2e2" : recomputed ? "#fef3c7" : "#f8fafc",
                    stroke: isLost ? "#e11d48" : recomputed ? "#d97706" : "#cbd5e1",
                  }} strokeWidth={1.6} />
                <text x={X(c)} y={Y(r) + 16} textAnchor="middle" className="font-mono text-[10px] font-semibold"
                  fill={isLost ? "#b91c1c" : "#64748b"}>{isLost ? "✕" : `p${r}`}</text>
              </g>
            );
          }),
        )}
        {["input", "map", "result"].map((l, c) => (
          <text key={l} x={X(c)} y={166} textAnchor="middle" className="text-[9.5px] tracking-wide uppercase" fill="#94a3b8">{l}</text>
        ))}
      </svg>

      <Readout
        items={[
          { label: "dependency", value: kind },
          { label: "partitions to recompute", value: lost === null ? "—" : affected.length,
            tone: lost === null ? "plain" : kind === "narrow" ? "ok" : "bad" },
          { label: "recovery", value: lost === null ? "—" : kind === "narrow" ? "parallel, local" : "re-run across ancestors" },
        ]}
      />
    </Figure>
  );
}
