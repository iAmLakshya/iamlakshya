import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Global MDX element styling. Required at the project root by @next/mdx.
 * Diagram components are imported per-file inside each .mdx page so a page
 * only ships the client bundles it actually uses.
 */

function Anchor({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  const internal = href.startsWith("/") || href.startsWith("#");
  if (internal) {
    return (
      <Link
        href={href}
        className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
      {...rest}
    >
      {children}
    </a>
  );
}

const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="mb-6 text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
      {children}
    </h1>
  ),
  h2: ({ children, className, ...p }: ComponentPropsWithoutRef<"h2">) => (
    // remark-gfm labels its generated footnote section with an sr-only h2. Respect any
    // className it passes rather than overwriting it, or that label becomes visible.
    <h2
      {...p}
      className={
        className ??
        "group mt-14 mb-4 scroll-mt-24 border-t border-gray-200 pt-8 text-2xl font-medium tracking-tight text-gray-900"
      }
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...p }) => (
    <h3
      {...p}
      className="mt-9 mb-3 scroll-mt-24 text-lg font-semibold tracking-tight text-gray-900"
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...p }) => (
    <h4 {...p} className="mt-6 mb-2 scroll-mt-24 text-base font-semibold text-gray-800">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-4 leading-[1.75] text-gray-700">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-1.5 pl-5 leading-[1.7] text-gray-700 marker:text-gray-400">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-1.5 pl-5 leading-[1.7] text-gray-700 marker:text-gray-400">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="text-gray-400 decoration-gray-400">{children}</del>
  ),
  a: Anchor,
  blockquote: ({ children }) => (
    <blockquote className="my-5 rounded-r border-l-2 border-amber-300 bg-amber-50/50 py-1 pr-4 pl-4 text-[0.94em] text-gray-600 [&>p]:my-2">
      {children}
    </blockquote>
  ),
  code: ({ children, ...p }) => (
    <code
      {...p}
      className="rounded border border-gray-200 bg-gray-50 px-[0.35em] py-[0.12em] font-mono text-[0.85em] text-gray-800"
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50/70 p-4">
      <pre className="font-mono text-[11.5px] leading-[1.5] whitespace-pre text-gray-600 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
        {children}
      </pre>
    </div>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-gray-100 px-3 py-2 align-top text-gray-700">
      {children}
    </td>
  ),
  hr: () => <hr className="my-10 border-gray-200" />,
  section: ({ children, ...p }: ComponentPropsWithoutRef<"section">) => {
    // remark-gfm emits <section data-footnotes> only when the page actually has footnotes,
    // so this heading never appears on a page without them.
    if (!("data-footnotes" in p)) return <section {...p}>{children}</section>;
    return (
      <section
        {...p}
        className="mt-14 border-t border-gray-200 pt-6 text-[0.86em] text-gray-500 [&_li]:mb-2 [&_p]:my-1"
      >
        <h2 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Footnotes
        </h2>
        {children}
      </section>
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
