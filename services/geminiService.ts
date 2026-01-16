
import { GoogleGenAI, Type } from "@google/genai";
import { PetType, TranslationResult, PetProfile } from "../types";
import { sanitizeForPrompt } from "../utils/security";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePetAudio = async (
  audioBase64: string, 
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

  const systemInstruction = `You are a world-class animal behaviorist and professional acoustic forensic analyst. 
Your specialty is distinguishing animal vocalizations from human speech and ambient noise.

STEP 1: ACOUSTIC AUDIT
Analyze the audio for specific signatures:
- "pet_vocalization": Distinct ${petType} sounds (${petVocalization}). Look for characteristic pitch patterns and duration.
- "human_speech": Human voices, talking, whispering, or singing. 
- "background_noise": TV sounds, wind, thumps, traffic, or generic room hiss.
- "silence": No significant audio signal above noise floor.

STEP 2: CLASSIFICATION
You must categorize the dominant sound. If human speech is audible or prominent, classify as "human_speech" and do NOT translate.

STEP 3: TRANSLATION (Only if soundDetected is true)
- Identify the primary emotion (Hungry, Happy, Scared, Angry, Nervous, Playful, Curious, Lonely, Affection-seeking).
- Provide a characterful translation from the pet's perspective.
- Provide practical care advice.

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
          text: `Perform a detailed acoustic audit of this recording for ${petType} vocalizations vs noise/human speech. Respond in JSON.`
        }
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedSoundType: { 
            type: Type.STRING, 
            description: "Must be exactly one of: pet_vocalization, human_speech, background_noise, silence." 
          },
          soundDetected: { 
            type: Type.BOOLEAN, 
            description: "Strictly true ONLY if detectedSoundType is 'pet_vocalization'." 
          },
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
      traitDescription = `This pet has a ${safeTrait.toLowerCase()} personality which shows in its expression.`;
    }
  }

  const prompt = `A high-quality, adorable, 3D animated style illustration of ${petDescription} expressing the emotion: ${emotion.toUpperCase()}. 
  The pet is at the center of the frame. ${traitDescription}
  Vibrant, soft pastel colors, professional studio lighting, and a clean simple background. 
  Extremely expressive eyes and detailed fur texture. 
  The image perfectly captures a pet that feels ${emotion.toLowerCase()}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "1:1" 
        } 
      }
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
