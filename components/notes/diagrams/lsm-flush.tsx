"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Btn, C, Figure, Readout, Stage } from "./primitives";

type Row = { k: string; v: number; tomb?: boolean };
const KEYS = ["ab", "cd", "ef", "gh", "ij", "kl", "mn", "op"];
const CAP = 4;

export function LsmFlush() {
  const [mem, setMem] = useState<Row[]>([]);
  const [tables, setTables] = useState<Row[][]>([]);
  const [i, setI] = useState(0);

  const write = (tomb = false) => {
    const row = { k: KEYS[i % KEYS.length], v: (i % 9) + 1, tomb };
    const next = [...mem.filter((r) => r.k !== row.k), row].sort((a, b) => a.k.localeCompare(b.k));
    setI(i + 1);
    if (next.length >= CAP) { setTables((t) => [next, ...t].slice(0, 3)); setMem([]); }
    else setMem(next);
  };

  const compact = () => {
    if (tables.length < 2) return;
    const [a, b, ...rest] = tables;
    const merged = new Map<string, Row>();
    for (const r of [...b, ...a]) merged.set(r.k, r); // newer (a) wins
    setTables([[...merged.values()].filter((r) => !r.tomb).sort((x, y) => x.k.localeCompare(y.k)), ...rest]);
  };

  const Cell = ({ r }: { r: Row }) => (
    <div className={`flex items-center justify-between rounded px-1.5 py-0.5 font-mono text-[10px] ${
      r.tomb ? "bg-rose-50 text-rose-600 line-through" : "bg-white text-gray-700"}`}>
      <span>{r.k}</span><span>{r.tomb ? "⌫" : r.v}</span>
    </div>
  );

  return (
    <Figure
      title="LSM-tree flush and compaction"
      caption={
        <>
          Writes land in the sorted in-memory table. At capacity it flushes whole to an
          immutable SSTable on disk, which is why writes are sequential and cheap. A
          delete writes a tombstone rather than removing anything, and only compaction
          reclaims the space.
        </>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Btn onClick={() => write()} tone="primary">Write key</Btn>
        <Btn onClick={() => write(true)} tone="danger">Delete key (tombstone)</Btn>
        <Btn onClick={compact}>Compact</Btn>
        <Btn onClick={() => { setMem([]); setTables([]); setI(0); }}>Reset</Btn>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_2fr]">
        <div>
          <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Memtable · RAM
          </div>
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-2">
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {mem.map((r) => (
                  <motion.div key={r.k} layout initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <Cell r={r} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {Array.from({ length: CAP - 1 - mem.length }).map((_, k) => (
                <div key={k} className="h-[19px] rounded border border-dashed border-gray-200" />
              ))}
            </div>
            <div className="mt-1.5 text-center font-mono text-[9px] text-gray-400">
              {mem.length}/{CAP} — flush at {CAP}
            </div>
          </div>
        </div>

        <div className="hidden items-center justify-center sm:flex">
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
            className="text-gray-300">→</motion.div>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            SSTables · disk, immutable, newest first
          </div>
          <div className="flex gap-2">
            <AnimatePresence mode="popLayout">
              {tables.map((t, ti) => (
                <motion.div key={`${ti}-${t.map((r) => r.k + r.v).join()}`} layout
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="min-w-[74px] flex-1 rounded-lg border border-gray-300 bg-gray-100/70 p-1.5">
                  <div className="mb-1 text-center font-mono text-[9px] text-gray-400">SST{tables.length - ti}</div>
                  <div className="space-y-1">{t.map((r) => <Cell key={r.k} r={r} />)}</div>
                </motion.div>
              ))}
            </AnimatePresence>
            {!tables.length && (
              <div className="flex-1 rounded-lg border border-dashed border-gray-200 py-8 text-center text-[11px] text-gray-300">
                no SSTables yet
              </div>
            )}
          </div>
        </div>
      </div>

      <Readout
        items={[
          { label: "writes", value: i },
          { label: "sstables", value: tables.length },
          { label: "read path", value: tables.length ? `memtable → ${tables.length} sstable${tables.length > 1 ? "s" : ""}` : "memtable only" },
        ]}
      />
    </Figure>
  );
}
