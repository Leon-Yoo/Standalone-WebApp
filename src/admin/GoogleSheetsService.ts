import { Keyword, GoogleSheetsConfig } from './types';
import { GoogleAuthService } from './GoogleAuthService';

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private authService: GoogleAuthService;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
    this.authService = new GoogleAuthService();
  }

  async initialize(): Promise<void> {
    await this.authService.initialize(this.config.apiKey, this.config.clientId);
  }

  getAuthService(): GoogleAuthService {
    return this.authService;
  }

  getConfig(): GoogleSheetsConfig {
    return { ...this.config }; // 복사본 반환하여 외부에서 수정 방지
  }

  getApiKey(): string {
    return this.config.apiKey;
  }

  getClientId(): string {
    return this.config.clientId;
  }

  private async request(method: string, path: string, body?: any, requireAuth: boolean = false): Promise<any> {
    const url = `${this.baseUrl}/${this.config.spreadsheetId}${path}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 인증이 필요한 경우 Access Token 사용, 아니면 API Key 사용
    if (requireAuth) {
      const accessToken = this.authService.getAccessToken();
      if (!accessToken) {
        throw new Error('Authentication required. Please sign in to Google.');
      }
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      // 읽기 전용 작업은 API Key 사용
      const urlWithKey = `${url}?key=${this.config.apiKey}`;
      return this.makeRequest(urlWithKey, method, headers, body);
    }

    return this.makeRequest(url, method, headers, body);
  }

  private async makeRequest(url: string, method: string, headers: HeadersInit, body?: any): Promise<any> {
    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      const errorCode = errorData.error?.code || response.status;
      
      console.error('Google Sheets API Error:', {
        code: errorCode,
        message: errorMessage,
        status: errorData.error?.status,
        url: url.includes('key=') ? url.replace(/key=[\w-]+/, 'key=[API_KEY_HIDDEN]') : url
      });
      
      if (errorCode === 401 || errorCode === 403) {
        throw new Error(`Authentication required (${errorCode}): ${errorMessage}`);
      }
      
      throw new Error(`Google Sheets API request failed (${errorCode}): ${errorMessage}`);
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
      const response = await this.request('GET', `/values/${range}`, undefined, false); // 읽기는 인증 불필요
      
      if (!response.values || response.values.length <= 1) {
        return []; // 빈 배열 반환
      }

      // 첫 번째 행은 헤더이므로 제외
      const dataRows = response.values.slice(1);
      let keywords = dataRows.map((row: string[], index: number) => 
        this.rowToKeyword(row, index + 2)
      );

      // 쿼리가 있으면 필터링
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        keywords = keywords.filter((keyword: Keyword) => 
          keyword.term.toLowerCase().includes(searchTerm) ||
          keyword.category.toLowerCase().includes(searchTerm) ||
          (keyword.synonyms && keyword.synonyms.some((s: string) => s.toLowerCase().includes(searchTerm)))
        );
      }

      return keywords;
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      throw error; // 에러를 다시 throw하여 호출하는 쪽에서 처리하도록 함
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
      }, true); // 쓰기 작업은 인증 필요

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
      const response = await this.request('GET', `/values/${range}`, undefined, false); // 읽기는 인증 불필요
      
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
      }, true); // 쓰기 작업은 인증 필요

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
      const response = await this.request('GET', `/values/${range}`, undefined, false); // 읽기는 인증 불필요
      
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
      }, true); // 쓰기 작업은 인증 필요

    } catch (error) {
      console.error('Error deleting keyword from Google Sheets:', error);
      throw error;
    }
  }

  async initializeSheet(): Promise<void> {
    try {
      // 헤더가 있는지 확인하고 없으면 추가
      const range = `${this.config.sheetName}!A1:G1`;
      const response = await this.request('GET', `/values/${range}`, undefined, false); // 읽기는 인증 불필요
      
      if (!response.values || response.values.length === 0) {
        const headers = ['ID', 'Term', 'Category', 'Boost', 'Synonyms', 'Created At', 'Updated At'];
        await this.request('PUT', `/values/${range}?valueInputOption=USER_ENTERED`, {
          values: [headers]
        }, true); // 쓰기 작업은 인증 필요
      }
    } catch (error) {
      console.error('Error initializing Google Sheets:', error);
    }
  }

  // 설정 테스트용 메서드
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // 먼저 스프레드시트 메타데이터만 확인
      const metadataUrl = `${this.baseUrl}/${this.config.spreadsheetId}?key=${this.config.apiKey}&fields=properties.title,sheets.properties.title`;
      
      const response = await fetch(metadataUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        const errorCode = errorData.error?.code || response.status;
        
        if (errorCode === 403) {
          return {
            success: false,
            message: `권한 오류 (403): ${errorMessage}`,
            details: {
              possibleCauses: [
                '1. API 키가 잘못되었거나 만료됨',
                '2. 스프레드시트가 공개로 설정되지 않음',
                '3. API 키에 Google Sheets API 권한이 없음',
                '4. 스프레드시트 ID가 잘못됨'
              ],
              solutions: [
                '1. Google Cloud Console에서 API 키 확인',
                '2. 스프레드시트 공유 설정: "링크가 있는 모든 사용자" 권한 부여',
                '3. Google Sheets API가 활성화되어 있는지 확인',
                '4. 스프레드시트 URL에서 ID 다시 복사'
              ]
            }
          };
        } else if (errorCode === 404) {
          return {
            success: false,
            message: `스프레드시트를 찾을 수 없음 (404): ${errorMessage}`,
            details: {
              possibleCauses: [
                '1. 스프레드시트 ID가 잘못됨',
                '2. 스프레드시트가 삭제됨',
                '3. 스프레드시트에 접근 권한이 없음'
              ]
            }
          };
        } else {
          return {
            success: false,
            message: `API 오류 (${errorCode}): ${errorMessage}`,
            details: { errorCode, errorMessage }
          };
        }
      }
      
      const data = await response.json();
      
      // 시트 이름 확인
      const sheetExists = data.sheets?.some((sheet: any) => 
        sheet.properties.title === this.config.sheetName
      );
      
      if (!sheetExists) {
        return {
          success: false,
          message: `시트 '${this.config.sheetName}'를 찾을 수 없습니다.`,
          details: {
            availableSheets: data.sheets?.map((sheet: any) => sheet.properties.title) || [],
            suggestion: `사용 가능한 시트 이름 중 하나를 선택하세요.`
          }
        };
      }
      
      return {
        success: true,
        message: `연결 성공! 스프레드시트: "${data.properties.title}", 시트: "${this.config.sheetName}"`,
        details: {
          spreadsheetTitle: data.properties.title,
          availableSheets: data.sheets?.map((sheet: any) => sheet.properties.title) || []
        }
      };
      
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        message: `연결 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        details: { error: error instanceof Error ? error.message : error }
      };
    }
  }
}
