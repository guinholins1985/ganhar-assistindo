

import { GoogleGenAI } from "@google/genai";
import { Video } from '../types';

export const getRecommendations = async (watchedVideos: Video[]): Promise<string> => {
  try {
    // FIX: Adhering to Gemini API guidelines to use process.env.API_KEY for the API key.
    // This assumes the execution environment is configured to provide this variable.
    if (!process.env.API_KEY) {
      return "A chave de API do Gemini não está configurada no ambiente do aplicativo (API_KEY).";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    if (watchedVideos.length === 0) {
      return "Você ainda não assistiu a nenhum vídeo. Assista a alguns vídeos e eu lhe darei recomendações personalizadas!";
    }

    const watchedTitles = watchedVideos.map(v => v.title).join(', ');

    const prompt = `
      You are a friendly and insightful video recommendation expert for a TikTok-style app.
      Based on the following list of videos a user has watched, please provide 3-5 new and interesting video recommendations.
      The recommendations should be topics or themes, not specific video titles.
      Keep the response concise, engaging, and directly address the user.

      User's watched videos: ${watchedTitles}

      Example response format:
      "Since you enjoyed [Observed Theme], you might also love:
      - [Recommendation 1]
      - [Recommendation 2]
      - [Recommendation 3]
      Happy watching!"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text ?? "Desculpe, não consegui gerar recomendações no momento.";
  } catch (error) {
    console.error("Error fetching recommendations from Gemini API:", error);
    return "Desculpe, não consegui buscar recomendações no momento. Por favor, tente novamente mais tarde.";
  }
};