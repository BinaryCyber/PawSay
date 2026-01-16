
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PetType, TranslationResult, PetProfile } from "../types";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePetAudio = async (
  audioBase64: string, 
  petType: PetType, 
  profile?: PetProfile
): Promise<TranslationResult> => {
  const ai = getAiClient();
  
  let profileContext = "";
  if (profile) {
    profileContext = `
      The pet's name is ${profile.name}.
      Species: ${profile.type}.
      Breed: ${profile.breed || 'Unknown'}.
      Age: ${profile.age || 'Unknown'}.
      Personality: ${profile.personality || 'Standard'}.
    `;
  }

  const petVocalization = petType === PetType.CAT ? 'MEOW' : 'WOOF/BARK/WHINE';

  const systemInstruction = `You are a world-class animal behaviorist and acoustic analyst specializing in ${petType} vocalizations. 

CRITICAL REQUIREMENT:
Your first and most important task is to verify if the audio contains a clear and distinct ${petVocalization}. 
You must be extremely strict. 

DO NOT translate if:
1. The audio is mostly silence or low-level background hiss.
2. The audio contains human speech, TV sounds, or music.
3. The sound is an ambiguous thump, wind, or generic room noise.
4. You are unsure if it's an actual ${petType} vocalization.

If any of the above conditions are met, you MUST set "soundDetected" to false.

If, and only if, a clear ${petVocalization} is present:
- Set "soundDetected" to true.
- Identify the primary emotion (e.g., Hungry, Happy, Scared, Angry, Nervous, Playful, Curious, Lonely, Affection-seeking).
- Provide a brief, characterful explanation from the pet's perspective.
- Provide practical care advice for the owner.

${profileContext}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'audio/webm',
            data: audioBase64
          }
        },
        {
          text: `Acoustic Analysis: Is there a clear ${petType} ${petVocalization} in this recording? Respond in JSON.`
        }
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          soundDetected: { 
            type: Type.BOOLEAN, 
            description: "Strictly true ONLY if a clear animal vocalization is heard. False for human speech, noise, or silence." 
          },
          emotion: { type: Type.STRING, description: "The specific emotion detected (null if soundDetected is false)." },
          explanation: { type: Type.STRING, description: "Characterful interpretation (null if soundDetected is false)." },
          advice: { type: Type.STRING, description: "Care advice (null if soundDetected is false)." }
        },
        required: ["soundDetected", "emotion", "explanation", "advice"]
      }
    }
  });

  const result = JSON.parse(response.text) as TranslationResult;
  
  // Only generate an image if a sound was actually detected
  let imageResult = undefined;
  if (result.soundDetected && result.emotion) {
    imageResult = await generatePetImage(petType, result.emotion, profile);
  }
  
  return {
    ...result,
    imageUrl: imageResult
  };
};

const generatePetImage = async (petType: PetType, emotion: string, profile?: PetProfile): Promise<string | undefined> => {
  const ai = getAiClient();
  const detail = profile ? `a ${profile.breed} named ${profile.name}` : `a ${petType}`;
  const prompt = `A very cute, high-quality, 3D animated style illustration of ${detail} looking ${emotion.toLowerCase()}. Vibrant colors, soft lighting, simple background. Body language reflects: ${emotion}.`;

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
    console.error("Image generation failed", error);
    return undefined;
  }
  return undefined;
};
