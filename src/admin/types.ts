export interface Keyword {
  id: string;
  term: string;
  category: string;
  boost?: number;
  synonyms?: string[];
  created_at: string;
  updated_at: string;
}

export interface ElasticsearchConfig {
  endpoint: string;
  index: string;
  apiKey?: string;
}
