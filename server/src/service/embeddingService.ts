import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function getGeminiEmbedding(content: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(content);
  return result.embedding.values;
}

export async function embedAndStoreContent(content: string): Promise<number[]> {
  return await getGeminiEmbedding(content);
}
