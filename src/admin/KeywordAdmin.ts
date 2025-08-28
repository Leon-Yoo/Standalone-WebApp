import { Keyword, ElasticsearchConfig } from './types';
import { ElasticsearchService } from './ElasticsearchService';

export class ElasticsearchKeywordAdmin {
  private container: HTMLElement;
  private elasticsearchService: ElasticsearchService;
  private keywords: Keyword[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    
    // 기본 Elasticsearch 설정 (환경변수나 설정 파일에서 가져올 수 있음)
    const config: ElasticsearchConfig = {
      endpoint: 'http://localhost:9200', // 개발 환경 기본값
      index: 'keywords',
      apiKey: undefined // 필요에 따라 설정
    };
    
    this.elasticsearchService = new ElasticsearchService(config);
  }

  async init(): Promise<void> {
    this.render();
    await this.loadKeywords();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="admin-container">
        <h2>Elasticsearch Keyword Management</h2>
        
        <!-- 설정 섹션 -->
        <div class="config-section">
          <h3>Elasticsearch 설정</h3>
          <div class="keyword-form">
            <input type="text" id="es-endpoint" placeholder="Elasticsearch Endpoint (예: http://localhost:9200)" />
            <input type="text" id="es-index" placeholder="Index Name (예: keywords)" />
            <input type="text" id="es-apikey" placeholder="API Key (선택사항)" />
            <button id="save-config">설정 저장</button>
          </div>
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
    const endpoint = (document.getElementById('es-endpoint') as HTMLInputElement).value;
    const index = (document.getElementById('es-index') as HTMLInputElement).value;
    const apiKey = (document.getElementById('es-apikey') as HTMLInputElement).value;

    if (endpoint && index) {
      const config: ElasticsearchConfig = {
        endpoint,
        index,
        apiKey: apiKey || undefined
      };
      
      this.elasticsearchService = new ElasticsearchService(config);
      
      // 로컬 스토리지에 설정 저장
      localStorage.setItem('es-config', JSON.stringify(config));
      
      alert('설정이 저장되었습니다.');
      this.loadKeywords();
    } else {
      alert('Endpoint와 Index는 필수입니다.');
    }
  }

  private async loadKeywords(): Promise<void> {
    try {
      // 저장된 설정 로드
      const savedConfig = localStorage.getItem('es-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        (document.getElementById('es-endpoint') as HTMLInputElement).value = config.endpoint;
        (document.getElementById('es-index') as HTMLInputElement).value = config.index;
        (document.getElementById('es-apikey') as HTMLInputElement).value = config.apiKey || '';
      }

      this.keywords = await this.elasticsearchService.searchKeywords();
      this.renderKeywords();
    } catch (error) {
      console.error('키워드 로딩 실패:', error);
      document.getElementById('keywords-container')!.innerHTML = 
        '<p>키워드를 로딩할 수 없습니다. Elasticsearch 설정을 확인해주세요.</p>';
    }
  }

  private async search(): Promise<void> {
    const query = (document.getElementById('search-input') as HTMLInputElement).value;
    try {
      this.keywords = await this.elasticsearchService.searchKeywords(query);
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
      alert('키워드와 카테고리는 필수입니다.');
      return;
    }

    try {
      const newKeyword = await this.elasticsearchService.createKeyword({
        term,
        category,
        boost: boostInput ? parseFloat(boostInput) : undefined,
        synonyms: synonymsInput ? synonymsInput.split(',').map(s => s.trim()) : undefined
      });

      this.keywords.unshift(newKeyword);
      this.renderKeywords();
      this.clearForm();
      alert('키워드가 추가되었습니다.');
    } catch (error) {
      console.error('키워드 추가 실패:', error);
      alert('키워드 추가에 실패했습니다.');
    }
  }

  private async handleDeleteKeyword(id: string): Promise<void> {
    if (!confirm('정말로 이 키워드를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await this.elasticsearchService.deleteKeyword(id);
      this.keywords = this.keywords.filter(k => k.id !== id);
      this.renderKeywords();
      alert('키워드가 삭제되었습니다.');
    } catch (error) {
      console.error('키워드 삭제 실패:', error);
      alert('키워드 삭제에 실패했습니다.');
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
