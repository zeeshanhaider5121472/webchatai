import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // adjust path if needed
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Get full rendered HTML
    const html = await page.content();
    await browser.close();

    // Extract structured data
    const $ = cheerio.load(html);
    // 1. Remove elements that don't contain "human-readable" content
    $(
      "script, style, noscript, iframe, head, nav, footer, .sidebar, .menu",
    ).remove();
    // 2. Get the text from the remaining body
    let text = $("body").text();
    // 3. Clean up the text using Regular Expressions
    text = text
      .replace(/[\t\r\n]+/g, " ") // Replace tabs, newlines, and carriage returns with a single space
      .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
      .replace(/\\u[0-9a-fA-F]{4}/g, "") // Remove unicode escape sequences like \u003C
      .trim(); // Final trim for start/end spaces

    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter((link) => link && link.startsWith("http")); // Filter for actual URLs
    //     const images = $("img")
    // .map((_, el) => $(el).attr("src"))
    // .get()
    // .filter(Boolean);

    const websiteContent = { text, links };
    return NextResponse.json({ scrapedData: websiteContent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//   const { searchParams } = new URL(req.url);
//   const url = searchParams.get("url");

//   if (!url) {
//     return NextResponse.json({ error: "URL is required" }, { status: 400 });
//   }

//   try {
//     const browser = await puppeteer.launch({
//       headless: true, // use true instead of "new"
//       executablePath:
//         "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // adjust if using Edge
//     });

//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "networkidle2" });

//     const html = await page.content();
//     await browser.close();

//     const $ = cheerio.load(html);
//     const bodyContent = $("body").text().trim();

//     return NextResponse.json({ data: bodyContent });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
