/** @type {import('next').NextConfig} */

const nextConfig = {
  serverExternalPackages: [
    "@sparticuz/chromium",
    "puppeteer-core",
    "puppeteer",
  ],
};

export default nextConfig;
