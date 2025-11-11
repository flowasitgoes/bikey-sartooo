# 轻松放 Take It Easy - 多人在线游戏

基于 React + Socket.IO 实现的多人在线「轻松放」桌游。

## 项目结构

```
game/
├── client/              # React 前端应用
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── App.jsx      # 主应用
│   │   └── App.css      # 样式
│   └── package.json
├── server/              # Node.js 后端服务器
│   ├── game/           # 游戏逻辑
│   ├── index.js        # 服务器入口
│   └── package.json
└── shared/             # 共享代码
    ├── GameLogic.js    # 游戏核心逻辑
    ├── tiles.js        # 板块数据
    ├── scoring.js      # 计分系统
    └── constants.js    # 游戏常量
```

## 安装依赖

### 前端
```bash
cd game/client
npm install
```

### 后端
```bash
cd game/server
npm install
```

## 运行项目

### 开发模式

首先启动后端服务器：
```bash
cd game/server
npm run dev
```
服务器将在 http://localhost:3001 启动

然后启动前端开发服务器：
```bash
cd game/client
npm run dev
```
前端将在 http://localhost:5173 启动

### 生产模式

构建前端：
```bash
cd game/client
npm run build
```

启动生产服务器：
```bash
cd game/server
npm start
```

## 游戏规则

### 基本玩法

1. **玩家数量**：2-6人
2. **游戏目标**：通过放置19片六角板块，形成连续同色/同数字的得分线，获得最高分数
3. **板块**：每片板块有3个方向的数字（1-9），每个数字对应不同颜色
4. **放置规则**：
   - 玩家同时获得相同的板块
   - 可以自由选择位置放置
   - 放置后不可移动
5. **计分**：每条完整得分线 = 数字 × 片数
6. **得分线**：三个方向（垂直、左上-右下、右上-左下）
7. **最高分**：307分

### 游戏流程

1. 创建或加入房间
2. 所有玩家准备
3. 系统随机抽取板块
4. 玩家同时放置板块
5. 所有人放置完毕后抽取下一片
6. 放置完19片后游戏结束
7. 计算分数并排名

## 技术栈

- **前端**：React 18, Vite, Socket.IO Client
- **后端**：Node.js, Express, Socket.IO
- **通信**：WebSocket 实时通信

## API 说明

### Socket.IO 事件

#### 客户端 -> 服务器

- `create-room`: 创建房间
- `join-room`: 加入房间
- `player-ready`: 玩家准备
- `place-tile`: 放置板块

#### 服务器 -> 客户端

- `room-created`: 房间创建成功
- `room-joined`: 加入房间成功
- `player-joined`: 有玩家加入
- `player-ready-updated`: 玩家准备状态更新
- `game-start`: 游戏开始
- `tile-drawn`: 抽取新板块
- `player-placed`: 玩家放置板块
- `game-end`: 游戏结束

## 开发计划

- [x] 项目初始化和基础结构
- [x] 游戏核心逻辑实现
- [x] 后端服务器和房间管理
- [x] Socket.IO 实时通信
- [x] 前端 UI 组件
- [x] 六角形图板渲染
- [x] 游戏流程控制
- [ ] 游戏测试和优化
- [ ] 移动端适配
- [ ] AI 对手（单人模式）

## 许可证

MIT License

