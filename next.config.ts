import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],

  // Extend webpack config
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Treat puppeteer as external so it won't be bundled
      config.externals.push({
        puppeteer: "puppeteer",
      });
    }
    return config;
  },
};

export default nextConfig;
