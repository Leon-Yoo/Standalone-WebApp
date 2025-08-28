export interface Keyword {
  id: string;
  term: string;
  category: string;
  boost?: number;
  synonyms?: string[];
  created_at: string;
  updated_at: string;
}

export interface GoogleSheetsConfig {
  apiKey: string;
  clientId: string;
  spreadsheetId: string;
  sheetName: string;
}

export interface GoogleSheetsRow {
  id: string;
  term: string;
  category: string;
  boost: string;
  synonyms: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  isSignedIn: boolean;
  accessToken?: string;
  user?: {
    name: string;
    email: string;
    picture: string;
  };
}

// 새로운 타입 정의 - 패션 검색 시스템용

export type KeywordType = 'brand' | 'category' | 'product' | 'color' | 'material' | 'style' | 'occasion' | 'season' | 'custom';

export interface SynonymEntry {
  id: string;
  type: KeywordType;
  mainKeyword: string;        // 대표 키워드
  synonyms: string[];         // 동의어 목록
  description?: string;       // 설명
  created_at: string;
  updated_at: string;
}

export interface MorphemeEntry {
  id: string;
  type: KeywordType;
  keyword: string;            // 키워드
  label: string;             // 레이블 (예: BRAND_NAME, CATEGORY_NAME 등)
  weight?: number;           // 가중치
  created_at: string;
  updated_at: string;
}

export interface DictionaryStats {
  synonyms: {
    total: number;
    byType: Record<KeywordType, number>;
  };
  morphemes: {
    total: number;
    byType: Record<KeywordType, number>;
  };
}
