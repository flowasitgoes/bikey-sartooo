import { useState, useEffect } from 'react';

function LobbyPage({ socket, onRoomCreated, onRoomJoined }) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  useEffect(() => {
    // 监听房间创建成功
    socket.on('room-created', (data) => {
      onRoomCreated(data);
    });

    // 监听加入房间成功
    socket.on('room-joined', (data) => {
      onRoomJoined(data);
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
    };
  }, [socket, onRoomCreated, onRoomJoined]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('请输入玩家名称');
      return;
    }

    socket.emit('create-room', { playerName });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('请输入玩家名称');
      return;
    }

    if (!roomId.trim()) {
      alert('请输入房间ID');
      return;
    }

    socket.emit('join-room', { roomId, playerName });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h1>轻松放 Take It Easy</h1>
      
      <div className="card">
        <h2>欢迎来到轻松放！</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          一个考验策略和运气的拼图游戏
        </p>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="输入您的名称"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>

        {!showJoinRoom ? (
          <>
            <button
              onClick={handleCreateRoom}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              创建房间
            </button>
            <button
              onClick={() => setShowJoinRoom(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              }}
            >
              加入房间
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="输入房间ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <button
              onClick={handleJoinRoom}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              加入
            </button>
            <button
              onClick={() => setShowJoinRoom(false)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              }}
            >
              返回
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default LobbyPage;

