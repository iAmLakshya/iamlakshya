import type { ReactNode } from "react";

/** Emphasis carried over from the source notes. */
export function Mark({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-amber-200/60 px-1 py-0.5 text-inherit">{children}</mark>
  );
}
