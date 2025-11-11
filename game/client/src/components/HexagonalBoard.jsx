import { BOARD_POSITIONS } from '../../../shared/constants.js';

function HexagonalBoard({ onPositionClick, currentTile, selectedPosition }) {
  // 计算六角格子的位置
  const getHexPosition = (row, col) => {
    const hexWidth = 60;
    const hexHeight = 52;
    const x = col * hexWidth * 0.75;
    const y = row * hexHeight;
    return { x, y };
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '600px',
      height: '600px',
      margin: '0 auto',
    }}>
      <svg
        viewBox="0 0 600 600"
        style={{ width: '100%', height: '100%' }}
      >
        {BOARD_POSITIONS.map((pos, index) => {
          const { x, y } = getHexPosition(pos.row, pos.col);
          
          return (
            <Hexagon
              key={index}
              x={x}
              y={y}
              size={30}
              isEmpty={true}
              onClick={() => onPositionClick && onPositionClick(index)}
              isSelected={selectedPosition === index}
            />
          );
        })}
      </svg>
    </div>
  );
}

// 六角形组件
function Hexagon({ x, y, size, isEmpty, onClick, isSelected }) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    points.push(`${px},${py}`);
  }

  const fill = isSelected ? '#667eea' : (isEmpty ? '#f0f0f0' : '#fff');
  const stroke = isSelected ? '#764ba2' : '#ddd';
  const strokeWidth = isSelected ? 3 : 1;

  return (
    <polygon
      points={points.join(' ')}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    />
  );
}

export default HexagonalBoard;

