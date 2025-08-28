import { SynonymEntry, MorphemeEntry, KeywordType, DictionaryStats } from './types';

export class FashionDictionaryAdmin {
  private readonly container: HTMLElement;
  private synonymEntries: SynonymEntry[] = [];
  private morphemeEntries: MorphemeEntry[] = [];
  private currentTab: 'synonyms' | 'morphemes' = 'synonyms';

  // 키워드 타입 정의
  private readonly keywordTypes: { value: KeywordType; label: string; description: string }[] = [
    { value: 'brand', label: '브랜드', description: '브랜드명 (예: 나이키, 아디다스)' },
    { value: 'category', label: '카테고리', description: '상품 카테고리 (예: 상의, 하의, 신발)' },
    { value: 'product', label: '상품', description: '상품명 (예: 티셔츠, 청바지)' },
    { value: 'color', label: '색상', description: '색상 (예: 빨강, 파랑, 검정)' },
    { value: 'material', label: '소재', description: '소재 (예: 면, 폴리에스터, 데님)' },
    { value: 'style', label: '스타일', description: '스타일 (예: 캐주얼, 포멀, 스트릿)' },
    { value: 'occasion', label: '용도', description: '착용 용도 (예: 데일리, 출근, 운동)' },
    { value: 'season', label: '시즌', description: '계절 (예: 봄, 여름, 가을, 겨울)' },
    { value: 'custom', label: '커스텀', description: '사용자 정의 타입' }
  ];

  constructor(container: HTMLElement) {
    this.container = container;
    this.initializeSampleData();
  }

  async init(): Promise<void> {
    this.render();
    this.setupEventListeners();
    this.renderCurrentTab();
  }

