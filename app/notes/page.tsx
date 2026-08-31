import { BlogHeadingText } from "@/app/fonts";
import { NotesFooter } from "@/components/notes/footer";
import { COLLECTIONS } from "@/components/notes/nav";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notes — Lakshya Singh Panwar",
  description:
    "Notes on whatever I am learning, written up properly enough to come back to.",
};

export default function NotesHome() {
  return (
    <div className="mx-auto max-w-[46rem] px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/"
        className="mb-8 inline-block text-[11px] font-medium tracking-wide text-gray-400 uppercase transition-colors hover:text-gray-900"
      >
        ← Lakshya
      </Link>

      <h1
        className={`${BlogHeadingText.className} mb-8 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl`}
      >
        Notes
      </h1>

      <ul className="space-y-3">
        {COLLECTIONS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/notes/${c.slug}`}
              className="group flex gap-4 rounded-xl border border-gray-200 p-5 transition-colors hover:border-gray-300 hover:bg-gray-50/70"
            >
              <span aria-hidden className="text-2xl leading-none">
                {c.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-lg font-medium text-gray-900">{c.title}</span>
                  {c.count && (
                    <span className="font-mono text-[11px] text-gray-400">
                      {c.count} pages
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                  {c.blurb}
                </span>
              </span>
              <span className="self-center text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <NotesFooter />
    </div>
  );
}
