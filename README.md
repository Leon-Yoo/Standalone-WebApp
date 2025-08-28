# Excel Keyword Admin

TypeScript 기반의 정적 파일 배포로 작동하는 Excel 키워드 관리 어드민 페이지입니다.

## 기능

- **키워드 관리**: Excel 파일을 통해 키워드를 추가, 검색, 삭제할 수 있습니다
- **Excel 다운로드**: 현재 키워드 데이터를 CSV 형식으로 다운로드
- **Excel 업로드**: 수정한 CSV/Excel 파일을 업로드하여 데이터 갱신
- **실시간 검색**: 키워드, 카테고리, 동의어를 기준으로 실시간 검색이 가능합니다
- **정적 배포**: 서버 없이 정적 파일만으로 배포 가능합니다
- **데이터 초기화**: 모든 데이터를 삭제하고 샘플 데이터로 복원

## 프로젝트 구조

```
src/
├── admin/
│   ├── types.ts                 # TypeScript 타입 정의
│   └── ExcelKeywordAdmin.ts     # 메인 Excel 키워드 관리 클래스
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

## Excel 파일 관리

### 1. Excel 다운로드

현재 키워드 데이터를 CSV 형식으로 다운로드할 수 있습니다:
- **다운로드 버튼**: "📥 Excel 다운로드" 클릭
- **파일 형식**: CSV (Excel에서 열 수 있음)
- **파일명**: `keywords_YYYY-MM-DD.csv`

### 2. Excel 편집

다운로드한 파일을 다음 프로그램으로 편집 가능:
- Microsoft Excel
- Google Sheets
- LibreOffice Calc
- 기타 스프레드시트 프로그램

### 3. Excel 업로드

편집한 파일을 업로드하여 데이터 갱신:
- **업로드 버튼**: "📤 Excel 업로드" 클릭
- **지원 형식**: .xlsx, .csv
- **자동 파싱**: 헤더 행 자동 인식

### 4. 데이터 형식

| 열 이름 | 설명 | 필수 | 예시 |
|---------|------|------|------|
| ID | 고유 식별자 | 선택 | kw_1 |
| Term | 키워드 | 필수 | typescript |
| Category | 카테고리 | 필수 | programming |
| Boost | 검색 가중치 | 선택 | 1.5 |
| Synonyms | 동의어 (세미콜론 구분) | 선택 | ts; javascript with types |
| Created At | 생성 시간 | 자동 | 2024-01-01T00:00:00Z |
| Updated At | 수정 시간 | 자동 | 2024-01-01T00:00:00Z |

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

1. **Excel 다운로드**: "📥 Excel 다운로드" 버튼으로 현재 데이터를 다운로드
2. **데이터 편집**: Excel, Google Sheets 등에서 다운로드한 파일 수정
3. **Excel 업로드**: "📤 Excel 업로드" 버튼으로 수정한 파일 업로드
4. **키워드 검색**: 검색 입력창에서 키워드, 카테고리, 동의어로 검색
5. **키워드 추가**: 새 키워드 추가 섹션에서 정보를 입력하고 추가
6. **키워드 삭제**: 키워드 목록에서 삭제 버튼을 클릭하여 삭제
7. **데이터 초기화**: "🗑️ 데이터 초기화" 버튼으로 샘플 데이터로 복원

### 로컬 데이터 관리

- **브라우저 저장**: 데이터는 브라우저 메모리에 저장되며 새로고침하면 초기화
- **지속성**: Excel 파일로 내보내기/가져오기를 통해 데이터 지속성 확보
- **백업**: 정기적으로 Excel 다운로드하여 백업 권장

## 라이선스

MIT License
