import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.close();
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

    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter((link) => link && link.startsWith("http"));

    return NextResponse.json({ scrapedData: { text, links } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
//scrape
