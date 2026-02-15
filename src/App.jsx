import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import GameComponent from './GameComponent';
import './App.css';

function App() {
  const initialOptions = {
    // 환경 변수에서 실제 Client ID를 읽어오도록 설정
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  // 아이템 구매 내역을 localStorage에 저장하는 유틸리티 함수
  const savePurchase = (itemKey) => {
    const saved = localStorage.getItem('void_survivor_purchases');
    const purchases = saved ? JSON.parse(saved) : [];
    if (!purchases.includes(itemKey)) {
      purchases.push(itemKey);
      localStorage.setItem('void_survivor_purchases', JSON.stringify(purchases));
    }
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="container">
        <header className="header">
          <h1>VOID SURVIVOR</h1>
          <p className="subtitle">글로벌 하이퍼 캐주얼 로그라이크</p>
        </header>

        <main className="main-layout">
          <div className="game-section">
            <div className="how-to-play">
              <h3>🎮 게임 방법 (How to Play)</h3>
              <ul>
                <li><strong>조작법</strong>: <strong>방향키(↑ ↓ ← →)</strong>를 이용해 캐릭터를 자유롭게 움직이세요.</li>
                <li><strong>생존 법칙</strong>: 사면초가! 사방에서 조여오는 적들을 피해 <strong>최대한 오래 생존</strong>해야 합니다.</li>
                <li><strong>강화 전략</strong>: 생존 시간에 따라 점수가 쌓이며, <strong>프리미엄 상점</strong>의 아이템으로 한계를 돌파하세요.</li>
              </ul>
            </div>

            {/* 가상 글로벌 랭킹 섹션 추가 */}
            <div className="hall-of-fame">
              <h3>🏆 Hall of Fame (Global)</h3>
              <div className="ranking-list">
                <div className="rank-item gold">
                  <span className="rank-num">1</span>
                  <span className="rank-flag">🇺🇸</span>
                  <span className="rank-id">ShadowMaster</span>
                  <span className="rank-score">12,450</span>
                </div>
                <div className="rank-item silver">
                  <span className="rank-num">2</span>
                  <span className="rank-flag">🇰🇷</span>
                  <span className="rank-id">K-Survivor</span>
                  <span className="rank-score">10,890</span>
                </div>
                <div className="rank-item bronze">
                  <span className="rank-num">3</span>
                  <span className="rank-flag">🇯🇵</span>
                  <span className="rank-id">NeonNinja</span>
                  <span className="rank-score">9,120</span>
                </div>
                <div className="rank-item">
                  <span className="rank-num">4</span>
                  <span className="rank-flag">🇩🇪</span>
                  <span className="rank-id">VoidWalker</span>
                  <span className="rank-score">7,540</span>
                </div>
                <div className="rank-item">
                  <span className="rank-num">5</span>
                  <span className="rank-flag">🇫🇷</span>
                  <span className="rank-id">StarDust</span>
                  <span className="rank-score">6,210</span>
                </div>
              </div>
              <p className="ranking-footer">전 세계 12,453명의 생존자가 경쟁 중입니다!</p>
            </div>

            <GameComponent />
          </div>

          <aside className="premium-shop">
            <div className="shop-card">
              <h2>프리미엄 상점</h2>

              {/* 무료 보상 섹션 추가 */}
              <div className="item free-gift">
                <span className="item-name">무료 일일 보너스</span>
                <span className="item-price">FREE</span>
                <p className="item-desc">오늘의 행운! 이동 속도가 즉시 1.5배 빨라집니다.</p>
                <button
                  className="claim-button"
                  onClick={() => {
                    if (window.applyGameReward) {
                      window.applyGameReward('SPEED_BOOST');
                      alert('신속의 축복! 이동 속도가 1.5배 빨라졌습니다! ⚡');
                    }
                  }}
                >
                  지금 받기
                </button>
              </div>

              <div className="item">
                <span className="item-name">황금 영웅 팩</span>
                <span className="item-price">$4.99</span>
                <p className="item-desc">위엄 있는 황금 영웅으로 변신! 모든 능력치가 20% 영구 상승합니다.</p>
                <div className="pay-button">
                  <PayPalButtons
                    style={{ layout: "vertical", height: 40 }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: "4.99",
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then((details) => {
                        savePurchase('GOLDEN_HERO'); // 결제 정보 영구 저장
                        if (window.applyGameReward) {
                          window.applyGameReward('GOLDEN_HERO');
                          alert(`전설의 탄생! ${details.payer.name.given_name} 님이 황금 영웅으로 각성했습니다! ✨`);
                        }
                      });
                    }}
                  />
                </div>
              </div>

              <div className="item">
                <span className="item-name">무한 부활권</span>
                <span className="item-price">$1.99</span>
                <p className="item-desc">죽음은 끝이 아닙니다. 부활 시 5초간 무적 상태가 되어 반격하세요!</p>
                <div className="pay-button">
                  <PayPalButtons
                    style={{ layout: "vertical", height: 40 }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: "1.99",
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then((details) => {
                        savePurchase('RESURRECT'); // 결제 정보 영구 저장
                        if (window.applyGameReward) {
                          window.applyGameReward('RESURRECT');
                          alert(`불사조의 가호! 부활과 함께 5초간 무적 상태가 됩니다. 👻`);
                        }
                      });
                    }}
                  />
                </div>
              </div>

              {/* 혜택 비교 가이드 추가 */}
              <div className="benefit-comparison">
                <h4>🏆 프리미엄 혜택 가이드</h4>
                <div className="comparison-table">
                  <div className="comp-row head">
                    <span>기능</span>
                    <span>FREE</span>
                    <span>PREMIUM</span>
                  </div>
                  <div className="comp-row">
                    <span>이동 속도</span>
                    <span>1.5배 (임시)</span>
                    <span><strong>영구 버프</strong></span>
                  </div>
                  <div className="comp-row">
                    <span>부활 기회</span>
                    <span>없음</span>
                    <span><strong>무한 부활</strong></span>
                  </div>
                  <div className="comp-row">
                    <span>캐릭터 스킨</span>
                    <span>기본</span>
                    <span><strong>황금 아우라</strong></span>
                  </div>
                </div>
                <p className="marketing-text">"무료는 체험일 뿐, 진정한 랭커는 프리미엄으로 완성됩니다."</p>
              </div>
            </div>
          </aside>
        </main>

        <footer className="footer">
          <p>© 2026 Void Survivor Studio. All Rights Reserved.</p>
        </footer>
      </div>
    </PayPalScriptProvider>
  )
}

export default App
