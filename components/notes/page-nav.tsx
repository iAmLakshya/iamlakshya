"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SYSTEM_DESIGN, SYSTEM_DESIGN_BASE } from "./nav";

type Target = { href: string; label: string; title: string };

/**
 * Previous / next chapter links. Rendered from the layout so every page gets them
 * without each MDX file having to opt in. At either end of the run the empty slot
 * becomes a link back to the contents rather than dead space.
 */
export function PageNav() {
  const path = usePathname();
  const i = SYSTEM_DESIGN.findIndex(
    (n) => path === `${SYSTEM_DESIGN_BASE}/${n.slug}`,
  );
  if (i === -1) return null; // section index, or somewhere else entirely

  const contents: Target = {
    href: SYSTEM_DESIGN_BASE,
    label: "Contents",
    title: "System Design",
  };
  const prevItem = SYSTEM_DESIGN[i - 1];
  const nextItem = SYSTEM_DESIGN[i + 1];

  const prev: Target = prevItem
    ? {
        href: `${SYSTEM_DESIGN_BASE}/${prevItem.slug}`,
        label: "Previous",
        title: prevItem.title,
      }
    : contents;
  const next: Target = nextItem
    ? {
        href: `${SYSTEM_DESIGN_BASE}/${nextItem.slug}`,
        label: "Next",
        title: nextItem.title,
      }
    : contents;

  return (
    <nav
      aria-label="Chapter"
      className="mt-16 grid gap-3 border-t border-gray-200 pt-8 sm:grid-cols-2"
    >
      <Slot target={prev} dir="prev" />
      <Slot target={next} dir="next" />
    </nav>
  );
}

function Slot({ target, dir }: { target: Target; dir: "prev" | "next" }) {
  const isNext = dir === "next";
  return (
    <Link
      href={target.href}
      rel={isNext ? "next" : "prev"}
      className={cn(
        "group flex flex-col gap-1 rounded-lg border border-gray-200 px-4 py-3.5 transition-colors",
        "hover:border-gray-300 hover:bg-gray-50/70",
        isNext && "sm:items-end sm:text-right",
      )}
    >
      <span className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-gray-400 uppercase">
        {!isNext && (
          <span
            aria-hidden
            className="transition-transform group-hover:-translate-x-0.5"
          >
            ←
          </span>
        )}
        {target.label}
        {isNext && (
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        )}
      </span>
      <span className="text-[15px] leading-snug font-medium text-gray-800 transition-colors group-hover:text-gray-900">
        {target.title}
      </span>
    </Link>
  );
}
