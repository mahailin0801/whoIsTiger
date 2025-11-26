#!/bin/bash

# 端口占用修复脚本
# 使用方法: ./fix-port.sh [端口号]

PORT=${1:-3000}

echo "检查端口 $PORT 的占用情况..."

# 查找占用端口的进程
PID=$(lsof -ti :$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  echo "✅ 端口 $PORT 未被占用，可以正常启动"
  exit 0
fi

echo "⚠️  端口 $PORT 已被进程占用"
echo "进程信息："
ps aux | grep $PID | grep -v grep

echo ""
echo "占用端口的进程 ID: $PID"

# 检查是否是 PM2 进程
if pm2 list | grep -q "$PID"; then
  echo "检测到这是 PM2 管理的进程"
  read -p "是否要停止所有 PM2 进程? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    pm2 stop all
    pm2 delete all
    echo "✅ PM2 进程已停止"
    sleep 2
    # 再次检查
    PID=$(lsof -ti :$PORT 2>/dev/null)
    if [ -z "$PID" ]; then
      echo "✅ 端口 $PORT 现在可用"
      exit 0
    fi
  fi
fi

# 询问是否要强制停止
read -p "是否要强制停止占用端口的进程? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  kill -9 $PID
  echo "✅ 进程 $PID 已停止"
  sleep 1
  
  # 再次检查
  PID=$(lsof -ti :$PORT 2>/dev/null)
  if [ -z "$PID" ]; then
    echo "✅ 端口 $PORT 现在可用，可以启动应用了"
    exit 0
  else
    echo "❌ 端口仍然被占用，可能需要手动处理"
    exit 1
  fi
else
  echo "❌ 未停止进程，请手动处理或使用其他端口"
  echo ""
  echo "解决方案："
  echo "1. 手动停止进程: kill -9 $PID"
  echo "2. 或修改应用端口（在 ecosystem.config.js 中设置 PORT=3001）"
  exit 1
fi

