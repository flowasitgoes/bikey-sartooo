// 计分系统
import { BOARD_POSITIONS } from './constants.js';

// 获取三个方向的邻居关系
export function getNeighbors() {
  const neighbors = {};
  
  BOARD_POSITIONS.forEach((pos, index) => {
    const row = pos.row;
    const col = pos.col;
    
    neighbors[index] = {
      // 垂直方向（方向0）
      vertical: getVerticalNeighbors(row, col),
      // 左上到右下（方向1）
      diagonal1: getDiagonal1Neighbors(row, col),
      // 右上到左下（方向2）
      diagonal2: getDiagonal2Neighbors(row, col),
    };
  });
  
  return neighbors;
}

// 获取垂直方向的邻居
function getVerticalNeighbors(row, col) {
  const neighbors = [];
  
  // 向上
  for (let r = row - 1; r >= 0; r--) {
    const pos = { row: r, col };
    const index = getPositionIndex(pos);
    if (index !== -1) {
      neighbors.unshift(index);
    } else {
      break;
    }
  }
  
  // 当前
  const currentIndex = getPositionIndex({ row, col });
  if (currentIndex !== -1) {
    neighbors.push(currentIndex);
  }
  
  // 向下
  for (let r = row + 1; r <= 9; r++) {
    const pos = { row: r, col };
    const index = getPositionIndex(pos);
    if (index !== -1) {
      neighbors.push(index);
    } else {
      break;
    }
  }
  
  return neighbors;
}

// 获取左上到右下的对角线邻居
function getDiagonal1Neighbors(row, col) {
  const neighbors = [];
  let currentRow = row;
  let currentCol = col;
  
  // 向左上
  while (currentRow >= 0 && currentCol >= 0) {
    const pos = { row: currentRow, col: currentCol };
    const index = getPositionIndex(pos);
    if (index !== -1) {
      neighbors.unshift(index);
      currentRow--;
      currentCol--;
    } else {
      break;
    }
  }
  
  // 向右下
  currentRow = row + 1;
  currentCol = col + 1;
  while (currentRow <= 9 && currentCol <= 6) {
    const pos = { row: currentRow, col: currentCol };
    const index = getPositionIndex(pos);
    if (index !== -1) {
      neighbors.push(index);
      currentRow++;
      currentCol++;
    } else {
      break;
    }
  }
  
  return neighbors;
}

// 获取右上到左下的对角线邻居
function getDiagonal2Neighbors(row, col) {
  const neighbors = [];
  let currentRow = row;
  let currentCol = col;
  
  // 向左下
  while (currentRow >= 0 && currentCol <= 6) {
    const pos = { row: currentRow, col: currentCol };
    const index = getPositionIndex(pos);
    if (index !== -1) {
      neighbors.unshift(index);
      currentRow--;
      currentCol++;
    } else {
      break;
    }
  }
  
  // 向右上
  currentRow = row + 1;
  currentCol = col - 1;
  while (currentRow <= 9 && currentCol >= 0) {
    const pos = { row: currentRow, col: currentCol };
    const index = getPositionIndex(pos);
    if (index !== -1) {
      neighbors.push(index);
      currentRow++;
      currentCol--;
    } else {
      break;
    }
  }
  
  return neighbors;
}

// 获取位置在数组中的索引
function getPositionIndex(pos) {
  return BOARD_POSITIONS.findIndex(
    p => p.row === pos.row && p.col === pos.col
  );
}

// 计算得分
export function calculateScore(board, neighbors) {
  let totalScore = 0;
  const scoredLines = [];
  
  // 遍历三个方向
  const directionKeys = ['vertical', 'diagonal1', 'diagonal2'];
  
  for (let direction = 0; direction < 3; direction++) {
    const directionKey = directionKeys[direction];
    const scoredLineSet = new Set(); // 用于避免重复计算同一条线
    
    // 遍历所有位置
    BOARD_POSITIONS.forEach((pos, index) => {
      if (!board[index]) return; // 位置为空，跳过
      
      const line = neighbors[index][directionKey];
      const tile = board[index];
      const number = tile.numbers[direction];
      
      // 为该线创建唯一标识（排序以去重）
      const lineKey = line.sort((a, b) => a - b).join('-');
      
      // 如果这条线已经计算过，跳过
      if (scoredLineSet.has(lineKey)) return;
      scoredLineSet.add(lineKey);
      
      // 检查线上所有数字是否相同
      const lineNumbers = line.map(idx => board[idx] && board[idx].numbers[direction]);
      
      // 如果线上所有位置都有板块且数字相同，则得分
      if (lineNumbers.every(n => n !== undefined && n === number)) {
        const count = line.length;
        const lineScore = number * count;
        totalScore += lineScore;
        scoredLines.push({
          line: lineKey,
          direction,
          number,
          count,
          score: lineScore,
        });
      }
    });
  }
  
  return { totalScore, scoredLines };
}

// 计算太阳/月亮额外分数
export function calculateSymbolBonus(board, scoredLines) {
  let bonus = 0;
  
  scoredLines.forEach(line => {
    const positions = line.line.split('-').map(Number);
    const allHaveSymbol = positions.every(pos => {
      const tile = board[pos];
      return tile && tile.symbol;
    });
    
    if (allHaveSymbol) {
      const symbolType = board[positions[0]].symbol;
      const symbolPoints = symbolType === 'sun' ? 7 : 6;
      bonus += symbolPoints * line.count;
    }
  });
  
  return bonus;
}

export default {
  getNeighbors,
  calculateScore,
  calculateSymbolBonus,
};

