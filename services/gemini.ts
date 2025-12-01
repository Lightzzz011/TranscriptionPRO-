import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || 'dummy-key-for-demo'; 
const ai = new GoogleGenAI({ apiKey });

// In this simplified version, we primarily use the simulated fetch for the transcript.
// However, we can keep this service to "clean up" raw messy transcripts if needed in the future.
export const cleanupTranscript = async (text: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Format the following transcript text to be more readable. 
      Add paragraph breaks where natural. Fix capitalization.
      Do NOT summarize. Return the full text formatted.

      Transcript:
      ${text.substring(0, 10000)}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const resultText = response.text;
    return resultText || text;

  } catch (error) {
    console.error("Gemini Error:", error);
    return text;
  }
};