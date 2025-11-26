#!/bin/bash

# 部署脚本
# 使用方法: ./deploy.sh [服务器地址] [用户名] [部署路径]

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始部署流程...${NC}"

# 1. 构建项目
echo -e "${YELLOW}步骤 1: 构建项目${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败！${NC}"
    exit 1
fi

echo -e "${GREEN}构建成功！${NC}"

# 2. 检查是否需要上传到服务器
if [ -z "$1" ]; then
    echo -e "${YELLOW}未提供服务器信息，跳过上传步骤${NC}"
    echo -e "${GREEN}构建完成！文件已准备好，可以手动上传到服务器${NC}"
    echo ""
    echo "需要上传的文件和目录："
    echo "  - .next/"
    echo "  - app/"
    echo "  - components/"
    echo "  - lib/"
    echo "  - public/ (如果有)"
    echo "  - package.json"
    echo "  - next.config.js"
    echo "  - tsconfig.json"
    echo "  - types/ (如果有)"
    echo "  - ecosystem.config.js"
    exit 0
fi

# 服务器信息
SERVER=$1
USER=${2:-root}
DEPLOY_PATH=${3:-/var/www/who-tiger}

echo -e "${YELLOW}步骤 2: 上传文件到服务器${NC}"
echo "服务器: $USER@$SERVER"
echo "路径: $DEPLOY_PATH"

# 创建部署目录
ssh $USER@$SERVER "mkdir -p $DEPLOY_PATH"

# 上传文件（排除 node_modules, .git, data 等）
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'data' \
  --exclude '.next/cache' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  .next/ app/ components/ lib/ \
  package.json next.config.js tsconfig.json ecosystem.config.js \
  $([ -d "public" ] && echo "public/") \
  $([ -d "types" ] && echo "types/") \
  $USER@$SERVER:$DEPLOY_PATH/

echo -e "${YELLOW}步骤 3: 在服务器上安装依赖${NC}"
ssh $USER@$SERVER "cd $DEPLOY_PATH && npm install --production"

echo -e "${YELLOW}步骤 4: 重启应用${NC}"
ssh $USER@$SERVER "cd $DEPLOY_PATH && pm2 restart who-tiger || pm2 start ecosystem.config.js"

echo -e "${GREEN}部署完成！${NC}"
echo ""
echo "应用应该运行在: http://$SERVER:3000"
echo ""
echo "查看日志: ssh $USER@$SERVER 'cd $DEPLOY_PATH && pm2 logs who-tiger'"

