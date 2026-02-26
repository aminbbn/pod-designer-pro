import { GoogleGenAI, Type } from "@google/genai";
import { DesignConcept } from "../types";

export async function generateDesignConcepts(prompt: string, productName?: string): Promise<DesignConcept[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `طراحی لباس (${productName || 'تی‌شرت'}) برای این ایده: "${prompt}"
      لطفاً 3 کانسپت طراحی مختلف پیشنهاد بده. هر کانسپت شامل لایه‌های متن و تصویر باشد.
      برای تصاویر، کلمات کلیدی جستجو (query) باید بسیار ساده، کوتاه و فقط شامل ۱ یا حداکثر ۲ کلمه انگلیسی باشند (مثل "cat", "vintage car", "skull"). از جملات یا عبارات پیچیده استفاده نکنید زیرا در جستجوی تصویر نتیجه‌ای نخواهند داشت.
      
      You MUST return ONLY a valid JSON object with this exact structure, and NO OTHER TEXT OR MARKDOWN FORMATTING:
      {
        "concepts": [
          {
            "title": "string",
            "description": "string",
            "elements": [
              {
                "type": "text" | "image",
                "yOffset": number,
                "content": "string (if text)",
                "fontFamily": "string (if text)",
                "fill": "string (if text)",
                "fontSize": number (if text),
                "fontWeight": "string (if text)",
                "query": "string (if image, 1-2 words max, English only, e.g. 'tiger' or 'red rose')"
              }
            ]
          }
        ]
      }`
        }]
      }]
    });

    let text = response.text;
    if (!text) return [];
    
    // Clean up markdown formatting if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    return parsed.concepts || [];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
