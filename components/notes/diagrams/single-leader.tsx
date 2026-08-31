import { Figure } from "./primitives";

/** The canonical single-leader picture: one write path, many read paths. */
export function SingleLeader() {
  return (
    <Figure
      title="Single leader replication"
      caption="All writes go through the leader, which streams its replication log to the followers asynchronously. Reads can be served by any replica, which is where the extra throughput comes from and also where stale reads come from."
    >
      <svg viewBox="0 0 460 190" className="w-full select-none" style={{ maxHeight: 220 }}>
        {/* client -> leader */}
        <text x={16} y={92} className="text-[11px] font-semibold" fill="#0f172a">Client</text>
        <line x1={58} y1={88} x2={120} y2={88} stroke="#0f172a" strokeWidth={2} />
        <text x={80} y={80} className="text-[10px] font-semibold" fill="#e11d48">write</text>

        <rect x={122} y={64} width={78} height={48} rx={9} fill="#0f172a" />
        <text x={161} y={93} textAnchor="middle" className="text-[12px] font-bold" fill="#fff">Leader</text>

        {[28, 88, 148].map((y, i) => (
          <g key={i}>
            <path d={`M 200 88 C 232 88 232 ${y + 16} 262 ${y + 16}`} fill="none"
              stroke="#94a3b8" strokeWidth={1.6} strokeDasharray="4 4" />
            <rect x={264} y={y} width={86} height={32} rx={8} fill="#fff" stroke="#cbd5e1" strokeWidth={1.6} />
            <text x={307} y={y + 20} textAnchor="middle" className="text-[11px] font-semibold" fill="#475569">
              Follower {i + 1}
            </text>
            <line x1={350} y1={y + 16} x2={402} y2={y + 16} stroke="#2563eb" strokeWidth={1.6} />
          </g>
        ))}
        <text x={222} y={132} className="text-[10px]" fill="#94a3b8">async replication log</text>
        <text x={404} y={92} className="text-[11px] font-semibold" fill="#2563eb">reads</text>
      </svg>
    </Figure>
  );
}
