import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow .md / .mdx files to act as pages
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async redirects() {
    return [
      // The blog lives on its own subdomain. Deliberately temporary (307) rather than
      // permanent: a 308 is cached hard by browsers and is painful to undo, and the old
      // /blog route was a placeholder with no accumulated link equity to preserve.
      // Flip `permanent` to true once the arrangement has settled.
      {
        source: "/blog",
        destination: "https://blog.iamlakshya.com/",
        permanent: false,
      },
      {
        source: "/blog/:path*",
        destination: "https://blog.iamlakshya.com/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

const withMDX = createMDX({
  options: {
    // Turbopack cannot receive JS functions across the Rust boundary, so
    // plugins are named as strings rather than imported.
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
