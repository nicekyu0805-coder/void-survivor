import React, { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import GameComponent from './GameComponent';
import './App.css';

function App() {
  const [user, setUser] = useState(localStorage.getItem('void_user') || '');
  const [nicknameInput, setNicknameInput] = useState('');
  const [trialStart, setTrialStart] = useState(localStorage.getItem('void_trial_start') || '');
  const [isExpired, setIsExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');

  const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  // 체험판 기간 체크 (72시간)
  useEffect(() => {
    if (user && trialStart) {
      const checkTrial = () => {
        const now = new Date().getTime();
        const start = parseInt(trialStart);
        const diff = now - start;
        const totalTrial = 72 * 60 * 60 * 1000; // 3일

        if (diff > totalTrial) {
          setIsExpired(true);
          setRemainingTime('EXP');
        } else {
          const remaining = totalTrial - diff;
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          setRemainingTime(`${Math.floor(hours / 24)}d ${hours % 24}h ${mins}m`);
        }
      };

      checkTrial();
      const timer = setInterval(checkTrial, 60000); // 1분마다 갱신
      return () => clearInterval(timer);
    }
  }, [user, trialStart]);

  const handleLogin = () => {
    if (nicknameInput.trim().length < 2) {
      alert('닉네임을 2자 이상 입력해주세요!');
      return;
    }
    const startTime = new Date().getTime().toString();
    localStorage.setItem('void_user', nicknameInput);
    localStorage.setItem('void_trial_start', startTime);
    setUser(nicknameInput);
    setTrialStart(startTime);
    alert(`${nicknameInput}님, 환영합니다! 3일간의 무료 체험이 시작되었습니다.`);
  };

  const savePurchase = (itemKey) => {
    const saved = localStorage.getItem('void_survivor_purchases');
    const purchases = saved ? JSON.parse(saved) : [];
    if (!purchases.includes(itemKey)) {
      purchases.push(itemKey);
      localStorage.setItem('void_survivor_purchases', JSON.stringify(purchases));
    }
  };

  // 로그인 안 된 경우 모달 표시
  if (!user) {
    return (
      <div className="auth-modal-overlay">
        <div className="auth-modal">
          <h2>VOID SURVIVOR</h2>
          <p style={{ marginBottom: '1rem', color: '#aaa' }}>전 세계 랭킹 등록을 위해 닉네임을 설정하세요.</p>
          <input
            className="nickname-input"
            type="text"
            placeholder="닉네임 입력 (예: Hero77)"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button className="claim-button" onClick={handleLogin}>계정 생성 & 시작하기</button>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="container">
        <header className="header">
          <h1>VOID SURVIVOR</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
            <span className="subtitle">ID: {user}</span>
            <div className={`trial-badge ${remainingTime === 'EXP' ? 'warning' : ''}`}>
              {remainingTime === 'EXP' ? '⚠️ TRIAL EXPIRED' : `⏳ TRIAL: ${remainingTime} LEFT`}
            </div>
          </div>
        </header>

        <main className="main-layout">
          <div className="game-section">
            <GameComponent />

            {isExpired && (
              <div className="auth-modal-overlay">
                <div className="auth-modal">
                  <h2 style={{ color: 'var(--neon-pink)' }}>⚠️ 체험 기간 만료</h2>
                  <p className="trial-expired-msg">3일간의 보급품이 모두 소진되었습니다!</p>
                  <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>인류의 구원을 위해 정식 지원군으로 합류하세요.</p>
                  <button className="claim-button" onClick={() => window.location.reload()}>새로고침하여 다시 확인</button>
                </div>
              </div>
            )}

            <div className="how-to-play">
              <h3>🎮 게임 방법 (How to Play)</h3>
              <ul>
                <li><strong>통합 조작</strong>: PC(마우스)든 모바일(터치)든 화면 왼쪽 하단의 <strong>가상 조이스틱</strong>을 드래그하여 전장을 지배하세요!</li>
                <li><strong>정밀 제어</strong>: 조이스틱을 살짝 당기면 천천히, 끝까지 당기면 빠르게 이동합니다.</li>
                <li><strong>위치 최적화</strong>: 조이스틱을 <strong>5초간 제자리에서 꾹</strong> 누르면 위치를 자유롭게 옮길 수 있습니다. 나만의 최적의 자리를 찾아보세요!</li>
                <li><strong>전체 화면</strong>: 우측 상단의 <strong>[ Fullscreen ]</strong>을 터치해 완벽하게 몰입된 전장을 경험하세요!</li>
                <li><strong>자동 사격</strong>: 프리미엄 아이템 장착 시 <strong>자동 조준 사격</strong>이 활성화됩니다. 조작은 오직 '이동'에만 집중하세요!</li>
              </ul>
            </div>

            <div className="hall-of-fame">
              <h3>🏆 Hall of Fame (Global)</h3>
              <div className="ranking-list">
                <div className="rank-item gold"><span className="rank-num">1</span><span className="rank-flag">🇺🇸</span><span className="rank-id">ShadowMaster</span><span className="rank-score">12,450</span></div>
                <div className="rank-item silver"><span className="rank-num">2</span><span className="rank-flag">🇰🇷</span><span className="rank-id">K-Survivor</span><span className="rank-score">10,890</span></div>
                <div className="rank-item bronze"><span className="rank-num">3</span><span className="rank-flag">🇯🇵</span><span className="rank-id">NeonNinja</span><span className="rank-score">9,120</span></div>
                <div className="rank-item"><span className="rank-num">?</span><span className="rank-flag">👤</span><span className="rank-id">{user} (YOU)</span><span className="rank-score">BEST: {localStorage.getItem('void_survivor_best_score') || 0}</span></div>
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

              {isExpired && (
                <div style={{ padding: '10px', background: 'rgba(255,0,0,0.1)', border: '1px solid red', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
                  <p style={{ color: 'white', fontSize: '0.8rem' }}>무료 체험이 종료되었습니다.<br />게임 플레이를 위해 위 아이템 중 하나를 구매해 지원해 주세요!</p>
                </div>
              )}
            </div>
          </aside>
        </main>

        <footer className="footer" style={{ position: 'relative' }}>
          <p>© 2026 Void Survivor Studio. All Rights Reserved.</p>
        </footer>
      </div>
    </PayPalScriptProvider>
  )
}

export default App