  private initializeSampleData(): void {
    // 동의어 사전 샘플 데이터
    this.synonymEntries = [
      {
        id: 'syn_1',
        type: 'brand',
        mainKeyword: '나이키',
        synonyms: ['nike', 'NIKE', '나키', '나이끼'],
        description: '스포츠 브랜드',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'syn_2',
        type: 'category',
        mainKeyword: '상의',
        synonyms: ['톱', '윗옷', '상의류', 'top'],
        description: '상체 착용 의류',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'syn_3',
        type: 'color',
        mainKeyword: '검정',
        synonyms: ['블랙', 'black', '까만색', '흑색'],
        description: '검은색 계열',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // 형태소 사전 샘플 데이터
    this.morphemeEntries = [
      {
        id: 'mor_1',
        type: 'brand',
        keyword: '나이키',
        label: 'BRAND_NAME',
        weight: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mor_2',
        type: 'category',
        keyword: '티셔츠',
        label: 'CATEGORY_NAME',
        weight: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mor_3',
        type: 'color',
        keyword: '검정',
        label: 'COLOR_NAME',
        weight: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="dictionary-admin-container">
        <div class="admin-header">
          <h2>🔍 패션 검색 사전 관리</h2>
          <p class="admin-description">브랜드, 카테고리 등 다양한 타입의 동의어 및 형태소 사전을 관리합니다.</p>
        </div>

        <!-- 탭 네비게이션 -->
        <div class="tab-navigation">
          <button id="synonyms-tab" class="tab-button active">
            📚 동의어 사전
          </button>
          <button id="morphemes-tab" class="tab-button">
            🔤 형태소 사전
          </button>
        </div>

        <!-- 통계 대시보드 -->
        <div class="stats-dashboard">
          <div class="stats-card">
            <h4>📊 통계</h4>
            <div id="stats-content"></div>
          </div>
        </div>

        <!-- 테스트 데이터 생성 -->
        <div class="test-data-section">
          <div class="stats-card">
            <h4>🧪 테스트 데이터 생성</h4>
            <div class="test-data-controls">
              <div class="form-row">
                <label>생성할 동의어 수:</label>
                <input type="number" id="synonym-count-input" value="50000" min="1" max="100000" />
                <label>생성할 형태소 수:</label>
                <input type="number" id="morpheme-count-input" value="50000" min="1" max="100000" />
                <button id="generate-test-data" class="btn-primary">📦 테스트 데이터 생성</button>
                <button id="clear-all-data" class="btn-danger">🗑️ 모든 데이터 삭제</button>
              </div>
              <div id="generation-progress" style="display: none;">
                <div class="progress-bar">
                  <div id="progress-fill" class="progress-fill"></div>
                </div>
                <div id="progress-text">생성 중...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 동의어 사전 탭 -->
        <div id="synonyms-content" class="tab-content active">
          <div class="section-header">
            <h3>동의어 사전 관리</h3>
            <div class="section-actions">
              <button id="download-synonyms" class="btn-primary">📥 동의어 다운로드</button>
              <button id="upload-synonyms-btn" class="btn-secondary">📤 동의어 업로드</button>
              <input type="file" id="upload-synonyms" accept=".xlsx,.csv" style="display: none;" />
            </div>
          </div>

          <!-- 동의어 추가 폼 -->
          <div class="add-form">
            <h4>새 동의어 추가</h4>
            <div class="form-row">
              <select id="synonym-type">
                <option value="">타입 선택</option>
                ${this.keywordTypes.map(type => 
                  `<option value="${type.value}" title="${type.description}">${type.label}</option>`
                ).join('')}
              </select>
              <input type="text" id="synonym-main" placeholder="대표 키워드" />
              <input type="text" id="synonym-list" placeholder="동의어 (쉼표로 구분)" />
              <input type="text" id="synonym-desc" placeholder="설명 (선택사항)" />
              <button id="add-synonym">동의어 추가</button>
            </div>
          </div>

          <!-- 검색 -->
          <div class="search-section">
            <div class="search-controls">
              <select id="synonym-filter-type">
                <option value="">전체 타입</option>
                ${this.keywordTypes.map(type => 
                  `<option value="${type.value}">${type.label}</option>`
                ).join('')}
              </select>
              <input type="text" id="synonym-search" placeholder="대표 키워드 또는 동의어로 검색..." />
              <button id="synonym-search-btn">검색</button>
              <button id="synonym-refresh-btn">전체 보기</button>
            </div>
          </div>

          <!-- 동의어 목록 -->
          <div class="list-section">
            <h4>동의어 목록 (<span id="synonym-count">0</span>개)</h4>
            <div id="synonyms-list"></div>
          </div>
        </div>

        <!-- 형태소 사전 탭 -->
        <div id="morphemes-content" class="tab-content">
          <div class="section-header">
            <h3>형태소 사전 관리</h3>
            <div class="section-actions">
              <button id="download-morphemes" class="btn-primary">📥 형태소 다운로드</button>
              <button id="upload-morphemes-btn" class="btn-secondary">📤 형태소 업로드</button>
              <input type="file" id="upload-morphemes" accept=".xlsx,.csv" style="display: none;" />
            </div>
          </div>

          <!-- 형태소 추가 폼 -->
          <div class="add-form">
            <h4>새 형태소 추가</h4>
            <div class="form-row">
              <select id="morpheme-type">
                <option value="">타입 선택</option>
                ${this.keywordTypes.map(type => 
                  `<option value="${type.value}" title="${type.description}">${type.label}</option>`
                ).join('')}
              </select>
              <input type="text" id="morpheme-keyword" placeholder="키워드" />
              <input type="text" id="morpheme-label" placeholder="레이블 (예: BRAND_NAME)" />
              <input type="number" id="morpheme-weight" placeholder="가중치 (선택사항)" step="0.1" />
              <button id="add-morpheme">형태소 추가</button>
            </div>
          </div>

          <!-- 검색 -->
          <div class="search-section">
            <div class="search-controls">
              <select id="morpheme-filter-type">
                <option value="">전체 타입</option>
                ${this.keywordTypes.map(type => 
                  `<option value="${type.value}">${type.label}</option>`
                ).join('')}
              </select>
              <input type="text" id="morpheme-search" placeholder="키워드 또는 레이블로 검색..." />
              <button id="morpheme-search-btn">검색</button>
              <button id="morpheme-refresh-btn">전체 보기</button>
            </div>
          </div>

          <!-- 형태소 목록 -->
          <div class="list-section">
            <h4>형태소 목록 (<span id="morpheme-count">0</span>개)</h4>
            <div id="morphemes-list"></div>
          </div>
        </div>

        <!-- 상태 메시지 -->
        <div id="status-message" style="margin: 20px 0;"></div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // 탭 전환
    document.getElementById('synonyms-tab')?.addEventListener('click', () => {
      this.switchTab('synonyms');
    });

    document.getElementById('morphemes-tab')?.addEventListener('click', () => {
      this.switchTab('morphemes');
    });

    // 테스트 데이터 생성
    this.setupTestDataEvents();

    // 동의어 관련 이벤트
    this.setupSynonymEvents();

    // 형태소 관련 이벤트
    this.setupMorphemeEvents();
  }

  private setupTestDataEvents(): void {
    // 테스트 데이터 생성
    document.getElementById('generate-test-data')?.addEventListener('click', () => {
      this.generateTestData();
    });

    // 모든 데이터 삭제
    document.getElementById('clear-all-data')?.addEventListener('click', () => {
      this.clearAllData();
    });
  }

  private setupSynonymEvents(): void {
    // 동의어 추가
    document.getElementById('add-synonym')?.addEventListener('click', () => {
      this.addSynonym();
    });

    // 동의어 검색
    document.getElementById('synonym-search-btn')?.addEventListener('click', () => {
      this.searchSynonyms();
    });

    document.getElementById('synonym-refresh-btn')?.addEventListener('click', () => {
      this.showAllSynonyms();
    });

    // 동의어 다운로드/업로드
    document.getElementById('download-synonyms')?.addEventListener('click', () => {
      this.downloadSynonyms();
    });

    document.getElementById('upload-synonyms-btn')?.addEventListener('click', () => {
      document.getElementById('upload-synonyms')?.click();
    });

    document.getElementById('upload-synonyms')?.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files?.[0]) {
        this.uploadSynonyms(input.files[0]);
      }
    });
  }

  private setupMorphemeEvents(): void {
    // 형태소 추가
    document.getElementById('add-morpheme')?.addEventListener('click', () => {
      this.addMorpheme();
    });

    // 형태소 검색
    document.getElementById('morpheme-search-btn')?.addEventListener('click', () => {
      this.searchMorphemes();
    });

    document.getElementById('morpheme-refresh-btn')?.addEventListener('click', () => {
      this.showAllMorphemes();
    });

    // 형태소 다운로드/업로드
    document.getElementById('download-morphemes')?.addEventListener('click', () => {
      this.downloadMorphemes();
    });

    document.getElementById('upload-morphemes-btn')?.addEventListener('click', () => {
      document.getElementById('upload-morphemes')?.click();
    });

    document.getElementById('upload-morphemes')?.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files?.[0]) {
        this.uploadMorphemes(input.files[0]);
      }
    });
  }

  private switchTab(tab: 'synonyms' | 'morphemes'): void {
    this.currentTab = tab;

    // 탭 버튼 활성화 상태 변경
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tab}-tab`)?.classList.add('active');

    // 탭 컨텐츠 표시/숨김
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}-content`)?.classList.add('active');

    this.renderCurrentTab();
  }

  private renderCurrentTab(): void {
    this.updateStats();
    
    if (this.currentTab === 'synonyms') {
      this.renderSynonyms();
    } else {
      this.renderMorphemes();
    }
  }

  private updateStats(): void {
    const stats = this.getStats();
    const statsContent = document.getElementById('stats-content')!;
    
    statsContent.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">${stats.synonyms.total}</div>
          <div class="stat-label">동의어 항목</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${stats.morphemes.total}</div>
          <div class="stat-label">형태소 항목</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${Object.keys(stats.synonyms.byType).length}</div>
          <div class="stat-label">사용 중인 타입</div>
        </div>
      </div>
      
      <div class="type-breakdown">
        <h5>타입별 분포</h5>
        ${this.keywordTypes.map(type => {
          const synCount = stats.synonyms.byType[type.value] || 0;
          const morCount = stats.morphemes.byType[type.value] || 0;
          const total = synCount + morCount;
          
          return total > 0 ? `
            <div class="type-stat">
              <span class="type-label">${type.label}</span>
              <span class="type-count">동의어: ${synCount}, 형태소: ${morCount}</span>
            </div>
          ` : '';
        }).join('')}
      </div>
    `;
  }

  private getStats(): DictionaryStats {
    const synonymsByType: Record<KeywordType, number> = {} as Record<KeywordType, number>;
    const morphemesByType: Record<KeywordType, number> = {} as Record<KeywordType, number>;

    this.synonymEntries.forEach(entry => {
      synonymsByType[entry.type] = (synonymsByType[entry.type] || 0) + 1;
    });

    this.morphemeEntries.forEach(entry => {
      morphemesByType[entry.type] = (morphemesByType[entry.type] || 0) + 1;
    });

    return {
      synonyms: {
        total: this.synonymEntries.length,
        byType: synonymsByType
      },
      morphemes: {
        total: this.morphemeEntries.length,
        byType: morphemesByType
      }
    };
  }

  // 동의어 관련 메서드들
  private addSynonym(): void {
    const type = (document.getElementById('synonym-type') as HTMLSelectElement).value as KeywordType;
    const mainKeyword = (document.getElementById('synonym-main') as HTMLInputElement).value;
    const synonymsInput = (document.getElementById('synonym-list') as HTMLInputElement).value;
    const description = (document.getElementById('synonym-desc') as HTMLInputElement).value;

    if (!type || !mainKeyword || !synonymsInput) {
      this.showStatus('타입, 대표 키워드, 동의어는 필수입니다.', 'error');
      return;
    }

    const synonyms = synonymsInput.split(',').map(s => s.trim()).filter(s => s);
    if (synonyms.length === 0) {
      this.showStatus('최소 하나의 동의어를 입력해주세요.', 'error');
      return;
    }

    const newSynonym: SynonymEntry = {
      id: `syn_${Date.now()}`,
      type,
      mainKeyword,
      synonyms,
      description: description || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.synonymEntries.unshift(newSynonym);
    this.renderSynonyms();
    this.clearSynonymForm();
    this.updateStats();
    this.showStatus('동의어가 추가되었습니다.', 'success');
  }

  private clearSynonymForm(): void {
    (document.getElementById('synonym-type') as HTMLSelectElement).value = '';
    (document.getElementById('synonym-main') as HTMLInputElement).value = '';
    (document.getElementById('synonym-list') as HTMLInputElement).value = '';
    (document.getElementById('synonym-desc') as HTMLInputElement).value = '';
  }

  private searchSynonyms(): void {
    const query = (document.getElementById('synonym-search') as HTMLInputElement).value;
    const typeFilter = (document.getElementById('synonym-filter-type') as HTMLSelectElement).value as KeywordType;
    
    let filtered = this.synonymEntries;

    if (typeFilter) {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }

    if (query?.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(entry => 
        entry.mainKeyword.toLowerCase().includes(searchTerm) ||
        entry.synonyms.some(s => s.toLowerCase().includes(searchTerm)) ||
        entry.description?.toLowerCase().includes(searchTerm)
      );
    }

    this.renderSynonyms(filtered);
    this.showStatus(`검색 결과: ${filtered.length}개의 동의어를 찾았습니다.`, 'success');
  }

  private showAllSynonyms(): void {
    (document.getElementById('synonym-search') as HTMLInputElement).value = '';
    (document.getElementById('synonym-filter-type') as HTMLSelectElement).value = '';
    this.renderSynonyms();
    this.showStatus('전체 동의어를 표시합니다.', 'info');
  }

  private renderSynonyms(synonymsToRender?: SynonymEntry[]): void {
    const synonyms = synonymsToRender || this.synonymEntries;
    const container = document.getElementById('synonyms-list')!;
    const countElement = document.getElementById('synonym-count')!;
    
    countElement.textContent = synonyms.length.toString();
    
    if (synonyms.length === 0) {
      container.innerHTML = '<p class="status-info">동의어가 없습니다.</p>';
      return;
    }

    container.innerHTML = synonyms.map(synonym => {
      const typeInfo = this.keywordTypes.find(t => t.value === synonym.type);
      return `
        <div class="dictionary-item synonym-item">
          <div class="item-header">
            <span class="item-type ${synonym.type}">${typeInfo?.label || synonym.type}</span>
            <strong class="main-keyword">${synonym.mainKeyword}</strong>
            <button class="btn-danger btn-small" onclick="dictionaryAdmin.deleteSynonym('${synonym.id}')">삭제</button>
          </div>
          <div class="item-content">
            <div class="synonyms-list">
              <strong>동의어:</strong> ${synonym.synonyms.join(', ')}
            </div>
            ${synonym.description ? `<div class="description">${synonym.description}</div>` : ''}
            <div class="item-meta">
              생성: ${new Date(synonym.created_at).toLocaleString('ko-KR')} | 
              수정: ${new Date(synonym.updated_at).toLocaleString('ko-KR')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  public deleteSynonym(id: string): void {
    if (!confirm('정말로 이 동의어를 삭제하시겠습니까?')) {
      return;
    }

    this.synonymEntries = this.synonymEntries.filter(s => s.id !== id);
    this.renderSynonyms();
    this.updateStats();
    this.showStatus('동의어가 삭제되었습니다.', 'success');
  }

  private downloadSynonyms(): void {
    try {
      const headers = ['ID', 'Type', 'Main Keyword', 'Synonyms', 'Description', 'Created At', 'Updated At'];
      const csvContent = [
        headers.join(','),
        ...this.synonymEntries.map(entry => [
          entry.id,
          entry.type,
          `"${entry.mainKeyword}"`,
          `"${entry.synonyms.join('; ')}"`,
          `"${entry.description || ''}"`,
          entry.created_at,
          entry.updated_at
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `synonyms_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showStatus('동의어 사전이 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('동의어 다운로드 실패:', error);
      this.showStatus('동의어 다운로드에 실패했습니다.', 'error');
    }
  }

  private async uploadSynonyms(file: File): Promise<void> {
    try {
      this.showStatus('동의어 파일을 읽는 중...', 'info');
      
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        this.showStatus('파일에 데이터가 없습니다.', 'error');
        return;
      }

      const newSynonyms: SynonymEntry[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < 3) continue;

        const synonymEntry: SynonymEntry = {
          id: values[0] || `syn_${Date.now()}_${i}`,
          type: values[1] as KeywordType || 'custom',
          mainKeyword: values[2] || '',
          synonyms: values[3] ? values[3].split(';').map(s => s.trim()).filter(s => s) : [],
          description: values[4] || undefined,
          created_at: values[5] || new Date().toISOString(),
          updated_at: values[6] || new Date().toISOString()
        };

        if (synonymEntry.mainKeyword && synonymEntry.synonyms.length > 0) {
          newSynonyms.push(synonymEntry);
        }
      }

      if (newSynonyms.length === 0) {
        this.showStatus('파일에서 유효한 동의어를 찾을 수 없습니다.', 'error');
        return;
      }

      this.synonymEntries = newSynonyms;
      this.renderSynonyms();
      this.updateStats();
      this.showStatus(`${newSynonyms.length}개의 동의어를 성공적으로 업로드했습니다.`, 'success');
      
      (document.getElementById('upload-synonyms') as HTMLInputElement).value = '';
      
    } catch (error) {
      console.error('동의어 업로드 실패:', error);
      this.showStatus('동의어 파일 업로드에 실패했습니다.', 'error');
    }
  }

  // 형태소 관련 메서드들
  private addMorpheme(): void {
    const type = (document.getElementById('morpheme-type') as HTMLSelectElement).value as KeywordType;
    const keyword = (document.getElementById('morpheme-keyword') as HTMLInputElement).value;
    const label = (document.getElementById('morpheme-label') as HTMLInputElement).value;
    const weightInput = (document.getElementById('morpheme-weight') as HTMLInputElement).value;

    if (!type || !keyword || !label) {
      this.showStatus('타입, 키워드, 레이블은 필수입니다.', 'error');
      return;
    }

    const newMorpheme: MorphemeEntry = {
      id: `mor_${Date.now()}`,
      type,
      keyword,
      label,
      weight: weightInput ? parseFloat(weightInput) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.morphemeEntries.unshift(newMorpheme);
    this.renderMorphemes();
    this.clearMorphemeForm();
    this.updateStats();
    this.showStatus('형태소가 추가되었습니다.', 'success');
  }

  private clearMorphemeForm(): void {
    (document.getElementById('morpheme-type') as HTMLSelectElement).value = '';
    (document.getElementById('morpheme-keyword') as HTMLInputElement).value = '';
    (document.getElementById('morpheme-label') as HTMLInputElement).value = '';
    (document.getElementById('morpheme-weight') as HTMLInputElement).value = '';
  }

  private searchMorphemes(): void {
    const query = (document.getElementById('morpheme-search') as HTMLInputElement).value;
    const typeFilter = (document.getElementById('morpheme-filter-type') as HTMLSelectElement).value as KeywordType;
    
    let filtered = this.morphemeEntries;

    if (typeFilter) {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }

    if (query?.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(entry => 
        entry.keyword.toLowerCase().includes(searchTerm) ||
        entry.label.toLowerCase().includes(searchTerm)
      );
    }

    this.renderMorphemes(filtered);
    this.showStatus(`검색 결과: ${filtered.length}개의 형태소를 찾았습니다.`, 'success');
  }

  private showAllMorphemes(): void {
    (document.getElementById('morpheme-search') as HTMLInputElement).value = '';
    (document.getElementById('morpheme-filter-type') as HTMLSelectElement).value = '';
    this.renderMorphemes();
    this.showStatus('전체 형태소를 표시합니다.', 'info');
  }

  private renderMorphemes(morphemesToRender?: MorphemeEntry[]): void {
    const morphemes = morphemesToRender || this.morphemeEntries;
    const container = document.getElementById('morphemes-list')!;
    const countElement = document.getElementById('morpheme-count')!;
    
    countElement.textContent = morphemes.length.toString();
    
    if (morphemes.length === 0) {
      container.innerHTML = '<p class="status-info">형태소가 없습니다.</p>';
      return;
    }

    container.innerHTML = morphemes.map(morpheme => {
      const typeInfo = this.keywordTypes.find(t => t.value === morpheme.type);
      return `
        <div class="dictionary-item morpheme-item">
          <div class="item-header">
            <span class="item-type ${morpheme.type}">${typeInfo?.label || morpheme.type}</span>
            <strong class="keyword">${morpheme.keyword}</strong>
            <span class="label">[${morpheme.label}]</span>
            ${morpheme.weight ? `<span class="weight">가중치: ${morpheme.weight}</span>` : ''}
            <button class="btn-danger btn-small" onclick="dictionaryAdmin.deleteMorpheme('${morpheme.id}')">삭제</button>
          </div>
          <div class="item-meta">
            생성: ${new Date(morpheme.created_at).toLocaleString('ko-KR')} | 
            수정: ${new Date(morpheme.updated_at).toLocaleString('ko-KR')}
          </div>
        </div>
      `;
    }).join('');
  }

  public deleteMorpheme(id: string): void {
    if (!confirm('정말로 이 형태소를 삭제하시겠습니까?')) {
      return;
    }

    this.morphemeEntries = this.morphemeEntries.filter(m => m.id !== id);
    this.renderMorphemes();
    this.updateStats();
    this.showStatus('형태소가 삭제되었습니다.', 'success');
  }

  private downloadMorphemes(): void {
    try {
      const headers = ['ID', 'Type', 'Keyword', 'Label', 'Weight', 'Created At', 'Updated At'];
      const csvContent = [
        headers.join(','),
        ...this.morphemeEntries.map(entry => [
          entry.id,
          entry.type,
          `"${entry.keyword}"`,
          `"${entry.label}"`,
          entry.weight || '',
          entry.created_at,
          entry.updated_at
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `morphemes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showStatus('형태소 사전이 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('형태소 다운로드 실패:', error);
      this.showStatus('형태소 다운로드에 실패했습니다.', 'error');
    }
  }

  private async uploadMorphemes(file: File): Promise<void> {
    try {
      this.showStatus('형태소 파일을 읽는 중...', 'info');
      
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        this.showStatus('파일에 데이터가 없습니다.', 'error');
        return;
      }

      const newMorphemes: MorphemeEntry[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < 3) continue;

        const morphemeEntry: MorphemeEntry = {
          id: values[0] || `mor_${Date.now()}_${i}`,
          type: values[1] as KeywordType || 'custom',
          keyword: values[2] || '',
          label: values[3] || '',
          weight: values[4] ? parseFloat(values[4]) : undefined,
          created_at: values[5] || new Date().toISOString(),
          updated_at: values[6] || new Date().toISOString()
        };

        if (morphemeEntry.keyword && morphemeEntry.label) {
          newMorphemes.push(morphemeEntry);
        }
      }

      if (newMorphemes.length === 0) {
        this.showStatus('파일에서 유효한 형태소를 찾을 수 없습니다.', 'error');
        return;
      }

      this.morphemeEntries = newMorphemes;
      this.renderMorphemes();
      this.updateStats();
      this.showStatus(`${newMorphemes.length}개의 형태소를 성공적으로 업로드했습니다.`, 'success');
      
      (document.getElementById('upload-morphemes') as HTMLInputElement).value = '';
      
    } catch (error) {
      console.error('형태소 업로드 실패:', error);
      this.showStatus('형태소 파일 업로드에 실패했습니다.', 'error');
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

  private showStatus(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const statusElement = document.getElementById('status-message')!;
    statusElement.className = `status-${type}`;
    statusElement.textContent = message;

    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = '';
    }, duration);
  }

  // 테스트 데이터 생성 관련 메서드들
  private async generateTestData(): Promise<void> {
    const synonymCount = parseInt((document.getElementById('synonym-count-input') as HTMLInputElement).value) || 50000;
    const morphemeCount = parseInt((document.getElementById('morpheme-count-input') as HTMLInputElement).value) || 50000;

    if (synonymCount + morphemeCount > 200000) {
      this.showStatus('총 데이터 수는 20만개를 초과할 수 없습니다.', 'error');
      return;
    }

    if (!confirm(`${synonymCount}개의 동의어와 ${morphemeCount}개의 형태소를 생성하시겠습니까?\n\n⚠️ 기존 데이터는 모두 삭제됩니다.`)) {
      return;
    }

    const progressDiv = document.getElementById('generation-progress')!;
    const progressFill = document.getElementById('progress-fill')!;
    const progressText = document.getElementById('progress-text')!;
    const generateBtn = document.getElementById('generate-test-data') as HTMLButtonElement;

    try {
      // UI 상태 변경
      generateBtn.disabled = true;
      generateBtn.textContent = '생성 중...';
      progressDiv.style.display = 'block';

      // 기존 데이터 삭제
      this.synonymEntries = [];
      this.morphemeEntries = [];

      const totalItems = synonymCount + morphemeCount;
      let currentProgress = 0;

      // 동의어 생성
      this.showStatus(`동의어 ${synonymCount}개를 생성하는 중...`, 'info', 10000);
      await this.generateSynonyms(synonymCount, (progress) => {
        currentProgress = progress;
        const percentage = (currentProgress / totalItems) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `동의어 생성 중... ${progress}/${synonymCount}`;
      });

      // 형태소 생성
      this.showStatus(`형태소 ${morphemeCount}개를 생성하는 중...`, 'info', 10000);
      await this.generateMorphemes(morphemeCount, (progress) => {
        currentProgress = synonymCount + progress;
        const percentage = (currentProgress / totalItems) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `형태소 생성 중... ${progress}/${morphemeCount}`;
      });

      // 완료
      progressFill.style.width = '100%';
      progressText.textContent = '생성 완료!';
      
      this.renderCurrentTab();
      this.updateStats();
      this.showStatus(`총 ${totalItems}개의 테스트 데이터가 생성되었습니다.`, 'success', 5000);

    } catch (error) {
      console.error('테스트 데이터 생성 실패:', error);
      this.showStatus('테스트 데이터 생성에 실패했습니다.', 'error');
    } finally {
      // UI 상태 복원
      generateBtn.disabled = false;
      generateBtn.textContent = '📦 테스트 데이터 생성';
      setTimeout(() => {
        progressDiv.style.display = 'none';
        progressFill.style.width = '0%';
      }, 2000);
    }
  }

  private async generateSynonyms(count: number, onProgress: (current: number) => void): Promise<void> {
    const batchSize = 1000; // 1000개씩 배치 처리
    const batches = Math.ceil(count / batchSize);

    const brands = ['나이키', '아디다스', '푸마', '리복', '컨버스', '뉴발란스', '반스', '아시아', '휠라', '챔피온'];
    const categories = ['상의', '하의', '아우터', '신발', '가방', '액세서리', '언더웨어', '양말', '모자', '벨트'];
    const products = ['티셔츠', '청바지', '후드티', '스니커즈', '원피스', '셔츠', '조거팬츠', '블레이저', '가디건', '스웨터'];
    const colors = ['검정', '흰색', '빨강', '파랑', '노랑', '초록', '보라', '분홍', '회색', '갈색'];
    const materials = ['면', '폴리에스터', '나일론', '데님', '울', '실크', '리넨', '가죽', '스웨이드', '플리스'];
    const styles = ['캐주얼', '포멀', '스트릿', '빈티지', '모던', '클래식', '미니멀', '보헤미안', '펑크', '프레피'];
    const occasions = ['데일리', '출근', '운동', '파티', '여행', '데이트', '홈웨어', '비치웨어', '스포츠', '아웃도어'];
    const seasons = ['봄', '여름', '가을', '겨울', '사계절', '봄여름', '가을겨울', '하프시즌', '겨울용', '여름용'];

    const keywordSets = [
      { type: 'brand' as KeywordType, words: brands },
      { type: 'category' as KeywordType, words: categories },
      { type: 'product' as KeywordType, words: products },
      { type: 'color' as KeywordType, words: colors },
      { type: 'material' as KeywordType, words: materials },
      { type: 'style' as KeywordType, words: styles },
      { type: 'occasion' as KeywordType, words: occasions },
      { type: 'season' as KeywordType, words: seasons }
    ];

    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, count);
      const batchItems: SynonymEntry[] = [];

      for (let i = batchStart; i < batchEnd; i++) {
        const keywordSet = keywordSets[i % keywordSets.length];
        const baseWord = keywordSet.words[Math.floor(Math.random() * keywordSet.words.length)];
        
        // 동의어 생성
        const synonyms = this.generateSynonymsForWord(baseWord, keywordSet.type);
        
        const synonymEntry: SynonymEntry = {
          id: `syn_${Date.now()}_${i}`,
          type: keywordSet.type,
          mainKeyword: `${baseWord}_${i}`,
          synonyms: synonyms,
          description: `테스트 데이터 - ${keywordSet.type} 타입`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        batchItems.push(synonymEntry);
      }

      this.synonymEntries.push(...batchItems);
      onProgress(batchEnd);

      // 다음 배치 전에 잠시 대기 (UI 블로킹 방지)
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  private async generateMorphemes(count: number, onProgress: (current: number) => void): Promise<void> {
    const batchSize = 1000;
    const batches = Math.ceil(count / batchSize);

    const keywordTypes: KeywordType[] = ['brand', 'category', 'product', 'color', 'material', 'style', 'occasion', 'season'];
    const labelPrefixes: Record<string, string> = {
      'brand': 'BRAND',
      'category': 'CATEGORY', 
      'product': 'PRODUCT',
      'color': 'COLOR',
      'material': 'MATERIAL',
      'style': 'STYLE',
      'occasion': 'OCCASION',
      'season': 'SEASON',
      'custom': 'CUSTOM'
    };

    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, count);
      const batchItems: MorphemeEntry[] = [];

      for (let i = batchStart; i < batchEnd; i++) {
        const type = keywordTypes[i % keywordTypes.length];
        const weight = Math.random() * 10 + 1; // 1-11 사이의 가중치

        const morphemeEntry: MorphemeEntry = {
          id: `mor_${Date.now()}_${i}`,
          type: type,
          keyword: `키워드_${type}_${i}`,
          label: `${labelPrefixes[type]}_NAME`,
          weight: Math.round(weight * 10) / 10, // 소수점 첫째 자리까지
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        batchItems.push(morphemeEntry);
      }

      this.morphemeEntries.push(...batchItems);
      onProgress(batchEnd);

      // 다음 배치 전에 잠시 대기
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  private generateSynonymsForWord(baseWord: string, type: KeywordType): string[] {
    const synonyms: string[] = [];
    
    // 타입별 동의어 패턴 생성
    switch (type) {
      case 'brand':
        synonyms.push(
          baseWord.toLowerCase(),
          baseWord.toUpperCase(),
          `${baseWord}_브랜드`,
          `${baseWord}브렌드`
        );
        break;
      case 'color':
        synonyms.push(
          `${baseWord}색`,
          `${baseWord}계열`,
          `${baseWord}톤`,
          baseWord.toLowerCase()
        );
        break;
      case 'category':
        synonyms.push(
          `${baseWord}류`,
          `${baseWord}계열`,
          baseWord.toLowerCase(),
          baseWord.toUpperCase()
        );
        break;
      default:
        synonyms.push(
          baseWord.toLowerCase(),
          baseWord.toUpperCase(),
          `${baseWord}_alt`,
          `alt_${baseWord}`
        );
    }

    // 랜덤 동의어 추가
    const randomSuffixes = ['_v1', '_v2', '_alt', '_syn', '_var'];
    const numRandomSynonyms = Math.floor(Math.random() * 3) + 2; // 2-4개
    
    for (let i = 0; i < numRandomSynonyms; i++) {
      const suffix = randomSuffixes[Math.floor(Math.random() * randomSuffixes.length)];
      synonyms.push(`${baseWord}${suffix}${i}`);
    }

    return synonyms.slice(0, 8); // 최대 8개의 동의어
  }

  private clearAllData(): void {
    if (!confirm('정말로 모든 데이터를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    this.synonymEntries = [];
    this.morphemeEntries = [];
    
    this.renderCurrentTab();
    this.updateStats();
    this.showStatus('모든 데이터가 삭제되었습니다.', 'success');
  }
}
