// 主服务器文件
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import RoomManager from './game/RoomManager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;
const roomManager = new RoomManager();

// 静态文件服务（用于生产环境）
app.use(express.static('../client/dist'));

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 创建房间
  socket.on('create-room', (data) => {
    const { playerName } = data;
    
    if (!playerName || playerName.trim() === '') {
      socket.emit('error', { message: '玩家名称不能为空' });
      return;
    }

    const roomId = uuidv4();
    const playerId = socket.id;

    roomManager.createRoom(roomId, playerId, playerName);
    socket.join(roomId);

    socket.emit('room-created', {
      roomId,
      playerId,
      players: roomManager.getRoomPlayers(roomId),
    });

    console.log(`房间创建: ${roomId} 由 ${playerName}`);
  });

  // 加入房间
  socket.on('join-room', (data) => {
    const { roomId, playerName } = data;

    if (!roomId || !playerName || playerName.trim() === '') {
      socket.emit('error', { message: '房间ID和玩家名称不能为空' });
      return;
    }

    const room = roomManager.getRoom(roomId);

    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    if (room.game.getPlayerCount() >= 6) {
      socket.emit('error', { message: '房间已满' });
      return;
    }

    const playerId = socket.id;
    roomManager.addPlayerToRoom(roomId, playerId, playerName);
    socket.join(roomId);

    socket.emit('room-joined', {
      roomId,
      playerId,
      players: roomManager.getRoomPlayers(roomId),
    });

    socket.to(roomId).emit('player-joined', {
      players: roomManager.getRoomPlayers(roomId),
    });

    console.log(`玩家加入: ${playerName} 加入房间 ${roomId}`);
  });

  // 玩家准备
  socket.on('player-ready', (data) => {
    const { roomId } = data;
    const playerId = socket.id;

    const room = roomManager.getRoom(roomId);

    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    room.game.setPlayerReady(playerId, true);

    // 广播给房间内所有玩家
    io.to(roomId).emit('player-ready-updated', {
      players: roomManager.getRoomPlayers(roomId),
    });

    // 如果所有人都准备好了且至少有2人，自动开始游戏
    if (room.game.allPlayersReady() && room.game.getPlayerCount() >= 2) {
      setTimeout(() => {
        const startResult = room.game.startGame();

        if (startResult.success) {
          io.to(roomId).emit('game-start', {
            currentTile: startResult.currentTile,
            roundNumber: 1,
          });
        }
      }, 1000);
    }
  });

  // 放置板块
  socket.on('place-tile', (data) => {
    const { roomId, position } = data;
    const playerId = socket.id;

    const room = roomManager.getRoom(roomId);

    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    const result = room.game.placeTile(playerId, position);

    if (result.success) {
      const gameState = room.game.getGameState();

      // 广播给房间内所有玩家
      io.to(roomId).emit('player-placed', {
        playerId,
        position,
        tile: result.tile,
        gameState,
      });

      // 检查是否所有人都已放置
      if (room.game.allPlayersPlaced()) {
        // 检查游戏是否结束
        if (room.game.checkGameEnd()) {
          const finalScores = room.game.getFinalScores();

          io.to(roomId).emit('game-end', {
            finalScores,
            winner: finalScores[0],
          });

          // 清理房间
          roomManager.deleteRoom(roomId);
        } else {
          // 抽取下一片板块
          const nextTile = room.game.drawTile();

          if (nextTile) {
            io.to(roomId).emit('tile-drawn', {
              tile: nextTile,
              roundNumber: room.game.roundNumber,
            });
          }
        }
      }
    } else {
      socket.emit('error', { message: result.message });
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);

    // 移除玩家并清理空房间
    roomManager.handlePlayerDisconnect(socket.id);
  });
});

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`🚀 Take It Easy 游戏服务器运行在 http://localhost:${PORT}`);
});

export default app;

