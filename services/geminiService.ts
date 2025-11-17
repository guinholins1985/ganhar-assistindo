import { GoogleGenAI } from "@google/genai";
import { Video } from '../types';

export const getRecommendations = async (watchedVideos: Video[]): Promise<string> => {
  try {
    // FIX: Initialize GoogleGenAI with API_KEY from process.env directly as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    if (watchedVideos.length === 0) {
      return "You haven't watched any videos yet. Watch some videos and I'll give you personalized recommendations!";
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

    return response.text;
  } catch (error) {
    console.error("Error fetching recommendations from Gemini API:", error);
    return "Sorry, I couldn't fetch recommendations at the moment. Please try again later.";
  }
};
