import { useState, useEffect } from 'react';
import HexagonalBoard from './HexagonalBoard';
import TileDisplay from './TileDisplay';

function GameBoard({ socket, roomData, gameState: initialGameState, onGameEnd }) {
  const [gameState, setGameState] = useState(initialGameState);
  const [currentTile, setCurrentTile] = useState(initialGameState?.currentTile);
  const [players, setPlayers] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    // 监听玩家放置板块
    socket.on('player-placed', (data) => {
      setGameState(data.gameState);
      setPlayers(data.gameState.players);
    });

    // 监听抽取新的板块
    socket.on('tile-drawn', (data) => {
      setCurrentTile(data.tile);
      setSelectedPosition(null);
    });

    // 监听游戏结束
    socket.on('game-end', (data) => {
      onGameEnd(data);
    });

    // 监听错误
    socket.on('error', (error) => {
      alert(error.message);
    });

    return () => {
      socket.off('player-placed');
      socket.off('tile-drawn');
      socket.off('game-end');
      socket.off('error');
    };
  }, [socket, onGameEnd]);

  const handlePositionClick = (positionIndex) => {
    if (!currentTile) return;

    setSelectedPosition(positionIndex);

    // 发送放置板块事件
    socket.emit('place-tile', {
      roomId: roomData.roomId,
      position: positionIndex,
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <h1>游戏进行中</h1>
      
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div>
            <h2>第 {gameState?.roundNumber || 0} / 19 轮</h2>
          </div>
          <div>
            <h3>玩家分数</h3>
            {players.map((player) => (
              <div key={player.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '5px 0',
              }}>
                <span>{player.name}:</span>
                <strong>{player.score}</strong>
              </div>
            ))}
          </div>
        </div>

        {currentTile && (
          <TileDisplay
            tile={currentTile}
            style={{ marginBottom: '20px' }}
          />
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>游戏图板</h3>
            <HexagonalBoard
              onPositionClick={handlePositionClick}
              currentTile={currentTile}
              selectedPosition={selectedPosition}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;

