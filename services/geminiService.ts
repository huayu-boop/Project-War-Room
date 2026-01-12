
import { GoogleGenAI } from "@google/genai";
import { Project, ActivityLog } from "../types";

// 初始化 Gemini API，API_KEY 會由 Vercel 的 Environment Variables 注入
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key 尚未設定，請在 Vercel 環境變數中配置 API_KEY。");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const getAIBriefing = async (projects: Project[], logs: ActivityLog[]) => {
  const ai = getAiClient();
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
      config: { 
        maxOutputTokens: 300,
        temperature: 0.7 
      }
    });
    return response.text || "目前戰報系統分析中...";
  } catch (error) {
    console.error("Gemini Briefing Error:", error);
    return "情報連線暫時中斷，請確認 API Key 配置或稍後再試。";
  }
};

export const getDailySummary = async (logs: ActivityLog[]) => {
  const ai = getAiClient();
  const prompt = `
    你現在是「成鼎電工」的資深管理秘書。
    請根據今日的施工日誌：
    ${JSON.stringify(logs)}
    
    為管理層生成一份「今日施工成果摘要」：
    1. 哪些專案有具體進展？
    2. 是否有緊急缺料或待處理的人力短缺？
    3. 明日重點關注事項。
    
    字數控制在 200 字以內，使用專業簡潔的正體中文。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        maxOutputTokens: 500,
        temperature: 0.7 
      }
    });
    return response.text || "尚無足夠數據生成摘要。";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "無法生成摘要，請檢查日誌數據完整性。";
  }
};
