import type { NextConfig } from "next";
// Trigger restart for prisma client update


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "eamgtafjsbdfvsjiezdo.supabase.co",
      },
    ],
  },
};

export default nextConfig;
