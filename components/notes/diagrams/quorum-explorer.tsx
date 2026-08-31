"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Controls, Figure, Readout, Slider, Stage } from "./primitives";

/**
 * W + R > N, shown as the pigeonhole argument it actually is.
 * Writes claim nodes from the left, reads claim them from the right. They are
 * forced to share a node exactly when W + R exceeds N.
 */
export function QuorumExplorer() {
  const [n, setN] = useState(5);
  const [w, setW] = useState(3);
  const [r, setR] = useState(3);

  const W = Math.min(w, n);
  const R = Math.min(r, n);
  const overlap = Math.max(0, W + R - n);
  const safe = W + R > n;

  const box = 62;
  const gap = 12;
  const width = n * box + (n - 1) * gap;

  return (
    <Figure
      title="Quorum overlap"
      caption={
        <>
          Writes fill from the left, reads from the right. The moment{" "}
          <code className="font-mono">W + R &gt; N</code> they are forced to share at
          least one node, which is the whole guarantee. Drag <code>W</code> and{" "}
          <code>R</code> down until the purple band disappears and the read set can
          miss the latest write entirely.
        </>
      }
    >
      <Controls>
        <Slider label="N — replicas" value={n} min={3} max={9}
          onChange={(v) => { setN(v); setW((x) => Math.min(x, v)); setR((x) => Math.min(x, v)); }}
          accent={C.ink} />
        <Slider label="W — write set" value={W} min={1} max={n} onChange={setW} accent={C.write} />
        <Slider label="R — read set" value={R} min={1} max={n} onChange={setR} accent={C.read} />
        <div className="flex gap-2">
          <Btn onClick={() => { setN(5); setW(3); setR(3); }}>Quorum</Btn>
          <Btn onClick={() => { setN(5); setW(1); setR(1); }}>Fast &amp; unsafe</Btn>
          <Btn onClick={() => { setN(5); setW(5); setR(1); }}>Write-all</Btn>
        </div>
      </Controls>

      <Stage viewBox={`0 0 ${width} 150`} height={190}>
        {Array.from({ length: n }).map((_, i) => {
          const isW = i < W;
          const isR = i >= n - R;
          const both = isW && isR;
          const fill = both ? C.both : isW ? C.write : isR ? C.read : C.idle;
          const x = i * (box + gap);
          return (
            <g key={i}>
              <motion.rect
                x={x} y={38} width={box} height={box} rx={10}
                animate={{ fill, opacity: both ? 1 : isW || isR ? 0.92 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
              />
              <text x={x + box / 2} y={38 + box / 2 + 5} textAnchor="middle"
                className="font-mono text-[15px] font-semibold"
                fill={isW || isR ? "#fff" : C.idleText}>
                {i + 1}
              </text>
              {both && (
                <motion.text
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  x={x + box / 2} y={124} textAnchor="middle"
                  className="text-[10px] font-semibold tracking-wide uppercase" fill={C.both}>
                  shared
                </motion.text>
              )}
            </g>
          );
        })}
        {W > 0 && (
          <motion.g animate={{ opacity: 1 }}>
            <line x1={0} y1={26} x2={W * box + (W - 1) * gap} y2={26} stroke={C.write} strokeWidth={2.5} strokeLinecap="round" />
            <text x={4} y={18} className="text-[11px] font-semibold" fill={C.write}>W = {W}</text>
          </motion.g>
        )}
        {R > 0 && (
          <motion.g>
            <line x1={width - (R * box + (R - 1) * gap)} y1={112} x2={width} y2={112} stroke={C.read} strokeWidth={2.5} strokeLinecap="round" />
            <text x={width - 4} y={107} textAnchor="end" className="text-[11px] font-semibold" fill={C.read}>R = {R}</text>
          </motion.g>
        )}
      </Stage>

      <Readout
        items={[
          { label: "W + R", value: `${W} + ${R} = ${W + R}` },
          { label: "N", value: n },
          { label: "shared nodes", value: overlap, tone: overlap > 0 ? "ok" : "bad" },
          {
            label: "verdict",
            value: safe ? "read sees latest write" : "read may miss the write",
            tone: safe ? "ok" : "bad",
          },
        ]}
      />
    </Figure>
  );
}
