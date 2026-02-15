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
                <li><strong>이동</strong>: 키보드 방향키(↑, ↓, ←, →)를 사용하여 움직이세요.</li>
                <li><strong>목표</strong>: 사방에서 몰려오는 적들을 피해 최대한 오래 살아남으세요!</li>
                <li><strong>성장</strong>: 적을 피하며 점수를 획득하고, 상점에서 강력한 보너스를 챙기세요.</li>
              </ul>
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
                <p className="item-desc">오늘의 행운! 이동 속도가 1.5배로 증가합니다.</p>
                <button
                  className="claim-button"
                  onClick={() => {
                    if (window.applyGameReward) {
                      window.applyGameReward('SPEED_BOOST');
                      alert('이동 속도가 1.5배 증가했습니다! ⚡');
                    }
                  }}
                >
                  지금 받기
                </button>
              </div>

              <div className="item">
                <span className="item-name">황금 영웅 팩</span>
                <span className="item-price">$4.99</span>
                <p className="item-desc">모든 능력치 +20% 증가 및 전용 스킨</p>
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
                        if (window.applyGameReward) {
                          window.applyGameReward('GOLDEN_HERO');
                          alert(`${details.payer.name.given_name} 님, 황금 영웅으로 변신했습니다! ✨`);
                        }
                      });
                    }}
                  />
                </div>
              </div>

              <div className="item">
                <span className="item-name">무한 부활권</span>
                <span className="item-price">$1.99</span>
                <p className="item-desc">죽어도 5초간 무적 상태로 부활합니다!</p>
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
                        if (window.applyGameReward) {
                          window.applyGameReward('RESURRECT');
                          alert(`부활권 구매 완료! 5초간 무적 상태가 됩니다. 👻`);
                        }
                      });
                    }}
                  />
                </div>
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
