import { Keyword } from './types';

export class ExcelKeywordAdmin {
  private readonly container: HTMLElement;
  private keywords: Keyword[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    
    // 기본 샘플 데이터
    this.keywords = [
      {
        id: 'kw_1',
        term: 'typescript',
        category: 'programming',
        boost: 1.5,
        synonyms: ['ts', 'javascript with types'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'kw_2',
        term: 'excel',
        category: 'office',
        boost: 2.0,
        synonyms: ['spreadsheet', 'microsoft excel'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'kw_3',
        term: 'vite',
        category: 'build-tool',
        boost: 1.2,
        synonyms: ['frontend build tool'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  async init(): Promise<void> {
    this.render();
    this.setupEventListeners();
    this.renderKeywords();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="admin-container">
        <h2>Excel Keyword Management</h2>
        
        <!-- Excel 파일 관리 섹션 -->
        <div class="excel-section">
          <h3>Excel 파일 관리</h3>
          <div class="excel-controls">
            <button id="download-excel" class="btn-primary">📥 Excel 다운로드</button>
            <input type="file" id="upload-excel" accept=".xlsx,.csv" style="display: none;" />
            <button id="upload-btn" class="btn-secondary">📤 Excel 업로드</button>
            <button id="clear-data" class="btn-danger">🗑️ 데이터 초기화</button>
          </div>
          <div id="file-status" style="margin-top: 10px;"></div>
          
          <!-- 가이드 -->
          <details style="margin-top: 15px;">
            <summary style="cursor: pointer; font-weight: bold;">📋 사용 가이드</summary>
            <div style="margin-top: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; font-size: 0.9em;">
              <h4>Excel 파일 관리 방법:</h4>
              <ul>
                <li>📥 <strong>다운로드</strong>: 현재 키워드 데이터를 Excel 파일로 다운로드</li>
                <li>✏️ <strong>편집</strong>: 다운로드한 Excel 파일을 수정 (Excel, Google Sheets 등)</li>
                <li>📤 <strong>업로드</strong>: 수정한 파일을 업로드하여 데이터 갱신</li>
                <li>🗑️ <strong>초기화</strong>: 모든 데이터를 삭제하고 샘플 데이터로 복원</li>
              </ul>
              
              <h4>Excel 파일 형식:</h4>
              <table style="border-collapse: collapse; width: 100%; margin-top: 10px; font-size: 0.85em;">
                <thead>
                  <tr style="background-color: #e9ecef;">
                    <th style="border: 1px solid #dee2e6; padding: 5px;">ID</th>
                    <th style="border: 1px solid #dee2e6; padding: 5px;">Term</th>
                    <th style="border: 1px solid #dee2e6; padding: 5px;">Category</th>
                    <th style="border: 1px solid #dee2e6; padding: 5px;">Boost</th>
                    <th style="border: 1px solid #dee2e6; padding: 5px;">Synonyms</th>
                    <th style="border: 1px solid #dee2e6; padding: 5px;">Created At</th>
                    <th style="border: 1px solid #dee2e6; padding: 5px;">Updated At</th>
                  </tr>
                </thead>
              </table>
              <p style="margin-top: 10px; color: #666;">
                ⚠️ <strong>중요</strong>: 첫 번째 행(헤더)은 수정하지 마세요!
              </p>
            </div>
          </details>
        </div>

        <!-- 검색 섹션 -->
        <div class="search-section">
          <h3>키워드 검색</h3>
          <div class="keyword-form">
            <input type="text" id="search-input" placeholder="키워드, 카테고리, 동의어로 검색..." />
            <button id="search-btn">검색</button>
            <button id="refresh-btn">전체 보기</button>
          </div>
        </div>

        <!-- 키워드 추가 섹션 -->
        <div class="add-section">
          <h3>새 키워드 추가</h3>
          <div class="keyword-form">
            <input type="text" id="new-term" placeholder="키워드" />
            <input type="text" id="new-category" placeholder="카테고리" />
            <input type="number" id="new-boost" placeholder="부스트 (선택사항)" step="0.1" />
            <input type="text" id="new-synonyms" placeholder="동의어 (쉼표로 구분)" />
            <button id="add-keyword">키워드 추가</button>
          </div>
        </div>

        <!-- 상태 메시지 -->
        <div id="status-message" style="margin: 20px 0;"></div>

        <!-- 키워드 목록 -->
        <div class="keywords-section">
          <h3>키워드 목록 (<span id="keyword-count">0</span>개)</h3>
          <div id="keywords-container"></div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // Excel 다운로드
    document.getElementById('download-excel')?.addEventListener('click', () => {
      this.downloadExcel();
    });

    // Excel 업로드 버튼
    document.getElementById('upload-btn')?.addEventListener('click', () => {
      document.getElementById('upload-excel')?.click();
    });

    // Excel 파일 업로드
    document.getElementById('upload-excel')?.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files?.[0]) {
        this.uploadExcel(input.files[0]);
      }
    });

    // 데이터 초기화
    document.getElementById('clear-data')?.addEventListener('click', () => {
      this.clearData();
    });

    // 검색
    document.getElementById('search-btn')?.addEventListener('click', () => {
      this.search();
    });

    // 전체 보기
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
      this.showAllKeywords();
    });

    // 키워드 추가
    document.getElementById('add-keyword')?.addEventListener('click', () => {
      this.addKeyword();
    });

    // 검색 엔터키
    document.getElementById('search-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.search();
      }
    });
  }

  private downloadExcel(): void {
    try {
      // CSV 형식으로 다운로드 (Excel에서 열 수 있음)
      const headers = ['ID', 'Term', 'Category', 'Boost', 'Synonyms', 'Created At', 'Updated At'];
      const csvContent = [
        headers.join(','),
        ...this.keywords.map(keyword => [
          keyword.id,
          `"${keyword.term}"`,
          `"${keyword.category}"`,
          keyword.boost || '',
          `"${keyword.synonyms?.join('; ') || ''}"`,
          keyword.created_at,
          keyword.updated_at
        ].join(','))
      ].join('\n');

      // BOM 추가 (UTF-8 인코딩을 위해)
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `keywords_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showStatus('Excel 파일이 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('Excel 다운로드 실패:', error);
      this.showStatus('Excel 다운로드에 실패했습니다.', 'error');
    }
  }

  private async uploadExcel(file: File): Promise<void> {
    try {
      this.showStatus('파일을 읽는 중...', 'info');
      
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        this.showStatus('파일에 데이터가 없습니다.', 'error');
        return;
      }

      // 헤더 확인 (첫 번째 줄)
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // 헤더 검증 (유연하게)
      if (!headers.some(h => h.toLowerCase().includes('term')) || 
          !headers.some(h => h.toLowerCase().includes('category'))) {
        this.showStatus('올바른 Excel 형식이 아닙니다. Term과 Category 열이 필요합니다.', 'error');
        return;
      }

      // 데이터 파싱
      const newKeywords: Keyword[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = this.parseCSVLine(line);
        if (values.length < 2) continue;

        const keyword: Keyword = {
          id: values[0] || `kw_${Date.now()}_${i}`,
          term: values[1] || '',
          category: values[2] || 'general',
          boost: values[3] ? parseFloat(values[3]) : undefined,
          synonyms: values[4] ? values[4].split(';').map(s => s.trim()).filter(s => s) : undefined,
          created_at: values[5] || new Date().toISOString(),
          updated_at: values[6] || new Date().toISOString()
        };

        if (keyword.term) {
          newKeywords.push(keyword);
        }
      }

      if (newKeywords.length === 0) {
        this.showStatus('파일에서 유효한 키워드를 찾을 수 없습니다.', 'error');
        return;
      }

      // 데이터 교체
      this.keywords = newKeywords;
      this.renderKeywords();
      this.showStatus(`${newKeywords.length}개의 키워드를 성공적으로 업로드했습니다.`, 'success');
      
      // 파일 입력 초기화
      (document.getElementById('upload-excel') as HTMLInputElement).value = '';
      
    } catch (error) {
      console.error('Excel 업로드 실패:', error);
      this.showStatus('Excel 파일 업로드에 실패했습니다.', 'error');
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(val => val.replace(/^"+$/g, '').replace(/^"+/g, '').replace(/"+$/g, ''));
  }

  private clearData(): void {
    if (!confirm('모든 키워드 데이터를 삭제하고 샘플 데이터로 초기화하시겠습니까?')) {
      return;
    }

    // 기본 샘플 데이터로 복원
    this.keywords = [
      {
        id: 'kw_1',
        term: 'typescript',
        category: 'programming',
        boost: 1.5,
        synonyms: ['ts', 'javascript with types'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'kw_2',
        term: 'excel',
        category: 'office',
        boost: 2.0,
        synonyms: ['spreadsheet', 'microsoft excel'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'kw_3',
        term: 'vite',
        category: 'build-tool',
        boost: 1.2,
        synonyms: ['frontend build tool'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.renderKeywords();
    this.showStatus('데이터가 초기화되었습니다.', 'success');
  }

  private search(): void {
    const query = (document.getElementById('search-input') as HTMLInputElement).value;
    
    if (!query?.trim()) {
      this.showAllKeywords();
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filteredKeywords = this.keywords.filter((keyword: Keyword) => 
      keyword.term.toLowerCase().includes(searchTerm) ||
      keyword.category.toLowerCase().includes(searchTerm) ||
      keyword.synonyms?.some((s: string) => s.toLowerCase().includes(searchTerm))
    );

    this.renderKeywords(filteredKeywords);
    this.showStatus(`검색 결과: ${filteredKeywords.length}개의 키워드를 찾았습니다.`, 'success');
  }

  private showAllKeywords(): void {
    (document.getElementById('search-input') as HTMLInputElement).value = '';
    this.renderKeywords();
    this.showStatus('전체 키워드를 표시합니다.', 'info');
  }

  private addKeyword(): void {
    const term = (document.getElementById('new-term') as HTMLInputElement).value;
    const category = (document.getElementById('new-category') as HTMLInputElement).value;
    const boostInput = (document.getElementById('new-boost') as HTMLInputElement).value;
    const synonymsInput = (document.getElementById('new-synonyms') as HTMLInputElement).value;

    if (!term || !category) {
      this.showStatus('키워드와 카테고리는 필수입니다.', 'error');
      return;
    }

    const newKeyword: Keyword = {
      id: `kw_${Date.now()}`,
      term,
      category,
      boost: boostInput ? parseFloat(boostInput) : undefined,
      synonyms: synonymsInput ? synonymsInput.split(',').map(s => s.trim()).filter(s => s) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.keywords.unshift(newKeyword);
    this.renderKeywords();
    this.clearForm();
    this.showStatus('키워드가 추가되었습니다.', 'success');
  }

  private clearForm(): void {
    (document.getElementById('new-term') as HTMLInputElement).value = '';
    (document.getElementById('new-category') as HTMLInputElement).value = '';
    (document.getElementById('new-boost') as HTMLInputElement).value = '';
    (document.getElementById('new-synonyms') as HTMLInputElement).value = '';
  }

  private renderKeywords(keywordsToRender?: Keyword[]): void {
    const keywords = keywordsToRender || this.keywords;
    const container = document.getElementById('keywords-container')!;
    const countElement = document.getElementById('keyword-count')!;
    
    countElement.textContent = keywords.length.toString();
    
    if (keywords.length === 0) {
      const searchInput = (document.getElementById('search-input') as HTMLInputElement)?.value;
      if (searchInput?.trim()) {
        container.innerHTML = '<p class="status-info">🔍 검색 결과가 없습니다. 다른 키워드로 검색해보세요.</p>';
      } else {
        container.innerHTML = `
          <div class="status-info">
            <p>📄 아직 키워드가 없습니다.</p>
            <p>위 폼을 사용하여 키워드를 추가하거나 Excel 파일을 업로드해보세요!</p>
          </div>
        `;
      }
      return;
    }

    container.innerHTML = keywords.map(keyword => `
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
  }

  public deleteKeyword(id: string): void {
    if (!confirm('정말로 이 키워드를 삭제하시겠습니까?')) {
      return;
    }

    this.keywords = this.keywords.filter(k => k.id !== id);
    this.renderKeywords();
    this.showStatus('키워드가 삭제되었습니다.', 'success');
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const statusElement = document.getElementById('status-message')!;
    statusElement.className = `status-${type}`;
    statusElement.textContent = message;

    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = '';
    }, duration);
  }
}
