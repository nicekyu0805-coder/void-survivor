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
        <div id="game-container" ref={gameContainerRef} className="game-container-wrapper">
            {/* Phaser 게임이 여기 렌더링됩니다 */}
        </div>
    );
};

export default GameComponent;
