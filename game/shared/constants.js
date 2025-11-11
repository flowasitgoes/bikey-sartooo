// 游戏常量定义

// 27片六角板块的所有可能组合
// 每条六角板块有3个方向，每个方向有1-9的数字
export const TILE_COMBINATIONS = [];

// 生成所有可能的板块组合
export function generateAllTiles() {
  const tiles = [];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // 生成所有排列组合
  for (let n1 of numbers) {
    for (let n2 of numbers) {
      for (let n3 of numbers) {
        tiles.push({
          id: `tile-${n1}-${n2}-${n3}`,
          numbers: [n1, n2, n3],
          colors: [getColorForNumber(n1), getColorForNumber(n2), getColorForNumber(n3)],
        });
      }
    }
  }
  
  return tiles;
}

// 每个数字对应的颜色
export function getColorForNumber(num) {
  const colorMap = {
    1: '#E8D5C4', // 米色
    2: '#F5A3A3', // 浅粉红
    3: '#B8E6B8', // 浅绿
    4: '#A3D5F5', // 浅蓝
    5: '#E0E0E0', // 灰
    6: '#F5D5A3', // 浅橙
    7: '#D5A3F5', // 浅紫
    8: '#FFFFA3', // 浅黄
    9: '#FFA3A3', // 粉红
  };
  return colorMap[num] || '#CCCCCC';
}

// 图板的19个位置坐标
// 标准Take It Easy棋盘布局（菱形，共5行）
export const BOARD_POSITIONS = [
  // Row 0 - 1个
  { row: 0, col: 2 },
  // Row 1 - 3个
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
  // Row 2 - 5个
  { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
  // Row 3 - 7个
  { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 },
  // Row 4 - 3个
  { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 },
];

// 游戏配置
export const GAME_CONFIG = {
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
  TOTAL_TILES: 27,
  TILES_TO_USE: 19,
  PERFECT_SCORE: 307,
};

// Socket 事件名称
export const SOCKET_EVENTS = {
  // 客户端 -> 服务器
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  PLACE_TILE: 'place-tile',
  PLAYER_READY: 'player-ready',
  
  // 服务器 -> 客户端
  ROOM_CREATED: 'room-created',
  ROOM_JOINED: 'room-joined',
  ROOM_LEFT: 'room-left',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  GAME_START: 'game-start',
  TILE_DRAWN: 'tile-drawn',
  PLAYER_PLACED: 'player-placed',
  ROUND_COMPLETE: 'round-complete',
  GAME_END: 'game-end',
  ERROR: 'error',
};

// 游戏状态
export const GAME_STATES = {
  WAITING: 'waiting',
  STARTING: 'starting',
  PLAYING: 'playing',
  FINISHED: 'finished',
};

export default {
  TILE_COMBINATIONS,
  generateAllTiles,
  getColorForNumber,
  BOARD_POSITIONS,
  GAME_CONFIG,
  SOCKET_EVENTS,
  GAME_STATES,
};

