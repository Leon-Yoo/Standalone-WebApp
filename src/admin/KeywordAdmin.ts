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
          
          <!-- 설정 가이드 -->
          <details style="margin-top: 15px;">
            <summary style="cursor: pointer; font-weight: bold;">📋 설정 가이드 (권한 오류 해결)</summary>
            <div style="margin-top: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; font-size: 0.9em;">
              <h4>1. Google Cloud Console 설정:</h4>
              <ul>
                <li>🔗 <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a> 접속</li>
                <li>📂 프로젝트 생성/선택</li>
                <li>🔌 API 및 서비스 → 라이브러리 → "Google Sheets API" 활성화</li>
                <li>🗝️ API 및 서비스 → 사용자 인증 정보 → "API 키" 생성</li>
              </ul>
              
              <h4>2. 스프레드시트 설정:</h4>
              <ul>
                <li>📊 <a href="https://sheets.google.com/" target="_blank">Google Sheets</a>에서 스프레드시트 생성</li>
                <li>🔗 공유 → "링크가 있는 모든 사용자" 권한 부여 ⚠️ <strong>필수!</strong></li>
                <li>🆔 URL에서 스프레드시트 ID 복사: <code>...sheets/d/<strong>ID</strong>/edit</code></li>
              </ul>
              
              <h4>⚠️ 권한 오류 (403) 해결:</h4>
              <ul>
                <li>✅ 스프레드시트가 <strong>공개</strong>로 설정되었는지 확인</li>
                <li>✅ API 키가 올바른지 확인</li>
                <li>✅ Google Sheets API가 활성화되었는지 확인</li>
                <li>✅ 스프레드시트 ID가 정확한지 확인</li>
              </ul>
            </div>
          </details>
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
      const result = await this.googleSheetsService.testConnection();
      
      if (result.success) {
        this.showStatus(result.message, 'success');
        
        // 사용 가능한 시트 목록도 표시
        if (result.details?.availableSheets?.length > 0) {
          const sheetsList = result.details.availableSheets.join(', ');
          setTimeout(() => {
            this.showStatus(`사용 가능한 시트: ${sheetsList}`, 'info');
          }, 2000);
        }
      } else {
        this.showStatus(result.message, 'error');
        
        // 상세한 진단 정보 표시
        if (result.details?.possibleCauses || result.details?.solutions) {
          console.log('진단 정보:', result.details);
          
          let diagnosticMessage = '진단 정보가 콘솔에 출력되었습니다. ';
          if (result.details.availableSheets?.length > 0) {
            diagnosticMessage += `사용 가능한 시트: ${result.details.availableSheets.join(', ')}`;
          }
          
          setTimeout(() => {
            this.showStatus(diagnosticMessage, 'info');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      this.showStatus('연결 테스트 실패. 설정을 확인해주세요.', 'error');
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

  private showStatus(message: string, type: 'success' | 'error' | 'info', duration: number = 5000): void {
    const statusElement = document.getElementById('connection-status')!;
    statusElement.innerHTML = `<div class="status-${type}">${message}</div>`;
    setTimeout(() => {
      statusElement.innerHTML = '';
    }, duration);
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
