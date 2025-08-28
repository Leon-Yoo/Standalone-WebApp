import { Keyword, GoogleSheetsConfig } from './types';

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const url = `${this.baseUrl}/${this.config.spreadsheetId}${path}?key=${this.config.apiKey}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Google Sheets API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private rowToKeyword(row: string[], rowIndex: number): Keyword {
    return {
      id: row[0] || `row_${rowIndex}`,
      term: row[1] || '',
      category: row[2] || '',
      boost: row[3] ? parseFloat(row[3]) : undefined,
      synonyms: row[4] ? row[4].split(',').map(s => s.trim()).filter(s => s) : undefined,
      created_at: row[5] || new Date().toISOString(),
      updated_at: row[6] || new Date().toISOString()
    };
  }

  private keywordToRow(keyword: Keyword): string[] {
    return [
      keyword.id,
      keyword.term,
      keyword.category,
      keyword.boost?.toString() || '',
      keyword.synonyms?.join(', ') || '',
      keyword.created_at,
      keyword.updated_at
    ];
  }

  async searchKeywords(query?: string): Promise<Keyword[]> {
    try {
      const range = `${this.config.sheetName}!A:G`;
      const response = await this.request('GET', `/values/${range}`);
      
      if (!response.values || response.values.length <= 1) {
        return this.getMockKeywords();
      }

      // 첫 번째 행은 헤더이므로 제외
      const dataRows = response.values.slice(1);
      let keywords = dataRows.map((row: string[], index: number) => 
        this.rowToKeyword(row, index + 2)
      );

      // 쿼리가 있으면 필터링
      if (query) {
        const searchTerm = query.toLowerCase();
        keywords = keywords.filter((keyword: Keyword) => 
          keyword.term.toLowerCase().includes(searchTerm) ||
          keyword.category.toLowerCase().includes(searchTerm) ||
          (keyword.synonyms && keyword.synonyms.some((s: string) => s.toLowerCase().includes(searchTerm)))
        );
      }

      return keywords;
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      return this.getMockKeywords();
    }
  }

  async createKeyword(keyword: Omit<Keyword, 'id' | 'created_at' | 'updated_at'>): Promise<Keyword> {
    const now = new Date().toISOString();
    const newKeyword: Keyword = {
      ...keyword,
      id: `kw_${Date.now()}`,
      created_at: now,
      updated_at: now
    };

    try {
      // 새 행을 시트에 추가
      const range = `${this.config.sheetName}!A:G`;
      const values = [this.keywordToRow(newKeyword)];
      
      await this.request('POST', `/values/${range}:append?valueInputOption=USER_ENTERED`, {
        values
      });

      return newKeyword;
    } catch (error) {
      console.error('Error creating keyword in Google Sheets:', error);
      // 로컬에서만 반환 (실제 시트에는 저장되지 않음)
      return newKeyword;
    }
  }

  async updateKeyword(id: string, updateData: Partial<Keyword>): Promise<Keyword> {
    try {
      // 먼저 모든 데이터를 가져와서 해당 ID의 행을 찾음
      const range = `${this.config.sheetName}!A:G`;
      const response = await this.request('GET', `/values/${range}`);
      
      if (!response.values || response.values.length <= 1) {
        throw new Error('No data found');
      }

      const dataRows = response.values.slice(1);
      const rowIndex = dataRows.findIndex((row: string[]) => row[0] === id);
      
      if (rowIndex === -1) {
        throw new Error('Keyword not found');
      }

      const currentKeyword = this.rowToKeyword(dataRows[rowIndex], rowIndex + 2);
      const updatedKeyword: Keyword = {
        ...currentKeyword,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      // 해당 행 업데이트 (A2부터 시작하므로 +2)
      const updateRange = `${this.config.sheetName}!A${rowIndex + 2}:G${rowIndex + 2}`;
      await this.request('PUT', `/values/${updateRange}?valueInputOption=USER_ENTERED`, {
        values: [this.keywordToRow(updatedKeyword)]
      });

      return updatedKeyword;
    } catch (error) {
      console.error('Error updating keyword in Google Sheets:', error);
      throw error;
    }
  }

  async deleteKeyword(id: string): Promise<void> {
    try {
      // Google Sheets API로 행 삭제는 복잡하므로, 
      // 대신 해당 행의 모든 셀을 비우는 방식을 사용
      const range = `${this.config.sheetName}!A:G`;
      const response = await this.request('GET', `/values/${range}`);
      
      if (!response.values || response.values.length <= 1) {
        throw new Error('No data found');
      }

      const dataRows = response.values.slice(1);
      const rowIndex = dataRows.findIndex((row: string[]) => row[0] === id);
      
      if (rowIndex === -1) {
        throw new Error('Keyword not found');
      }

      // 해당 행의 모든 셀을 비움
      const clearRange = `${this.config.sheetName}!A${rowIndex + 2}:G${rowIndex + 2}`;
      await this.request('PUT', `/values/${clearRange}?valueInputOption=USER_ENTERED`, {
        values: [['', '', '', '', '', '', '']]
      });

    } catch (error) {
      console.error('Error deleting keyword from Google Sheets:', error);
      throw error;
    }
  }

  async initializeSheet(): Promise<void> {
    try {
      // 헤더가 있는지 확인하고 없으면 추가
      const range = `${this.config.sheetName}!A1:G1`;
      const response = await this.request('GET', `/values/${range}`);
      
      if (!response.values || response.values.length === 0) {
        const headers = ['ID', 'Term', 'Category', 'Boost', 'Synonyms', 'Created At', 'Updated At'];
        await this.request('PUT', `/values/${range}?valueInputOption=USER_ENTERED`, {
          values: [headers]
        });
      }
    } catch (error) {
      console.error('Error initializing Google Sheets:', error);
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
        term: 'google sheets',
        category: 'database',
        boost: 2.0,
        synonyms: ['sheets', 'spreadsheet', 'google drive'],
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

  // 설정 테스트용 메서드
  async testConnection(): Promise<boolean> {
    try {
      const range = `${this.config.sheetName}!A1:A1`;
      await this.request('GET', `/values/${range}`);
      return true;
    } catch (error) {
      console.error('Google Sheets connection test failed:', error);
      return false;
    }
  }
}
