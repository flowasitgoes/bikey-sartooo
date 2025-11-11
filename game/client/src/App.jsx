import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LobbyPage from './components/LobbyPage';
import GameRoom from './components/GameRoom';
import GameBoard from './components/GameBoard';
import './App.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentPage, setCurrentPage] = useState('lobby'); // lobby, room, game
  const [roomData, setRoomData] = useState(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // 初始化 Socket 连接
    const newSocket = io(SOCKET_URL);
    
    // 监听错误
    newSocket.on('error', (error) => {
      console.error('Socket错误:', error);
      alert(error.message || '发生错误');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleRoomCreated = (data) => {
    setRoomData(data);
    setCurrentPage('room');
  };

  const handleRoomJoined = (data) => {
    setRoomData(data);
    setCurrentPage('room');
  };

  const handleGameStart = (data) => {
    setGameState(data);
    setCurrentPage('game');
  };

  const handleGameEnd = (data) => {
    alert(`游戏结束！获胜者: ${data.winner.playerName} (${data.winner.score}分)`);
    setRoomData(null);
    setGameState(null);
    setCurrentPage('lobby');
  };

  return (
    <div className="App">
      {socket && (
        <>
          {currentPage === 'lobby' && (
            <LobbyPage
              socket={socket}
              onRoomCreated={handleRoomCreated}
              onRoomJoined={handleRoomJoined}
            />
          )}
          
          {currentPage === 'room' && roomData && (
            <GameRoom
              socket={socket}
              roomData={roomData}
              onGameStart={handleGameStart}
            />
          )}
          
          {currentPage === 'game' && roomData && gameState && (
            <GameBoard
              socket={socket}
              roomData={roomData}
              gameState={gameState}
              onGameEnd={handleGameEnd}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
