# GitHub Pages 배포 가이드

## 1. GitHub 저장소 생성
GitHub에서 새 저장소를 생성하세요:
- Repository name: `Standalone-WebApp` (또는 원하는 이름)
- Public으로 설정 (GitHub Pages 무료 사용을 위해)

## 2. 로컬 저장소를 GitHub에 연결
```bash
git remote add origin https://github.com/YOUR_USERNAME/Standalone-WebApp.git
git branch -M main
git push -u origin main
```

## 3. GitHub Pages 설정
1. GitHub 저장소 → Settings 탭
2. Pages 섹션으로 이동
3. Source: "GitHub Actions" 선택

## 4. 자동 배포
- 코드를 main 브랜치에 푸시하면 자동으로 GitHub Actions가 실행됩니다
- 빌드 완료 후 `https://YOUR_USERNAME.github.io/Standalone-WebApp/`에서 접근 가능

## 5. 수동 배포 (대안)
gh-pages 패키지를 사용한 수동 배포:
```bash
npm install
npm run deploy
```

## 현재 상태
✅ Git 저장소 초기화 완료
✅ 프로젝트 빌드 완료 (dist/ 폴더)
✅ GitHub Actions 워크플로우 설정 완료
✅ Vite 설정에 GitHub Pages base path 추가

## 다음 단계
1. GitHub에서 새 저장소 생성
2. 위의 git 명령어로 푸시
3. GitHub Pages 설정에서 "GitHub Actions" 선택
4. 자동 배포 완료!
