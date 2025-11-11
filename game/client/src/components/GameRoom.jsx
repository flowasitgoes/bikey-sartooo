import { useState, useEffect } from 'react';

function GameRoom({ socket, roomData, onGameStart }) {
  const [players, setPlayers] = useState(roomData?.players || []);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 监听玩家加入
    socket.on('player-joined', (data) => {
      setPlayers(data.players);
    });

    // 监听玩家准备状态更新
    socket.on('player-ready-updated', (data) => {
      setPlayers(data.players);
    });

    // 监听游戏开始
    socket.on('game-start', (data) => {
      onGameStart(data);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-ready-updated');
      socket.off('game-start');
    };
  }, [socket, onGameStart]);

  const handleReady = () => {
    setIsReady(true);
    socket.emit('player-ready', { roomId: roomData.roomId });
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomData.roomId);
    alert('房间ID已复制到剪贴板');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <h1>等待玩家加入</h1>

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <h2>房间信息</h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <p style={{ margin: 0 }}>房间ID: <strong>{roomData.roomId}</strong></p>
            <button onClick={handleCopyRoomId} style={{ padding: '6px 12px', fontSize: '14px' }}>
              复制
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>玩家列表 ({players.length}/6)</h3>
          <div style={{ marginTop: '10px' }}>
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  marginBottom: '8px',
                  background: player.ready ? '#d4edda' : '#f8f9fa',
                  borderRadius: '8px',
                  border: player.ready ? '2px solid #28a745' : '2px solid #e0e0e0',
                }}
              >
                <span>{player.name}</span>
                <span style={{
                  color: player.ready ? '#28a745' : '#999',
                  fontWeight: 'bold',
                }}>
                  {player.ready ? '✓ 已准备' : '等待中'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {players.length < 2 && (
          <p style={{ color: '#999', marginBottom: '20px', textAlign: 'center' }}>
            至少需要2名玩家才能开始游戏
          </p>
        )}

        {!isReady && players.length >= 2 && (
          <button
            onClick={handleReady}
            style={{ width: '100%' }}
          >
            准备
          </button>
        )}

        {isReady && (
          <p style={{ textAlign: 'center', color: '#28a745', fontWeight: 'bold' }}>
            等待其他玩家准备...
          </p>
        )}
      </div>
    </div>
  );
}

export default GameRoom;

