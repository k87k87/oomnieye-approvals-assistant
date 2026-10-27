import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function testGemini25() {
  console.log("Testing Gemini 2.5 Flash with user key...");
  const apiKey = process.env.GEMINI_API_KEY!;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Give a 1-sentence greeting for an operator of OomniEye Digital Twin.");
    console.log("\n>>> Gemini 2.5 Flash Success Response <<<");
    console.log(result.response.text());
  } catch (err: any) {
    console.error("Gemini Error:", err.message);
  }
}

testGemini25();
