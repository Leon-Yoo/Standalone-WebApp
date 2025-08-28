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
