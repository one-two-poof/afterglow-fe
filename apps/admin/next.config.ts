import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@afterglow/design-system",
    "@afterglow/api",
    "@afterglow/types",
    "@afterglow/utils",
  ],
};

export default nextConfig;
