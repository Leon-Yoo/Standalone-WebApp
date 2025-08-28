import { Keyword, GoogleSheetsConfig } from './types';
import { GoogleSheetsService } from './GoogleSheetsService';

export class GoogleSheetsKeywordAdmin {
  private readonly container: HTMLElement;
  private googleSheetsService: GoogleSheetsService;
  private keywords: Keyword[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    
    // 기본 Google Sheets 설정 (사용자가 설정해야 함)
    const config: GoogleSheetsConfig = {
      apiKey: '',
      spreadsheetId: '',
      sheetName: 'Keywords'
    };
    
    this.googleSheetsService = new GoogleSheetsService(config);
  }

  async init(): Promise<void> {
    this.render();
    await this.loadKeywords();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="admin-container">
        <h2>Google Sheets Keyword Management</h2>
        
        <!-- 설정 섹션 -->
        <div class="config-section">
          <h3>Google Sheets 설정</h3>
          <div class="keyword-form">
            <input type="text" id="api-key" placeholder="Google Sheets API Key" />
            <input type="text" id="spreadsheet-id" placeholder="스프레드시트 ID" />
            <input type="text" id="sheet-name" placeholder="시트 이름 (기본값: Keywords)" value="Keywords" />
            <button id="save-config">설정 저장</button>
            <button id="test-connection">연결 테스트</button>
            <button id="init-sheet">시트 초기화</button>
          </div>
          <div id="connection-status" style="margin-top: 10px;"></div>
        </div>

        <!-- 검색 섹션 -->
        <div class="search-section">
          <h3>키워드 검색</h3>
          <input type="text" id="search-input" placeholder="키워드 검색..." />
          <button id="search-btn">검색</button>
          <button id="refresh-btn">새로고침</button>
        </div>

        <!-- 새 키워드 추가 섹션 -->
        <div class="add-section">
          <h3>새 키워드 추가</h3>
          <div class="keyword-form">
            <input type="text" id="new-term" placeholder="키워드" required />
            <input type="text" id="new-category" placeholder="카테고리" required />
            <input type="number" id="new-boost" placeholder="부스트 (예: 1.5)" step="0.1" min="0" />
            <input type="text" id="new-synonyms" placeholder="동의어 (쉼표로 구분)" />
            <button id="add-keyword">키워드 추가</button>
          </div>
        </div>

        <!-- 키워드 목록 -->
        <div class="keyword-list" id="keyword-list">
          <h3>키워드 목록</h3>
          <div id="keywords-container">로딩 중...</div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // 설정 저장
    document.getElementById('save-config')?.addEventListener('click', () => {
      this.saveConfig();
    });

    // 연결 테스트
    document.getElementById('test-connection')?.addEventListener('click', () => {
      this.testConnection();
    });

    // 시트 초기화
    document.getElementById('init-sheet')?.addEventListener('click', () => {
      this.initializeSheet();
    });

    // 검색
    document.getElementById('search-btn')?.addEventListener('click', () => {
      this.search();
    });

    // 새로고침
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
      this.loadKeywords();
    });

    // 키워드 추가
    document.getElementById('add-keyword')?.addEventListener('click', () => {
      this.addKeyword();
    });

    // 검색 입력 엔터키 처리
    document.getElementById('search-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.search();
      }
    });
  }

  private saveConfig(): void {
    const apiKey = (document.getElementById('api-key') as HTMLInputElement).value;
    const spreadsheetId = (document.getElementById('spreadsheet-id') as HTMLInputElement).value;
    const sheetName = (document.getElementById('sheet-name') as HTMLInputElement).value || 'Keywords';

    if (apiKey && spreadsheetId) {
      const config: GoogleSheetsConfig = {
        apiKey,
        spreadsheetId,
        sheetName
      };
      
      this.googleSheetsService = new GoogleSheetsService(config);
      
      // 로컬 스토리지에 설정 저장 (API 키 제외)
      localStorage.setItem('sheets-config', JSON.stringify({
        spreadsheetId,
        sheetName
      }));
      
      this.showStatus('설정이 저장되었습니다.', 'success');
      this.loadKeywords();
    } else {
      this.showStatus('API Key와 스프레드시트 ID는 필수입니다.', 'error');
    }
  }

  private async testConnection(): Promise<void> {
    try {
      this.showStatus('연결 테스트 중...', 'info');
      const isConnected = await this.googleSheetsService.testConnection();
      if (isConnected) {
        this.showStatus('연결 성공!', 'success');
      } else {
        this.showStatus('연결 실패. 설정을 확인해주세요.', 'error');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      this.showStatus('연결 실패. 설정을 확인해주세요.', 'error');
    }
  }

  private async initializeSheet(): Promise<void> {
    try {
      this.showStatus('시트 초기화 중...', 'info');
      await this.googleSheetsService.initializeSheet();
      this.showStatus('시트가 초기화되었습니다.', 'success');
    } catch (error) {
      console.error('Sheet initialization failed:', error);
      this.showStatus('시트 초기화에 실패했습니다.', 'error');
    }
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info'): void {
    const statusElement = document.getElementById('connection-status')!;
    statusElement.innerHTML = `<div class="status-${type}">${message}</div>`;
    setTimeout(() => {
      statusElement.innerHTML = '';
    }, 3000);
  }

  private async loadKeywords(): Promise<void> {
    try {
      // 저장된 설정 로드
      const savedConfig = localStorage.getItem('sheets-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        (document.getElementById('spreadsheet-id') as HTMLInputElement).value = config.spreadsheetId;
        (document.getElementById('sheet-name') as HTMLInputElement).value = config.sheetName;
      }

      this.keywords = await this.googleSheetsService.searchKeywords();
      this.renderKeywords();
    } catch (error) {
      console.error('키워드 로딩 실패:', error);
      document.getElementById('keywords-container')!.innerHTML = 
        '<p>키워드를 로딩할 수 없습니다. Google Sheets 설정을 확인해주세요.</p>';
    }
  }

  private async search(): Promise<void> {
    const query = (document.getElementById('search-input') as HTMLInputElement).value;
    try {
      this.keywords = await this.googleSheetsService.searchKeywords(query);
      this.renderKeywords();
    } catch (error) {
      console.error('검색 실패:', error);
    }
  }

  private async addKeyword(): Promise<void> {
    const term = (document.getElementById('new-term') as HTMLInputElement).value;
    const category = (document.getElementById('new-category') as HTMLInputElement).value;
    const boostInput = (document.getElementById('new-boost') as HTMLInputElement).value;
    const synonymsInput = (document.getElementById('new-synonyms') as HTMLInputElement).value;

    if (!term || !category) {
      this.showStatus('키워드와 카테고리는 필수입니다.', 'error');
      return;
    }

    try {
      const newKeyword = await this.googleSheetsService.createKeyword({
        term,
        category,
        boost: boostInput ? parseFloat(boostInput) : undefined,
        synonyms: synonymsInput ? synonymsInput.split(',').map(s => s.trim()) : undefined
      });

      this.keywords.unshift(newKeyword);
      this.renderKeywords();
      this.clearForm();
      this.showStatus('키워드가 추가되었습니다.', 'success');
    } catch (error) {
      console.error('키워드 추가 실패:', error);
      this.showStatus('키워드 추가에 실패했습니다.', 'error');
    }
  }

  private async handleDeleteKeyword(id: string): Promise<void> {
    if (!confirm('정말로 이 키워드를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await this.googleSheetsService.deleteKeyword(id);
      this.keywords = this.keywords.filter(k => k.id !== id);
      this.renderKeywords();
      this.showStatus('키워드가 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('키워드 삭제 실패:', error);
      this.showStatus('키워드 삭제에 실패했습니다.', 'error');
    }
  }

  private renderKeywords(): void {
    const container = document.getElementById('keywords-container')!;
    
    if (this.keywords.length === 0) {
      container.innerHTML = '<p>키워드가 없습니다.</p>';
      return;
    }

    container.innerHTML = this.keywords.map(keyword => `
      <div class="keyword-item">
        <div>
          <strong>${keyword.term}</strong>
          <span style="color: #666; margin-left: 10px;">[${keyword.category}]</span>
          ${keyword.boost ? `<span style="color: #007bff; margin-left: 10px;">Boost: ${keyword.boost}</span>` : ''}
          ${keyword.synonyms && keyword.synonyms.length > 0 ? 
            `<div style="font-size: 0.9em; color: #666;">동의어: ${keyword.synonyms.join(', ')}</div>` : ''}
          <div style="font-size: 0.8em; color: #999;">
            생성: ${new Date(keyword.created_at).toLocaleString('ko-KR')} | 
            수정: ${new Date(keyword.updated_at).toLocaleString('ko-KR')}
          </div>
        </div>
        <button class="btn-danger" onclick="admin.deleteKeyword('${keyword.id}')">삭제</button>
      </div>
    `).join('');

    // 전역 참조를 위해 admin 객체를 window에 할당
    (window as any).admin = this;
  }

  private clearForm(): void {
    (document.getElementById('new-term') as HTMLInputElement).value = '';
    (document.getElementById('new-category') as HTMLInputElement).value = '';
    (document.getElementById('new-boost') as HTMLInputElement).value = '';
    (document.getElementById('new-synonyms') as HTMLInputElement).value = '';
  }

  // 전역에서 호출할 수 있도록 public 메서드
  public async deleteKeyword(id: string): Promise<void> {
    await this.handleDeleteKeyword(id);
  }
}

// 하위 호환성을 위한 별칭 export
export { GoogleSheetsKeywordAdmin as ElasticsearchKeywordAdmin };
