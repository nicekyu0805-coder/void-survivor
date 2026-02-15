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
            <GameComponent />

            <div className="how-to-play">
              <h3>🎮 게임 방법 (How to Play)</h3>
              <ul>
                <li><strong>PC 조작</strong>: <strong>방향키(↑ ↓ ← →)</strong>로 캐릭터를 정밀하게 움직이세요.</li>
                <li><strong>모바일 조작</strong>: 화면 왼쪽 하단의 <strong>가상 조이스틱</strong>을 드래그하여 움직이세요! 손가락이 캐릭터를 가리지 않아 편리합니다.</li>
                <li><strong>전체 화면</strong>: 우측 상단의 <strong>[ Fullscreen ]</strong>을 터치해 몰입감 넘치는 전체 화면으로 즐기세요!</li>
                <li><strong>자동 사격</strong>: 프리미엄 아이템 장착 시 <strong>자동으로 가장 가까운 적</strong>을 조준 사격합니다. 조작은 오직 이동에만 집중하세요!</li>
              </ul>
            </div>

            <div className="hall-of-fame">
              <h3>🏆 Hall of Fame (Global)</h3>
              <div className="ranking-list">
                <div className="rank-item gold"><span className="rank-num">1</span><span className="rank-flag">🇺🇸</span><span className="rank-id">ShadowMaster</span><span className="rank-score">12,450</span></div>
                <div className="rank-item silver"><span className="rank-num">2</span><span className="rank-flag">🇰🇷</span><span className="rank-id">K-Survivor</span><span className="rank-score">10,890</span></div>
                <div className="rank-item bronze"><span className="rank-num">3</span><span className="rank-flag">🇯🇵</span><span className="rank-id">NeonNinja</span><span className="rank-score">9,120</span></div>
              </div>
            </div>
          </div>

          <aside className="premium-shop">
            <div className="shop-card">
              <h2>프리미엄 상점</h2>
              <div className="item free-gift">
                <span className="item-name">무료 일일 보너스</span>
                <span className="item-price">FREE</span>
                <p className="item-desc">오늘의 행운! 이동 속도가 즉시 1.5배 빨라집니다.</p>
                <button className="claim-button" onClick={() => { if (window.applyGameReward) { window.applyGameReward('SPEED_BOOST'); alert('신속의 축복! ⚡'); } }}>지금 받기</button>
              </div>

              <div className="item">
                <span className="item-name">황금 영웅 팩</span>
                <span className="item-price">$4.99</span>
                <p className="item-desc">능력치 20% 영구 상승!</p>
                <div className="pay-button"><PayPalButtons style={{ layout: "vertical", height: 40 }} createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: "4.99" } }] })} onApprove={(data, actions) => actions.order.capture().then(() => { savePurchase('GOLDEN_HERO'); if (window.applyGameReward) window.applyGameReward('GOLDEN_HERO'); })} /></div>
              </div>

              <div className="item">
                <span className="item-name">무한 부활권</span>
                <span className="item-price">$1.99</span>
                <p className="item-desc">부활 시 5초 무적!</p>
                <div className="pay-button"><PayPalButtons style={{ layout: "vertical", height: 40 }} createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: "1.99" } }] })} onApprove={(data, actions) => actions.order.capture().then(() => { savePurchase('RESURRECT'); if (window.applyGameReward) window.applyGameReward('RESURRECT'); })} /></div>
              </div>
            </div>
          </aside>
        </main>

        <footer className="footer" style={{ position: 'relative' }}>
          <p>© 2026 Void Survivor Studio. All Rights Reserved.</p>

          {/* 캐시 확인용 전역 배지 */}
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#ff00ff',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: '50px',
            fontWeight: '900',
            fontSize: '14px',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.8)',
            zIndex: 10000,
            pointerEvents: 'none',
            fontFamily: 'sans-serif'
          }} id="v3-badge">
            SERVER LIVE: v3.2 (Smart) ✅
          </div>
          <style>{`
            #v3-badge { animation: v3-pulse 2s infinite; }
            @keyframes v3-pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.9; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </footer>
      </div>
    </PayPalScriptProvider>
  )
}

export default App
