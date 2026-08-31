"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Controls, Figure, Readout, Slider, Stage } from "./primitives";

/** Wider pages mean higher fan-out, which means fewer levels, which means fewer seeks. */
export function BTreeFanout() {
  const [kb, setKb] = useState(8);
  const ROWS = 1_000_000;
  const keysPerPage = Math.max(2, Math.floor((kb * 1024) / 128)); // ~128 bytes per entry
  const depth = Math.max(1, Math.ceil(Math.log(ROWS) / Math.log(keysPerPage)));

  const levels = Array.from({ length: Math.min(depth, 4) });
  const W = 420;

  return (
    <Figure
      title="Page size and tree depth"
      caption={
        <>
          A B-tree lookup costs one disk seek per level, so depth is the number that matters.
          Depth is set by fan-out, and fan-out is set by how many keys fit in a page. Doubling
          the page size does not halve the depth, it divides it logarithmically, which is why
          real engines settle in the single-digit kilobytes rather than going as wide as
          possible.
        </>
      }
    >
      <Controls>
        <Slider label="page size (kB)" value={kb} min={1} max={64} onChange={setKb} accent={C.ink}
          hint="Postgres 8 · InnoDB 16 · SQLite 4" />
      </Controls>

      <Stage viewBox={`0 0 ${W} 150`} height={180}>
        {levels.map((_, lvl) => {
          const n = Math.min(2 ** lvl, 8);
          const bw = Math.min(70, (W - 40) / n - 8);
          return (
            <g key={lvl}>
              {Array.from({ length: n }).map((__, i) => {
                const x = 20 + i * ((W - 40) / n) + ((W - 40) / n - bw) / 2;
                return (
                  <motion.rect key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    x={x} y={16 + lvl * 32} width={bw} height={20} rx={4}
                    fill={lvl === 0 ? C.ink : "#e2e8f0"} />
                );
              })}
              <text x={0} y={31 + lvl * 32} className="font-mono text-[9px]" fill={C.muted}>
                L{lvl}
              </text>
            </g>
          );
        })}
        {depth > 4 && (
          <text x={W / 2} y={144} textAnchor="middle" className="text-[10px]" fill={C.muted}>
            … {depth - 4} more level{depth - 4 > 1 ? "s" : ""}
          </text>
        )}
      </Stage>

      <Readout
        items={[
          { label: "keys per page", value: keysPerPage },
          { label: "rows", value: "1,000,000" },
          { label: "depth", value: depth },
          { label: "seeks per lookup", value: depth, tone: depth <= 3 ? "ok" : "bad" },
        ]}
      />
    </Figure>
  );
}
