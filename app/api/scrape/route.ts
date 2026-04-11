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

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath: isLocal
        ? process.platform === "win32"
          ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
          : process.platform === "darwin"
            ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            : "/usr/bin/google-chrome"
        : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    // Pretend to be a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("body");

    const html = await page.content();
    await browser.close();

    if (html.includes("security verification")) {
      return NextResponse.json(
        { error: "Blocked by Cloudflare bot protection" },
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
      .trim();

    //due to free version of my api
    // Limit to max 8000 words
    const words = text.split(" ");
    if (words.length > 8000) {
      text = words.slice(0, 8000).join(" ");
    }

    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter((link) => link && link.startsWith("http"));

    return NextResponse.json({ scrapedData: { text, links } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
