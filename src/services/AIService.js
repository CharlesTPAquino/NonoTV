/**
 * NonoTV AI Hub - Powered by Google AI PRO & Video Stitcher
 * Gerencia a inteligência generativa e integração com Google Stitcher.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY || "";
const STITCHER_PROJECT_ID = "3722493286327444324"; 
const STITCHER_LOCATION = "us-central1"; 

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const aiService = {
  /**
   * AI Stitcher: Cria uma sessão de vídeo 'costurada' via Google Video Stitcher
   */
  async getStitchedManifest(originalUrl, channelData = {}) {
    console.log(`[AI-Stitcher] Preparando sessão para projeto: ${STITCHER_PROJECT_ID}`);
    try {
      if (!API_KEY) return originalUrl;
      // Futura chamada real para Video Stitcher API
      return originalUrl; 
    } catch (err) {
      return originalUrl;
    }
  },

  /**
   * AI EPG: Gera descrição para conteúdos sem guia de programação (EPG)
   * Usa Gemini 1.5 Flash para análise contextual.
   */
  async enrichMetadata(channelName, groupName = "") {
    if (!genAI) return "Sintonize agora no melhor conteúdo do NonoTV Elite 4K.";
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Você é um especialista em TV e Cinema. Sua tarefa é escrever descrições curtas (máximo 150 caracteres) e impactantes para canais de TV ou Filmes de IPTV. Use um tom empolgante e profissional."
      });

      const prompt = `Gere uma descrição atraente para o canal/filme: "${channelName}" que pertence à categoria "${groupName}". Não use aspas.`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      return text || "Aproveite a melhor transmissão em Ultra HD.";
    } catch (err) {
      console.warn("[AI-Hub] Falha ao enriquecer metadados.");
      return "Conteúdo Premium NonoTV Elite 4K.";
    }
  },

  /**
   * AI Predição de Performance
   */
  async predictOptimization(deviceData) {
    if (!genAI) return null;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Sugira buffer (s), bitrate (bps) e threads (1-4) para este hardware: ${JSON.stringify(deviceData)}. Responda apenas o JSON.`;
      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (err) {
      return null;
    }
  }
};

export default aiService;
