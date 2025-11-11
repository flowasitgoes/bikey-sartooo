// 板块显示组件
function TileDisplay({ tile }) {
  if (!tile) return null;

  const size = 80;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = size / 2 + size / 2 * Math.cos(angle);
    const y = size / 2 + size / 2 * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '12px',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h3 style={{ marginBottom: '10px' }}>当前板块</h3>
        <svg
          width={size + 20}
          height={size + 20}
          viewBox={`0 0 ${size + 20} ${size + 20}`}
        >
          <polygon
            points={points.join(' ')}
            fill="white"
            stroke="#333"
            strokeWidth="2"
            transform={`translate(10, 10)`}
          />
          
          {/* 三条数字线 */}
          <line
            x1={centerX + 10}
            y1={centerY + 10 - size / 2}
            x2={centerX + 10}
            y2={centerY + 10 + size / 2}
            stroke={tile.colors[0]}
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          <line
            x1={centerX + 10}
            y1={centerY + 10 - size / 2}
            x2={centerX + 10 + size / 2}
            y2={centerY + 10 + size / 2}
            stroke={tile.colors[1]}
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          <line
            x1={centerX + 10}
            y1={centerY + 10 - size / 2}
            x2={centerX + 10 - size / 2}
            y2={centerY + 10 + size / 2}
            stroke={tile.colors[2]}
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* 数字显示 */}
          <text
            x={centerX + 10}
            y={centerY + 10 - size / 3}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#333"
          >
            {tile.numbers[0]}
          </text>
          
          <text
            x={centerX + 10 + size / 4}
            y={centerY + 10 + size / 4}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#333"
          >
            {tile.numbers[1]}
          </text>
          
          <text
            x={centerX + 10 - size / 4}
            y={centerY + 10 + size / 4}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#333"
          >
            {tile.numbers[2]}
          </text>
        </svg>
      </div>
    </div>
  );
}

export default TileDisplay;

