"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Btn, C, Figure, Readout, Segmented, Stage } from "./primitives";

const KEYS = ["user:1","cart:9","img:4","doc:2","evt:7","tag:3","job:5","msg:8","ref:6","sku:0"];
const hash = (s: string) => { let x = 17; for (const c of s) x = (x * 31 + c.charCodeAt(0)) % 360; return x; };
const NODE_TINT = ["#0f172a", "#2563eb", "#059669", "#d97706", "#7c3aed"];

export function ConsistentHashRing() {
  const [nodes, setNodes] = useState([20, 110, 200, 290]);
  const [mode, setMode] = useState<"ring" | "modulo">("ring");
  const [prev, setPrev] = useState<Record<string, number> | null>(null);

  const keys = useMemo(() => KEYS.map((k) => ({ k, a: hash(k) })), []);

  const owner = (a: number, i: number) => {
    if (mode === "modulo") return i % Math.max(1, nodes.length);
    if (!nodes.length) return -1;
    const sorted = [...nodes].sort((x, y) => x - y);
    const found = sorted.find((n) => n >= a) ?? sorted[0];
    return nodes.indexOf(found);
  };

  const assign = useMemo(() => {
    const m: Record<string, number> = {};
    keys.forEach((k, i) => (m[k.k] = owner(k.a, i)));
    return m;
  }, [nodes, mode, keys]);

  const moved = prev ? keys.filter((k) => prev[k.k] !== assign[k.k]).length : null;

  const change = (fn: (n: number[]) => number[]) => { setPrev({ ...assign }); setNodes(fn); };
  const addNode = () => change((n) => (n.length >= 5 ? n : [...n, (n[n.length - 1] + 83) % 360]));
  const dropNode = () => change((n) => (n.length <= 1 ? n : n.slice(0, -1)));

  const R = 92, cx = 130, cy = 118;
  const pt = (a: number, r = R) => [cx + r * Math.cos(((a - 90) * Math.PI) / 180), cy + r * Math.sin(((a - 90) * Math.PI) / 180)];

  return (
    <Figure
      title="Consistent hashing"
      caption={
        <>
          Add or remove a node and watch how many keys change owner. On the ring only
          the keys in the departing arc move. Switch to <code>hash(key) % n</code> and
          nearly every key relocates, which is the reason modulus is unusable for
          partitioning.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Segmented value={mode} onChange={(m) => { setPrev(null); setMode(m); }}
          options={[{ value: "ring", label: "Hash ring" }, { value: "modulo", label: "hash % n" }] as const} />
        <div className="flex gap-2">
          <Btn onClick={addNode} tone="primary">Add node</Btn>
          <Btn onClick={dropNode} tone="danger">Remove node</Btn>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Stage viewBox="0 0 260 236" height={240} className="sm:w-1/2">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.line} strokeWidth={1.5}
            strokeDasharray={mode === "modulo" ? "4 5" : undefined} />
          {mode === "ring" && nodes.map((a, i) => {
            const sorted = [...nodes].sort((x, y) => x - y);
            const idx = sorted.indexOf(a);
            const start = sorted[(idx - 1 + sorted.length) % sorted.length];
            const [sx, sy] = pt(start); const [ex, ey] = pt(a);
            const large = ((a - start + 360) % 360) > 180 ? 1 : 0;
            return <path key={`arc${i}`} d={`M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`}
              fill="none" stroke={NODE_TINT[i % 5]} strokeWidth={5} strokeLinecap="round" opacity={0.22} />;
          })}
          {keys.map((k) => {
            const [x, y] = pt(k.a, R - 24);
            const o = assign[k.k];
            const didMove = prev && prev[k.k] !== o;
            return (
              <motion.circle key={k.k} r={5.5}
                animate={{ cx: x, cy: y, fill: o >= 0 ? NODE_TINT[o % 5] : C.muted, scale: didMove ? 1.5 : 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }} />
            );
          })}
          {nodes.map((a, i) => {
            const [x, y] = pt(a);
            return (
              <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <rect x={x - 15} y={y - 11} width={30} height={22} rx={6} fill={NODE_TINT[i % 5]} />
                <text x={x} y={y + 5} textAnchor="middle" className="font-mono text-[11px] font-bold" fill="#fff">
                  N{i + 1}
                </text>
              </motion.g>
            );
          })}
        </Stage>

        <div className="sm:w-1/2">
          <div className="grid grid-cols-2 gap-1.5">
            {keys.map((k) => {
              const o = assign[k.k];
              const didMove = prev && prev[k.k] !== o;
              return (
                <motion.div key={k.k} animate={{ backgroundColor: didMove ? "#fef3c7" : "#ffffff" }}
                  className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: o >= 0 ? NODE_TINT[o % 5] : C.muted }} />
                  <span className="font-mono text-[11px] text-gray-700">{k.k}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <Readout
        items={[
          { label: "nodes", value: nodes.length },
          { label: "keys", value: keys.length },
          { label: "moved on last change", value: moved === null ? "—" : `${moved} / ${keys.length}`,
            tone: moved === null ? "plain" : moved > keys.length / 2 ? "bad" : "ok" },
        ]}
      />
    </Figure>
  );
}
