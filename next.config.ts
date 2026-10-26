import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // lib/openjlpt.ts reads these with fs, which file tracing can't follow.
  outputFileTracingIncludes: {
    "/dictionary": ["./data/openjlpt/**/*"],
    "/dictionary/**": ["./data/openjlpt/**/*"],
    "/grammar": ["./data/openjlpt/**/*"],
    "/grammar/**": ["./data/openjlpt/**/*"],
    "/test": ["./content/questions/**/*"],
    "/test/**": ["./content/questions/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
