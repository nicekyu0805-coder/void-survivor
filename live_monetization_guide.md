# PayPal 실결제(Live) 전환 및 정산 가이드

배포를 축하드립니다! 이제 실제 수익을 창출하기 위해 결제 시스템을 테스트 모드에서 **라이브(실제 결제) 모드**로 전환해야 합니다.

## 1. PayPal 라이브 Client ID 발급
1. [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)에 로그인합니다.
2. 'Apps & Credentials' 메뉴에서 좌측 상단의 토글을 **'Live'**로 변경합니다.
3. 'Create App'을 클릭하여 새로운 앱(예: Void Survivor Live)을 만듭니다.
4. 생성된 **'Client ID'**를 복사합니다.

## 2. Vercel에서 실제 ID 적용
현재 게임 코드에는 테스트용 ID가 입력되어 있습니다. 이를 사용자님의 실제 ID로 교체해야 합니다.
1. [Vercel 대시보드](https://vercel.com) -> 프로젝트 선택 -> 'Settings' -> 'Environment Variables'로 이동합니다.
2. 새 변수를 추가합니다:
   - **Key**: `VITE_PAYPAL_CLIENT_ID`
   - **Value**: 방금 복사한 PayPal 라이브 Client ID
3. 'Add'를 누른 후, 프로젝트를 다시 배포(Deploy)하거나 'Redeploy'를 진행합니다.

## 3. 대금 수령 및 국내 인출 방법
1. **수익 확인**: 결제가 발생하면 등록하신 PayPal 비즈니스 계정 이메일로 알림이 오며, PayPal 잔액(Balance)에 즉시 반영됩니다.
2. **은행 계좌 연결**: PayPal 대지보드에서 '전자지갑' -> '은행 계좌 연결' 섹션에서 국내 은행(예: 신한, 국민 등)의 **SWIFT 코드**와 함께 계좌를 등록합니다.
3. **자금 인출**: '자금 인출' 버튼을 누르면 약 3~5 영업일 이내에 한국 계좌로 원화(KRW)로 환전되어 입금됩니다.

## 주의 사항
> [!IMPORTANT]
> 실제 결제가 정상적으로 작동하는지 확인하기 위해, 가족이나 지인의 계정으로 $1 정도의 최소 금액 결제를 직접 테스트해 보시는 것을 권장합니다.
