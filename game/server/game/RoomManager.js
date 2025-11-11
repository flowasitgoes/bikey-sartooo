// 房间管理
import TakeItEasyGame from '../../shared/GameLogic.js';

export default class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> room
    this.playerToRoom = new Map(); // playerId -> roomId
  }

  // 创建房间
  createRoom(roomId, hostPlayerId, hostPlayerName) {
    const game = new TakeItEasyGame();
    game.addPlayer(hostPlayerId, hostPlayerName);

    const room = {
      id: roomId,
      host: hostPlayerId,
      game,
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    this.playerToRoom.set(hostPlayerId, roomId);

    return room;
  }

  // 获取房间
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // 添加玩家到房间
  addPlayerToRoom(roomId, playerId, playerName) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return null;
    }

    room.game.addPlayer(playerId, playerName);
    this.playerToRoom.set(playerId, roomId);

    return room;
  }

  // 从房间移除玩家
  removePlayerFromRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    room.game.removePlayer(playerId);
    this.playerToRoom.delete(playerId);

    // 如果房间为空，删除房间
    if (room.game.getPlayerCount() === 0) {
      this.rooms.delete(roomId);
    }
  }

  // 获取房间的玩家列表
  getRoomPlayers(roomId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return [];
    }

    return room.game.getGameState().players;
  }

  // 删除房间
  deleteRoom(roomId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    // 移除所有玩家的映射
    room.game.players.forEach((_, playerId) => {
      this.playerToRoom.delete(playerId);
    });

    this.rooms.delete(roomId);
  }

  // 处理玩家断开连接
  handlePlayerDisconnect(playerId) {
    const roomId = this.playerToRoom.get(playerId);

    if (!roomId) {
      return;
    }

    const room = this.getRoom(roomId);

    if (!room) {
      return;
    }

    // 移除玩家
    this.removePlayerFromRoom(roomId, playerId);

    console.log(`玩家 ${playerId} 离开房间 ${roomId}`);
  }

  // 获取所有房间
  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  // 获取房间数量
  getRoomCount() {
    return this.rooms.size;
  }
}

