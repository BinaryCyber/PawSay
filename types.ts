
export enum PetType {
  CAT = 'cat',
  DOG = 'dog'
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  isSubscribed?: boolean;
  isAdmin?: boolean;
  isDeactivated?: boolean;
  warnings?: number;
}

export interface PetProfile {
  id: string;
  ownerId: string;
  name: string;
  type: PetType;
  breed: string;
  age: string;
  personality: string;
  imageUrl?: string;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  imageUrl?: string;
  timestamp: number;
  likes: string[]; // Array of user IDs
  reports: string[]; // Array of reporter user IDs
  comments: CommunityComment[];
}

export interface ReportedPost {
  id: string;
  postId: string;
  reporterId: string;
  timestamp: number;
  reason: string;
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

export enum ViewMode {
  TRANSLATOR = 'translator',
  COMMUNITY = 'community',
  ADMIN = 'admin'
}
