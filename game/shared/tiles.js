// 27片六角板块的完整数据
// 根据游戏规则，每片板块有3个方向的数字（1-9）

export const ALL_TILES = [
  { id: 1, numbers: [1, 1, 1] },
  { id: 2, numbers: [1, 1, 5] },
  { id: 3, numbers: [1, 1, 9] },
  { id: 4, numbers: [1, 5, 1] },
  { id: 5, numbers: [1, 5, 5] },
  { id: 6, numbers: [1, 5, 9] },
  { id: 7, numbers: [1, 9, 1] },
  { id: 8, numbers: [1, 9, 5] },
  { id: 9, numbers: [1, 9, 9] },
  
  { id: 10, numbers: [5, 1, 1] },
  { id: 11, numbers: [5, 1, 5] },
  { id: 12, numbers: [5, 1, 9] },
  { id: 13, numbers: [5, 5, 1] },
  { id: 14, numbers: [5, 5, 5] },
  { id: 15, numbers: [5, 5, 9] },
  { id: 16, numbers: [5, 9, 1] },
  { id: 17, numbers: [5, 9, 5] },
  { id: 18, numbers: [5, 9, 9] },
  
  { id: 19, numbers: [9, 1, 1] },
  { id: 20, numbers: [9, 1, 5] },
  { id: 21, numbers: [9, 1, 9] },
  { id: 22, numbers: [9, 5, 1] },
  { id: 23, numbers: [9, 5, 5] },
  { id: 24, numbers: [9, 5, 9] },
  { id: 25, numbers: [9, 9, 1] },
  { id: 26, numbers: [9, 9, 5] },
  { id: 27, numbers: [9, 9, 9] },
];

// 为板块添加颜色信息
export function enrichTilesWithColors() {
  return ALL_TILES.map(tile => ({
    ...tile,
    colors: tile.numbers.map(num => getColorForNumber(num)),
  }));
}

// 获取数字对应的颜色
function getColorForNumber(num) {
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

// 获取太阳/月亮符号（某些板块有特殊标记）
export function getTileSymbol(tileId) {
  const symbolTiles = {
    1: 'sun',
    5: 'sun',
    9: 'moon',
    14: 'sun',
    18: 'moon',
    22: 'sun',
    27: 'moon',
  };
  return symbolTiles[tileId] || null;
}

export default ALL_TILES;

