#!/bin/bash

echo "📦 安装 Take It Easy 游戏依赖..."

# 安装前端依赖
echo "正在安装前端依赖..."
cd client
npm install
cd ..

# 安装后端依赖
echo "正在安装后端依赖..."
cd server
npm install
cd ..

echo "✅ 依赖安装完成！"
echo ""
echo "运行以下命令启动游戏："
echo "  cd server && npm start    # 启动后端"
echo "  cd client && npm run dev  # 启动前端"
echo ""
echo "或使用快速启动脚本："
echo "  ./start.sh"

