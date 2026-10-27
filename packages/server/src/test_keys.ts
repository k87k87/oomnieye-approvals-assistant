import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function testOpenAI() {
  console.log("--- Testing OpenAI Key ---");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("No OpenAI key found.");
    return;
  }
  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: "Say hello in 5 words" }],
      max_tokens: 30,
    });
    console.log("OpenAI Response:", completion.choices[0]?.message?.content);
  } catch (err: any) {
    console.error("OpenAI Error:", err.message);
  }
}

async function testGemini() {
  console.log("\n--- Testing Gemini Key ---");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No Gemini key found.");
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello in 5 words");
    console.log("Gemini Response:", result.response.text());
  } catch (err: any) {
    console.error("Gemini Error:", err.message);
  }
}

async function main() {
  await testOpenAI();
  await testGemini();
}

main();
