export const runtime = "nodejs";
export const maxDuration = 60;

import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    console.log("[scrape] Fetching via ScrapingBee:", url);

    const params = new URLSearchParams({
      api_key: process.env.SCRAPINGBEE_API_KEY!,
      url: url,
      render_js: "true", // ← change this
      block_ads: "true",
      block_resources: "true",
      wait: "2000", // wait 2s for JS to load
    });

    const response = await fetch(
      `https://app.scrapingbee.com/api/v1/?${params.toString()}`,
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[scrape] ScrapingBee error:", response.status, errText);
      throw new Error(`ScrapingBee returned ${response.status}: ${errText}`);
    }

    const html = await response.text();
    console.log("[scrape] Got HTML, length:", html.length);

    const $ = cheerio.load(html);

    // Remove only truly useless elements
    $("script, style, noscript, iframe").remove();

    // Try to get main content first, fall back to full body
    const mainSelectors = [
      "main",
      "article",
      "[role='main']",
      "#content",
      "#main",
      ".content",
      "body",
    ];
    let text = "";

    for (const selector of mainSelectors) {
      const el = $(selector);
      if (el.length) {
        text = el
          .text()
          .replace(/[\t\r\n]+/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
        if (text.length > 100) break; // found something useful
      }
    }

    console.log("[scrape] Extracted text length:", text.length);

    //due to free version of my api
    // Limit to max 8000 words
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
