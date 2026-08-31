"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { C, Controls, Figure, Readout, Segmented, Slider, Stage } from "./primitives";

/** Server-local caches multiply with the fleet; a shared layer scales on its own axis. */
export function CacheTopology() {
  const [n, setN] = useState(4);
  const [kind, setKind] = useState<"local" | "global">("local");
  const PER = 8; // GB of cache per server
  const total = kind === "local" ? n * PER : 32;
  const distinct = kind === "local" ? PER : 32;
  const y = (i: number) => 22 + i * (110 / Math.max(1, n - 1 || 1));

  return (
    <Figure
      title="Server-local against a shared cache layer"
      caption={
        <>
          A per-process cache costs no network hop, but every server keeps its own copy of the
          same hot keys, so the distinct working set it can hold never grows past one machine no
          matter how many you add. A shared layer holds one copy of everything and scales
          independently of the fleet, at the price of a round trip and one more thing that can
          fail.
        </>
      }
    >
      <Controls>
        <Slider label="app servers" value={n} min={2} max={6} onChange={setN} accent={C.ink} />
        <Segmented value={kind} onChange={setKind}
          options={[{ value: "local", label: "Server-local" }, { value: "global", label: "Shared layer" }] as const} />
      </Controls>

      <Stage viewBox="0 0 400 160" height={190}>
        {Array.from({ length: n }).map((_, i) => (
          <g key={i}>
            <rect x={30} y={y(i) - 12} width={72} height={24} rx={6} fill="#fff" stroke={C.line} strokeWidth={1.5} />
            <text x={66} y={y(i) + 4} textAnchor="middle" className="text-[10px] font-semibold" fill={C.idleText}>app {i + 1}</text>
            {kind === "local" ? (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <rect x={108} y={y(i) - 10} width={46} height={20} rx={5} fill="#fef3c7" stroke={C.warn} strokeWidth={1.3} />
                <text x={131} y={y(i) + 4} textAnchor="middle" className="font-mono text-[8.5px]" fill="#92400e">{PER}GB</text>
              </motion.g>
            ) : (
              <motion.line initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                x1={102} y1={y(i)} x2={250} y2={78} stroke={C.read} strokeWidth={1.4} strokeDasharray="3 3" />
            )}
            <line x1={kind === "local" ? 154 : 102} y1={y(i)} x2={330} y2={78} stroke={C.line} strokeWidth={1} opacity={0.35} />
          </g>
        ))}
        {kind === "global" && (
          <motion.g initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <rect x={252} y={58} width={56} height={40} rx={8} fill="#dbeafe" stroke={C.read} strokeWidth={1.8} />
            <text x={280} y={76} textAnchor="middle" className="text-[9.5px] font-bold" fill="#1e40af">cache</text>
            <text x={280} y={89} textAnchor="middle" className="font-mono text-[8.5px]" fill="#1e40af">32GB</text>
          </motion.g>
        )}
        <rect x={332} y={58} width={54} height={40} rx={8} fill={C.ink} />
        <text x={359} y={82} textAnchor="middle" className="text-[9.5px] font-bold" fill="#fff">db</text>
      </Stage>

      <Readout
        items={[
          { label: "memory bought", value: `${total} GB` },
          { label: "distinct keys cacheable", value: `${distinct} GB`,
            tone: kind === "local" ? "bad" : "ok" },
          { label: "network hop", value: kind === "local" ? "none" : "one", tone: kind === "local" ? "ok" : "plain" },
          { label: "duplicated copies", value: kind === "local" ? n : 1, tone: kind === "local" ? "bad" : "ok" },
        ]}
      />
    </Figure>
  );
}
