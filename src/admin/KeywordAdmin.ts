import { Keyword, GoogleSheetsConfig, AuthState } from './types';
import { GoogleSheetsService } from './GoogleSheetsService';

export class GoogleSheetsKeywordAdmin {
  private readonly container: HTMLElement;
  private googleSheetsService: GoogleSheetsService;
  private keywords: Keyword[] = [];
  
  // 내장된 API 설정
  private readonly DEFAULT_CONFIG = {
    apiKey: 'AIzaSyCXPcbpDUUL7zlWT4rSKInoK4x65JSqtj0',
    clientId: '350696285675-bs18lsr5frcgqmr3nurucdcoen1hfrok.apps.googleusercontent.com',
    sheetName: 'Keywords'
  };

  constructor(container: HTMLElement) {
    this.container = container;
    
    // 기본 Google Sheets 설정 (내장된 API 키 사용)
    const config: GoogleSheetsConfig = {
      apiKey: this.DEFAULT_CONFIG.apiKey,
      clientId: this.DEFAULT_CONFIG.clientId,
      spreadsheetId: '',
      sheetName: this.DEFAULT_CONFIG.sheetName
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
            <input type="text" id="spreadsheet-id" placeholder="스프레드시트 ID" />
            <input type="text" id="sheet-name" placeholder="시트 이름 (기본값: Keywords)" value="Keywords" />
            <button id="save-config">설정 저장</button>
            <button id="test-connection">연결 테스트</button>
            <button id="check-api-config">API 설정 확인</button>
            <button id="sign-in" style="display: none;">Google 로그인</button>
            <button id="sign-out" style="display: none;">로그아웃</button>
            <button id="init-sheet">시트 초기화</button>
          </div>
          <div id="auth-status" style="margin-top: 10px;"></div>
          <div id="connection-status" style="margin-top: 10px;"></div>
          
          <!-- 설정 가이드 -->
          <details style="margin-top: 15px;">
            <summary style="cursor: pointer; font-weight: bold;">📋 설정 가이드</summary>
            <div style="margin-top: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; font-size: 0.9em;">
              <h4>✅ API 키와 OAuth 클라이언트 ID가 내장되어 있습니다!</h4>
              <p style="color: #28a745; font-weight: bold;">더 이상 API 키나 클라이언트 ID를 입력할 필요가 없습니다.</p>
              
              <h4>설정 방법:</h4>
              <ul>
                <li>📊 <a href="https://sheets.google.com/" target="_blank">Google Sheets</a>에서 스프레드시트 생성</li>
                <li>🔗 공유 → "링크가 있는 모든 사용자" 권한 부여 ⚠️ <strong>필수!</strong></li>
                <li>🆔 URL에서 스프레드시트 ID 복사: <code>...sheets/d/<strong>ID</strong>/edit</code></li>
                <li>⬆️ 위의 "스프레드시트 ID" 필드에 입력</li>
                <li>💾 "설정 저장" 클릭</li>
                <li>🔐 "Google 로그인"으로 인증 (키워드 추가/수정/삭제용)</li>
              </ul>
              
              <h4>⚠️ 권한 오류 (403) 해결:</h4>
              <ul>
                <li>✅ 스프레드시트가 <strong>공개</strong>로 설정되었는지 확인</li>
                <li>✅ 스프레드시트 ID가 정확한지 확인</li>
                <li>✅ 시트 이름이 정확한지 확인 (기본값: Keywords)</li>
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

    // API 설정 확인
    document.getElementById('check-api-config')?.addEventListener('click', () => {
      this.checkApiConfig();
    });

    // 로그인/로그아웃
    document.getElementById('sign-in')?.addEventListener('click', () => {
      this.signIn();
    });

    document.getElementById('sign-out')?.addEventListener('click', () => {
      this.signOut();
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
    const spreadsheetId = (document.getElementById('spreadsheet-id') as HTMLInputElement).value;
    const sheetName = (document.getElementById('sheet-name') as HTMLInputElement).value || 'Keywords';

    if (spreadsheetId) {
      const config: GoogleSheetsConfig = {
        apiKey: this.DEFAULT_CONFIG.apiKey,
        clientId: this.DEFAULT_CONFIG.clientId,
        spreadsheetId,
        sheetName
      };
      
      this.googleSheetsService = new GoogleSheetsService(config);
      
      // 로컬 스토리지에 설정 저장 (스프레드시트 ID와 시트 이름만)
      localStorage.setItem('sheets-config', JSON.stringify({
        spreadsheetId,
        sheetName
      }));
      
      // Google Auth 초기화
      this.initializeAuth();
      
      this.showStatus('설정이 저장되었습니다.', 'success');
    } else {
      this.showStatus('스프레드시트 ID는 필수입니다.', 'error');
    }
  }

  private async initializeAuth(): Promise<void> {
    try {
      await this.googleSheetsService.initialize();
      
      // 인증 상태 변화 감지
      this.googleSheetsService.getAuthService().onAuthChange((authState: AuthState) => {
        this.updateAuthUI(authState);
      });
      
      // 현재 인증 상태 표시
      const authState = this.googleSheetsService.getAuthService().getAuthState();
      this.updateAuthUI(authState);
      
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.showStatus('인증 초기화에 실패했습니다.', 'error');
    }
  }

  private updateAuthUI(authState: AuthState): void {
    const signInBtn = document.getElementById('sign-in') as HTMLButtonElement;
    const signOutBtn = document.getElementById('sign-out') as HTMLButtonElement;
    const authStatusEl = document.getElementById('auth-status')!;
    
    if (authState.isSignedIn && authState.user) {
      signInBtn.style.display = 'none';
      signOutBtn.style.display = 'inline-block';
      authStatusEl.innerHTML = `
        <div class="status-success">
          ✅ 로그인됨: ${authState.user.name} (${authState.user.email})
        </div>
      `;
      this.loadKeywords(); // 인증 후 키워드 로드
    } else {
      signInBtn.style.display = 'inline-block';
      signOutBtn.style.display = 'none';
      authStatusEl.innerHTML = `
        <div class="status-info">
          ℹ️ 키워드 추가/수정/삭제를 위해 Google 로그인이 필요합니다.
        </div>
      `;
    }
  }

  private async signIn(): Promise<void> {
    try {
      await this.googleSheetsService.getAuthService().signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
      this.showStatus('로그인에 실패했습니다.', 'error');
    }
  }

  private async signOut(): Promise<void> {
    try {
      await this.googleSheetsService.getAuthService().signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      this.showStatus('로그아웃에 실패했습니다.', 'error');
    }
  }

  private async testConnection(): Promise<void> {
    try {
      this.showStatus('연결 테스트 중...', 'info');
      const result = await this.googleSheetsService.testConnection();
      
      if (result.success) {
        this.showStatus(result.message, 'success');
        
        // 연결 성공 후 키워드 목록 로드 시도
        try {
          await this.loadKeywords();
        } catch (loadError) {
          console.error('키워드 로딩 실패:', loadError);
          this.showStatus('연결은 성공했지만 키워드 로딩에 실패했습니다. 시트 이름을 확인해주세요.', 'error');
        }
        
        // 사용 가능한 시트 목록도 표시
        if (result.details?.availableSheets?.length > 0) {
          const sheetsList = result.details.availableSheets.join(', ');
          setTimeout(() => {
            this.showStatus(`사용 가능한 시트: ${sheetsList}`, 'info');
          }, 3000);
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

  private checkApiConfig(): void {
    const maskedApiKey = this.maskSensitiveData(this.DEFAULT_CONFIG.apiKey);
    const maskedClientId = this.maskSensitiveData(this.DEFAULT_CONFIG.clientId);
    
    // 현재 Google Sheets Service에서 사용 중인 설정도 확인
    const currentConfig = this.googleSheetsService.getConfig();
    const isConfigured = currentConfig.spreadsheetId ? '✅' : '❌';
    
    const configInfo = `
      <div style="font-family: monospace; font-size: 0.9em; background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 10px;">
        <h4 style="margin-top: 0; color: #28a745;">🔧 현재 API 설정</h4>
        <div style="margin-bottom: 10px;">
          <strong>API Key (내장):</strong><br>
          <code style="background-color: #e9ecef; padding: 2px 4px; border-radius: 2px;">${maskedApiKey}</code>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>OAuth Client ID (내장):</strong><br>
          <code style="background-color: #e9ecef; padding: 2px 4px; border-radius: 2px;">${maskedClientId}</code>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>스프레드시트 설정:</strong> ${isConfigured}<br>
          ${currentConfig.spreadsheetId ? 
            `<code style="background-color: #e9ecef; padding: 2px 4px; border-radius: 2px;">${this.maskSensitiveData(currentConfig.spreadsheetId)}</code>` : 
            '<span style="color: #dc3545;">설정되지 않음</span>'
          }
        </div>
        <div style="margin-bottom: 10px;">
          <strong>시트 이름:</strong> <code style="background-color: #e9ecef; padding: 2px 4px; border-radius: 2px;">${currentConfig.sheetName}</code>
        </div>
        <div style="margin-top: 15px; padding: 10px; background-color: #d1ecf1; border-radius: 3px; border-left: 3px solid #bee5eb;">
          <small style="color: #0c5460;">
            ℹ️ 보안상 일부 문자는 마스킹되어 표시됩니다.<br>
            API 키와 클라이언트 ID는 코드에 내장되어 변경할 수 없습니다.
          </small>
        </div>
      </div>
    `;
    
    // 상태 메시지 영역에 설정 정보 표시
    const statusElement = document.getElementById('connection-status')!;
    statusElement.innerHTML = configInfo;
    
    // 8초 후 메시지 제거
    setTimeout(() => {
      statusElement.innerHTML = '';
    }, 8000);
  }

  private maskSensitiveData(data: string): string {
    if (!data || data.length < 8) {
      return '***';
    }
    
    // 앞의 4자리와 뒤의 4자리만 보여주고 나머지는 마스킹
    const start = data.substring(0, 4);
    const end = data.substring(data.length - 4);
    const middle = '*'.repeat(Math.max(data.length - 8, 3));
    
    return `${start}${middle}${end}`;
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
        
        // 내장된 API 설정으로 서비스 재초기화
        const fullConfig: GoogleSheetsConfig = {
          apiKey: this.DEFAULT_CONFIG.apiKey,
          clientId: this.DEFAULT_CONFIG.clientId,
          spreadsheetId: config.spreadsheetId,
          sheetName: config.sheetName
        };
        this.googleSheetsService = new GoogleSheetsService(fullConfig);
        
        // Google Auth 초기화
        this.initializeAuth();
      }

      this.keywords = await this.googleSheetsService.searchKeywords();
      this.renderKeywords();
    } catch (error) {
      console.error('키워드 로딩 실패:', error);
      // 설정이 완료되지 않은 경우 안내 메시지 표시
      const savedConfig = localStorage.getItem('sheets-config');
      if (!savedConfig) {
        document.getElementById('keywords-container')!.innerHTML = 
          '<p class="status-info">📝 먼저 스프레드시트 ID를 설정하고 저장해주세요.</p>';
      } else {
        document.getElementById('keywords-container')!.innerHTML = 
          '<p class="status-error">❌ 키워드를 로딩할 수 없습니다. Google Sheets 설정과 권한을 확인해주세요.</p>';
      }
    }
  }

  private async search(): Promise<void> {
    const query = (document.getElementById('search-input') as HTMLInputElement).value;
    
    // 설정이 완료되지 않은 경우 검색하지 않음
    const savedConfig = localStorage.getItem('sheets-config');
    if (!savedConfig) {
      this.showStatus('먼저 스프레드시트 설정을 완료해주세요.', 'error');
      return;
    }
    
    try {
      this.keywords = await this.googleSheetsService.searchKeywords(query);
      this.renderKeywords();
      
      // 검색 결과 안내
      if (query?.trim()) {
        const resultCount = this.keywords.length;
        this.showStatus(`검색 결과: ${resultCount}개의 키워드를 찾았습니다.`, 'success');
      }
    } catch (error) {
      console.error('검색 실패:', error);
      this.showStatus('검색 중 오류가 발생했습니다. 네트워크 연결과 설정을 확인해주세요.', 'error');
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
      await this.googleSheetsService.createKeyword({
        term,
        category,
        boost: boostInput ? parseFloat(boostInput) : undefined,
        synonyms: synonymsInput ? synonymsInput.split(',').map(s => s.trim()) : undefined
      });

      // 키워드 추가 후 전체 목록을 다시 로드
      await this.loadKeywords();
      this.clearForm();
      this.showStatus('키워드가 추가되었습니다.', 'success');
    } catch (error) {
      console.error('키워드 추가 실패:', error);
      this.showStatus('키워드 추가에 실패했습니다. Google 로그인이 필요할 수 있습니다.', 'error');
    }
  }

  private async handleDeleteKeyword(id: string): Promise<void> {
    if (!confirm('정말로 이 키워드를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await this.googleSheetsService.deleteKeyword(id);
      // 삭제 후 전체 목록을 다시 로드
      await this.loadKeywords();
      this.showStatus('키워드가 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('키워드 삭제 실패:', error);
      this.showStatus('키워드 삭제에 실패했습니다. Google 로그인이 필요할 수 있습니다.', 'error');
    }
  }

  private renderKeywords(): void {
    const container = document.getElementById('keywords-container')!;
    
    if (this.keywords.length === 0) {
      const searchInput = (document.getElementById('search-input') as HTMLInputElement)?.value;
      if (searchInput?.trim()) {
        container.innerHTML = '<p class="status-info">🔍 검색 결과가 없습니다. 다른 키워드로 검색해보세요.</p>';
      } else {
        container.innerHTML = `
          <div class="status-info">
            <p>📄 아직 키워드가 없습니다.</p>
            <p>아래 폼을 사용하여 첫 번째 키워드를 추가해보세요!</p>
          </div>
        `;
      }
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
