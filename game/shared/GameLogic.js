// 游戏核心逻辑
import { ALL_TILES, enrichTilesWithColors, getTileSymbol } from './tiles.js';
import { BOARD_POSITIONS } from './constants.js';
import { calculateScore, getNeighbors } from './scoring.js';

export class TakeItEasyGame {
  constructor() {
    this.tiles = enrichTilesWithColors();
    this.tilesToUse = 19; // 使用19片板块
    this.usedTiles = [];
    this.currentTile = null;
    this.roundNumber = 0;
    this.players = new Map(); // 玩家数据
    this.neighbors = getNeighbors(); // 邻居关系
    this.gameState = 'waiting'; // waiting, playing, finished
  }
  
  // 随机抽取一片板块
  drawTile() {
    if (this.roundNumber >= this.tilesToUse) {
      return null; // 游戏结束
    }
    
    const availableTiles = this.tiles.filter(
      tile => !this.usedTiles.includes(tile.id)
    );
    
    if (availableTiles.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableTiles.length);
    const tile = { ...availableTiles[randomIndex] };
    
    // 添加太阳/月亮符号
    tile.symbol = getTileSymbol(tile.id);
    
    this.usedTiles.push(tile.id);
    this.currentTile = tile;
    this.roundNumber++;
    
    return tile;
  }
  
  // 添加玩家
  addPlayer(playerId, playerName) {
    const player = {
      id: playerId,
      name: playerName,
      board: Array(BOARD_POSITIONS.length).fill(null), // 19个位置
      score: 0,
      ready: false,
    };
    
    this.players.set(playerId, player);
    return player;
  }
  
  // 移除玩家
  removePlayer(playerId) {
    this.players.delete(playerId);
  }
  
  // 玩家准备
  setPlayerReady(playerId, ready) {
    const player = this.players.get(playerId);
    if (player) {
      player.ready = ready;
    }
  }
  
  // 检查是否所有玩家都准备好
  allPlayersReady() {
    return Array.from(this.players.values()).every(p => p.ready);
  }
  
  // 获取玩家数量
  getPlayerCount() {
    return this.players.size;
  }
  
  // 放置板块
  placeTile(playerId, positionIndex) {
    const player = this.players.get(playerId);
    
    if (!player) {
      return { success: false, message: '玩家不存在' };
    }
    
    // 检查位置是否有效
    if (positionIndex < 0 || positionIndex >= BOARD_POSITIONS.length) {
      return { success: false, message: '无效的位置' };
    }
    
    // 检查位置是否已被占用
    if (player.board[positionIndex] !== null) {
      return { success: false, message: '位置已被占用' };
    }
    
    // 检查是否有当前板块
    if (!this.currentTile) {
      return { success: false, message: '没有可放置的板块' };
    }
    
    // 放置板块
    player.board[positionIndex] = { ...this.currentTile };
    
    // 重新计算分数
    const scoreResult = calculateScore(player.board, this.neighbors);
    player.score = scoreResult.totalScore;
    
    return {
      success: true,
      position: positionIndex,
      tile: this.currentTile,
      score: scoreResult,
    };
  }
  
  // 检查玩家是否已放置当前板块
  hasPlayerPlaced(playerId) {
    const player = this.players.get(playerId);
    if (!player) return false;
    
    // 检查玩家板子上是否已经有当前板块
    return player.board.some(
      tile => tile && tile.id === this.currentTile.id
    );
  }
  
  // 检查所有玩家是否都已放置
  allPlayersPlaced() {
    return Array.from(this.players.values()).every(
      player => this.hasPlayerPlaced(player.id)
    );
  }
  
  // 检查游戏是否结束
  checkGameEnd() {
    if (this.roundNumber > this.tilesToUse) {
      this.gameState = 'finished';
      return true;
    }
    return false;
  }
  
  // 获取最终分数和排名
  getFinalScores() {
    const playerScores = Array.from(this.players.values()).map(player => ({
      playerId: player.id,
      playerName: player.name,
      score: player.score,
    }));
    
    // 按分数排序
    playerScores.sort((a, b) => b.score - a.score);
    
    return playerScores;
  }
  
  // 获取游戏状态
  getGameState() {
    return {
      gameState: this.gameState,
      roundNumber: this.roundNumber,
      currentTile: this.currentTile,
      players: Array.from(this.players.values()).map(player => ({
        id: player.id,
        name: player.name,
        score: player.score,
        ready: player.ready,
      })),
    };
  }
  
  // 开始游戏
  startGame() {
    if (this.players.size < 2) {
      return { success: false, message: '至少需要2名玩家' };
    }
    
    if (!this.allPlayersReady()) {
      return { success: false, message: '不是所有玩家都准备好了' };
    }
    
    this.gameState = 'playing';
    this.drawTile();
    
    return { success: true, currentTile: this.currentTile };
  }
  
  // 重置游戏
  reset() {
    this.usedTiles = [];
    this.currentTile = null;
    this.roundNumber = 0;
    this.gameState = 'waiting';
    
    // 重置所有玩家的棋盘
    this.players.forEach(player => {
      player.board = Array(BOARD_POSITIONS.length).fill(null);
      player.score = 0;
      player.ready = false;
    });
  }
}

export default TakeItEasyGame;

