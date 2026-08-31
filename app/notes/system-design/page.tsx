import { SYSTEM_DESIGN, SYSTEM_DESIGN_BASE } from "@/components/notes/nav";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "System Design — Notes",
  description:
    "Notes on storage engines, replication, consensus, batch and stream processing, and caching.",
};

export default function SystemDesignIndex() {
  return (
    <>
      <h1 className="mb-6 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
        System Design
      </h1>

      <div className="text-gray-700">
        <p className="my-4 leading-[1.75]">
          Notes on how data systems actually work underneath: what a storage engine does on
          one node, what breaks when you put several of them behind a network, and what each
          fix costs. The ground is roughly that of{" "}
          <em>Designing Data-Intensive Applications</em>, written up as mechanisms and
          trade-offs rather than tutorials.
        </p>
        <p className="my-4 leading-[1.75]">
          Every claim that comes from outside carries a footnote back to the paper or the
          documentation it came from.
        </p>
      </div>

      <ol className="mt-10 space-y-px">
        {SYSTEM_DESIGN.map((n, i) => (
          <li key={n.slug}>
            <Link
              href={`${SYSTEM_DESIGN_BASE}/${n.slug}`}
              className="group flex gap-4 rounded-lg border border-transparent px-3 py-3.5 transition-colors hover:border-gray-200 hover:bg-gray-50/70"
            >
              <span className="mt-0.5 font-mono text-xs text-gray-300 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-gray-900">{n.title}</span>
                <span className="mt-0.5 block text-sm leading-snug text-gray-500">
                  {n.blurb}
                </span>
              </span>
              <span className="self-center text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
