export const runtime = "nodejs";
// Increase the timeout to 60 seconds (Vercel Pro limit) to allow scraping
export const maxDuration = 60;

import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

async function getBrowser() {
  // Import the modern package
  const chromium = (await import("@sparticuz/chromium")) as any;
  const puppeteer = await import("puppeteer-core");

  return puppeteer.launch({
    args: [
      ...chromium.args,
      "--disable-gpu", // Essential for Vercel
      "--disable-setuid-sandbox",
      "--no-sandbox",
      // Vercel specific fix to handle shared memory
      "--disable-dev-shm-usage",
    ],
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
}

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    // Anti-detection script
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "language", { get: () => "en-US" });
    });

    // Reduced timeout to prevent function hang if network is slow
    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 2000));

    const html = await page.content();
    await browser.close();

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
    console.error("Scraping Error:", error); // Log the ACTUAL error for Vercel logs
    const message = error instanceof Error ? error.message : "Unknown error";
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
