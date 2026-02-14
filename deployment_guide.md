# Vercel 글로벌 배포 가이드

본 가이드는 현재 제작된 'Void Survivor' 게임을 전 세계에 라이브로 배포하는 방법을 설명합니다.

## 1단계: 빌드 테스트
터미널에서 다음 명령어를 실행하여 배포용 파일이 정상적으로 생성되는지 확인합니다.
```powershell
npm run build
```
성공하면 `dist` 폴더가 생성됩니다.

## 2단계: Vercel 계정 생성 및 프로젝트 연결
1. [Vercel 공식 사이트](https://vercel.com)에 가입합니다 (GitHub 계정 권장).
2. 'Add New' -> 'Project'를 클릭합니다.
3. 현재 게임 코드가 담긴 GitHub 저장소를 임포트합니다.

## 3단계: 환경 변수 설정
PayPal 실제 결제를 위해서는 Vercel 대시보드의 'Environment Variables' 섹션에 다음을 추가해야 합니다.
- `VITE_PAYPAL_CLIENT_ID`: PayPal Developer에서 발급받은 실제(Live) Client ID

## 4단계: 배포 완료
'Deploy' 버튼을 누르면 전 세계 어디서든 접속 가능한 URL(예: `void-survivor.vercel.app`)이 생성됩니다!
