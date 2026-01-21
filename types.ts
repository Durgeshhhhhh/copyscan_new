
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'user';
  photoFileName?: string;
  password?: string; // Added to store plain-text password for admin oversight
}

export interface UserDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  ownerId?: string; 
  ownerEmail?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDocs: number;
  activeLast24h: number;
}

export interface UserWithStats extends UserProfile {
  docCount: number;
  joinedAt: string;
}

export interface PlagiarismResult {
  score: number;
  summary: string;
  highlightedHtml?: string;
  sources: {
    title: string;
    url: string;
    score: number;
    isPrivate?: boolean;
  }[];
}

export interface ScanHistoryRecord {
  id: string;
  userId: string;
  userEmail?: string;
  text: string;
  result: PlagiarismResult;
  createdAt: string;
  checkVaultOnly: boolean;
}

export interface ComparisonResult {
  score: number;
  summary: string;
  highlightedTextA: string;
  highlightedTextB: string;
}

export enum AuthMode {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}

export type AppView = 'HOME' | 'SCANNER' | 'COMPARISON' | 'VAULT' | 'HISTORY' | 'PROFILE' | 'ADMIN';
