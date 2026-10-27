import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Checking Gemini API key prefix:", apiKey?.substring(0, 8));
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log("List Models Response Status:", res.status);
    console.log("List Models Response:", JSON.stringify(data, null, 2).substring(0, 500));
  } catch (err: any) {
    console.error("List models fetch error:", err.message);
  }
}

listModels();
