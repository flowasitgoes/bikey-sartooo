#!/bin/bash

# 启动脚本 - 同时启动前后端

echo "🚀 启动 Take It Easy 游戏服务器..."

# 启动后端服务器
cd server
npm start &
SERVER_PID=$!
cd ..

# 等待服务器启动
sleep 2

# 启动前端开发服务器
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo "✅ 服务器已启动！"
echo "📱 前端地址: http://localhost:5173"
echo "🖥️  后端地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止服务器"

# 等待用户中断
trap "kill $SERVER_PID $CLIENT_PID" EXIT
wait

