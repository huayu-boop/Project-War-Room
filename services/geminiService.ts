
import { GoogleGenAI } from "@google/genai";
import { Project, ActivityLog } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY 遺失。");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const getAIBriefing = async (projects: Project[], logs: ActivityLog[]) => {
  const ai = getAiClient();
  const prompt = `
    角色：成鼎電工戰略室 AI 指揮顧問 (Tactical AI Advisor)。
    任務：分析目前的工程部署動態並提供 3 點極具行動力、簡明扼要的「戰略指令」。
    
    當前部署數據: ${JSON.stringify(projects)}
    近期作戰紀錄: ${JSON.stringify(logs.slice(0, 5))}
    
    語氣要求：極度專業、軍事化、充滿工程效率、不廢話。使用正體中文。
    每點不超過 30 字。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        maxOutputTokens: 250,
        temperature: 0.5 
      }
    });
    return response.text || "正在連線情報節點...";
  } catch (error) {
    return "情報連線異常。";
  }
};

export const getDailySummary = async (logs: ActivityLog[]) => {
  const ai = getAiClient();
  const prompt = `
    角色：戰略室參謀長。
    任務：彙整今日施工日誌，生成一份高層專用的「戰果摘要」。
    
    原始數據: ${JSON.stringify(logs)}
    
    摘要結構：
    1. 戰術推進：列出有顯著進度的專案。
    2. 威脅評估：指出缺料或人力短缺。
    3. 下階段指令：明早核心任務。
    
    限制：總字數 150 字內，使用專業精鍊的正體中文。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        maxOutputTokens: 400,
        temperature: 0.4 
      }
    });
    return response.text || "尚未收到完整數據。";
  } catch (error) {
    return "報告產出失敗。";
  }
};
