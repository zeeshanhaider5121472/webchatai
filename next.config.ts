import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
  serverExternalPackages: [
    "@sparticuz/chromium",
    "puppeteer-core",
    "puppeteer",
  ],
  experimental: {
    // Increase memory for the serverless function
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
