import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("hi");
    console.log(`Success with ${modelName}:`, result.response.text());
    return true;
  } catch (err) {
    console.error(`Error with ${modelName}:`, err.message);
    return false;
  }
}

testModel("gemini-2.5-pro");
