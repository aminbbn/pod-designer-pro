import { GoogleGenAI, Type } from "@google/genai";
import { DesignConcept } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateDesignConcepts(prompt: string, productName?: string): Promise<DesignConcept[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `طراحی لباس (${productName || 'تی‌شرت'}) برای این ایده: "${prompt}"
      لطفاً 3 کانسپت طراحی مختلف پیشنهاد بده. هر کانسپت شامل لایه‌های متن و تصویر باشد.
      تصاویر باید با کلمات کلیدی انگلیسی برای جستجو در Pixabay مشخص شوند.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              elements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["text", "image"] },
                    yOffset: { type: Type.NUMBER },
                    content: { type: Type.STRING },
                    fontFamily: { type: Type.STRING },
                    fill: { type: Type.STRING },
                    fontSize: { type: Type.NUMBER },
                    fontWeight: { type: Type.STRING },
                    query: { type: Type.STRING }
                  },
                  required: ["type", "yOffset"]
                }
              }
            },
            required: ["title", "description", "elements"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
