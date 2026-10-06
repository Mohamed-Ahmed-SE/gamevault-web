import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.rawg.io" },
      { protocol: "https", hostname: "cdn.steamgriddb.com" },
      { protocol: "https", hostname: "cdn2.steamgriddb.com" },
    ],
  },
};

export default nextConfig;
