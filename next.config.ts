import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // OAuth avatar providers + the seed's placeholder avatars.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default nextConfig;