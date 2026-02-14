import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import config from './gameConfig';

const GameComponent = () => {
    const gameContainerRef = useRef(null);
    const gameInstanceRef = useRef(null);

    useEffect(() => {
        if (!gameInstanceRef.current) {
            gameInstanceRef.current = new Phaser.Game(config);
        }

        return () => {
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div id="game-container" ref={gameContainerRef} style={{ width: '800px', height: '600px', margin: '20px auto', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,255,255,0.3)' }}>
            {/* Phaser 게임이 여기 렌더링됩니다 */}
        </div>
    );
};

export default GameComponent;
