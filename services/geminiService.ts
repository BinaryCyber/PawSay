
import { GoogleGenAI, Type } from "@google/genai";
import { PetType, TranslationResult, PetProfile } from "../types";
import { sanitizeForPrompt } from "../utils/security";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePetAudio = async (
  audioBase64: string, 
  mimeType: string,
  petType: PetType, 
  profile?: PetProfile
): Promise<TranslationResult> => {
  const ai = getAiClient();
  
  let profileContext = "";
  if (profile) {
    const safeName = sanitizeForPrompt(profile.name);
    const safeBreed = sanitizeForPrompt(profile.breed || 'Unknown');
    const safePersonality = sanitizeForPrompt(profile.personality || 'Standard', 100);

    profileContext = `
      The pet's name is ${safeName}.
      Species: ${profile.type}.
      Breed: ${safeBreed}.
      Age: ${sanitizeForPrompt(profile.age || 'Unknown', 20)}.
      Personality: ${safePersonality}.
    `;
  }

  const petVocalization = petType === PetType.CAT ? 'MEOW/PURR/HISS' : 'WOOF/BARK/WHINE/GROWL';

  const systemInstruction = `You are a world-class animal behaviorist and acoustic analyst.
Analyze the provided audio for ${petType} sounds.

AUDIT TASKS:
1. Determine if the sound is primarily a ${petType} vocalization (${petVocalization}).
2. Filter out human speech or background noise. If human talking is the main feature, mark soundDetected as false.
3. If a ${petType} is heard, identify the emotion and provide a fun translation.

JSON STRUCTURE:
{
  "detectedSoundType": "pet_vocalization" | "human_speech" | "background_noise" | "silence",
  "soundDetected": boolean,
  "emotion": string | null,
  "explanation": "Human-friendly translation of what the pet is saying",
  "advice": "Care advice for the owner"
}

${profileContext}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          {
            text: `Analyze this audio for ${petType} sounds and return the results in JSON format.`
          }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSoundType: { type: Type.STRING },
            soundDetected: { type: Type.BOOLEAN },
            emotion: { type: Type.STRING, nullable: true },
            explanation: { type: Type.STRING, nullable: true },
            advice: { type: Type.STRING, nullable: true }
          },
          required: ["detectedSoundType", "soundDetected", "emotion", "explanation", "advice"]
        }
      }
    });

    const result = JSON.parse(response.text) as TranslationResult;
    
    let imageResult = undefined;
    if (result.soundDetected && result.emotion) {
      imageResult = await generatePetImage(petType, result.emotion, profile);
    }
    
    return {
      ...result,
      imageUrl: imageResult
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const generatePetImage = async (petType: PetType, emotion: string, profile?: PetProfile): Promise<string | undefined> => {
  const ai = getAiClient();
  
  let petDescription = `a ${petType}`;
  let traitDescription = "";
  
  if (profile) {
    const safeBreed = sanitizeForPrompt(profile.breed && profile.breed !== "Other" ? profile.breed : petType);
    petDescription = `a ${safeBreed} ${petType}`;
    if (profile.personality) {
      const safeTrait = sanitizeForPrompt(profile.personality, 80);
      traitDescription = `This pet has a ${safeTrait.toLowerCase()} personality.`;
    }
  }

  const prompt = `A cute 3D animation style illustration of ${petDescription} expressing ${emotion}. Soft lighting, clean background.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
    return undefined;
  }
  return undefined;
};
