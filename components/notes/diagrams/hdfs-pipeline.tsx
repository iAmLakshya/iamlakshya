"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout, Stage } from "./primitives";

const NODES = ["DN-A", "DN-B", "DN-C"];

export function HdfsPipeline() {
  const [at, setAt] = useState(-1);      // how far the write has travelled
  const [acked, setAcked] = useState(-1); // how far the ack has come back
  const [broken, setBroken] = useState<number | null>(null);

  const step = () => {
    if (at < NODES.length - 1) {
      if (broken !== null && at + 1 > broken) return;
      setAt(at + 1);
    } else if (acked < NODES.length - 1) setAcked(acked + 1);
  };
  const reset = () => { setAt(-1); setAcked(-1); setBroken(null); };

  const stalled = broken !== null && at === broken;
  const done = acked === NODES.length - 1;
  const x = (i: number) => 60 + i * 100;

  return (
    <Figure
      title="HDFS replication pipeline"
      caption={
        <>
          The client writes once and the datanodes forward down the pipeline, with acks
          coming back the other way. Break a link to see the failure the notes describe:
          the write is already durable on some nodes but the client never learns it, so
          it retries. Tries to be consistent, and is not.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Btn onClick={step} tone="primary">{at < NODES.length - 1 ? "Forward write" : "Return ack"}</Btn>
        <Btn onClick={() => setBroken(broken === 1 ? null : 1)} tone="danger">
          {broken === 1 ? "Repair B → C" : "Break B → C"}
        </Btn>
        <Btn onClick={reset}>Reset</Btn>
      </div>

      <Stage viewBox="0 0 380 150" height={180}>
        <g>
          <circle cx={16} cy={75} r={13} fill="#fff" stroke={C.ink} strokeWidth={1.8} />
          <text x={16} y={79} textAnchor="middle" className="text-[10px] font-bold" fill={C.ink}>C</text>
        </g>
        {NODES.map((n, i) => {
          const has = at >= i;
          const ok = acked >= i;
          return (
            <g key={n}>
              {(() => {
                const from = i === 0 ? 32 : x(i - 1) + 26;
                const dead = broken === i - 1;
                return (
                  <>
                    <motion.line x1={from} y1={68} x2={x(i) - 26} y2={68}
                      animate={{ stroke: dead ? C.write : at >= i ? C.ink : C.line, opacity: dead ? 1 : 0.8 }}
                      strokeWidth={2} strokeDasharray={dead ? "4 3" : undefined} markerEnd="url(#arw)" />
                    <motion.line x1={x(i) - 26} y1={86} x2={from} y2={86}
                      animate={{ stroke: ok ? C.ok : C.line }} strokeWidth={2} strokeDasharray="3 3" />
                    {dead && <text x={(from + x(i) - 26) / 2} y={58} textAnchor="middle"
                      className="text-[9px] font-bold" fill={C.write}>✕ broken</text>}
                  </>
                );
              })()}
              <motion.rect x={x(i) - 26} y={54} width={52} height={42} rx={8}
                animate={{ fill: ok ? "#d1fae5" : has ? C.ink : "#fff", stroke: ok ? C.ok : has ? C.ink : C.line }}
                strokeWidth={1.8} />
              <text x={x(i)} y={73} textAnchor="middle" className="font-mono text-[10px] font-bold"
                fill={ok ? "#047857" : has ? "#fff" : C.idleText}>{n}</text>
              <text x={x(i)} y={87} textAnchor="middle" className="text-[9px]"
                fill={ok ? "#047857" : has ? "#cbd5e1" : C.line}>{ok ? "acked" : has ? "stored" : "empty"}</text>
            </g>
          );
        })}
        <defs>
          <marker id="arw" markerWidth={7} markerHeight={7} refX={6} refY={3} orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="currentColor" strokeWidth={1.2} />
          </marker>
        </defs>
        <text x={44} y={44} className="text-[9px] tracking-wide uppercase" fill={C.muted}>write, once</text>
        <text x={44} y={108} className="text-[9px] tracking-wide uppercase" fill={C.muted}>ack</text>
      </Stage>

      <Readout
        items={[
          { label: "replicas holding data", value: `${Math.max(0, at + 1)} / 3` },
          { label: "client believes", value: done ? "written" : "not yet written", tone: done ? "ok" : "plain" },
          { label: "state", value: stalled ? "durable on some nodes, client will retry" : done ? "consistent" : "in flight",
            tone: stalled ? "bad" : done ? "ok" : "plain" },
        ]}
      />
    </Figure>
  );
}
