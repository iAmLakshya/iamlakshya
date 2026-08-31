import { Figure } from "./primitives";

export function HdfsArchitecture() {
  return (
    <Figure
      title="HDFS"
      caption="The NameNode holds the entire namespace and block map in memory, which is what makes lookups fast and what makes it the single point of failure. DataNodes hold the blocks and report in on start-up."
    >
      <svg viewBox="0 0 440 180" className="w-full select-none" style={{ maxHeight: 200 }}>
        <rect x={155} y={10} width={130} height={44} rx={9} fill="#0f172a" />
        <text x={220} y={30} textAnchor="middle" className="text-[12px] font-bold" fill="#fff">NameNode</text>
        <text x={220} y={44} textAnchor="middle" className="text-[9px]" fill="#94a3b8">namespace + block map, in RAM</text>
        <text x={300} y={36} className="text-[10px]" fill="#64748b">← metadata only</text>

        {[30, 175, 320].map((x, i) => (
          <g key={i}>
            <line x1={220} y1={54} x2={x + 47} y2={104} stroke="#cbd5e1" strokeWidth={1.4} strokeDasharray="3 3" />
            <rect x={x} y={106} width={94} height={40} rx={8} fill="#fff" stroke="#cbd5e1" strokeWidth={1.6} />
            <text x={x + 47} y={124} textAnchor="middle" className="text-[11px] font-semibold" fill="#334155">DataNode</text>
            <text x={x + 47} y={137} textAnchor="middle" className="text-[9px]" fill="#94a3b8">blocks on disk</text>
          </g>
        ))}
        <text x={30} y={166} className="text-[9.5px]" fill="#94a3b8">
          replicas placed across racks, so losing a rack does not lose the block
        </text>
      </svg>
    </Figure>
  );
}
