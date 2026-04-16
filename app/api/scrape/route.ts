export const runtime = "nodejs";
export const maxDuration = 60;

import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

const isVercel = !!process.env.VERCEL;
interface ChromiumModule {
  executablePath: string;
  args: string[];
  headless: "new" | boolean;
  defaultViewport?: { width: number; height: number };
}

// Hardcode these so we don't depend on the bundled export
const CHROMIUM_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--single-process",
  "--no-zygote",
  "--disable-software-rasterizer",
  "--disable-extensions",
  "--window-size=1920,1080",
];

async function getBrowser() {
  const puppeteer = await import("puppeteer-core");
  if (isVercel) {
    const chromium =
      (await import("@sparticuz/chromium")) as unknown as ChromiumModule;

    return puppeteer.launch({
      args: chromium.args,
      executablePath: chromium.executablePath,
      headless: chromium.headless,
    });
  } else {
    // Point to your local Windows Chrome or Edge installation
    let executablePath = "/usr/bin/google-chrome"; // Default for Mac/Linux

    if (process.platform === "win32") {
      // Standard Windows Chrome path
      executablePath =
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

      // Alternative: If you don't have Chrome, use Edge (comes with Windows)
      // executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    }
    return puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--window-size=1920,1080",
      ],
    });
  }
}

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    console.log("[scrape] Launching browser, isVercel:", isVercel);
    const browser = await getBrowser();
    console.log("[scrape] Browser launched");

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "language", { get: () => "en-US" });
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 3000));

    const html = await page.content();
    await browser.close();
    console.log("[scrape] Browser closed, parsing HTML");

    const $ = cheerio.load(html);
    $(
      "script, style, noscript, iframe, head, nav, footer, .sidebar, .menu",
    ).remove();

    let text = $("body")
      .text()
      .replace(/[\t\r\n]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/\\u[0-9a-fA-F]{4}/g, "")
      .trim();

    const words = text.split(" ");
    if (words.length > 8000) {
      text = words.slice(0, 8000).join(" ");
    }

    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter(
        (link): link is string =>
          typeof link === "string" && link.startsWith("http"),
      );

    return NextResponse.json({ scrapedData: { text, links } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[scrape] Error:", message);
    if (error instanceof Error && error.stack) {
      console.error("[scrape] Stack:", error.stack);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

//due to free version of my api
// Limit to max 8000 words
// const words = text.split(" ");
// if (words.length > 8000) {
//   text = words.slice(0, 8000).join(" ");
// }

// import chromium from "@sparticuz/chromium";
// import * as cheerio from "cheerio";
// import { NextResponse } from "next/server";
// import puppeteer from "puppeteer-core";

// export const maxDuration = 60; // Vercel max for Pro, use 10 for Hobby

// export async function POST(req: Request) {
//   const { url } = await req.json();

//   try {
//     const isLocal = process.env.NODE_ENV === "development";

//     const browser = await puppeteer.launch({
//       args: chromium.args,
//       defaultViewport: { width: 1280, height: 720 },
//       executablePath: isLocal
//         ? process.platform === "win32"
//           ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
//           : process.platform === "darwin"
//             ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
//             : "/usr/bin/google-chrome"
//         : await chromium.executablePath(),
//       headless: true,
//     });

//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "networkidle2" });

//     const html = await page.content();
//     await browser.close();

//     if (html.includes("security verification")) {
//       return NextResponse.json(
//         { error: "Blocked by Cloudflare bot protection" },
//         { status: 403 },
//       );
//     }

//     const $ = cheerio.load(html);
//     $(
//       "script, style, noscript, iframe, head, nav, footer, .sidebar, .menu",
//     ).remove();

//     let text = $("body").text();
//     text = text
//       .replace(/[\t\r\n]+/g, " ")
//       .replace(/\s{2,}/g, " ")
//       .replace(/\\u[0-9a-fA-F]{4}/g, "")
//       .trim();

//     const links = $("a")
//       .map((_, el) => $(el).attr("href"))
//       .get()
//       .filter((link) => link && link.startsWith("http"));

//     return NextResponse.json({ scrapedData: { text, links } });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
