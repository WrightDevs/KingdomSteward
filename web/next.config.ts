import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next stops inferring it from a stray
  // package-lock.json in the parent directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
