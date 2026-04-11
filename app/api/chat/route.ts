// import { model } from "@/lib/gemini";
// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   const { message, websiteContent } = req.body;

//   try {
//     const prompt = `
//       You are a chatbot for the website.
//       Use the following website content to answer questions in a curated way:
//       ${websiteContent}

//       User: ${message}
//     `;

//     const result = await model.generateContent(prompt);
//     const response = result.response.text();

//     res.status(200).json({ reply: response });
//   } catch (error) {
//     res.status(500).json({ error: "Something went wrong" });
//   }
// }

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { NextResponse } from "next/server";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// export async function POST(req: Request) {
//   const { message, url } = await req.json();

//   const content = await fetch(url);
//   const websiteContent = await content.text(); // extracted readable text

//   // Fetch website HTML
//   // const siteRes = await fetch(url);
//   // const html = await siteRes.text();

//   // Extract text (basic approach: strip tags)
//   // const websiteContent = html.replace(/<[^>]*>?/gm, " ");
//   console.log("Extracted website content:", websiteContent);

//   const prompt = `
//     You are a chatbot named DocBilli for the website.
//     Use the following website content to answer questions in a curated way:
//     ${websiteContent}
//     User: ${message}
//     `;

//   try {
//     const result = await model.generateContent(prompt);
//     const reply = result.response.text();
//     return NextResponse.json({ reply });
//   } catch (error) {
//     return NextResponse.json({ error: "AI request failed" }, { status: 500 });
//   }
// }
// function fetch_web_content(arg0: { url: any }) {
//   throw new Error("Function not implemented.");
// }

import fs from "fs";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import path from "path";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
// export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  try {
    const { message, websiteContent, history } = await req.json();
    // 1. Basic validation to prevent empty calls
    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 },
      );
    }

    // Build prompt with clear instructions and structured content
    // give the answers in very fun way so the user will be happy to talk with you and use emojis in your answers if wanted.
    const prompt = `
      You are a chatbot named Zephyrus for the website.
      Give very concise and accurate answers based on the provided website content.
      make the convo very interacting.
      do not tell the user that you are an AI model.
      do not mention that you are using the website content to answer the question.
      if you don't know the answer, ask them to visit the website and thanks them in a beautiful way that they took time to talk with you or if they have any query they can email or call.
      Use the following structured website content to answer questions in a curated way:
      ${JSON.stringify(websiteContent)}
      User: ${message}
    `;

    //for Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Groq model name
      messages: [
        { role: "system", content: prompt },
        ...(history || []), // Include conversation history if available
        { role: "user", content: message },
      ],
    });
    const reply = response.choices[0]?.message?.content ?? "";

    //for gemini
    // const result = await model.generateContent(prompt);
    // const reply = result.response.text();

    return NextResponse.json({ reply, scraped: websiteContent });
  } catch (error: any) {
    // 2. Log the full error to your terminal for debugging
    console.error("Ai API Error:", error);

    // 3. Extract specific status codes (like 429 for quota) if available
    const statusCode = error.status || 500;

    // 4. Return the specific error message from the Gemini SDK
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
        details: error.stack?.split("\n")[0], // Optional: gives a bit more context
      },
      { status: statusCode },
    );
  }
}

const dbPath = path.join(process.cwd(), "db.json");

export async function DELETE() {
  try {
    const raw = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(raw);

    // Clear chats and optionally Website data
    db.chats = [];
    db.Website.scrapedData = "";

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true, message: "All chats deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
