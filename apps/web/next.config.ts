import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@afterglow/ui",
    "@afterglow/api",
    "@afterglow/types",
    "@afterglow/utils",
  ],
};

export default nextConfig;
