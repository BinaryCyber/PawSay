
export enum PetType {
  CAT = 'cat',
  DOG = 'dog'
}

export interface PetProfile {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: string;
  personality: string;
}

export interface TranslationResult {
  soundDetected: boolean;
  emotion: string;
  explanation: string;
  advice: string;
  imageUrl?: string;
}

export enum AppState {
  IDLE = 'idle',
  RECORDING = 'recording',
  ANALYZING = 'analyzing',
  RESULT = 'result',
  ERROR = 'error'
}
