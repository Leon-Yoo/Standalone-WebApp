import { Keyword, ElasticsearchConfig } from './types';

export class ElasticsearchService {
  private config: ElasticsearchConfig;

  constructor(config: ElasticsearchConfig) {
    this.config = config;
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `ApiKey ${this.config.apiKey}`;
    }

    const response = await fetch(`${this.config.endpoint}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Elasticsearch request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async searchKeywords(query?: string): Promise<Keyword[]> {
    const searchBody = {
      query: query ? {
        multi_match: {
          query,
          fields: ['term', 'category', 'synonyms']
        }
      } : { match_all: {} },
      size: 100,
      sort: [{ updated_at: { order: 'desc' } }]
    };

    try {
      const response = await this.request('POST', `/${this.config.index}/_search`, searchBody);
      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source
      }));
    } catch (error) {
      console.error('Error searching keywords:', error);
      // 로컬 데이터로 폴백 (개발/데모 목적)
      return this.getMockKeywords();
    }
  }

  async createKeyword(keyword: Omit<Keyword, 'id' | 'created_at' | 'updated_at'>): Promise<Keyword> {
    const now = new Date().toISOString();
    const newKeyword = {
      ...keyword,
      created_at: now,
      updated_at: now
    };

    try {
      const response = await this.request('POST', `/${this.config.index}/_doc`, newKeyword);
      return {
        id: response._id,
        ...newKeyword
      };
    } catch (error) {
      console.error('Error creating keyword:', error);
      // 로컬 데이터로 폴백
      const mockKeyword = {
        id: `mock_${Date.now()}`,
        ...newKeyword
      };
      return mockKeyword;
    }
  }

  async updateKeyword(id: string, keyword: Partial<Keyword>): Promise<Keyword> {
    const updateData = {
      ...keyword,
      updated_at: new Date().toISOString()
    };

    try {
      await this.request('POST', `/${this.config.index}/_doc/${id}/_update`, {
        doc: updateData
      });
      
      const response = await this.request('GET', `/${this.config.index}/_doc/${id}`);
      return {
        id: response._id,
        ...response._source
      };
    } catch (error) {
      console.error('Error updating keyword:', error);
      throw error;
    }
  }

  async deleteKeyword(id: string): Promise<void> {
    try {
      await this.request('DELETE', `/${this.config.index}/_doc/${id}`);
    } catch (error) {
      console.error('Error deleting keyword:', error);
      throw error;
    }
  }

  private getMockKeywords(): Keyword[] {
    return [
      {
        id: '1',
        term: 'typescript',
        category: 'programming',
        boost: 1.5,
        synonyms: ['ts', 'javascript with types'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        term: 'elasticsearch',
        category: 'database',
        boost: 2.0,
        synonyms: ['elastic', 'es', 'search engine'],
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        term: 'vite',
        category: 'build-tool',
        boost: 1.2,
        synonyms: ['frontend build tool'],
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      }
    ];
  }
}
