
import { GoogleGenAI } from "@google/genai";
import { Project, ActivityLog } from "../types";

// Always initialize GoogleGenAI using the process.env.API_KEY directly as a named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIBriefing = async (projects: Project[], logs: ActivityLog[]) => {
  const prompt = `
    你現在是「成鼎電工」的戰略室 AI 顧問。
    請根據以下目前的專案狀態與日誌提供簡短的「指揮官簡報」。
    
    專案狀況: ${JSON.stringify(projects)}
    近期動態: ${JSON.stringify(logs.slice(0, 5))}
    
    請提供 3 點具備行動導向的建議，語氣要專業、嚴謹且有工程效率感。使用正體中文。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { maxOutputTokens: 300 }
    });
    // Use .text property directly (not a method call)
    return response.text || "目前戰報系統連線不穩定。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "情報連線中斷，請手動監看面板。";
  }
};

export const getDailySummary = async (logs: ActivityLog[]) => {
  const prompt = `
    你現在是「成鼎電工」的資深會計兼管理秘書。
    請根據今日的施工日誌：
    ${JSON.stringify(logs)}
    
    為老闆生成一份「今日施工成果摘要」：
    1. 哪些專案有進展？
    2. 是否有緊急缺料或人力短缺？
    3. 明日重點關注事項。
    
    字數控制在 200 字以內，使用專業簡潔的正體中文。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { maxOutputTokens: 500 }
    });
    // Use .text property directly (not a method call)
    return response.text || "尚無足夠數據生成摘要。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "無法生成摘要。";
  }
};
