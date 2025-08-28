# Google Sheets Keyword Admin

TypeScript 기반의 정적 파일 배포로 작동하는 Google Sheets 키워드 관리 어드민 페이지입니다.

## 기능

- **키워드 관리**: Google Sheets의 키워드를 추가, 검색, 삭제할 수 있습니다
- **실시간 검색**: 키워드, 카테고리, 동의어를 기준으로 실시간 검색이 가능합니다
- **설정 관리**: Google Sheets API 연결 설정을 웹 인터페이스에서 직접 관리할 수 있습니다
- **정적 배포**: 서버 없이 정적 파일만으로 배포 가능합니다
- **시트 초기화**: 헤더가 없는 시트를 자동으로 초기화할 수 있습니다

## 프로젝트 구조

```
src/
├── admin/
│   ├── types.ts                 # TypeScript 타입 정의
│   ├── GoogleSheetsService.ts   # Google Sheets API 통신 서비스
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

## Google Sheets 설정

### 1. Google Cloud Console에서 API 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Google Sheets API 활성화:
   - API 및 서비스 → 라이브러리
   - "Google Sheets API" 검색 후 활성화
4. API 키 생성:
   - API 및 서비스 → 사용자 인증 정보
   - "사용자 인증 정보 만들기" → "API 키"
   - 생성된 API 키를 복사

### 2. Google Sheets 스프레드시트 준비

1. [Google Sheets](https://sheets.google.com/)에서 새 스프레드시트 생성
2. 스프레드시트 URL에서 ID 확인:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
3. 스프레드시트를 공개로 설정:
   - 공유 → "링크가 있는 모든 사용자" 권한 부여
4. 시트 이름 확인 (기본값: "Sheet1", 권장값: "Keywords")

### 3. 어드민 페이지에서 설정

어드민 페이지에서 다음 정보를 입력:

- **Google Sheets API Key**: 생성한 API 키
- **스프레드시트 ID**: URL에서 추출한 ID
- **시트 이름**: 키워드를 저장할 시트 이름 (기본값: Keywords)

## 키워드 데이터 구조

Google Sheets의 열 구조:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | Term | Category | Boost | Synonyms | Created At | Updated At |
| kw_1 | typescript | programming | 1.5 | ts, javascript with types | 2024-01-01T00:00:00Z | 2024-01-01T00:00:00Z |

TypeScript 인터페이스:
```typescript
interface Keyword {
  id: string;           // 고유 ID
  term: string;         // 키워드
  category: string;     // 카테고리
  boost?: number;       // 검색 가중치 (선택사항)
  synonyms?: string[];  // 동의어 목록 (선택사항)
  created_at: string;   // 생성 시간
  updated_at: string;   // 수정 시간
}
```

## 사용법

1. **Google Sheets 설정**: 페이지 상단에서 API 키, 스프레드시트 ID, 시트 이름을 입력하고 저장
2. **연결 테스트**: "연결 테스트" 버튼으로 Google Sheets 연결 확인
3. **시트 초기화**: 헤더가 없는 경우 "시트 초기화" 버튼으로 헤더 행 생성
4. **키워드 검색**: 검색 입력창에서 키워드, 카테고리, 동의어로 검색
5. **키워드 추가**: 새 키워드 추가 섹션에서 정보를 입력하고 추가
6. **키워드 삭제**: 키워드 목록에서 삭제 버튼을 클릭하여 삭제

### API 연동

Google Sheets API v4를 직접 사용하여 통신합니다:

- `GET /v4/spreadsheets/{spreadsheetId}/values/{range}`: 데이터 읽기
- `POST /v4/spreadsheets/{spreadsheetId}/values/{range}:append`: 새 행 추가
- `PUT /v4/spreadsheets/{spreadsheetId}/values/{range}`: 행 업데이트

### 로컬 개발 모드

Google Sheets 연결이 실패하는 경우 자동으로 목 데이터(Mock Data)로 전환되어 개발과 데모가 가능합니다.

## 라이선스

MIT License
