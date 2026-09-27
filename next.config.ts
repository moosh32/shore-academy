import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Dev assets must load when the site is opened at 127.0.0.1, not only localhost.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
