"use client";

import { BlogHeadingText } from "@/app/fonts";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SECTIONS } from "./headings";
import { SYSTEM_DESIGN, SYSTEM_DESIGN_BASE } from "./nav";

/** Highlights whichever H2 is currently nearest the top of the viewport. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!ids.length) return;
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);
    if (!nodes.length) return;

    const pick = () => {
      // The heading whose top has most recently passed the reading line.
      const line = 120;
      let current = nodes[0].id;
      for (const n of nodes) {
        if (n.getBoundingClientRect().top <= line) current = n.id;
        else break;
      }
      // At the very bottom of the page the last section may never reach the line.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = nodes[nodes.length - 1].id;
      }
      setActive(current);
    };

    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [ids]);
  return active;
}

export function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const current = SYSTEM_DESIGN.find(
    (n) => path === `${SYSTEM_DESIGN_BASE}/${n.slug}`,
  );
  const sections = current ? (SECTIONS[current.slug] ?? []) : [];
  const activeSection = useActiveSection(sections.map((s) => s.id));

  return (
    <>
      {/* mobile bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white/85 px-4 py-2.5 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          {open ? "Close" : "Contents"}
        </button>
        <span className="truncate text-xs text-gray-500">
          {current?.title ?? "System Design"}
        </span>
      </div>

      <nav
        className={cn(
          "border-b border-gray-200 bg-white px-4 pt-5 pb-6",
          "lg:sticky lg:top-0 lg:h-screen lg:w-[17.5rem] lg:shrink-0 lg:overflow-y-auto",
          "lg:border-r lg:border-b-0 lg:px-6 lg:py-9",
          open ? "block" : "hidden lg:block",
        )}
      >
        <Link
          href="/notes"
          onClick={() => setOpen(false)}
          className="group mb-7 inline-flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-gray-500 uppercase transition-colors hover:text-gray-900"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Notes
        </Link>

        <Link
          href={SYSTEM_DESIGN_BASE}
          onClick={() => setOpen(false)}
          className={cn(
            BlogHeadingText.className,
            "mb-4 block text-[19px] leading-none tracking-tight transition-colors",
            path === SYSTEM_DESIGN_BASE
              ? "text-gray-900"
              : "text-gray-800 hover:text-gray-900",
          )}
        >
          System Design
        </Link>

        <ol className="relative border-l border-[#ececf0]">
          {SYSTEM_DESIGN.map((n, i) => {
            const active = path === `${SYSTEM_DESIGN_BASE}/${n.slug}`;
            return (
              <li key={n.slug} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1 bottom-1 -left-px w-[2px] rounded-full transition-colors",
                    active ? "bg-gray-900" : "bg-transparent",
                  )}
                />
                <Link
                  href={`${SYSTEM_DESIGN_BASE}/${n.slug}`}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-baseline gap-2.5 rounded-r-md py-[7px] pr-2 pl-3.5 text-[13px] leading-[1.35] transition-colors",
                    active
                      ? "font-semibold text-gray-900"
                      : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900",
                  )}
                >
                  <span
                    className={cn(
                      "w-[17px] shrink-0 text-[11px] font-medium tabular-nums transition-colors",
                      active
                        ? "text-gray-900"
                        : "text-gray-500 group-hover:text-gray-700",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">{n.title}</span>
                </Link>

                {active && sections.length > 0 && (
                  <ul className="mt-0.5 mb-2 ml-[17px] space-y-px border-l border-[#ececf0] pl-0">
                    {sections.map((sec) => {
                      const on = activeSection === sec.id;
                      return (
                        <li key={sec.id} className="relative">
                          <span
                            aria-hidden
                            className={cn(
                              "absolute top-1 bottom-1 -left-px w-[2px] rounded-full transition-colors",
                              on ? "bg-gray-400" : "bg-transparent",
                            )}
                          />
                          <a
                            href={`#${sec.id}`}
                            onClick={() => setOpen(false)}
                            aria-current={on ? "location" : undefined}
                            className={cn(
                              "block rounded-r-md py-[5px] pr-2 pl-3 text-[12px] leading-[1.35] transition-colors",
                              on
                                ? "font-medium text-gray-900"
                                : "text-gray-500 hover:bg-gray-50/80 hover:text-gray-800",
                            )}
                          >
                            {sec.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
