# Elasticsearch Keyword Admin

TypeScript 기반의 정적 파일 배포로 작동하는 Elasticsearch 키워드 관리 어드민 페이지입니다.

## 기능

- **키워드 관리**: Elasticsearch 인덱스의 키워드를 추가, 검색, 삭제할 수 있습니다
- **실시간 검색**: 키워드, 카테고리, 동의어를 기준으로 실시간 검색이 가능합니다
- **설정 관리**: Elasticsearch 연결 설정을 웹 인터페이스에서 직접 관리할 수 있습니다
- **정적 배포**: 서버 없이 정적 파일만으로 배포 가능합니다

## 프로젝트 구조

```
src/
├── admin/
│   ├── types.ts                 # TypeScript 타입 정의
│   ├── ElasticsearchService.ts  # Elasticsearch API 통신 서비스
│   └── KeywordAdmin.ts          # 메인 어드민 페이지 클래스
├── main.ts                      # 애플리케이션 진입점
└── style.css                    # 스타일시트
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성되며, 이 폴더의 내용을 웹 서버에 배포하면 됩니다.

## Elasticsearch 설정

### 개발 환경 설정

1. 로컬 Elasticsearch 실행 (Docker 사용 예시):
```bash
docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" elasticsearch:8.11.0
```

2. CORS 설정을 위해 elasticsearch.yml에 다음 추가:
```yaml
http.cors.enabled: true
http.cors.allow-origin: "*"
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
```

### 프로덕션 환경 설정

어드민 페이지에서 다음 정보를 입력하여 Elasticsearch에 연결:

- **Endpoint**: Elasticsearch 클러스터 URL (예: `https://your-es-cluster.com:9200`)
- **Index**: 키워드를 저장할 인덱스 이름 (예: `keywords`)
- **API Key**: Elasticsearch API 키 (보안이 활성화된 경우)

## 키워드 데이터 구조

```typescript
interface Keyword {
  id: string;           // 문서 ID
  term: string;         // 키워드
  category: string;     // 카테고리
  boost?: number;       // 검색 가중치 (선택사항)
  synonyms?: string[];  // 동의어 목록 (선택사항)
  created_at: string;   // 생성 시간
  updated_at: string;   // 수정 시간
}
```

## 사용법

1. **Elasticsearch 설정**: 페이지 상단에서 Elasticsearch 연결 정보를 입력하고 저장
2. **키워드 검색**: 검색 입력창에서 키워드, 카테고리, 동의어로 검색
3. **키워드 추가**: 새 키워드 추가 섹션에서 정보를 입력하고 추가
4. **키워드 삭제**: 키워드 목록에서 삭제 버튼을 클릭하여 삭제

## 배포

### 정적 호스팅 서비스 (권장)

- **Vercel**: `npm run build` 후 `dist` 폴더 배포
- **Netlify**: `dist` 폴더를 드래그 앤 드롭으로 배포
- **GitHub Pages**: `dist` 폴더 내용을 `gh-pages` 브랜치에 푸시

### 일반 웹 서버

```bash
# 빌드
npm run build

# dist 폴더 내용을 웹 서버 루트에 복사
cp -r dist/* /var/www/html/
```

## 개발

### 기술 스택

- **TypeScript**: 타입 안전성과 개발 경험 향상
- **Vite**: 빠른 개발 서버와 최적화된 빌드
- **Vanilla JS**: 프레임워크 없이 가벼운 구현
- **CSS**: 반응형 디자인과 다크/라이트 테마 지원

### API 연동

Elasticsearch REST API를 직접 사용하여 통신합니다:

- `GET /{index}/_search`: 키워드 검색
- `POST /{index}/_doc`: 새 키워드 추가
- `POST /{index}/_doc/{id}/_update`: 키워드 수정
- `DELETE /{index}/_doc/{id}`: 키워드 삭제

### 로컬 개발 모드

Elasticsearch가 연결되지 않는 경우 자동으로 목 데이터(Mock Data)로 전환되어 개발과 데모가 가능합니다.

## 라이선스

MIT License
