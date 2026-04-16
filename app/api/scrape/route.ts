export const runtime = "nodejs";

import chromium from "@sparticuz/chromium";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    const isLocal = process.env.NODE_ENV === "development";

    // 👇 Key fix: set chromium graphics and font flags for Vercel
    chromium.setGraphicsMode = false;

    const browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: { width: 1280, height: 720 },
      executablePath: isLocal
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : await chromium.executablePath(),
      headless: isLocal ? false : chromium.headless,
    });

    const page = await browser.newPage();

    // Manual stealth - no extra packages needed
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    );
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      (window as any).chrome = { runtime: {} };
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    const html = await page.content();
    await browser.close();

    if (
      html.includes("cf-turnstile") ||
      html.includes("security verification")
    ) {
      return NextResponse.json(
        { error: "Blocked by bot protection" },
        { status: 403 },
      );
    }

    const $ = cheerio.load(html);
    $(
      "script, style, noscript, iframe, head, nav, footer, .sidebar, .menu",
    ).remove();

    let text = $("body").text();
    text = text
      .replace(/[\t\r\n]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/\\u[0-9a-fA-F]{4}/g, "")
      .trim();

    //due to free version of my api
    // Limit to max 8000 words
    // const words = text.split(" ");
    // if (words.length > 8000) {
    //   text = words.slice(0, 8000).join(" ");
    // }

    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter((link) => link && link.startsWith("http"));

    return NextResponse.json({ scrapedData: { text, links } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
