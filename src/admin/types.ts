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
